import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PlaceOrderInput = {
  items: { item_id: string; portion: "Half" | "Full" | "Regular"; qty: number }[];
  customer_name: string;
  phone: string;
  address: string;
  landmark: string;
  notes: string;
  mode: "delivery" | "takeaway";
  payment_method: "cod" | "upi";
};

const FREE_DELIVERY_AT = 399;
const DELIVERY_FEE = 39;

function validate(input: PlaceOrderInput): PlaceOrderInput {
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("Cart is empty.");
  if (input.items.length > 50) throw new Error("Too many items in one order.");
  if (!/^\d{10}$/.test(input.phone)) throw new Error("Enter a valid 10-digit phone number.");
  if (input.customer_name.trim().length < 2) throw new Error("Enter your name.");
  if (input.mode === "delivery" && input.address.trim().length < 10)
    throw new Error("Please give a full delivery address.");
  return input;
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlaceOrderInput) => validate(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const ids = [...new Set(data.items.map((i) => i.item_id))];
    const { data: dishes, error: dishErr } = await supabase
      .from("menu_items")
      .select("id,name,price,half_price,full_price,available")
      .in("id", ids);
    if (dishErr) throw new Error(dishErr.message);

    // Server-side pricing — frontend totals are never trusted.
    let subtotal = 0;
    const lines = data.items.map((line) => {
      const dish = (dishes ?? []).find((d) => d.id === line.item_id);
      if (!dish) throw new Error(`A dish in your cart is no longer on the menu.`);
      if (!dish.available) throw new Error(`${dish.name} is sold out right now.`);
      const qty = Math.max(1, Math.min(50, Math.round(line.qty)));
      const price =
        line.portion === "Half"
          ? Number(dish.half_price ?? Math.round(Number(dish.price) / 2))
          : line.portion === "Full"
            ? Number(dish.full_price ?? dish.price)
            : Number(dish.price);
      subtotal += price * qty;
      return { item_id: dish.id, name: dish.name, portion: line.portion, qty, price };
    });

    const { data: offers } = await supabase
      .from("offers")
      .select("id,label,min_order,discount_type,value,max_discount,priority,active,expires_at")
      .eq("active", true);

    const now = Date.now();
    const eligible = (offers ?? [])
      .filter(
        (o) =>
          subtotal >= Number(o.min_order) &&
          (!o.expires_at || new Date(o.expires_at).getTime() > now) &&
          (o.discount_type === "flat" || o.discount_type === "percent"),
      )
      .sort((a, b) => b.priority - a.priority);

    const best = eligible[0] ?? null;
    let discount = 0;
    if (best) {
      discount =
        best.discount_type === "percent"
          ? Math.round((subtotal * Number(best.value)) / 100)
          : Number(best.value);
      if (best.max_discount) discount = Math.min(discount, Number(best.max_discount));
      discount = Math.min(discount, subtotal);
    }

    const deliveryFee =
      data.mode === "takeaway" || subtotal - discount >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
    const total = Math.max(0, subtotal - discount) + deliveryFee;

    const orderCode = `AB${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_code: orderCode,
        customer_id: userId,
        customer_name: data.customer_name.trim(),
        phone: data.phone,
        address: data.mode === "delivery" ? data.address.trim() : "",
        landmark: data.landmark.trim(),
        notes: data.notes.trim(),
        mode: data.mode,
        payment_method: data.payment_method,
        payment_status: "pending",
        status: "pending",
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        total,
        offer_id: best?.id ?? null,
      })
      .select("id,order_code,total")
      .single();
    if (orderErr || !order) throw new Error(orderErr?.message ?? "Could not place the order.");

    const { error: itemErr } = await supabase
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemErr) {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      throw new Error(itemErr.message);
    }

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "pending",
      changed_by: userId,
      changed_by_name: data.customer_name.trim(),
      note: "Order placed by customer",
    });

    return { id: order.id, order_code: order.order_code, total: Number(order.total) };
  });
