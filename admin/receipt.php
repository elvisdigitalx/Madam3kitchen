<?php
/**
 * Madam 3 Kitchen - Printable Thermal / Standard Order Receipt
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

$db = Database::getConnection();
$id = intval($_GET['id'] ?? 0);
$orderNumber = sanitize($_GET['order_number'] ?? '');

if ($id > 0) {
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$id]);
} else {
    $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ?");
    $stmt->execute([$orderNumber]);
}

$order = $stmt->fetch();

if (!$order) {
    die("Receipt not found.");
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
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt #<?= $order['order_number'] ?> — Madam 3 Kitchen</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/styles.css">
  <style>
    body {
      background: #EFEBE9;
      padding: 1rem;
    }
  </style>
</head>
<body>

<div class="receipt-wrapper">
  <!-- Print Controls -->
  <div class="no-print d-flex justify-content-between align-items-center mb-3">
    <button onclick="window.print()" class="btn btn-primary btn-sm">🖨️ Print Receipt</button>
    <button onclick="window.close()" class="btn btn-outline-secondary btn-sm">Close</button>
  </div>

  <div class="receipt-header">
    <h2 style="font-size: 1.35rem; margin-bottom: 0.2rem; font-weight: 900;">MADAM 3 KITCHEN</h2>
    <div style="font-size: 0.8rem;">Asoro Bus Stop, Ekhuan Road, Benin City</div>
    <div style="font-size: 0.8rem;">Tel: <?= RESTAURANT_PHONE_DISPLAY ?></div>
    <div style="font-size: 0.8rem;">WhatsApp: +<?= RESTAURANT_WHATSAPP ?></div>
  </div>

  <div style="font-size: 0.85rem; margin-bottom: 1rem; border-bottom: 1px dashed #3E2723; padding-bottom: 0.5rem;">
    <div class="receipt-row">
      <span>Order Number:</span>
      <strong><?= sanitize($order['order_number']) ?></strong>
    </div>
    <div class="receipt-row">
      <span>Date / Time:</span>
      <span><?= date('d/m/Y h:i A', strtotime($order['created_at'])) ?></span>
    </div>
    <div class="receipt-row">
      <span>Customer:</span>
      <span><?= sanitize($order['customer_name']) ?></span>
    </div>
    <div class="receipt-row">
      <span>Phone:</span>
      <span><?= sanitize($order['phone']) ?></span>
    </div>
    <div class="receipt-row">
      <span>Area:</span>
      <span><?= sanitize($order['zone_name'] ?: 'Benin City') ?></span>
    </div>
    <div class="receipt-row">
      <span>Address:</span>
      <span><?= sanitize($order['delivery_address']) ?></span>
    </div>
    <?php if ($order['landmark']): ?>
      <div class="receipt-row">
        <span>Landmark:</span>
        <span><?= sanitize($order['landmark']) ?></span>
      </div>
    <?php endif; ?>
  </div>

  <!-- Items list -->
  <div style="font-size: 0.85rem; margin-bottom: 1rem;">
    <div class="receipt-row" style="font-weight: bold; border-bottom: 1px dashed #3E2723; padding-bottom: 0.3rem;">
      <span>ITEM</span>
      <span>QTY × PRICE</span>
      <span>TOTAL</span>
    </div>

    <?php foreach ($items as $item): ?>
      <div class="receipt-row" style="margin-top: 0.4rem;">
        <span style="max-width: 180px;"><?= sanitize($item['product_name']) ?></span>
        <span><?= $item['quantity'] ?> × <?= formatPrice($item['unit_price']) ?></span>
        <span><?= formatPrice($item['subtotal']) ?></span>
      </div>
      <?php if (!empty($item['extras'])): ?>
        <?php foreach ($item['extras'] as $extra): ?>
          <div style="font-size: 0.75rem; color: #555; padding-left: 8px;">
            + <?= sanitize($extra['extra_name']) ?> (<?= formatPrice($extra['extra_price']) ?>)
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
      <?php if (!empty($item['instructions'])): ?>
        <div style="font-size: 0.75rem; color: #795548; fst-italic; padding-left: 8px;">
          Note: <?= sanitize($item['instructions']) ?>
        </div>
      <?php endif; ?>
    <?php endforeach; ?>
  </div>

  <!-- Summary Totals -->
  <div style="font-size: 0.85rem;">
    <div class="receipt-row">
      <span>Subtotal:</span>
      <span><?= formatPrice($order['subtotal']) ?></span>
    </div>
    <div class="receipt-row">
      <span>Delivery Fee:</span>
      <span><?= formatPrice($order['delivery_fee']) ?></span>
    </div>
    <?php if ($order['discount_amount'] > 0): ?>
      <div class="receipt-row" style="color: #C62828;">
        <span>Promo Discount (<?= sanitize($order['promo_code']) ?>):</span>
        <span>- <?= formatPrice($order['discount_amount']) ?></span>
      </div>
    <?php endif; ?>

    <div class="receipt-total-row">
      <span>GRAND TOTAL:</span>
      <span><?= formatPrice($order['grand_total']) ?></span>
    </div>

    <div class="receipt-row">
      <span>Payment Method:</span>
      <span><?= strtoupper(sanitize($order['payment_method'])) ?></span>
    </div>
    <div class="receipt-row">
      <span>Payment Status:</span>
      <span><strong><?= strtoupper(sanitize($order['payment_status'])) ?></strong></span>
    </div>
    <div class="receipt-row">
      <span>Order Status:</span>
      <span><?= strtoupper(sanitize($order['status'])) ?></span>
    </div>
  </div>

  <div class="receipt-footer">
    <div style="font-weight: bold; margin-bottom: 0.25rem;">
      Thank you for ordering from Madam 3 Kitchen.
    </div>
    <div>Cooked with love in Benin City!</div>
    <div style="font-size: 0.75rem; color: #777; margin-top: 0.5rem;">www.madam3kitchen.com</div>
  </div>
</div>

</body>
</html>
