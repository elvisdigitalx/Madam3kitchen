<?php
/**
 * Madam 3 Kitchen - Checkout API Endpoint
 */
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

try {
    $db = Database::getConnection();

    // 1. Promo Code Validation
    if (isset($_GET['action']) && $_GET['action'] === 'validate_promo') {
        $code = strtoupper(trim($_GET['code'] ?? ''));
        $subtotal = floatval($_GET['subtotal'] ?? 0);

        $stmt = $db->prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1");
        $stmt->execute([$code]);
        $promo = $stmt->fetch();

        if (!$promo) {
            echo json_encode(['success' => false, 'message' => 'Invalid promo code.']);
            exit;
        }

        $today = date('Y-m-d');
        if (!empty($promo['start_date']) && $today < $promo['start_date']) {
            echo json_encode(['success' => false, 'message' => 'This promo code is not active yet.']);
            exit;
        }

        if (!empty($promo['expiry_date']) && $today > $promo['expiry_date']) {
            echo json_encode(['success' => false, 'message' => 'This promo code has expired.']);
            exit;
        }

        if ($promo['usage_count'] >= $promo['usage_limit']) {
            echo json_encode(['success' => false, 'message' => 'Promo code usage limit has been reached.']);
            exit;
        }

        if ($subtotal < floatval($promo['min_order_amount'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Minimum order of ' . formatPrice($promo['min_order_amount']) . ' required for this promo.'
            ]);
            exit;
        }

        $message = $promo['discount_type'] === 'percentage'
            ? "{$promo['discount_value']}% OFF"
            : formatPrice($promo['discount_value']) . " OFF";

        echo json_encode([
            'success' => true,
            'promo' => [
                'code' => $promo['code'],
                'type' => $promo['discount_type'],
                'value' => floatval($promo['discount_value']),
                'max_discount' => $promo['max_discount_amount'] ? floatval($promo['max_discount_amount']) : null,
                'message' => $message
            ]
        ]);
        exit;
    }

    // 2. Order Placement (POST)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $customerName = sanitize($input['customer_name'] ?? '');
        $phone = sanitize($input['phone'] ?? '');
        $whatsapp = sanitize($input['whatsapp'] ?? $phone);
        $email = sanitize($input['email'] ?? '');
        $address = sanitize($input['address'] ?? '');
        $landmark = sanitize($input['landmark'] ?? '');
        $zoneId = intval($input['delivery_zone_id'] ?? 0);
        $instructions = sanitize($input['instructions'] ?? '');
        $orderTiming = $input['order_timing'] === 'scheduled' ? 'scheduled' : 'asap';
        $scheduledDate = $orderTiming === 'scheduled' ? sanitize($input['scheduled_date'] ?? '') : null;
        $scheduledTime = $orderTiming === 'scheduled' ? sanitize($input['scheduled_time'] ?? '') : null;
        $paymentMethod = in_array($input['payment_method'] ?? '', ['online', 'bank_transfer', 'cod']) ? $input['payment_method'] : 'online';
        $promoCode = strtoupper(sanitize($input['promo_code'] ?? ''));
        $items = $input['items'] ?? [];

        if (empty($customerName) || empty($phone) || empty($address) || empty($items)) {
            echo json_encode(['success' => false, 'message' => 'Please provide your name, phone number, delivery address, and food items.']);
            exit;
        }

        // Fetch Zone details
        $zoneStmt = $db->prepare("SELECT * FROM delivery_zones WHERE id = ?");
        $zoneStmt->execute([$zoneId]);
        $zone = $zoneStmt->fetch();
        $deliveryFee = $zone ? floatval($zone['delivery_fee']) : floatval(getSetting('default_delivery_fee', '1000'));
        $zoneName = $zone ? $zone['name'] : 'Benin City';

        // Calculate Subtotal from database prices
        $subtotal = 0;
        $processedItems = [];

        foreach ($items as $item) {
            $prodId = intval($item['productId'] ?? $item['id'] ?? 0);
            $qty = max(1, intval($item['quantity'] ?? 1));

            // Verify product
            $pStmt = $db->prepare("SELECT id, name, price, discount_price, is_available FROM products WHERE id = ?");
            $pStmt->execute([$prodId]);
            $product = $pStmt->fetch();

            if (!$product || !$product['is_available']) {
                continue;
            }

            $unitPrice = floatval($product['discount_price'] ?: $product['price']);
            $itemExtras = $item['extras'] ?? [];
            $extrasSubtotal = 0;
            $verifiedExtras = [];

            foreach ($itemExtras as $extra) {
                $extraPrice = floatval($extra['price'] ?? 0);
                $extraName = sanitize($extra['name'] ?? '');
                if ($extraName) {
                    $extrasSubtotal += $extraPrice;
                    $verifiedExtras[] = [
                        'name' => $extraName,
                        'price' => $extraPrice
                    ];
                }
            }

            $lineUnitPrice = $unitPrice + $extrasSubtotal;
            $lineSubtotal = $lineUnitPrice * $qty;
            $subtotal += $lineSubtotal;

            $processedItems[] = [
                'product_id' => $product['id'],
                'product_name' => $product['name'],
                'unit_price' => $lineUnitPrice,
                'quantity' => $qty,
                'subtotal' => $lineSubtotal,
                'instructions' => sanitize($item['instructions'] ?? ''),
                'extras' => $verifiedExtras
            ];
        }

        if (empty($processedItems)) {
            echo json_encode(['success' => false, 'message' => 'No valid items found in order.']);
            exit;
        }

        // Apply Promo Discount
        $discountAmount = 0;
        if (!empty($promoCode)) {
            $promoStmt = $db->prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1");
            $promoStmt->execute([$promoCode]);
            $promoData = $promoStmt->fetch();

            if ($promoData && $subtotal >= floatval($promoData['min_order_amount'])) {
                if ($promoData['discount_type'] === 'percentage') {
                    $discountAmount = ($subtotal * floatval($promoData['discount_value'])) / 100;
                    if (!empty($promoData['max_discount_amount']) && $discountAmount > floatval($promoData['max_discount_amount'])) {
                        $discountAmount = floatval($promoData['max_discount_amount']);
                    }
                } else {
                    $discountAmount = floatval($promoData['discount_value']);
                }

                // Increment usage
                $db->prepare("UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = ?")->execute([$promoData['id']]);
            }
        }

        $grandTotal = max(0, $subtotal + $deliveryFee - $discountAmount);
        $orderNumber = generateOrderNumber();
        $userId = $_SESSION['user_id'] ?? null;
        $initialStatus = ($paymentMethod === 'online') ? 'Pending' : 'Confirmed';
        $paymentStatus = ($paymentMethod === 'cod') ? 'Pending' : (($paymentMethod === 'bank_transfer') ? 'Pending' : 'Pending');

        // Insert Order
        $orderSql = "INSERT INTO orders (
            order_number, user_id, customer_name, phone, whatsapp, email,
            delivery_address, landmark, delivery_zone_id, zone_name, instructions,
            order_timing, scheduled_date, scheduled_time, payment_method, payment_status,
            subtotal, delivery_fee, discount_amount, grand_total, promo_code, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $db->prepare($orderSql);
        $stmt->execute([
            $orderNumber, $userId, $customerName, $phone, $whatsapp, $email,
            $address, $landmark, $zoneId, $zoneName, $instructions,
            $orderTiming, $scheduledDate, $scheduledTime, $paymentMethod, $paymentStatus,
            $subtotal, $deliveryFee, $discountAmount, $grandTotal, $promoCode, $initialStatus
        ]);

        $orderId = $db->lastInsertId();

        // Insert Order Items and Extras
        $itemStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $extraStmt = $db->prepare("INSERT INTO order_item_extras (order_item_id, extra_name, extra_price) VALUES (?, ?, ?)");

        foreach ($processedItems as $pItem) {
            $itemStmt->execute([
                $orderId,
                $pItem['product_id'],
                $pItem['product_name'],
                $pItem['unit_price'],
                $pItem['quantity'],
                $pItem['subtotal'],
                $pItem['instructions']
            ]);
            $orderItemId = $db->lastInsertId();

            foreach ($pItem['extras'] as $pExtra) {
                $extraStmt->execute([
                    $orderItemId,
                    $pExtra['name'],
                    $pExtra['price']
                ]);
            }
        }

        // Insert History
        $histStmt = $db->prepare("INSERT INTO order_status_history (order_id, status, notes, changed_by) VALUES (?, ?, ?, ?)");
        $histStmt->execute([$orderId, $initialStatus, "Order placed successfully by {$customerName}", "Customer"]);

        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully!',
            'order_number' => $orderNumber,
            'order_id' => $orderId,
            'grand_total' => $grandTotal
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred processing your checkout: ' . $e->getMessage()]);
}
