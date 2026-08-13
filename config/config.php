<?php
/**
 * Madam 3 Kitchen - Core Configuration
 * Authentic Nigerian Food Ordering System
 * Location: Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria
 */

// Strict error reporting for debugging, sanitized for production
error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set Lagos/Benin City Timezone (GMT+1)
date_default_timezone_set('Africa/Lagos');

// Secure Session Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Brand & Restaurant Constants
define('APP_NAME', 'Madam 3 Kitchen');
define('APP_TAGLINE', 'Delicious Nigerian Meals, Made With Love');
define('RESTAURANT_ADDRESS', 'Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria');
define('RESTAURANT_PHONE', '+2348030001234');
define('RESTAURANT_PHONE_DISPLAY', '0803 000 1234');
define('RESTAURANT_WHATSAPP', '2348030001234');
define('RESTAURANT_EMAIL', 'orders@madam3kitchen.com');
define('CURRENCY_SYMBOL', '₦');
define('CURRENCY_CODE', 'NGN');

// Base URL Auto-detection for cPanel & Localhost
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$baseUrl = rtrim($protocol . $host . $scriptDir, '/');

// Clean subpath for includes
define('BASE_URL', $baseUrl);
define('ROOT_PATH', dirname(__DIR__));

// Security Salt / Pepper
define('APP_KEY', 'madam3_secret_salt_benin_city_2026');

// Database Credentials (easily configured in cPanel / .env / config)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'madam3_kitchen');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');
