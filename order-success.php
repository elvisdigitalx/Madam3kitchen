<?php
/**
 * Madam 3 Kitchen - Order Success & Confirmation Page
 */
$pageTitle = 'Order Confirmed! 🎉 — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';

$orderNumber = sanitize($_GET['order_number'] ?? '');
$db = Database::getConnection();

$order = null;
$items = [];

if (!empty($orderNumber)) {
    $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ?");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch();

    if ($order) {
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();

        foreach ($items as &$item) {
            $eStmt = $db->prepare("SELECT * FROM order_item_extras WHERE order_item_id = ?");
            $eStmt->execute([$item['id']]);
            $item['extras'] = $eStmt->fetchAll();
        }
    }
}

// Fallback order details if local simulation
$whatsAppLink = $order ? getWhatsAppOrderLink($order, $items) : "https://wa.me/" . RESTAURANT_WHATSAPP;
?>

<div class="container py-5">
  <div class="card max-w-700 mx-auto shadow-sm p-4 p-md-5 text-center" style="border-radius: var(--radius-xl);">
    <!-- Success Celebration Icon -->
    <div style="width: 80px; height: 80px; border-radius: 50%; background: #E8F5E9; color: #2E7D32; font-size: 2.5rem; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
      🎉
    </div>

    <h1 class="h2 fw-extrabold text-secondary mb-2">Order Confirmed!</h1>
    <p class="text-muted fs-base mb-4">
      Your order <strong class="text-primary"><?= $orderNumber ?: 'MDM-REC-'.time() ?></strong> has been received.<br>
      We'll start preparing your delicious meal shortly.
    </p>

    <?php if ($order): ?>
      <!-- Order Summary Box -->
      <div class="card p-3 mb-4 text-start bg-light border" style="font-size: 0.9rem;">
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span class="text-muted">Customer:</span>
          <strong><?= sanitize($order['customer_name']) ?> (<?= sanitize($order['phone']) ?>)</strong>
        </div>
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span class="text-muted">Delivery Area:</span>
          <strong><?= sanitize($order['zone_name'] ?: 'Benin City') ?></strong>
        </div>
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span class="text-muted">Address:</span>
          <span><?= sanitize($order['delivery_address']) ?></span>
        </div>
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span class="text-muted">Payment Method:</span>
          <span class="badge badge-primary"><?= strtoupper(sanitize($order['payment_method'])) ?></span>
        </div>
        <div class="d-flex justify-content-between pt-1">
          <span class="fw-bold">Grand Total:</span>
          <span class="fs-lg fw-extrabold text-primary"><?= formatPrice($order['grand_total']) ?></span>
        </div>
      </div>
    <?php endif; ?>

    <!-- Action Buttons -->
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
      <a href="track-order.php?order_number=<?= urlencode($orderNumber) ?>" class="btn btn-primary btn-lg">
        📍 Track My Order
      </a>
      <a href="<?= $whatsAppLink ?>" target="_blank" class="btn btn-whatsapp btn-lg">
        💬 Send to WhatsApp
      </a>
    </div>

    <div class="d-flex justify-content-center gap-3">
      <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.print()">
        🖨️ Print Receipt
      </button>
      <a href="menu.php" class="btn btn-outline-secondary btn-sm">
        🍛 Continue Shopping
      </a>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
