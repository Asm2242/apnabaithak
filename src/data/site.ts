export const ORIGIN = "https://apnabaithak.vercel.app";

export const RESTAURANT = {
  name: "APNA BAITHAK",
  tagline: "Pure Veg • Eldeco City",
  phone: "9454999442",
  phoneDisplay: "+91 9454999442",
  whatsapp: "919454999442",
  email: "contact@apnabaithak.example",
  address:
    "Apna Baithak Vegetarian Restaurant, Eldeco City, Lucknow, Uttar Pradesh",
  area: "Eldeco City, Lucknow",
  hours: "7:30 AM – 10:00 PM",
  days: "All Days",
  rating: 4.6,
  coords: "26.9381402, 80.9129123",
  maps:
    "https://www.google.com/maps/place/APNA+BAITHAK+VEGITERIAN+RESTAURANT/@26.9383956,80.9125479,18.51z/data=!4m6!3m5!1s0x3999579a39ab8ffd:0x77a1bd2200e446b!8m2!3d26.9381402!4d80.9129123!16s%2Fg%2F11nvgvl9m5?entry=ttu",
  logo: "/logo-neon.svg",
};

export const waLink = (text = "Hi Apna Baithak") =>
  `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(text)}`;

export type Offer = {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  minOrder: number;
  type: "flat" | "freeItem" | "bulk";
  value: number;
  badge: string;
  priority: number;
  tone: "brown" | "green" | "purple" | "orange";
};

export const OFFERS: Offer[] = [
  {
    id: "flat75",
    emoji: "🎉",
    label: "₹75 OFF",
    desc: "₹75 off on orders above ₹499",
    minOrder: 499,
    type: "flat",
    value: 75,
    badge: "SAVE ₹75",
    priority: 1,
    tone: "orange",
  },
  {
    id: "flat150",
    emoji: "💥",
    label: "₹150 OFF",
    desc: "₹150 off on orders above ₹999",
    minOrder: 999,
    type: "flat",
    value: 150,
    badge: "SAVE ₹150",
    priority: 2,
    tone: "brown",
  },
  {
    id: "freeItem200",
    emoji: "🎁",
    label: "FREE ITEM ₹200",
    desc: "Order ₹1500+ and get any item worth ₹200 free",
    minOrder: 1500,
    type: "freeItem",
    value: 200,
    badge: "FREE ITEM",
    priority: 3,
    tone: "green",
  },
  {
    id: "freeItem250",
    emoji: "🏆",
    label: "FREE ITEM ₹250",
    desc: "Order ₹2000+ and get any item worth ₹250 free",
    minOrder: 2000,
    type: "freeItem",
    value: 250,
    badge: "FREE ITEM",
    priority: 4,
    tone: "purple",
  },
  {
    id: "bulk3000",
    emoji: "📦",
    label: "BULK OFFER",
    desc: "Special bulk order pricing - contact us for custom quote",
    minOrder: 3000,
    type: "bulk",
    value: 0,
    badge: "CUSTOM",
    priority: 5,
    tone: "orange",
  },
];

export const FREE_DELIVERY_AT = 399;

const g = (n: string) => `/images/gallery/${encodeURIComponent(n)}`;

export type GalleryImage = { src: string; caption: string; kind: "Restaurant" | "Food" };

export const GALLERY: GalleryImage[] = [
  { src: g("WhatsApp Image 2026-08-23 at 11.08.40 PM.jpeg"), caption: "Front • Night glow", kind: "Restaurant" },
  { src: g("WhatsApp Image 2026-08-23 at 11.08.41 PM.jpeg"), caption: "Apna Baithak • Signage", kind: "Restaurant" },
  { src: g("WhatsApp Image 2026-08-23 at 11.08.42 PM.jpeg"), caption: "Live wok • Flame", kind: "Restaurant" },
  { src: g("WhatsApp Image 2026-08-23 at 11.08.43 PM.jpeg"), caption: "Evening • Crowd favourite", kind: "Restaurant" },
  { src: g("WhatsApp Image 2026-08-23 at 11.08.44 PM.jpeg"), caption: "Counter • Pure Veg", kind: "Restaurant" },
  { src: g("WhatsApp Image 2026-08-23 at 11.08.41 PM (1).jpeg"), caption: "Outdoor seating", kind: "Restaurant" },
  { src: `/images/foods/special-thali.jpg`, caption: "special thali", kind: "Food" },
  { src: `/images/foods/steam-momos-6-pc.jpg`, caption: "steam momos 6 pc", kind: "Food" },
  { src: `/images/foods/mini-combo.jpg`, caption: "mini combo", kind: "Food" },
  { src: `/images/foods/jeera-rice.jpg`, caption: "jeera rice", kind: "Food" },
  { src: `/images/foods/malai-chaap.jpg`, caption: "malai chaap", kind: "Food" },
  { src: `/images/foods/afghani-chaap.jpg`, caption: "afghani chaap", kind: "Food" },
  { src: `/images/foods/thali.jpg`, caption: "thali", kind: "Food" },
  { src: `/images/foods/paneer-butter-masala.jpg`, caption: "paneer butter masala", kind: "Food" },
  { src: `/images/foods/paneer-burger.jpg`, caption: "paneer burger", kind: "Food" },
  { src: `/images/foods/schezwan-noodles.jpg`, caption: "schezwan noodles", kind: "Food" },
  { src: `/images/foods/tandoori-momos.jpg`, caption: "tandoori momos", kind: "Food" },
  { src: `/images/foods/chilli-paneer.jpg`, caption: "chilli paneer", kind: "Food" },
  { src: `/images/foods/malai-chaap-roll.jpg`, caption: "malai chaap roll", kind: "Food" },
  { src: `/images/foods/kadai-chaap.jpg`, caption: "kadai chaap", kind: "Food" },
  { src: `/images/foods/honey-chilli-potato.jpg`, caption: "honey chilli potato", kind: "Food" },
  { src: `/images/foods/cold-coffee.jpg`, caption: "cold coffee", kind: "Food" },
  { src: `/images/foods/family-combo.jpg`, caption: "family combo", kind: "Food" },
  { src: `/images/foods/paneer-tikka-chaap.jpg`, caption: "paneer tikka chaap", kind: "Food" },
  { src: `/images/foods/veg-fried-rice.jpg`, caption: "veg fried rice", kind: "Food" },
  { src: `/images/foods/shahi-paneer.jpg`, caption: "shahi paneer", kind: "Food" },
  { src: `/images/foods/crispy-momos.jpg`, caption: "crispy momos", kind: "Food" },
  { src: `/images/foods/butter-naan.jpg`, caption: "butter naan", kind: "Food" },
];

export type BulkOrder = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  company: string;
  items: string;
  qty: number;
  delivery: string;
  quoted: number | null;
  status: string;
  created: string;
};

export const BULK_ORDERS: BulkOrder[] = [
  {
    id: "bulk-1",
    customer: "ABC Corporation",
    phone: "9876543210",
    email: "orders@abc.com",
    company: "ABC Corp",
    items: "Thali x50, Special Thali x30",
    qty: 100,
    delivery: "2026-09-05",
    quoted: 25000,
    status: "quoted",
    created: "1/20/2024, 10:30:00 AM",
  },
  {
    id: "bulk-2",
    customer: "XYZ School",
    phone: "9876543211",
    email: "admin@xyzschool.edu",
    company: "XYZ School",
    items: "Mini Combo x100",
    qty: 150,
    delivery: "2026-09-10",
    quoted: null,
    status: "new",
    created: "1/22/2024, 2:20:00 PM",
  },
  {
    id: "bulk-3",
    customer: "Tech Solutions Pvt Ltd",
    phone: "9876543212",
    email: "hr@techsolutions.com",
    company: "Tech Solutions",
    items: "Family Combo x30",
    qty: 40,
    delivery: "2026-09-02",
    quoted: 18500,
    status: "quoted",
    created: "1/18/2024, 9:15:00 AM",
  },
];
