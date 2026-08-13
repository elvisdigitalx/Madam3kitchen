<?php
/**
 * Madam 3 Kitchen - Database Connection (PDO)
 * Supports MySQL/MariaDB for production cPanel hosting
 * Supports seamless SQLite fallback for local developer sandbox testing
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        try {
            // Try connecting to MySQL/MariaDB first
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];

            self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            return self::$instance;

        } catch (PDOException $e) {
            // If MySQL is not available in sandbox environment, fallback to SQLite seamlessly
            try {
                $sqlitePath = ROOT_PATH . '/config/madam3_local.sqlite';
                $sqliteDsn = "sqlite:" . $sqlitePath;
                $sqliteOptions = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ];
                self::$instance = new PDO($sqliteDsn, null, null, $sqliteOptions);
                self::$instance->exec("PRAGMA foreign_keys = ON;");
                self::bootstrapSQLiteSchema(self::$instance);
                return self::$instance;
            } catch (Exception $ex) {
                error_log("Database Connection Error: " . $ex->getMessage());
                die("A technical error occurred while connecting to the database. Please check configuration.");
            }
        }
    }

    private static function bootstrapSQLiteSchema(PDO $db): void {
        // Create initial tables if SQLite fallback is used
        $schema = <<<SQL
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            icon TEXT,
            image TEXT,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            discount_price REAL,
            image TEXT,
            is_available INTEGER DEFAULT 1,
            is_popular INTEGER DEFAULT 0,
            is_featured INTEGER DEFAULT 0,
            prep_time_minutes INTEGER DEFAULT 25,
            rating REAL DEFAULT 4.9,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS product_extras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS delivery_zones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            delivery_fee REAL NOT NULL,
            estimated_time TEXT DEFAULT '25-45 mins',
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS promo_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT DEFAULT 'percentage',
            discount_value REAL NOT NULL,
            min_order_amount REAL DEFAULT 0,
            max_discount_amount REAL,
            start_date DATE,
            expiry_date DATE,
            usage_limit INTEGER DEFAULT 100,
            usage_count INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE NOT NULL,
            whatsapp TEXT,
            password TEXT NOT NULL,
            address TEXT,
            landmark TEXT,
            delivery_zone_id INTEGER,
            role TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            whatsapp TEXT,
            email TEXT,
            delivery_address TEXT NOT NULL,
            landmark TEXT,
            delivery_zone_id INTEGER,
            zone_name TEXT,
            instructions TEXT,
            order_timing TEXT DEFAULT 'asap',
            scheduled_date DATE,
            scheduled_time TEXT,
            payment_method TEXT DEFAULT 'online',
            payment_status TEXT DEFAULT 'Pending',
            payment_reference TEXT,
            subtotal REAL NOT NULL,
            delivery_fee REAL NOT NULL,
            discount_amount REAL DEFAULT 0,
            grand_total REAL NOT NULL,
            promo_code TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            unit_price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            instructions TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS order_item_extras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_item_id INTEGER NOT NULL,
            extra_name TEXT NOT NULL,
            extra_price REAL NOT NULL,
            FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS order_status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            changed_by TEXT DEFAULT 'System',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            customer_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            is_approved INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS restaurant_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT
        );

        CREATE TABLE IF NOT EXISTS admin_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_user TEXT NOT NULL,
            action TEXT NOT NULL,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
SQL;
        $db->exec($schema);
    }
}
