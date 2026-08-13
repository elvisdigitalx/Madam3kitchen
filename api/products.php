<?php
/**
 * Madam 3 Kitchen - Products API Endpoint
 */
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

try {
    $db = Database::getConnection();
    $action = $_GET['action'] ?? 'list';

    if ($action === 'detail') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $db->prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            echo json_encode(['success' => false, 'message' => 'Meal not found']);
            exit;
        }

        // Fetch extras
        $extraStmt = $db->prepare("SELECT * FROM product_extras WHERE product_id = ? AND is_active = 1");
        $extraStmt->execute([$id]);
        $product['extras'] = $extraStmt->fetchAll();

        echo json_encode(['success' => true, 'product' => $product]);
        exit;
    }

    // Default: List with filters
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $sort = $_GET['sort'] ?? 'popular';

    $sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_available = 1";
    $params = [];

    if ($category && $category !== 'all') {
        $sql .= " AND c.slug = ?";
        $params[] = $category;
    }

    if ($search) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    switch ($sort) {
        case 'price_asc':
            $sql .= " ORDER BY p.price ASC";
            break;
        case 'price_desc':
            $sql .= " ORDER BY p.price DESC";
            break;
        case 'newest':
            $sql .= " ORDER BY p.id DESC";
            break;
        case 'popular':
        default:
            $sql .= " ORDER BY p.is_popular DESC, p.id ASC";
            break;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode(['success' => true, 'products' => $products]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error retrieving menu items: ' . $e->getMessage()]);
}
