import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MENU_ITEMS, type MenuItem } from "@/data/menu";
import { FREE_DELIVERY_AT, OFFERS, type Offer } from "@/data/site";

export type CartLine = {
  key: string;
  id: string;
  name: string;
  image: string;
  portion: "Half" | "Full" | "Regular";
  price: number;
  qty: number;
};

export type Customer = { name: string; email: string; phone: string };

type ShopState = {
  ready: boolean;
  lines: CartLine[];
  wishlist: string[];
  customer: Customer | null;
  add: (item: MenuItem, portion?: "Half" | "Full" | "Regular") => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  signup: (c: Customer & { password: string }) => { ok: boolean; error?: string };
  logout: () => void;
  count: number;
  subtotal: number;
  bestOffer: Offer | null;
  discount: number;
  delivery: number;
  total: number;
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "ab_cart";
const WISH_KEY = "ab_wishlist";
const USER_KEY = "ab_customer";
const USERS_KEY = "ab_customers";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function priceFor(item: MenuItem, portion: "Half" | "Full" | "Regular") {
  if (portion === "Half") return item.half ?? Math.round(item.price / 2);
  if (portion === "Full") return item.full ?? item.price;
  return item.price;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setLines(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setCustomer(read<Customer | null>(USER_KEY, null));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(CART_KEY, lines);
  }, [lines, ready]);
  useEffect(() => {
    if (ready) write(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const add = useCallback(
    (item: MenuItem, portion: "Half" | "Full" | "Regular" = "Regular") => {
      const price = priceFor(item, portion);
      const key = `${item.id}::${portion}`;
      setLines((prev) => {
        const found = prev.find((l) => l.key === key);
        if (found) {
          return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
        }
        return [
          ...prev,
          { key, id: item.id, name: item.name, image: item.image, portion, price, qty: 1 },
        ];
      });
    },
    [],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const signup = useCallback((c: Customer & { password: string }) => {
    const users = read<(Customer & { password: string })[]>(USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === c.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (users.some((u) => u.phone === c.phone)) {
      return { ok: false, error: "One account per phone number." };
    }
    write(USERS_KEY, [...users, c]);
    const profile = { name: c.name, email: c.email, phone: c.phone };
    write(USER_KEY, profile);
    setCustomer(profile);
    return { ok: true };
  }, []);

  const login = useCallback((identifier: string, password: string) => {
    const users = read<(Customer & { password: string })[]>(USERS_KEY, []);
    const found = users.find(
      (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier,
    );
    if (!found || found.password !== password) {
      return { ok: false, error: "Invalid credentials. Check your email/phone and password." };
    }
    const profile = { name: found.name, email: found.email, phone: found.phone };
    write(USER_KEY, profile);
    setCustomer(profile);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    write(USER_KEY, null);
    setCustomer(null);
  }, []);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const bestOffer =
    OFFERS.filter((o) => o.type !== "bulk" && subtotal >= o.minOrder).sort(
      (a, b) => b.priority - a.priority,
    )[0] ?? null;
  const discount = bestOffer?.type === "flat" ? bestOffer.value : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_AT ? 0 : 39;
  const total = Math.max(0, subtotal - discount) + delivery;

  const value = useMemo<ShopState>(
    () => ({
      ready,
      lines,
      wishlist,
      customer,
      add,
      setQty,
      remove,
      clear,
      toggleWish,
      login,
      signup,
      logout,
      count,
      subtotal,
      bestOffer,
      discount,
      delivery,
      total,
    }),
    [
      ready,
      lines,
      wishlist,
      customer,
      add,
      setQty,
      remove,
      clear,
      toggleWish,
      login,
      signup,
      logout,
      count,
      subtotal,
      bestOffer,
      discount,
      delivery,
      total,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export const itemById = (id: string) => MENU_ITEMS.find((i) => i.id === id);

export const rupees = (n: number) =>
  `₹${Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0"}`;
