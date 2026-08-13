<?php
/**
 * Madam 3 Kitchen - Orders API Endpoint
 */
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

try {
    $db = Database::getConnection();
    $action = $_GET['action'] ?? 'track';

    // 1. Order Tracking by Order Number and/or Phone
    if ($action === 'track') {
        $orderNumber = sanitize($_GET['order_number'] ?? '');
        $phone = sanitize($_GET['phone'] ?? '');

        if (empty($orderNumber) && empty($phone)) {
            echo json_encode(['success' => false, 'message' => 'Please provide an Order Number or Phone Number.']);
            exit;
        }

        $sql = "SELECT * FROM orders WHERE 1=1";
        $params = [];

        if (!empty($orderNumber)) {
            $sql .= " AND order_number = ?";
            $params[] = $orderNumber;
        }

        if (!empty($phone)) {
            $sql .= " AND (phone LIKE ? OR whatsapp LIKE ?)";
            $params[] = "%{$phone}%";
            $params[] = "%{$phone}%";
        }

        $sql .= " ORDER BY id DESC LIMIT 1";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $order = $stmt->fetch();

        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'No order found matching the provided details.']);
            exit;
        }

        // Fetch items
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();

        foreach ($items as &$item) {
            $eStmt = $db->prepare("SELECT * FROM order_item_extras WHERE order_item_id = ?");
            $eStmt->execute([$item['id']]);
            $item['extras'] = $eStmt->fetchAll();
        }

        // Fetch history
        $histStmt = $db->prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC");
        $histStmt->execute([$order['id']]);
        $history = $histStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'order' => $order,
            'items' => $items,
            'history' => $history
        ]);
        exit;
    }

    // 2. Admin Status Update
    if ($action === 'update_status') {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $orderId = intval($input['order_id'] ?? 0);
        $status = sanitize($input['status'] ?? '');
        $notes = sanitize($input['notes'] ?? "Status updated to {$status}");

        $allowedStatuses = ['Pending', 'Payment Confirmed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'];
        if (!in_array($status, $allowedStatuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid order status value.']);
            exit;
        }

        $stmt = $db->prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$status, $orderId]);

        $hist = $db->prepare("INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, ?)");
        $adminName = $_SESSION['admin_name'] ?? 'Admin';
        $hist->execute([$orderId, $status, $notes, $adminName]);

        logAdminActivity($adminName, "Updated Order #{$orderId} status to {$status}");

        echo json_encode(['success' => true, 'message' => "Order status updated to {$status}"]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Orders API error: ' . $e->getMessage()]);
}
