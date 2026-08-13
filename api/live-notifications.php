<?php
/**
 * Madam 3 Kitchen - Live Admin Notification Polling API
 */
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getConnection();

    // Count pending & preparing orders
    $stmt = $db->query("SELECT COUNT(*) FROM orders WHERE status IN ('Pending', 'Payment Confirmed', 'Confirmed')");
    $pendingCount = intval($stmt->fetchColumn());

    // Latest order number
    $latestStmt = $db->query("SELECT order_number, customer_name, grand_total, created_at FROM orders ORDER BY id DESC LIMIT 1");
    $latest = $latestStmt->fetch();

    echo json_encode([
        'success' => true,
        'pending_count' => $pendingCount,
        'latest_order_number' => $latest ? $latest['order_number'] : null,
        'latest_customer' => $latest ? $latest['customer_name'] : null,
        'latest_total' => $latest ? floatval($latest['grand_total']) : 0,
        'timestamp' => time()
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'pending_count' => 0]);
}
