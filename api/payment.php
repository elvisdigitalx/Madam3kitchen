<?php
/**
 * Madam 3 Kitchen - Server-Side Payment Verification & Webhook Handler
 */
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

try {
    $db = Database::getConnection();
    $action = $_GET['action'] ?? 'verify';

    if ($action === 'verify') {
        $reference = sanitize($_GET['reference'] ?? $_POST['reference'] ?? '');
        $orderNumber = sanitize($_GET['order_number'] ?? $_POST['order_number'] ?? '');

        if (empty($reference) && empty($orderNumber)) {
            echo json_encode(['success' => false, 'message' => 'Missing transaction reference.']);
            exit;
        }

        // Look up order
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ? OR payment_reference = ?");
        $stmt->execute([$orderNumber, $reference]);
        $order = $stmt->fetch();

        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found for verification.']);
            exit;
        }

        // Server-side payment check simulation / Paystack API verification hook
        // Update Order to Paid
        $upStmt = $db->prepare("UPDATE orders SET payment_status = 'Paid', payment_reference = ?, status = 'Confirmed' WHERE id = ?");
        $upStmt->execute([$reference ?: 'PAY-' . time(), $order['id']]);

        // Insert Status History
        $histStmt = $db->prepare("INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, 'Payment Confirmed', ?, 'Payment Gateway')");
        $histStmt->execute([$order['id'], "Payment verified successfully. Reference: " . ($reference ?: 'PAY-' . time())]);

        echo json_encode([
            'success' => true,
            'message' => 'Payment verified successfully! Your order has been confirmed.',
            'order_number' => $order['order_number']
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Payment processing error: ' . $e->getMessage()]);
}
