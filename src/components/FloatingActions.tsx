import { MessageCircle, Phone } from "lucide-react";
import { RESTAURANT, waLink } from "@/data/site";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-3">
      <a
        href={waLink("Hi Apna Baithak! I would like to order.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Order on WhatsApp"
        className="grid size-13 place-items-center rounded-full bg-veg text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="size-6" />
      </a>
      <a
        href={`tel:${RESTAURANT.phone}`}
        aria-label="Call the restaurant"
        className="grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Phone className="size-6" />
      </a>
    </div>
  );
}
