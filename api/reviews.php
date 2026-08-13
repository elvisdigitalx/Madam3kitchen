<?php
/**
 * Madam 3 Kitchen - Reviews API
 */
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

try {
    $db = Database::getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $productId = intval($input['product_id'] ?? 0);
        $customerName = sanitize($input['customer_name'] ?? 'Customer');
        $rating = max(1, min(5, intval($input['rating'] ?? 5)));
        $comment = sanitize($input['comment'] ?? '');

        if (empty($comment)) {
            echo json_encode(['success' => false, 'message' => 'Please provide your review comments.']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO reviews (product_id, customer_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, 1)");
        $stmt->execute([$productId ?: null, $customerName, $rating, $comment]);

        echo json_encode(['success' => true, 'message' => 'Thank you for your feedback! Your review has been recorded.']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Review error: ' . $e->getMessage()]);
}
