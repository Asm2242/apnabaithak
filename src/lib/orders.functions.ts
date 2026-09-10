import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHmac, timingSafeEqual } from "crypto";

export type PlaceOrderInput = {
  items: { item_id: string; portion: "Half" | "Full" | "Regular"; qty: number }[];
  customer_name: string;
  phone: string;
  address: string;
  landmark: string;
  notes: string;
  mode: "delivery" | "takeaway";
  payment_method: "cod" | "upi" | "razorpay";
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

type SupabaseLike = {
  from: (table: string) => any;
};

// Server-side pricing — frontend totals are never trusted.
async function priceCart(supabase: SupabaseLike, data: PlaceOrderInput) {
  const ids = [...new Set(data.items.map((i) => i.item_id))];
  const { data: dishes, error: dishErr } = await supabase
    .from("menu_items")
    .select("id,name,price,half_price,full_price,available")
    .in("id", ids);
  if (dishErr) throw new Error(dishErr.message);

  let subtotal = 0;
  const lines = data.items.map((line) => {
    const dish = (dishes ?? []).find((d: any) => d.id === line.item_id);
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
      (o: any) =>
        subtotal >= Number(o.min_order) &&
        (!o.expires_at || new Date(o.expires_at).getTime() > now) &&
        (o.discount_type === "flat" || o.discount_type === "percent"),
    )
    .sort((a: any, b: any) => b.priority - a.priority);

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

  return { lines, subtotal, discount, deliveryFee, total, best };
}

function newOrderCode() {
  return `AB${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${Math.floor(
    1000 + Math.random() * 9000,
  )}`;
}

async function insertOrder(
  supabase: SupabaseLike,
  userId: string,
  data: PlaceOrderInput,
  extra: Record<string, unknown> = {},
) {
  const priced = await priceCart(supabase, data);
  const orderCode = newOrderCode();

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
      subtotal: priced.subtotal,
      discount: priced.discount,
      delivery_fee: priced.deliveryFee,
      total: priced.total,
      offer_id: priced.best?.id ?? null,
      ...extra,
    })
    .select("id,order_code,total")
    .single();
  if (orderErr || !order) throw new Error(orderErr?.message ?? "Could not place the order.");

  const { error: itemErr } = await supabase
    .from("order_items")
    .insert(priced.lines.map((l) => ({ ...l, order_id: order.id })));
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

  return { order, priced };
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlaceOrderInput) => validate(input))
  .handler(async ({ data, context }) => {
    const { order } = await insertOrder(context.supabase, context.userId, data);
    return { id: order.id, order_code: order.order_code, total: Number(order.total) };
  });

// Creates the order in the database AND a matching Razorpay order.
export const placeOnlineOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlaceOrderInput) => validate(input))
  .handler(async ({ data, context }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Online payment is not configured yet.");

    // Price first so we never create a payment for an invalid cart.
    const priced = await priceCart(context.supabase, data);
    if (priced.total < 1) throw new Error("Order total must be at least ₹1 for online payment.");

    const orderCode = newOrderCode();
    const auth = btoa(`${keyId}:${keySecret}`);
    const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(priced.total * 100),
        currency: "INR",
        receipt: orderCode,
        notes: { restaurant: "Apna Baithak", phone: data.phone },
      }),
    });
    const rpBody = (await rpRes.json()) as { id?: string; error?: { description?: string } };
    if (!rpRes.ok || !rpBody.id)
      throw new Error(rpBody.error?.description ?? "Could not start online payment. Try again.");

    const { order } = await insertOrder(context.supabase, context.userId, data, {
      razorpay_order_id: rpBody.id,
    });

    return {
      id: order.id,
      order_code: order.order_code,
      total: Number(order.total),
      razorpay_order_id: rpBody.id,
      razorpay_key_id: keyId,
    };
  });

// Verifies the Razorpay signature after checkout, then marks the order paid.
export const confirmOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      if (!input.order_id || !input.razorpay_payment_id || !input.razorpay_signature)
        throw new Error("Missing payment details.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const keySecret = process.env["RAZORPAY_KEY_SECRET"]!;

    const { data: order } = await supabase
      .from("orders")
      .select("id,customer_id,razorpay_order_id,payment_status,order_code,total")
      .eq("id", data.order_id)
      .single();
    if (!order || order.customer_id !== userId) throw new Error("Order not found.");
    if (order.payment_status === "paid")
      return { ok: true, order_code: order.order_code, total: Number(order.total) };

    const expected = createHmac("sha256", keySecret)
      .update(`${order.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      throw new Error("Payment verification failed. If money was deducted, contact us.");

    await supabase
      .from("orders")
      .update({ payment_status: "paid", razorpay_payment_id: data.razorpay_payment_id })
      .eq("id", order.id);

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "pending",
      changed_by: userId,
      changed_by_name: "Online payment",
      note: `Payment received online (${data.razorpay_payment_id})`,
    });

    return { ok: true, order_code: order.order_code, total: Number(order.total) };
  });
