// Menu data — Apna Baithak Vegetarian Restaurant, Eldeco City Lucknow.
// All vegetarian. All prices INR (₹). Source: official PDF menu.
// Pricing rule: two prices = HALF / FULL (Pizza = SMALL / REGULAR stored in half/full).
export type MenuItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  half: number | null;
  full: number | null;
  rating: number;
  category: string;
  categoryId: string;
  description: string | null;
  bestSeller: boolean;
  available: boolean;
};

export type MenuCategory = { id: string; icon: string; name: string };

export const CATEGORIES: MenuCategory[] = [
  { id: "chai-coffee", icon: "☕", name: "Chai & Coffee" },
  { id: "breakfast", icon: "🍳", name: "Breakfast" },
  { id: "maggi", icon: "🍜", name: "Maggi" },
  { id: "sandwich", icon: "🥪", name: "Sandwich" },
  { id: "burger", icon: "🍔", name: "Burger" },
  { id: "pizza", icon: "🍕", name: "Pizza" },
  { id: "chinese", icon: "🍲", name: "Chinese" },
  { id: "snacks", icon: "🍟", name: "Snacks" },
  { id: "paratha-roti", icon: "🫓", name: "Paratha & Roti" },
  { id: "dal-sabzi", icon: "🍛", name: "Dal & Sabzi" },
  { id: "raita", icon: "🥣", name: "Raita" },
  { id: "dessert", icon: "🍨", name: "Dessert" },
  { id: "thali", icon: "🍽️", name: "Thali" },
  { id: "combos", icon: "🍱", name: "Combo" },
];

const img = (n: string) => `/images/foods/${n}.jpg`;

export const MENU_ITEMS: MenuItem[] = [
  // 1. CHAI & COFFEE — single price
  { id: "chai-coffee-chai", name: "Chai", image: img("chai"), price: 15, half: null, full: null, rating: 4.6, category: "Chai & Coffee", categoryId: "chai-coffee", description: "Kadak desi chai", bestSeller: true, available: true },
  { id: "chai-coffee-khullad-chai", name: "Khullad Chai", image: img("khullad-chai"), price: 20, half: null, full: null, rating: 4.7, category: "Chai & Coffee", categoryId: "chai-coffee", description: "Kulhad wali chai", bestSeller: true, available: true },
  { id: "chai-coffee-coffee", name: "Coffee", image: img("coffee"), price: 30, half: null, full: null, rating: 4.4, category: "Chai & Coffee", categoryId: "chai-coffee", description: "Hot coffee", bestSeller: false, available: true },
  { id: "chai-coffee-cold-coffee", name: "Cold Coffee", image: img("cold-coffee"), price: 140, half: null, full: null, rating: 4.6, category: "Chai & Coffee", categoryId: "chai-coffee", description: "Chilled cold coffee", bestSeller: true, available: true },

  // 2. BREAKFAST — single price
  { id: "breakfast-samosa", name: "Samosa", image: img("samosa"), price: 15, half: null, full: null, rating: 4.5, category: "Breakfast", categoryId: "breakfast", description: "Crispy aloo samosa", bestSeller: true, available: true },
  { id: "breakfast-bread-pakora", name: "Bread Pakora", image: img("bread-pakora"), price: 20, half: null, full: null, rating: 4.4, category: "Breakfast", categoryId: "breakfast", description: "1 pc", bestSeller: false, available: true },
  { id: "breakfast-chole-samosa", name: "Chole Samosa", image: img("chole-samosa"), price: 25, half: null, full: null, rating: 4.5, category: "Breakfast", categoryId: "breakfast", description: "Samosa with chole", bestSeller: false, available: true },
  { id: "breakfast-aloo-patties", name: "Aloo Patties", image: img("aloo-patties"), price: 30, half: null, full: null, rating: 4.4, category: "Breakfast", categoryId: "breakfast", description: "1 pc", bestSeller: false, available: true },
  { id: "breakfast-paneer-patties", name: "Paneer Patties", image: img("paneer-patties"), price: 40, half: null, full: null, rating: 4.5, category: "Breakfast", categoryId: "breakfast", description: "1 pc", bestSeller: false, available: true },
  { id: "breakfast-chole-puri", name: "Chole Puri", image: img("chole-puri"), price: 60, half: null, full: null, rating: 4.6, category: "Breakfast", categoryId: "breakfast", description: "4 pcs puri with chole", bestSeller: true, available: true },
  { id: "breakfast-namak-para", name: "Namak Para", image: img("namak-para"), price: 60, half: null, full: null, rating: 4.3, category: "Breakfast", categoryId: "breakfast", description: "250 g", bestSeller: false, available: true },
  { id: "breakfast-chole-chawal", name: "Chole Chawal", image: img("chole-chawal"), price: 80, half: null, full: null, rating: 4.5, category: "Breakfast", categoryId: "breakfast", description: "Chole with steamed rice", bestSeller: false, available: true },
  { id: "breakfast-chole", name: "Chole", image: img("chole"), price: 80, half: null, full: null, rating: 4.4, category: "Breakfast", categoryId: "breakfast", description: "Breakfast chole bowl", bestSeller: false, available: true },
  { id: "breakfast-aloo-pakora", name: "Aloo Pakora", image: img("aloo-pakora"), price: 80, half: null, full: null, rating: 4.4, category: "Breakfast", categoryId: "breakfast", description: "16 pcs", bestSeller: false, available: true },
  { id: "breakfast-pyaz-pakora", name: "Pyaz Pakora", image: img("pyaz-pakora"), price: 90, half: null, full: null, rating: 4.4, category: "Breakfast", categoryId: "breakfast", description: "16 pcs", bestSeller: false, available: true },
  { id: "breakfast-paneer-pakora", name: "Paneer Pakora", image: img("paneer-pakora"), price: 140, half: null, full: null, rating: 4.6, category: "Breakfast", categoryId: "breakfast", description: "16 pcs", bestSeller: true, available: true },

  // 3. MAGGI — HALF / FULL
  { id: "maggi-plain-maggi", name: "Plain Maggi", image: img("plain-maggi"), price: 40, half: 40, full: 80, rating: 4.5, category: "Maggi", categoryId: "maggi", description: "Classic plain maggi", bestSeller: true, available: true },
  { id: "maggi-double-masala-maggi", name: "Double Masala Maggi", image: img("double-masala-maggi"), price: 50, half: 50, full: 100, rating: 4.5, category: "Maggi", categoryId: "maggi", description: "Extra masala", bestSeller: false, available: true },
  { id: "maggi-butter-veggies-maggi", name: "Butter Veggies Maggi", image: img("butter-veggies-maggi"), price: 60, half: 60, full: 120, rating: 4.5, category: "Maggi", categoryId: "maggi", description: "Butter + mixed veggies", bestSeller: false, available: true },
  { id: "maggi-paneer-maggi", name: "Paneer Maggi", image: img("paneer-maggi"), price: 70, half: 70, full: 140, rating: 4.6, category: "Maggi", categoryId: "maggi", description: "With paneer cubes", bestSeller: false, available: true },
  { id: "maggi-cheese-maggi", name: "Cheese Maggi", image: img("cheese-maggi"), price: 80, half: 80, full: 150, rating: 4.6, category: "Maggi", categoryId: "maggi", description: "Cheesy maggi", bestSeller: true, available: true },

  // 4. SANDWICH — single price
  { id: "sandwich-veg-sandwich", name: "Veg Sandwich", image: img("veg-sandwich"), price: 50, half: null, full: null, rating: 4.4, category: "Sandwich", categoryId: "sandwich", description: "Grilled veg sandwich", bestSeller: false, available: true },
  { id: "sandwich-paneer-sandwich", name: "Paneer Sandwich", image: img("paneer-sandwich"), price: 80, half: null, full: null, rating: 4.5, category: "Sandwich", categoryId: "sandwich", description: "Paneer filling", bestSeller: false, available: true },
  { id: "sandwich-cheese-sandwich", name: "Cheese Sandwich", image: img("cheese-sandwich"), price: 80, half: null, full: null, rating: 4.5, category: "Sandwich", categoryId: "sandwich", description: "Cheese filling", bestSeller: false, available: true },

  // 5. BURGER — single price
  { id: "burger-aloo-tikki-burger", name: "Aloo Tikki Burger", image: img("aloo-tikki-burger"), price: 60, half: null, full: null, rating: 4.4, category: "Burger", categoryId: "burger", description: "Crispy aloo tikki", bestSeller: true, available: true },
  { id: "burger-veg-burger", name: "Veg Burger", image: img("veg-burger"), price: 70, half: null, full: null, rating: 4.4, category: "Burger", categoryId: "burger", description: "Veg patty burger", bestSeller: false, available: true },
  { id: "burger-paneer-burger", name: "Paneer Burger", image: img("paneer-burger"), price: 90, half: null, full: null, rating: 4.5, category: "Burger", categoryId: "burger", description: "Paneer patty burger", bestSeller: false, available: true },
  { id: "burger-cheese-burger", name: "Cheese Burger", image: img("cheese-burger"), price: 90, half: null, full: null, rating: 4.5, category: "Burger", categoryId: "burger", description: "Cheese slice burger", bestSeller: false, available: true },

  // 6. PIZZA — SMALL / REGULAR (stored in half/full)
  { id: "pizza-onion-pizza", name: "Onion Pizza", image: img("onion-pizza"), price: 120, half: 120, full: 200, rating: 4.5, category: "Pizza", categoryId: "pizza", description: "Small ₹120 / Regular ₹200", bestSeller: true, available: true },
  { id: "pizza-paneer-pizza", name: "Paneer Pizza", image: img("paneer-pizza"), price: 130, half: 130, full: 220, rating: 4.6, category: "Pizza", categoryId: "pizza", description: "Small ₹130 / Regular ₹220", bestSeller: true, available: true },

  // 7. CHINESE — HALF / FULL
  { id: "chinese-veg-noodles", name: "Veg Noodles", image: img("veg-noodles"), price: 60, half: 60, full: 110, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "Classic veg noodles", bestSeller: true, available: true },
  { id: "chinese-chilli-garlic-noodles", name: "Chilli Garlic Noodles", image: img("chilli-garlic-noodles"), price: 70, half: 70, full: 130, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "Spicy garlic flavour", bestSeller: false, available: true },
  { id: "chinese-butter-noodles", name: "Butter Noodles", image: img("butter-noodles"), price: 70, half: 70, full: 130, rating: 4.4, category: "Chinese", categoryId: "chinese", description: "Buttery noodles", bestSeller: false, available: true },
  { id: "chinese-fried-rice", name: "Fried Rice", image: img("veg-fried-rice"), price: 70, half: 70, full: 130, rating: 4.4, category: "Chinese", categoryId: "chinese", description: "Veg fried rice", bestSeller: false, available: true },
  { id: "chinese-paneer-noodles", name: "Paneer Noodles", image: img("paneer-noodles"), price: 70, half: 70, full: 130, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "With paneer", bestSeller: false, available: true },
  { id: "chinese-schezwan-noodles", name: "Schezwan Noodles", image: img("schezwan-noodles"), price: 70, half: 70, full: 150, rating: 4.6, category: "Chinese", categoryId: "chinese", description: "Schezwan style", bestSeller: true, available: true },
  { id: "chinese-manchurian", name: "Manchurian", image: img("manchurian"), price: 80, half: 80, full: 150, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "Veg manchurian", bestSeller: true, available: true },
  { id: "chinese-schezwan-fried-rice", name: "Schezwan Fried Rice", image: img("schezwan-fried-rice"), price: 80, half: 80, full: 150, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "Schezwan rice", bestSeller: false, available: true },
  { id: "chinese-paneer-fried-rice", name: "Paneer Fried Rice", image: img("paneer-fried-rice"), price: 80, half: 80, full: 150, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "With paneer", bestSeller: false, available: true },
  { id: "chinese-chilli-potato", name: "Chilli Potato", image: img("chilli-potato"), price: 80, half: 80, full: 150, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "Crispy chilli potato", bestSeller: true, available: true },
  { id: "chinese-paneer-manchurian", name: "Paneer Manchurian", image: img("paneer-manchurian"), price: 90, half: 90, full: 170, rating: 4.5, category: "Chinese", categoryId: "chinese", description: "Paneer manchurian", bestSeller: false, available: true },
  { id: "chinese-chilli-paneer", name: "Chilli Paneer", image: img("chilli-paneer"), price: 100, half: 100, full: 190, rating: 4.7, category: "Chinese", categoryId: "chinese", description: "Restaurant style chilli paneer", bestSeller: true, available: true },
  { id: "chinese-honey-chilli-potato", name: "Honey Chilli Potato", image: img("honey-chilli-potato"), price: 100, half: 100, full: 190, rating: 4.6, category: "Chinese", categoryId: "chinese", description: "Sweet-spicy", bestSeller: true, available: true },

  // 8. SNACKS — mixed
  { id: "snacks-kebab-tikki", name: "Kebab Tikki", image: img("kebab-tikki"), price: 20, half: null, full: null, rating: 4.4, category: "Snacks", categoryId: "snacks", description: "1 pc", bestSeller: false, available: true },
  { id: "snacks-kebab-paratha", name: "Kebab Paratha", image: img("kebab-paratha"), price: 20, half: null, full: null, rating: 4.4, category: "Snacks", categoryId: "snacks", description: "Kebab with paratha", bestSeller: false, available: true },
  { id: "snacks-kebab-roll", name: "Kebab Roll", image: img("kebab-roll"), price: 40, half: null, full: null, rating: 4.5, category: "Snacks", categoryId: "snacks", description: "Veg kebab roll", bestSeller: true, available: true },
  { id: "snacks-biryani", name: "Biryani", image: img("biryani"), price: 50, half: 50, full: 100, rating: 4.5, category: "Snacks", categoryId: "snacks", description: "Veg biryani", bestSeller: true, available: true },
  { id: "snacks-finger-chips", name: "Finger Chips", image: img("finger-chips"), price: 50, half: 50, full: 100, rating: 4.4, category: "Snacks", categoryId: "snacks", description: "Crispy fries", bestSeller: false, available: true },
  { id: "snacks-spring-roll", name: "Spring Roll", image: img("spring-roll"), price: 50, half: 50, full: 100, rating: 4.4, category: "Snacks", categoryId: "snacks", description: "Veg spring roll", bestSeller: false, available: true },
  { id: "snacks-steam-momos", name: "Steam Momos", image: img("steam-momos"), price: 50, half: 50, full: 100, rating: 4.6, category: "Snacks", categoryId: "snacks", description: "Steamed veg momos", bestSeller: true, available: true },
  { id: "snacks-fried-momos", name: "Fried Momos", image: img("fried-momos"), price: 60, half: 60, full: 120, rating: 4.5, category: "Snacks", categoryId: "snacks", description: "Crispy fried momos", bestSeller: false, available: true },
  { id: "snacks-chilli-momos", name: "Chilli Momos", image: img("chilli-momos"), price: 70, half: 70, full: 130, rating: 4.5, category: "Snacks", categoryId: "snacks", description: "Spicy chilli momos", bestSeller: false, available: true },
  { id: "snacks-paneer-momos-steam", name: "Paneer Momos Steam", image: img("paneer-momos-steam"), price: 80, half: 80, full: 150, rating: 4.6, category: "Snacks", categoryId: "snacks", description: "Steamed paneer momos", bestSeller: true, available: true },
  { id: "snacks-paneer-fried", name: "Paneer Fried", image: img("paneer-fried-momos"), price: 90, half: 90, full: 160, rating: 4.5, category: "Snacks", categoryId: "snacks", description: "Fried paneer momos", bestSeller: false, available: true },
  { id: "snacks-chilli-paneer-momos", name: "Chilli Paneer Momos", image: img("chilli-paneer-momos"), price: 100, half: 100, full: 180, rating: 4.6, category: "Snacks", categoryId: "snacks", description: "Chilli paneer momos", bestSeller: true, available: true },

  // 9. PARATHA & ROTI — single price
  { id: "paratha-roti-tawa-roti", name: "Tawa Roti", image: img("tawa-roti"), price: 10, half: null, full: null, rating: 4.5, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Fresh tawa roti", bestSeller: false, available: true },
  { id: "paratha-roti-butter-roti", name: "Butter Roti", image: img("butter-roti"), price: 15, half: null, full: null, rating: 4.5, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Tawa roti with butter", bestSeller: false, available: true },
  { id: "paratha-roti-plain-paratha", name: "Plain Paratha", image: img("plain-paratha"), price: 25, half: null, full: null, rating: 4.4, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Tawa plain paratha", bestSeller: false, available: true },
  { id: "paratha-roti-lachha-paratha", name: "Lachha Paratha", image: img("lachha-paratha"), price: 40, half: null, full: null, rating: 4.6, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Layered lachha paratha", bestSeller: true, available: true },
  { id: "paratha-roti-aloo-paratha", name: "Aloo Paratha", image: img("aloo-paratha"), price: 50, half: null, full: null, rating: 4.6, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Stuffed aloo paratha", bestSeller: true, available: true },
  { id: "paratha-roti-pyaz-paratha", name: "Pyaz Paratha", image: img("pyaz-paratha"), price: 60, half: null, full: null, rating: 4.5, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Onion stuffed paratha", bestSeller: false, available: true },
  { id: "paratha-roti-paneer-paratha", name: "Paneer Paratha", image: img("paneer-paratha"), price: 100, half: null, full: null, rating: 4.7, category: "Paratha & Roti", categoryId: "paratha-roti", description: "Paneer stuffed paratha", bestSeller: true, available: true },

  // 10. DAL & SABZI — HALF / FULL
  { id: "dal-sabzi-aloo-jeera", name: "Aloo Jeera", image: img("aloo-jeera"), price: 70, half: 70, full: 130, rating: 4.4, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Jeera aloo", bestSeller: false, available: true },
  { id: "dal-sabzi-aloo-matar", name: "Aloo Matar", image: img("aloo-matar"), price: 70, half: 70, full: 130, rating: 4.4, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Aloo matar sabzi", bestSeller: false, available: true },
  { id: "dal-sabzi-aloo-matar-tamatar", name: "Aloo Matar Tamatar", image: img("aloo-matar-tamatar"), price: 70, half: 70, full: 130, rating: 4.4, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "With tomato gravy", bestSeller: false, available: true },
  { id: "dal-sabzi-chole", name: "Chole", image: img("chole-masala"), price: 70, half: 70, full: 130, rating: 4.5, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Chole masala", bestSeller: true, available: true },
  { id: "dal-sabzi-arhar-dal-fry", name: "Arhar Dal Fry", image: img("arhar-dal-fry"), price: 80, half: 80, full: 150, rating: 4.5, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Tadka arhar dal", bestSeller: false, available: true },
  { id: "dal-sabzi-matar-paneer", name: "Matar Paneer", image: img("matar-paneer"), price: 100, half: 100, full: 180, rating: 4.6, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Matar paneer curry", bestSeller: true, available: true },
  { id: "dal-sabzi-matar-mushroom", name: "Matar Mushroom", image: img("matar-mushroom"), price: 110, half: 110, full: 200, rating: 4.5, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Mushroom matar", bestSeller: false, available: true },
  { id: "dal-sabzi-kadai-paneer", name: "Kadai Paneer", image: img("kadai-paneer"), price: 120, half: 120, full: 220, rating: 4.7, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Kadai masala paneer", bestSeller: true, available: true },
  { id: "dal-sabzi-shahi-paneer", name: "Shahi Paneer", image: img("shahi-paneer"), price: 120, half: 120, full: 220, rating: 4.7, category: "Dal & Sabzi", categoryId: "dal-sabzi", description: "Rich shahi paneer", bestSeller: true, available: true },

  // 11. RAITA — single price
  { id: "raita-boondi-raita", name: "Boondi Raita", image: img("boondi-raita"), price: 70, half: null, full: null, rating: 4.4, category: "Raita", categoryId: "raita", description: "Boondi raita bowl", bestSeller: false, available: true },
  { id: "raita-kheera-raita", name: "Kheera Raita", image: img("kheera-raita"), price: 70, half: null, full: null, rating: 4.4, category: "Raita", categoryId: "raita", description: "Cucumber raita", bestSeller: false, available: true },

  // 12. DESSERT — single price
  { id: "dessert-gulab-jamun", name: "Gulab Jamun", image: img("gulab-jamun"), price: 25, half: null, full: null, rating: 4.7, category: "Dessert", categoryId: "dessert", description: "1 pc", bestSeller: true, available: true },
  { id: "dessert-rasgulla", name: "Rasgulla", image: img("rasgulla"), price: 25, half: null, full: null, rating: 4.6, category: "Dessert", categoryId: "dessert", description: "1 pc", bestSeller: false, available: true },
  { id: "dessert-dahi-bada", name: "Dahi Bada", image: img("dahi-bada"), price: 30, half: null, full: null, rating: 4.5, category: "Dessert", categoryId: "dessert", description: "1 pc", bestSeller: false, available: true },
  { id: "dessert-kheer", name: "Kheer", image: img("kheer"), price: 100, half: null, full: null, rating: 4.6, category: "Dessert", categoryId: "dessert", description: "Rice kheer bowl", bestSeller: true, available: true },

  // 13. THALI — single price
  { id: "thali-thali", name: "Thali", image: img("thali"), price: 120, half: null, full: null, rating: 4.7, category: "Thali", categoryId: "thali", description: "4 Roti + Daal + Sabji + Jeera Rice + Salad + Raita", bestSeller: true, available: true },
  { id: "thali-special-thali", name: "Special Thali", image: img("special-thali"), price: 200, half: null, full: null, rating: 4.8, category: "Thali", categoryId: "thali", description: "Paneer Sabji/Mushroom + Daal Fry/Daal Makhni + Papad + 1 Lachha Paratha + 2 Tawa Roti + Jeera Rice + Salad + Raita + 1 Rasgulla", bestSeller: true, available: true },

  // 14. COMBO — single price, visually highlighted via bestSeller
  { id: "combos-combo-140", name: "Combo 140", image: img("combo-140"), price: 140, half: null, full: null, rating: 4.7, category: "Combo", categoryId: "combos", description: "Veg Noodles + Finger Chips + Chilli Paneer + Cold Drink", bestSeller: true, available: true },
  { id: "combos-combo-160", name: "Combo 160", image: img("combo-160"), price: 160, half: null, full: null, rating: 4.7, category: "Combo", categoryId: "combos", description: "Manchurian + Fried Rice + Chilli Paneer + Cold Drink", bestSeller: true, available: true },
];
