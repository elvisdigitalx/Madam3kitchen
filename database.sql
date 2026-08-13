-- ====================================================================
-- MADAM 3 KITCHEN — PRODUCTION MARIADB / MYSQL DATABASE SCHEMA & SEED
-- Location: No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State, Nigeria
-- Target: MariaDB 10.4+ / MySQL 8.0+
-- Storage Engine: InnoDB
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+01:00'; -- Africa/Lagos (GMT+1)

-- --------------------------------------------------------------------
-- 1. Table: users (Customers & Staff)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) DEFAULT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `whatsapp` VARCHAR(30) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `landmark` VARCHAR(190) DEFAULT NULL,
  `delivery_zone_id` INT UNSIGNED DEFAULT NULL,
  `role` ENUM('customer', 'admin', 'staff') NOT NULL DEFAULT 'customer',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_phone` (`phone`),
  UNIQUE KEY `uk_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. Table: admins (Dedicated Restaurant Managers & Dispatchers)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'manager', 'kitchen_staff', 'dispatcher') NOT NULL DEFAULT 'manager',
  `last_login` DATETIME DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_username` (`username`),
  UNIQUE KEY `uk_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. Table: categories (Food Categories)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `icon` VARCHAR(50) DEFAULT '🍲',
  `image` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  INDEX `idx_cat_order` (`display_order`),
  INDEX `idx_cat_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Table: products (Nigerian Dishes & Delicacies)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(190) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `discount_price` DECIMAL(10,2) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `prep_time_minutes` INT NOT NULL DEFAULT 20,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_products_slug` (`slug`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_popular` (`is_popular`),
  INDEX `idx_products_available` (`is_available`),
  INDEX `idx_products_price` (`price`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. Table: product_images (Multi-image Gallery per Product)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pimages_prod` (`product_id`),
  CONSTRAINT `fk_pimages_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. Table: product_extras (Customizable Sides, Proteins & Drinks)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `product_extras`;
CREATE TABLE `product_extras` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_extras_product` (`product_id`),
  CONSTRAINT `fk_extras_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. Table: delivery_zones (Benin City Delivery Zone Matrix)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `delivery_zones`;
CREATE TABLE `delivery_zones` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  `estimated_time` VARCHAR(80) NOT NULL DEFAULT '25-45 mins',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_zones_active` (`is_active`),
  INDEX `idx_zones_fee` (`delivery_fee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. Table: promo_codes (Coupon & Discount Engine)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `promo_codes`;
CREATE TABLE `promo_codes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` DECIMAL(10,2) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `usage_limit` INT NOT NULL DEFAULT 100,
  `usage_count` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promo_code` (`code`),
  INDEX `idx_promo_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. Table: promo_usage (Audit Log of Applied Coupons)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `promo_usage`;
CREATE TABLE `promo_usage` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `promo_code_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `order_number` VARCHAR(50) NOT NULL,
  `discount_applied` DECIMAL(10,2) NOT NULL,
  `used_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pusage_promo` (`promo_code_id`),
  INDEX `idx_pusage_user` (`user_id`),
  CONSTRAINT `fk_pusage_promo` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pusage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. Table: orders (Customer Orders Master Table)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL,
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
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orders_num` (`order_number`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_created` (`created_at`),
  INDEX `idx_orders_payment_status` (`payment_status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_zone` FOREIGN KEY (`delivery_zone_id`) REFERENCES `delivery_zones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 11. Table: order_items (Items inside each order)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(190) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `instructions` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_items_order` (`order_id`),
  INDEX `idx_items_product` (`product_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 12. Table: order_item_extras (Custom Extras per Order Item)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `order_item_extras`;
CREATE TABLE `order_item_extras` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id` INT UNSIGNED NOT NULL,
  `extra_name` VARCHAR(150) NOT NULL,
  `extra_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_item_extras` (`order_item_id`),
  CONSTRAINT `fk_extras_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 13. Table: payments (Payment Transactions Log)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `payment_gateway` ENUM('paystack', 'flutterwave', 'bank_transfer', 'cash') NOT NULL,
  `reference` VARCHAR(120) NOT NULL,
  `transaction_id` VARCHAR(120) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'NGN',
  `status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
  `gateway_response` TEXT DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payments_ref` (`reference`),
  INDEX `idx_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 14. Table: addresses (Customer Saved Addresses in Benin City)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `address_title` VARCHAR(80) NOT NULL DEFAULT 'Home',
  `delivery_zone_id` INT UNSIGNED DEFAULT NULL,
  `street_address` TEXT NOT NULL,
  `landmark` VARCHAR(190) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_addresses_zone` FOREIGN KEY (`delivery_zone_id`) REFERENCES `delivery_zones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 15. Table: favorites (Saved Meals per User)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product_favorite` (`user_id`, `product_id`),
  INDEX `idx_fav_user` (`user_id`),
  INDEX `idx_fav_prod` (`product_id`),
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fav_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 16. Table: order_status_history (Order State Transition Audit)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `order_status_history`;
CREATE TABLE `order_status_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `changed_by` VARCHAR(100) DEFAULT 'System',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_history_order` (`order_id`),
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 17. Table: reviews (Customer Reviews & Ratings)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED DEFAULT NULL,
  `product_id` INT UNSIGNED DEFAULT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `rating` TINYINT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_review_prod` (`product_id`),
  INDEX `idx_review_approved` (`is_approved`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 18. Table: notifications (Admin & Customer In-app Alerts)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(190) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('new_order', 'order_status', 'payment', 'system') NOT NULL DEFAULT 'new_order',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 19. Table: contact_messages (Contact Form Inquiries)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) DEFAULT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_contact_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 20. Table: restaurant_settings (Key-Value Configuration)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `restaurant_settings`;
CREATE TABLE `restaurant_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 21. Table: admin_activity_logs (Audit Trail for Management)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_activity_logs`;
CREATE TABLE `admin_activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user` VARCHAR(100) NOT NULL,
  `action` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_admin_logs_user` (`admin_user`),
  INDEX `idx_admin_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- SEED DATA (PRODUCTION-READY SEEDING)
-- ====================================================================

-- 1. Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `display_order`, `is_active`) VALUES
(1, 'Rice Dishes', 'rice', '🍚', 'assets/images/products/jollof-rice.jpg', 1, 1),
(2, 'Traditional Soups', 'soups', '🍲', 'assets/images/products/egusi-soup.jpg', 2, 1),
(3, 'Swallow', 'swallow', '🥣', 'assets/images/products/amala-abula.jpg', 3, 1),
(4, 'Proteins & Grills', 'proteins', '🍗', 'assets/images/products/peppered-chicken.jpg', 4, 1),
(5, 'Snacks & Sides', 'snacks', '🥟', 'assets/images/products/meat-pie.jpg', 5, 1),
(6, 'Drinks & Beverages', 'drinks', '🍹', 'assets/images/products/chapman-drink.jpg', 6, 1),
(7, 'Combos & Feasts', 'combos', '🍱', 'assets/images/hero-banner.jpg', 7, 1),
(8, 'Family Packs', 'family-packs', '👨‍👩‍👧‍👦', 'assets/images/hero-banner.jpg', 8, 1);

-- 2. Products
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

-- 3. Product Extras
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

-- 4. Delivery Zones in Benin City
INSERT INTO `delivery_zones` (`id`, `name`, `description`, `delivery_fee`, `estimated_time`, `is_active`) VALUES
(1, 'No. 3 Asoro / Ekehuan Road', 'Direct proximity to Madam 3 Kitchen', 500.00, '15-25 mins', 1),
(2, 'GRA & Boundary Road', 'Government Reserved Area, Boundary & Country Club environs', 1000.00, '25-35 mins', 1),
(3, 'Ring Road & King Square', 'Benin City Central Commercial District', 800.00, '20-30 mins', 1),
(4, 'Airport Road & Environs', 'Airport Road, Akenzua, and surrounding avenues', 1200.00, '30-40 mins', 1),
(5, 'Ugbowo / UNIBEN Campus', 'University of Benin Main Campus, BDPA, and Uselu', 1500.00, '35-45 mins', 1),
(6, 'Sapele Road & Limit', 'Sapele Road, Limit, Agip, and bypass areas', 1200.00, '30-40 mins', 1),
(7, 'Ikpoba Hill & Environs', 'Ikpoba Hill, Ramat Park, and Upper Mission Extension', 1500.00, '40-50 mins', 1),
(8, 'New Benin & Mission Road', 'New Benin Market, Mission Road, and Forestry', 1000.00, '25-35 mins', 1),
(9, 'Aduwawa & Federal Housing', 'Aduwawa, Upper Lawani, and Federal Quarters', 1800.00, '45-55 mins', 1),
(10, 'Upper Sakponba Road', 'Upper Sakponba, St. Saviour, and environs', 1500.00, '35-45 mins', 1);

-- 5. Promo Codes
INSERT INTO `promo_codes` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `start_date`, `expiry_date`, `usage_limit`, `usage_count`, `is_active`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 3000.00, 2000.00, '2026-01-01', '2026-12-31', 500, 18, 1),
(2, 'BENIN500', 'fixed', 500.00, 4000.00, NULL, '2026-01-01', '2026-12-31', 300, 42, 1),
(3, 'FAMILYFEAST', 'percentage', 15.00, 15000.00, 4000.00, '2026-01-01', '2026-12-31', 100, 5, 1);

-- 6. Admins & Users
-- Default Admin (Password: admin123)
INSERT INTO `admins` (`id`, `username`, `full_name`, `email`, `phone`, `password`, `role`, `is_active`) VALUES
(1, 'admin', 'Madam 3 Administrator', 'admin@madam3kitchen.com', '08030001234', '$2y$10$wN1iN2GzFhG2pTf3HqPzse1s9Cg3fB.4a9CgDqE4N6A7P8Q9R0S1T', 'superadmin', 1);

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `whatsapp`, `password`, `address`, `landmark`, `delivery_zone_id`, `role`, `is_active`) VALUES
(1, 'Madam 3 Administrator', 'admin@madam3kitchen.com', '08030001234', '2348030001234', '$2y$10$wN1iN2GzFhG2pTf3HqPzse1s9Cg3fB.4a9CgDqE4N6A7P8Q9R0S1T', 'No. 3 Asoro Bus Stop, Ekehuan Road', 'Near Asoro Statue', 1, 'admin', 1),
(2, 'Osasogie Igbinosa', 'osas@example.com', '08051234567', '2348051234567', '$2y$10$wN1iN2GzFhG2pTf3HqPzse1s9Cg3fB.4a9CgDqE4N6A7P8Q9R0S1T', '14 Boundary Road, GRA, Benin City', 'Opposite Golf Club', 2, 'customer', 1);

-- 7. Restaurant Settings
INSERT INTO `restaurant_settings` (`setting_key`, `setting_value`) VALUES
('restaurant_name', 'Madam 3 Kitchen'),
('restaurant_tagline', 'Delicious Nigerian Meals, Made With Love'),
('restaurant_address', 'No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State, Nigeria'),
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

-- 8. Customer Reviews
INSERT INTO `reviews` (`id`, `order_id`, `product_id`, `customer_name`, `rating`, `comment`, `is_approved`) VALUES
(1, NULL, 1, 'Osasogie I. (GRA, Benin City)', 5, 'Their party Jollof rice is on another level! The smoky aroma reminds me of authentic Edo wedding celebrations. Delivery to GRA took only 25 minutes.', 1),
(2, NULL, 2, 'Blessing E. (Ugbowo)', 5, 'The Egusi soup with pounded yam was so fresh and properly garnished with assorted meat. Delivered hot to UNIBEN gate. Madam 3 Kitchen is 10/10!', 1),
(3, NULL, 5, 'Efe Collins (Airport Road)', 5, 'The peppered chicken is seriously spicy and tasty! Perfect accompaniment with cold Chapman. Best food plug on Ekehuan Road.', 1),
(4, NULL, 7, 'Dr. Endurance (Asoro)', 5, 'Living right by Asoro bus stop, Madam 3 Kitchen has become my family lunch routine. Clean packaging and friendly dispatch riders.', 1);

-- 9. Sample Orders & Items
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `phone`, `whatsapp`, `email`, `delivery_address`, `landmark`, `delivery_zone_id`, `zone_name`, `order_timing`, `payment_method`, `payment_status`, `payment_reference`, `subtotal`, `delivery_fee`, `discount_amount`, `grand_total`, `promo_code`, `status`, `created_at`) VALUES
(1, 'MDM-20260813-00124', 2, 'Osasogie Igbinosa', '08051234567', '2348051234567', 'osas@example.com', '14 Boundary Road, GRA, Benin City', 'Opposite Edo Golf Club', 2, 'GRA & Boundary Road', 'asap', 'online', 'Paid', 'PAY-98741235', 7600.00, 1000.00, 760.00, 7840.00, 'WELCOME10', 'Preparing', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, 'MDM-20260813-00125', NULL, 'Blessing E. Enoma', '08032223344', '2348032223344', 'blessing@example.com', 'UNIBEN Main Gate, Ugbowo, Benin City', 'Beside Main Security Gate', 5, 'Ugbowo / UNIBEN Campus', 'asap', 'bank_transfer', 'Pending', NULL, 4500.00, 1500.00, 0.00, 6000.00, NULL, 'Pending', DATE_SUB(NOW(), INTERVAL 5 MINUTE));

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit_price`, `quantity`, `subtotal`, `instructions`) VALUES
(1, 1, 1, 'Party Jollof Rice with Chicken & Dodo', 3200.00, 2, 6400.00, 'Extra cutlery please'),
(2, 1, 9, 'Madam 3 Signature Chapman Cocktail', 1200.00, 1, 1200.00, 'Serve with extra ice'),
(3, 2, 2, 'Egusi Soup with Pounded Yam & Assorted Meat', 4500.00, 1, 4500.00, 'Make soup spicy');

INSERT INTO `order_item_extras` (`id`, `order_item_id`, `extra_name`, `extra_price`) VALUES
(1, 1, 'Extra Fried Plantain (Dodo)', 500.00),
(2, 3, 'Extra Goat Meat Portion', 1500.00);

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `notes`, `changed_by`, `created_at`) VALUES
(1, 1, 'Pending', 'Order placed by Osasogie Igbinosa', 'Customer', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, 1, 'Payment Confirmed', 'Paystack payment verified reference PAY-98741235', 'Paystack Gateway', DATE_SUB(NOW(), INTERVAL 24 MINUTE)),
(3, 1, 'Confirmed', 'Kitchen approved order', 'Madam 3 Administrator', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(4, 1, 'Preparing', 'Chef currently packaging meals', 'Madam 3 Administrator', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(5, 2, 'Pending', 'Order placed via bank transfer', 'Customer', DATE_SUB(NOW(), INTERVAL 5 MINUTE));

INSERT INTO `admin_activity_logs` (`id`, `admin_user`, `action`, `ip_address`, `created_at`) VALUES
(1, 'Madam 3 Administrator', 'System initialized for Benin City kitchen dispatch', '127.0.0.1', NOW());
