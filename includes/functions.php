<?php
/**
 * Madam 3 Kitchen - Reusable Business & Utility Functions
 */

require_once __DIR__ . '/../config/database.php';

function formatPrice($amount): string {
    $num = floatval($amount);
    return CURRENCY_SYMBOL . number_format($num, 0, '.', ',');
}

function sanitize(string $data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function getSetting(string $key, string $default = ''): string {
    try {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT setting_value FROM restaurant_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $val = $stmt->fetchColumn();
        return $val !== false ? $val : $default;
    } catch (Exception $e) {
        return $default;
    }
}

function setSetting(string $key, string $value): bool {
    try {
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO restaurant_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
        return $stmt->execute([$key, $value]);
    } catch (Exception $e) {
        try {
            $stmt = $db->prepare("REPLACE INTO restaurant_settings (setting_key, setting_value) VALUES (?, ?)");
            return $stmt->execute([$key, $value]);
        } catch (Exception $ex) {
            error_log("Failed to set setting: " . $ex->getMessage());
            return false;
        }
    }
}

function generateOrderNumber(): string {
    $datePart = date('Ymd');
    $randomPart = str_pad((string)random_int(1, 99999), 5, '0', STR_PAD_LEFT);
    return "MDM-{$datePart}-{$randomPart}";
}

function logAdminActivity(string $adminUser, string $action): void {
    try {
        $db = Database::getConnection();
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt = $db->prepare("INSERT INTO admin_activity_logs (admin_user, action, ip_address) VALUES (?, ?, ?)");
        $stmt->execute([$adminUser, $action, $ip]);
    } catch (Exception $e) {
        error_log("Failed to log admin activity: " . $e->getMessage());
    }
}

function isRestaurantOpen(): bool {
    $manualStatus = getSetting('restaurant_status', 'OPEN');
    if ($manualStatus === 'CLOSED') {
        return false;
    }

    $openTime = getSetting('opening_time', '08:00');
    $closeTime = getSetting('closing_time', '22:00');
    $currentTime = date('H:i');

    return ($currentTime >= $openTime && $currentTime <= $closeTime);
}

function getWhatsAppOrderLink(array $order, array $items = []): string {
    $orderNumber = $order['order_number'] ?? 'N/A';
    $customerName = $order['customer_name'] ?? 'Customer';
    $phone = $order['phone'] ?? '';
    $address = $order['delivery_address'] ?? '';
    $zone = $order['zone_name'] ?? 'Benin City';
    $payment = $order['payment_status'] ?? 'Pending';
    $total = formatPrice($order['grand_total'] ?? 0);
    $subtotal = formatPrice($order['subtotal'] ?? 0);
    $delivery = formatPrice($order['delivery_fee'] ?? 0);

    $itemsText = "";
    foreach ($items as $item) {
        $name = $item['product_name'] ?? $item['name'] ?? 'Meal';
        $qty = $item['quantity'] ?? 1;
        $itemsText .= "• {$name} × {$qty}\n";
    }

    $message = "🍲 *NEW MADAM 3 ORDER*\n"
             . "━━━━━━━━━━━━━━\n"
             . "*Order #:* {$orderNumber}\n"
             . "*Customer:* {$customerName}\n"
             . "*Phone:* {$phone}\n"
             . "*Delivery Area:* {$zone}\n"
             . "*Address:* {$address}\n\n"
             . "*Items Ordered:*\n{$itemsText}\n"
             . "*Subtotal:* {$subtotal}\n"
             . "*Delivery Fee:* {$delivery}\n"
             . "*Total Amount:* {$total}\n"
             . "*Payment:* {$payment}\n"
             . "━━━━━━━━━━━━━━\n"
             . "Thank you for choosing Madam 3 Kitchen!";

    return "https://wa.me/" . RESTAURANT_WHATSAPP . "?text=" . urlencode($message);
}
