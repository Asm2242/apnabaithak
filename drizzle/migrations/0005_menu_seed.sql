-- SEED: 14 categories + 81 vegetarian items (INR) for Apna Baithak ---------------
-- Run AFTER 0000-0004 in Supabase Dashboard > SQL Editor.
-- Pricing rule: two prices = HALF / FULL. Pizza SMALL/REGULAR stored in
-- half_price/full_price. Single-price items have NULL half/full.
-- All items vegetarian (is_veg = true). Prices in INR, never USD.

insert into public.categories (id, name, icon, sort_order, active) values
  ('chai-coffee', 'Chai & Coffee', '☕', 1, true),
  ('breakfast', 'Breakfast', '🍳', 2, true),
  ('maggi', 'Maggi', '🍜', 3, true),
  ('sandwich', 'Sandwich', '🥪', 4, true),
  ('burger', 'Burger', '🍔', 5, true),
  ('pizza', 'Pizza', '🍕', 6, true),
  ('chinese', 'Chinese', '🍲', 7, true),
  ('snacks', 'Snacks', '🍟', 8, true),
  ('paratha-roti', 'Paratha & Roti', '🫓', 9, true),
  ('dal-sabzi', 'Dal & Sabzi', '🍛', 10, true),
  ('raita', 'Raita', '🥣', 11, true),
  ('dessert', 'Dessert', '🍨', 12, true),
  ('thali', 'Thali', '🍽️', 13, true),
  ('combos', 'Combo', '🍱', 14, true)
on conflict (id) do update set name = excluded.name, icon = excluded.icon,
  sort_order = excluded.sort_order, active = true;

insert into public.menu_items
  (id, category_id, name, description, image, price, half_price, full_price, rating, is_veg, best_seller, available, sort_order)
values
  -- 1. CHAI & COFFEE
  ('chai-coffee-chai', 'chai-coffee', 'Chai', 'Kadak desi chai', '/images/foods/chai.jpg', 15, null, null, 4.6, true, true, true, 1),
  ('chai-coffee-khullad-chai', 'chai-coffee', 'Khullad Chai', 'Kulhad wali chai', '/images/foods/khullad-chai.jpg', 20, null, null, 4.7, true, true, true, 2),
  ('chai-coffee-coffee', 'chai-coffee', 'Coffee', 'Hot coffee', '/images/foods/coffee.jpg', 30, null, null, 4.4, true, false, true, 3),
  ('chai-coffee-cold-coffee', 'chai-coffee', 'Cold Coffee', 'Chilled cold coffee', '/images/foods/cold-coffee.jpg', 140, null, null, 4.6, true, true, true, 4),
  -- 2. BREAKFAST
  ('breakfast-samosa', 'breakfast', 'Samosa', 'Crispy aloo samosa', '/images/foods/samosa.jpg', 15, null, null, 4.5, true, true, true, 5),
  ('breakfast-bread-pakora', 'breakfast', 'Bread Pakora', '1 pc', '/images/foods/bread-pakora.jpg', 20, null, null, 4.4, true, false, true, 6),
  ('breakfast-chole-samosa', 'breakfast', 'Chole Samosa', 'Samosa with chole', '/images/foods/chole-samosa.jpg', 25, null, null, 4.5, true, false, true, 7),
  ('breakfast-aloo-patties', 'breakfast', 'Aloo Patties', '1 pc', '/images/foods/aloo-patties.jpg', 30, null, null, 4.4, true, false, true, 8),
  ('breakfast-paneer-patties', 'breakfast', 'Paneer Patties', '1 pc', '/images/foods/paneer-patties.jpg', 40, null, null, 4.5, true, false, true, 9),
  ('breakfast-chole-puri', 'breakfast', 'Chole Puri', '4 pcs puri with chole', '/images/foods/chole-puri.jpg', 60, null, null, 4.6, true, true, true, 10),
  ('breakfast-namak-para', 'breakfast', 'Namak Para', '250 g', '/images/foods/namak-para.jpg', 60, null, null, 4.3, true, false, true, 11),
  ('breakfast-chole-chawal', 'breakfast', 'Chole Chawal', 'Chole with steamed rice', '/images/foods/chole-chawal.jpg', 80, null, null, 4.5, true, false, true, 12),
  ('breakfast-chole', 'breakfast', 'Chole', 'Breakfast chole bowl', '/images/foods/chole.jpg', 80, null, null, 4.4, true, false, true, 13),
  ('breakfast-aloo-pakora', 'breakfast', 'Aloo Pakora', '16 pcs', '/images/foods/aloo-pakora.jpg', 80, null, null, 4.4, true, false, true, 14),
  ('breakfast-pyaz-pakora', 'breakfast', 'Pyaz Pakora', '16 pcs', '/images/foods/pyaz-pakora.jpg', 90, null, null, 4.4, true, false, true, 15),
  ('breakfast-paneer-pakora', 'breakfast', 'Paneer Pakora', '16 pcs', '/images/foods/paneer-pakora.jpg', 140, null, null, 4.6, true, true, true, 16),
  -- 3. MAGGI (HALF/FULL)
  ('maggi-plain-maggi', 'maggi', 'Plain Maggi', 'Classic plain maggi', '/images/foods/plain-maggi.jpg', 40, 40, 80, 4.5, true, true, true, 17),
  ('maggi-double-masala-maggi', 'maggi', 'Double Masala Maggi', 'Extra masala', '/images/foods/double-masala-maggi.jpg', 50, 50, 100, 4.5, true, false, true, 18),
  ('maggi-butter-veggies-maggi', 'maggi', 'Butter Veggies Maggi', 'Butter + mixed veggies', '/images/foods/butter-veggies-maggi.jpg', 60, 60, 120, 4.5, true, false, true, 19),
  ('maggi-paneer-maggi', 'maggi', 'Paneer Maggi', 'With paneer cubes', '/images/foods/paneer-maggi.jpg', 70, 70, 140, 4.6, true, false, true, 20),
  ('maggi-cheese-maggi', 'maggi', 'Cheese Maggi', 'Cheesy maggi', '/images/foods/cheese-maggi.jpg', 80, 80, 150, 4.6, true, true, true, 21),
  -- 4. SANDWICH
  ('sandwich-veg-sandwich', 'sandwich', 'Veg Sandwich', 'Grilled veg sandwich', '/images/foods/veg-sandwich.jpg', 50, null, null, 4.4, true, false, true, 22),
  ('sandwich-paneer-sandwich', 'sandwich', 'Paneer Sandwich', 'Paneer filling', '/images/foods/paneer-sandwich.jpg', 80, null, null, 4.5, true, false, true, 23),
  ('sandwich-cheese-sandwich', 'sandwich', 'Cheese Sandwich', 'Cheese filling', '/images/foods/cheese-sandwich.jpg', 80, null, null, 4.5, true, false, true, 24),
  -- 5. BURGER
  ('burger-aloo-tikki-burger', 'burger', 'Aloo Tikki Burger', 'Crispy aloo tikki', '/images/foods/aloo-tikki-burger.jpg', 60, null, null, 4.4, true, true, true, 25),
  ('burger-veg-burger', 'burger', 'Veg Burger', 'Veg patty burger', '/images/foods/veg-burger.jpg', 70, null, null, 4.4, true, false, true, 26),
  ('burger-paneer-burger', 'burger', 'Paneer Burger', 'Paneer patty burger', '/images/foods/paneer-burger.jpg', 90, null, null, 4.5, true, false, true, 27),
  ('burger-cheese-burger', 'burger', 'Cheese Burger', 'Cheese slice burger', '/images/foods/cheese-burger.jpg', 90, null, null, 4.5, true, false, true, 28),
  -- 6. PIZZA (SMALL/REGULAR in half/full)
  ('pizza-onion-pizza', 'pizza', 'Onion Pizza', 'Small ₹120 / Regular ₹200', '/images/foods/onion-pizza.jpg', 120, 120, 200, 4.5, true, true, true, 29),
  ('pizza-paneer-pizza', 'pizza', 'Paneer Pizza', 'Small ₹130 / Regular ₹220', '/images/foods/paneer-pizza.jpg', 130, 130, 220, 4.6, true, true, true, 30),
  -- 7. CHINESE (HALF/FULL)
  ('chinese-veg-noodles', 'chinese', 'Veg Noodles', 'Classic veg noodles', '/images/foods/veg-noodles.jpg', 60, 60, 110, 4.5, true, true, true, 31),
  ('chinese-chilli-garlic-noodles', 'chinese', 'Chilli Garlic Noodles', 'Spicy garlic flavour', '/images/foods/chilli-garlic-noodles.jpg', 70, 70, 130, 4.5, true, false, true, 32),
  ('chinese-butter-noodles', 'chinese', 'Butter Noodles', 'Buttery noodles', '/images/foods/butter-noodles.jpg', 70, 70, 130, 4.4, true, false, true, 33),
  ('chinese-fried-rice', 'chinese', 'Fried Rice', 'Veg fried rice', '/images/foods/veg-fried-rice.jpg', 70, 70, 130, 4.4, true, false, true, 34),
  ('chinese-paneer-noodles', 'chinese', 'Paneer Noodles', 'With paneer', '/images/foods/paneer-noodles.jpg', 70, 70, 130, 4.5, true, false, true, 35),
  ('chinese-schezwan-noodles', 'chinese', 'Schezwan Noodles', 'Schezwan style', '/images/foods/schezwan-noodles.jpg', 70, 70, 150, 4.6, true, true, true, 36),
  ('chinese-manchurian', 'chinese', 'Manchurian', 'Veg manchurian', '/images/foods/manchurian.jpg', 80, 80, 150, 4.5, true, true, true, 37),
  ('chinese-schezwan-fried-rice', 'chinese', 'Schezwan Fried Rice', 'Schezwan rice', '/images/foods/schezwan-fried-rice.jpg', 80, 80, 150, 4.5, true, false, true, 38),
  ('chinese-paneer-fried-rice', 'chinese', 'Paneer Fried Rice', 'With paneer', '/images/foods/paneer-fried-rice.jpg', 80, 80, 150, 4.5, true, false, true, 39),
  ('chinese-chilli-potato', 'chinese', 'Chilli Potato', 'Crispy chilli potato', '/images/foods/chilli-potato.jpg', 80, 80, 150, 4.5, true, true, true, 40),
  ('chinese-paneer-manchurian', 'chinese', 'Paneer Manchurian', 'Paneer manchurian', '/images/foods/paneer-manchurian.jpg', 90, 90, 170, 4.5, true, false, true, 41),
  ('chinese-chilli-paneer', 'chinese', 'Chilli Paneer', 'Restaurant style chilli paneer', '/images/foods/chilli-paneer.jpg', 100, 100, 190, 4.7, true, true, true, 42),
  ('chinese-honey-chilli-potato', 'chinese', 'Honey Chilli Potato', 'Sweet-spicy', '/images/foods/honey-chilli-potato.jpg', 100, 100, 190, 4.6, true, true, true, 43),
  -- 8. SNACKS
  ('snacks-kebab-tikki', 'snacks', 'Kebab Tikki', '1 pc', '/images/foods/kebab-tikki.jpg', 20, null, null, 4.4, true, false, true, 44),
  ('snacks-kebab-paratha', 'snacks', 'Kebab Paratha', 'Kebab with paratha', '/images/foods/kebab-paratha.jpg', 20, null, null, 4.4, true, false, true, 45),
  ('snacks-kebab-roll', 'snacks', 'Kebab Roll', 'Veg kebab roll', '/images/foods/kebab-roll.jpg', 40, null, null, 4.5, true, true, true, 46),
  ('snacks-biryani', 'snacks', 'Biryani', 'Veg biryani', '/images/foods/biryani.jpg', 50, 50, 100, 4.5, true, true, true, 47),
  ('snacks-finger-chips', 'snacks', 'Finger Chips', 'Crispy fries', '/images/foods/finger-chips.jpg', 50, 50, 100, 4.4, true, false, true, 48),
  ('snacks-spring-roll', 'snacks', 'Spring Roll', 'Veg spring roll', '/images/foods/spring-roll.jpg', 50, 50, 100, 4.4, true, false, true, 49),
  ('snacks-steam-momos', 'snacks', 'Steam Momos', 'Steamed veg momos', '/images/foods/steam-momos.jpg', 50, 50, 100, 4.6, true, true, true, 50),
  ('snacks-fried-momos', 'snacks', 'Fried Momos', 'Crispy fried momos', '/images/foods/fried-momos.jpg', 60, 60, 120, 4.5, true, false, true, 51),
  ('snacks-chilli-momos', 'snacks', 'Chilli Momos', 'Spicy chilli momos', '/images/foods/chilli-momos.jpg', 70, 70, 130, 4.5, true, false, true, 52),
  ('snacks-paneer-momos-steam', 'snacks', 'Paneer Momos Steam', 'Steamed paneer momos', '/images/foods/paneer-momos-steam.jpg', 80, 80, 150, 4.6, true, true, true, 53),
  ('snacks-paneer-fried', 'snacks', 'Paneer Fried', 'Fried paneer momos', '/images/foods/paneer-fried-momos.jpg', 90, 90, 160, 4.5, true, false, true, 54),
  ('snacks-chilli-paneer-momos', 'snacks', 'Chilli Paneer Momos', 'Chilli paneer momos', '/images/foods/chilli-paneer-momos.jpg', 100, 100, 180, 4.6, true, true, true, 55),
  -- 9. PARATHA & ROTI
  ('paratha-roti-tawa-roti', 'paratha-roti', 'Tawa Roti', 'Fresh tawa roti', '/images/foods/tawa-roti.jpg', 10, null, null, 4.5, true, false, true, 56),
  ('paratha-roti-butter-roti', 'paratha-roti', 'Butter Roti', 'Tawa roti with butter', '/images/foods/butter-roti.jpg', 15, null, null, 4.5, true, false, true, 57),
  ('paratha-roti-plain-paratha', 'paratha-roti', 'Plain Paratha', 'Tawa plain paratha', '/images/foods/plain-paratha.jpg', 25, null, null, 4.4, true, false, true, 58),
  ('paratha-roti-lachha-paratha', 'paratha-roti', 'Lachha Paratha', 'Layered lachha paratha', '/images/foods/lachha-paratha.jpg', 40, null, null, 4.6, true, true, true, 59),
  ('paratha-roti-aloo-paratha', 'paratha-roti', 'Aloo Paratha', 'Stuffed aloo paratha', '/images/foods/aloo-paratha.jpg', 50, null, null, 4.6, true, true, true, 60),
  ('paratha-roti-pyaz-paratha', 'paratha-roti', 'Pyaz Paratha', 'Onion stuffed paratha', '/images/foods/pyaz-paratha.jpg', 60, null, null, 4.5, true, false, true, 61),
  ('paratha-roti-paneer-paratha', 'paratha-roti', 'Paneer Paratha', 'Paneer stuffed paratha', '/images/foods/paneer-paratha.jpg', 100, null, null, 4.7, true, true, true, 62),
  -- 10. DAL & SABZI (HALF/FULL)
  ('dal-sabzi-aloo-jeera', 'dal-sabzi', 'Aloo Jeera', 'Jeera aloo', '/images/foods/aloo-jeera.jpg', 70, 70, 130, 4.4, true, false, true, 63),
  ('dal-sabzi-aloo-matar', 'dal-sabzi', 'Aloo Matar', 'Aloo matar sabzi', '/images/foods/aloo-matar.jpg', 70, 70, 130, 4.4, true, false, true, 64),
  ('dal-sabzi-aloo-matar-tamatar', 'dal-sabzi', 'Aloo Matar Tamatar', 'With tomato gravy', '/images/foods/aloo-matar-tamatar.jpg', 70, 70, 130, 4.4, true, false, true, 65),
  ('dal-sabzi-chole', 'dal-sabzi', 'Chole', 'Chole masala', '/images/foods/chole-masala.jpg', 70, 70, 130, 4.5, true, true, true, 66),
  ('dal-sabzi-arhar-dal-fry', 'dal-sabzi', 'Arhar Dal Fry', 'Tadka arhar dal', '/images/foods/arhar-dal-fry.jpg', 80, 80, 150, 4.5, true, false, true, 67),
  ('dal-sabzi-matar-paneer', 'dal-sabzi', 'Matar Paneer', 'Matar paneer curry', '/images/foods/matar-paneer.jpg', 100, 100, 180, 4.6, true, true, true, 68),
  ('dal-sabzi-matar-mushroom', 'dal-sabzi', 'Matar Mushroom', 'Mushroom matar', '/images/foods/matar-mushroom.jpg', 110, 110, 200, 4.5, true, false, true, 69),
  ('dal-sabzi-kadai-paneer', 'dal-sabzi', 'Kadai Paneer', 'Kadai masala paneer', '/images/foods/kadai-paneer.jpg', 120, 120, 220, 4.7, true, true, true, 70),
  ('dal-sabzi-shahi-paneer', 'dal-sabzi', 'Shahi Paneer', 'Rich shahi paneer', '/images/foods/shahi-paneer.jpg', 120, 120, 220, 4.7, true, true, true, 71),
  -- 11. RAITA
  ('raita-boondi-raita', 'raita', 'Boondi Raita', 'Boondi raita bowl', '/images/foods/boondi-raita.jpg', 70, null, null, 4.4, true, false, true, 72),
  ('raita-kheera-raita', 'raita', 'Kheera Raita', 'Cucumber raita', '/images/foods/kheera-raita.jpg', 70, null, null, 4.4, true, false, true, 73),
  -- 12. DESSERT
  ('dessert-gulab-jamun', 'dessert', 'Gulab Jamun', '1 pc', '/images/foods/gulab-jamun.jpg', 25, null, null, 4.7, true, true, true, 74),
  ('dessert-rasgulla', 'dessert', 'Rasgulla', '1 pc', '/images/foods/rasgulla.jpg', 25, null, null, 4.6, true, false, true, 75),
  ('dessert-dahi-bada', 'dessert', 'Dahi Bada', '1 pc', '/images/foods/dahi-bada.jpg', 30, null, null, 4.5, true, false, true, 76),
  ('dessert-kheer', 'dessert', 'Kheer', 'Rice kheer bowl', '/images/foods/kheer.jpg', 100, null, null, 4.6, true, true, true, 77),
  -- 13. THALI
  ('thali-thali', 'thali', 'Thali', '4 Roti + Daal + Sabji + Jeera Rice + Salad + Raita', '/images/foods/thali.jpg', 120, null, null, 4.7, true, true, true, 78),
  ('thali-special-thali', 'thali', 'Special Thali', 'Paneer Sabji/Mushroom + Daal Fry/Daal Makhni + Papad + 1 Lachha Paratha + 2 Tawa Roti + Jeera Rice + Salad + Raita + 1 Rasgulla', '/images/foods/special-thali.jpg', 200, null, null, 4.8, true, true, true, 79),
  -- 14. COMBO
  ('combos-combo-140', 'combos', 'Combo 140', 'Veg Noodles + Finger Chips + Chilli Paneer + Cold Drink', '/images/foods/combo-140.jpg', 140, null, null, 4.7, true, true, true, 80),
  ('combos-combo-160', 'combos', 'Combo 160', 'Manchurian + Fried Rice + Chilli Paneer + Cold Drink', '/images/foods/combo-160.jpg', 160, null, null, 4.7, true, true, true, 81)
on conflict (id) do update set
  category_id = excluded.category_id, name = excluded.name, description = excluded.description,
  image = excluded.image, price = excluded.price, half_price = excluded.half_price,
  full_price = excluded.full_price, rating = excluded.rating, is_veg = true,
  best_seller = excluded.best_seller, available = excluded.available,
  sort_order = excluded.sort_order, updated_at = now();
