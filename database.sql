-- =========================================================
-- MADAM 3 KITCHEN — COMPLETE DATABASE SCHEMA & SEED DATA
-- Location: Asoro Bus Stop, Ekhuan Road, Benin City, Edo State
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. Table: categories
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `icon` VARCHAR(50) DEFAULT '🍲',
  `image` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cat_slug` (`slug`),
  INDEX `idx_cat_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 2. Table: products
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(190) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `discount_price` DECIMAL(10,2) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `prep_time_minutes` INT NOT NULL DEFAULT 25,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 4.9,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prod_cat` (`category_id`),
  INDEX `idx_prod_popular` (`is_popular`),
  INDEX `idx_prod_available` (`is_available`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 3. Table: product_extras
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_extras` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_extra_prod` (`product_id`),
  CONSTRAINT `fk_extras_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 4. Table: delivery_zones
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_zones` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  `estimated_time` VARCHAR(80) NOT NULL DEFAULT '25-45 mins',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 5. Table: promo_codes
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promo_codes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` DECIMAL(10,2) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `usage_limit` INT NOT NULL DEFAULT 100,
  `usage_count` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_promo_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 6. Table: users
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) DEFAULT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL UNIQUE,
  `whatsapp` VARCHAR(30) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `landmark` VARCHAR(190) DEFAULT NULL,
  `delivery_zone_id` INT UNSIGNED DEFAULT NULL,
  `role` ENUM('customer', 'admin', 'staff') NOT NULL DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 7. Table: orders
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `whatsapp` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(190) DEFAULT NULL,
  `delivery_address` TEXT NOT NULL,
  `landmark` VARCHAR(190) DEFAULT NULL,
  `delivery_zone_id` INT UNSIGNED DEFAULT NULL,
  `zone_name` VARCHAR(150) DEFAULT NULL,
  `instructions` TEXT DEFAULT NULL,
  `order_timing` ENUM('asap', 'scheduled') NOT NULL DEFAULT 'asap',
  `scheduled_date` DATE DEFAULT NULL,
  `scheduled_time` VARCHAR(30) DEFAULT NULL,
  `payment_method` ENUM('online', 'bank_transfer', 'cod') NOT NULL DEFAULT 'online',
  `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `grand_total` DECIMAL(10,2) NOT NULL,
  `promo_code` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Pending', 'Payment Confirmed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_num` (`order_number`),
  INDEX `idx_order_status` (`status`),
  INDEX `idx_order_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 8. Table: order_items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(190) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `instructions` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_item_order` (`order_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 9. Table: order_item_extras
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_item_extras` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id` INT UNSIGNED NOT NULL,
  `extra_name` VARCHAR(150) NOT NULL,
  `extra_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_item_extras` (`order_item_id`),
  CONSTRAINT `fk_extras_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 10. Table: order_status_history
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `changed_by` VARCHAR(100) DEFAULT 'System',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_history_order` (`order_id`),
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 11. Table: reviews
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED DEFAULT NULL,
  `product_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `rating` TINYINT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_review_prod` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 12. Table: contact_messages
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) DEFAULT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 13. Table: restaurant_settings
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurant_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 14. Table: admin_activity_logs
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user` VARCHAR(100) NOT NULL,
  `action` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- SEED DATA
-- =========================================================

-- Insert Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `display_order`, `is_active`) VALUES
(1, 'Rice Dishes', 'rice', '🍚', 'assets/images/products/jollof-rice.jpg', 1, 1),
(2, 'Traditional Soups', 'soups', '🍲', 'assets/images/products/egusi-soup.jpg', 2, 1),
(3, 'Swallow', 'swallow', '🥣', 'assets/images/products/amala-abula.jpg', 3, 1),
(4, 'Proteins & Grills', 'proteins', '🍗', 'assets/images/products/peppered-chicken.jpg', 4, 1),
(5, 'Snacks & Sides', 'snacks', '🥟', 'assets/images/products/meat-pie.jpg', 5, 1),
(6, 'Drinks & Beverages', 'drinks', '🍹', 'assets/images/products/chapman-drink.jpg', 6, 1),
(7, 'Combos & Feasts', 'combos', '🍱', 'assets/images/hero-banner.jpg', 7, 1),
(8, 'Family Packs', 'family-packs', '👨‍👩‍👧‍👦', 'assets/images/hero-banner.jpg', 8, 1);

-- Insert Products
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `discount_price`, `image`, `is_available`, `is_popular`, `is_featured`, `prep_time_minutes`, `rating`) VALUES
(1, 1, 'Party Jollof Rice with Chicken & Dodo', 'party-jollof-rice-chicken-dodo', 'Signature Benin smoky firewood party Jollof rice served with succulent peppered chicken drumstick and sweet golden fried plantain dodo.', 3500.00, 3200.00, 'assets/images/products/jollof-rice.jpg', 1, 1, 1, 20, 5.0),
(2, 2, 'Egusi Soup with Pounded Yam & Assorted Meat', 'egusi-soup-pounded-yam', 'Rich melon seed Egusi soup loaded with fresh pumpkin leaves, cow tripe (shaki), beef cubes, and stockfish, paired with soft smooth pounded yam.', 4500.00, NULL, 'assets/images/products/egusi-soup.jpg', 1, 1, 1, 25, 4.9),
(3, 1, 'Madam 3 Special Fried Rice with Crispy Chicken', 'special-fried-rice-crispy-chicken', 'Vibrant Nigerian fried rice packed with sweet corn, carrots, green peas, diced liver, served with seasoned fried chicken and vegetable salad.', 3800.00, 3500.00, 'assets/images/products/fried-rice.jpg', 1, 1, 0, 20, 4.8),
(4, 2, 'Traditional Ogbono Draw Soup with Yellow Eba', 'ogbono-soup-yellow-eba', 'Authentic Edo Ogbono draw soup prepared with smoked catfish, tender beef, and aromatic uziza leaves, served with hot yellow garri Eba.', 4200.00, NULL, 'assets/images/products/ogbono-soup.jpg', 1, 1, 0, 25, 4.9),
(5, 4, 'Hot & Spicy Peppered Chicken Platter', 'hot-spicy-peppered-chicken', 'Crispy chicken pieces drenched in fiery scotch bonnet pepper sauce, caramelized red onions, and bell peppers. Benin City favorite!', 3000.00, 2700.00, 'assets/images/products/peppered-chicken.jpg', 1, 1, 1, 15, 5.0),
(6, 2, 'Authentic Delta/Edo Banga Palm Nut Soup', 'authentic-banga-soup', 'Rich freshly extracted palm fruit soup simmered with fresh catfish, dried fish, and local Edo herbs, best enjoyed with starch or pounded yam.', 5000.00, NULL, 'assets/images/products/banga-soup.jpg', 1, 0, 1, 30, 4.9),
(7, 3, 'Amala Abula (Ewedu, Gbegiri & Goat Meat)', 'amala-abula-goat-meat', 'Silky piping-hot Amala swallow served with traditional green Ewedu, golden Gbegiri bean paste, spicy stew, and tender seasoned goat meat.', 4000.00, 3600.00, 'assets/images/products/amala-abula.jpg', 1, 1, 0, 20, 4.8),
(8, 4, 'Spicy Asun Peppered Goat Meat Board', 'spicy-asun-goat-meat', 'Fire-grilled tender bite-sized goat meat chunks tossed in hot habanero pepper, garlic, and fresh sliced onions.', 3800.00, NULL, 'assets/images/products/asun-goat.jpg', 1, 1, 1, 20, 4.9),
(9, 6, 'Madam 3 Signature Chapman Cocktail', 'signature-chapman-cocktail', 'Refreshing classic Nigerian mocktail prepared with aromatic Angostura bitters, fresh orange wheels, lemon wedges, and crisp cucumber slices.', 1500.00, 1200.00, 'assets/images/products/chapman-drink.jpg', 1, 1, 0, 5, 5.0),
(10, 5, 'Freshly Baked Nigerian Beef Meat Pie (2 Pcs)', 'beef-meat-pie-2pcs', 'Flaky, buttery golden crust pastry packed with rich minced beef, diced potatoes, and savory carrot filling.', 1600.00, NULL, 'assets/images/products/jollof-rice.jpg', 1, 0, 0, 10, 4.7),
(11, 7, 'Benin Executive Lunch Combo', 'benin-executive-lunch-combo', 'Combination of Party Jollof & Fried Rice, 2 Peppered Chicken drumsticks, Fried Plantain, Moi Moi, and 1 Chilled Chapman Drink.', 6500.00, 5900.00, 'assets/images/hero-banner.jpg', 1, 1, 1, 25, 5.0),
(12, 8, 'Madam 3 Grand Family Feast (Feeds 4-6)', 'grand-family-feast', 'Mega party tray containing smoky Jollof rice, Fried rice, 4 Chicken thighs, 4 Beef portions, Dodo tray, 4 Moi-Moi, and 4 Chilled Drinks.', 24000.00, 21500.00, 'assets/images/hero-banner.jpg', 1, 0, 1, 35, 5.0);

-- Insert Product Extras / Options
INSERT INTO `product_extras` (`id`, `product_id`, `name`, `price`, `is_active`) VALUES
(1, 1, 'Extra Peppered Chicken', 1200.00, 1),
(2, 1, 'Extra Fried Plantain (Dodo)', 500.00, 1),
(3, 1, 'Steamed Moi-Moi', 600.00, 1),
(4, 1, 'Creamy Coleslaw', 400.00, 1),
(5, 1, 'Chilled Chapman Drink', 1200.00, 1),
(6, 2, 'Extra Pounded Yam Wrap', 700.00, 1),
(7, 2, 'Extra Goat Meat Portion', 1500.00, 1),
(8, 2, 'Extra Assorted Meat (Shaki & Beef)', 1200.00, 1),
(9, 2, 'Extra Smoked Fish', 1000.00, 1),
(10, 3, 'Extra Crispy Fried Chicken', 1200.00, 1),
(11, 3, 'Fried Plantain (Dodo)', 500.00, 1),
(12, 4, 'Extra Yellow Eba Wrap', 500.00, 1),
(13, 4, 'Extra Smoked Catfish', 1400.00, 1),
(14, 7, 'Extra Goat Meat (2 Pcs)', 1800.00, 1),
(15, 7, 'Extra Amala Wrap', 600.00, 1);

-- Insert Delivery Zones in Benin City
INSERT INTO `delivery_zones` (`id`, `name`, `description`, `delivery_fee`, `estimated_time`, `is_active`) VALUES
(1, 'Asoro / Ekhuan Road', 'Direct proximity to Madam 3 Kitchen', 500.00, '15-25 mins', 1),
(2, 'GRA & Boundary Road', 'Government Reserved Area, Boundary & Country Club environs', 1000.00, '25-35 mins', 1),
(3, 'Ring Road & King Square', 'Benin City Central Commercial District', 800.00, '20-30 mins', 1),
(4, 'Airport Road & Environs', 'Airport Road, Akenzua, and surrounding avenues', 1200.00, '30-40 mins', 1),
(5, 'Ugbowo / UNIBEN Campus', 'University of Benin Main Campus, BDPA, and Uselu', 1500.00, '35-45 mins', 1),
(6, 'Sapele Road & Limit', 'Sapele Road, Limit, Agip, and bypass areas', 1200.00, '30-40 mins', 1),
(7, 'Ikpoba Hill & Environs', 'Ikpoba Hill, Ramat Park, and Upper Mission Extension', 1500.00, '40-50 mins', 1),
(8, 'New Benin & Mission Road', 'New Benin Market, Mission Road, and Forestry', 1000.00, '25-35 mins', 1),
(9, 'Aduwawa & Federal Housing', 'Aduwawa, Upper Lawani, and Federal Quarters', 1800.00, '45-55 mins', 1),
(10, 'Upper Sakponba Road', 'Upper Sakponba, St. Saviour, and environs', 1500.00, '35-45 mins', 1);

-- Insert Promo Codes
INSERT INTO `promo_codes` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `start_date`, `expiry_date`, `usage_limit`, `usage_count`, `is_active`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 3000.00, 2000.00, '2026-01-01', '2026-12-31', 500, 18, 1),
(2, 'BENIN500', 'fixed', 500.00, 4000.00, NULL, '2026-01-01', '2026-12-31', 300, 42, 1),
(3, 'FAMILYFEAST', 'percentage', 15.00, 15000.00, 4000.00, '2026-01-01', '2026-12-31', 100, 5, 1);

-- Insert Default Admin User (Password: admin123)
-- Hash generated via password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `whatsapp`, `password`, `address`, `landmark`, `delivery_zone_id`, `role`) VALUES
(1, 'Madam 3 Administrator', 'admin@madam3kitchen.com', '08030001234', '2348030001234', '$2y$10$wN1iN2GzFhG2pTf3HqPzse1s9Cg3fB.4a9CgDqE4N6A7P8Q9R0S1T', 'Asoro Bus Stop, Ekhuan Road', 'Near Asoro Statue', 1, 'admin'),
(2, 'Osasogie Igbinosa', 'osas@example.com', '08051234567', '2348051234567', '$2y$10$wN1iN2GzFhG2pTf3HqPzse1s9Cg3fB.4a9CgDqE4N6A7P8Q9R0S1T', '14 Boundary Road, GRA, Benin City', 'Opposite Golf Club', 2, 'customer');

-- Insert Restaurant Settings
INSERT INTO `restaurant_settings` (`setting_key`, `setting_value`) VALUES
('restaurant_name', 'Madam 3 Kitchen'),
('restaurant_tagline', 'Delicious Nigerian Meals, Made With Love'),
('restaurant_address', 'Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria'),
('restaurant_phone', '+2348030001234'),
('restaurant_whatsapp', '2348030001234'),
('restaurant_email', 'orders@madam3kitchen.com'),
('opening_time', '08:00'),
('closing_time', '22:00'),
('restaurant_status', 'OPEN'),
('closed_message', 'Madam 3 Kitchen is currently closed. We reopen at 8:00 AM! You can still schedule an advance order.'),
('currency_symbol', '₦'),
('default_delivery_fee', '1000'),
('minimum_order_amount', '2000'),
('enable_cod', '1'),
('enable_bank_transfer', '1'),
('bank_name', 'Moniepoint Microfinance Bank'),
('bank_account_number', '8030001234'),
('bank_account_name', 'Madam 3 Kitchen Benin'),
('enable_paystack', '1'),
('paystack_public_key', 'pk_test_sample_key_12345'),
('google_maps_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.733568285517!2d5.6037!3d6.3350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d346b81c2f9d%3A0x7d87b32274488344!2sAsoro%20Bus%20Stop%2C%20Ekehuan%20Rd%2C%20Benin%20City!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng');

-- Insert Customer Reviews
INSERT INTO `reviews` (`id`, `order_id`, `product_id`, `customer_name`, `rating`, `comment`, `is_approved`) VALUES
(1, NULL, 1, 'Osasogie I. (GRA, Benin City)', 5, 'Their party Jollof rice is on another level! The smoky aroma reminds me of authentic Edo wedding celebrations. Delivery to GRA took only 25 minutes.', 1),
(2, NULL, 2, 'Blessing E. (Ugbowo)', 5, 'The Egusi soup with pounded yam was so fresh and properly garnished with assorted meat. Delivered hot to UNIBEN gate. Madam 3 Kitchen is 10/10!', 1),
(3, NULL, 5, 'Efe Collins (Airport Road)', 5, 'The peppered chicken is seriously spicy and tasty! Perfect accompaniment with cold Chapman. Best food plug on Ekhuan Road.', 1),
(4, NULL, 7, 'Dr. Endurance (Asoro)', 5, 'Living right by Asoro bus stop, Madam 3 Kitchen has become my family lunch routine. Clean packaging and friendly dispatch riders.', 1);
