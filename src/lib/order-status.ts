export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Allowed next steps from each status. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-muted text-foreground",
  confirmed: "bg-primary/10 text-primary",
  preparing: "bg-primary/10 text-primary",
  ready: "bg-veg-soft text-veg",
  out_for_delivery: "bg-veg-soft text-veg",
  delivered: "bg-veg-soft text-veg",
  cancelled: "bg-destructive/10 text-destructive",
};

export const isOrderStatus = (v: string): v is OrderStatus =>
  (ORDER_STATUSES as readonly string[]).includes(v);
