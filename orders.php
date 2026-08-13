<?php
/**
 * Madam 3 Kitchen - Customer Orders History Page
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$currentUser = getCurrentUser();
$db = Database::getConnection();

$orderStmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? OR phone = ? ORDER BY id DESC");
$orderStmt->execute([$currentUser['id'], $currentUser['phone']]);
$orders = $orderStmt->fetchAll();

$pageTitle = 'Order History — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
    <div>
      <h1 class="h2 mb-1">My Orders 📦</h1>
      <p class="text-muted fs-sm mb-0">Track live orders and view your previous Madam 3 meal history.</p>
    </div>
    <a href="menu.php" class="btn btn-primary btn-sm">+ Order More Food</a>
  </div>

  <?php if (empty($orders)): ?>
    <div class="card p-5 text-center shadow-sm max-w-600 mx-auto">
      <div style="font-size: 3.5rem;" class="mb-2">📦</div>
      <h3>No orders yet.</h3>
      <p class="text-muted mb-4">When you place orders for delicious Nigerian dishes, they will appear here.</p>
      <a href="menu.php" class="btn btn-primary btn-lg mx-auto">Start Ordering Now &rarr;</a>
    </div>
  <?php else: ?>
    <div class="d-flex flex-column gap-4">
      <?php foreach ($orders as $order): ?>
        <?php
        // Fetch items for this order
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $orderItems = $itemStmt->fetchAll();
        ?>
        <div class="card shadow-sm p-4">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 border-bottom mb-3">
            <div>
              <span class="fs-xs text-muted fw-bold">ORDER NUMBER</span>
              <h4 class="h5 mb-0 fw-extrabold text-secondary"><?= sanitize($order['order_number']) ?></h4>
              <span class="fs-xs text-muted">Placed on <?= date('M d, Y h:i A', strtotime($order['created_at'])) ?></span>
            </div>

            <div class="text-end">
              <span class="badge badge-primary fs-sm fw-bold mb-1 d-inline-block"><?= strtoupper(sanitize($order['status'])) ?></span>
              <div class="fs-xs text-muted">Payment: <?= sanitize($order['payment_status']) ?> (<?= sanitize($order['payment_method']) ?>)</div>
            </div>
          </div>

          <!-- Items in order -->
          <div class="row g-2 mb-3">
            <?php foreach ($orderItems as $item): ?>
              <div class="col-12 col-md-6">
                <div class="p-2 bg-light rounded d-flex justify-content-between align-items-center">
                  <div>
                    <strong><?= sanitize($item['product_name']) ?></strong> <span class="text-primary">× <?= $item['quantity'] ?></span>
                  </div>
                  <div class="fw-bold fs-sm"><?= formatPrice($item['subtotal']) ?></div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>

          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-3 border-top">
            <div>
              <span class="text-muted fs-sm">Total Paid: </span>
              <span class="fs-lg fw-extrabold text-primary"><?= formatPrice($order['grand_total']) ?></span>
              <span class="fs-xs text-muted ms-2">(Delivered to: <?= sanitize($order['zone_name'] ?: 'Benin City') ?>)</span>
            </div>

            <div class="d-flex gap-2">
              <a href="track-order.php?order_number=<?= urlencode($order['order_number']) ?>" class="btn btn-outline-primary btn-sm">
                📍 Track Live Status
              </a>
              <a href="menu.php" class="btn btn-primary btn-sm">
                🔁 Order Again
              </a>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
