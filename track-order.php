<?php
/**
 * Madam 3 Kitchen - Live Order Tracking Page
 */
$pageTitle = 'Track Your Order — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';

$orderNumber = sanitize($_GET['order_number'] ?? '');
$phone = sanitize($_GET['phone'] ?? '');
$db = Database::getConnection();

$order = null;
$items = [];
$history = [];

if (!empty($orderNumber) || !empty($phone)) {
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

    if ($order) {
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();

        foreach ($items as &$item) {
            $eStmt = $db->prepare("SELECT * FROM order_item_extras WHERE order_item_id = ?");
            $eStmt->execute([$item['id']]);
            $item['extras'] = $eStmt->fetchAll();
        }

        $hStmt = $db->prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC");
        $hStmt->execute([$order['id']]);
        $history = $hStmt->fetchAll();
    }
}

// Map Status to Step Index (0-6)
$statusLevels = [
    'Pending' => 0,
    'Payment Confirmed' => 1,
    'Confirmed' => 2,
    'Preparing' => 3,
    'Ready' => 4,
    'Out for Delivery' => 5,
    'Delivered' => 6,
    'Cancelled' => -1,
    'Rejected' => -1
];

$currentLevel = $order ? ($statusLevels[$order['status']] ?? 2) : 0;
?>

<div class="container py-5">
  <div class="max-w-800 mx-auto">
    <!-- Header -->
    <div class="text-center mb-5">
      <span class="badge badge-primary mb-2">Live Order Status</span>
      <h1 class="h2 fw-extrabold mb-1">Track Your Order 📍</h1>
      <p class="text-muted fs-sm">Enter your Madam 3 Kitchen order number and phone to view live status.</p>
    </div>

    <!-- Search Form -->
    <div class="card p-4 shadow-sm mb-5">
      <form action="track-order.php" method="GET" class="row g-3 align-items-end">
        <div class="col-12 col-sm-6">
          <label for="track_order_number" class="form-label fs-sm">Order Number</label>
          <input type="text" id="track_order_number" name="order_number" class="form-control" placeholder="e.g. MDM-20260813-00124" value="<?= $orderNumber ?>">
        </div>
        <div class="col-12 col-sm-4">
          <label for="track_phone" class="form-label fs-sm">Phone Number</label>
          <input type="tel" id="track_phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" value="<?= $phone ?>">
        </div>
        <div class="col-12 col-sm-2">
          <button type="submit" class="btn btn-primary w-100">
            Track
          </button>
        </div>
      </form>
    </div>

    <?php if ($order): ?>
      <!-- Order Details Card -->
      <div class="card p-4 p-md-5 shadow-sm mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 border-bottom mb-4">
          <div>
            <span class="fs-xs text-muted fw-bold">ORDER NUMBER</span>
            <h3 class="mb-0 text-secondary fs-lg fw-extrabold"><?= sanitize($order['order_number']) ?></h3>
            <span class="fs-xs text-muted">Placed on <?= date('M d, Y h:i A', strtotime($order['created_at'])) ?></span>
          </div>

          <div class="text-end">
            <span class="fs-xs text-muted fw-bold d-block">CURRENT STATUS</span>
            <span class="badge badge-primary fs-sm fw-bold"><?= strtoupper(sanitize($order['status'])) ?></span>
          </div>
        </div>

        <!-- 7-Step Visual Timeline -->
        <div class="tracking-timeline">
          <!-- Step 1: Order Received -->
          <div class="tracking-step <?= $currentLevel >= 0 ? ($currentLevel === 0 ? 'active' : 'completed') : '' ?>">
            <div class="step-indicator"><?= $currentLevel > 0 ? '✓' : '1' ?></div>
            <div class="step-content">
              <h5>Order Received</h5>
              <p>We have received your order details in our kitchen system.</p>
            </div>
          </div>

          <!-- Step 2: Payment Confirmed -->
          <div class="tracking-step <?= $currentLevel >= 1 ? ($currentLevel === 1 ? 'active' : 'completed') : '' ?>">
            <div class="step-indicator"><?= $currentLevel > 1 ? '✓' : '2' ?></div>
            <div class="step-content">
              <h5>Payment Confirmed</h5>
              <p>Payment verification recorded (<?= sanitize($order['payment_method']) ?> - <?= sanitize($order['payment_status']) ?>).</p>
            </div>
          </div>

          <!-- Step 3: Restaurant Confirmed -->
          <div class="tracking-step <?= $currentLevel >= 2 ? ($currentLevel === 2 ? 'active' : 'completed') : '' ?>">
            <div class="step-indicator"><?= $currentLevel > 2 ? '✓' : '3' ?></div>
            <div class="step-content">
              <h5>Restaurant Confirmed</h5>
              <p>Madam 3 Kitchen chefs have approved and queued your order.</p>
            </div>
          </div>

          <!-- Step 4: Preparing -->
          <div class="tracking-step <?= $currentLevel >= 3 ? ($currentLevel === 3 ? 'active' : 'completed') : '' ?>">
            <div class="step-indicator"><?= $currentLevel > 3 ? '✓' : '4' ?></div>
            <div class="step-content">
              <h5>Preparing Your Meal 🍳</h5>
              <p>Our cooks are actively packaging your delicious Nigerian dishes.</p>
            </div>
          </div>

          <!-- Step 5: Ready -->
          <div class="tracking-step <?= $currentLevel >= 4 ? ($currentLevel === 4 ? 'active' : 'completed') : '' ?>">
            <div class="step-indicator"><?= $currentLevel > 4 ? '✓' : '5' ?></div>
            <div class="step-content">
              <h5>Meal Ready & Packaged</h5>
              <p>Food is hot and placed into insulated thermal delivery bags.</p>
            </div>
          </div>

          <!-- Step 6: Out for Delivery -->
          <div class="tracking-step <?= $currentLevel >= 5 ? ($currentLevel === 5 ? 'active' : 'completed') : '' ?>">
            <div class="step-indicator"><?= $currentLevel > 5 ? '✓' : '6' ?></div>
            <div class="step-content">
              <h5>Out for Delivery 🛵</h5>
              <p>Dispatch rider is en-route to <?= sanitize($order['delivery_address']) ?>.</p>
            </div>
          </div>

          <!-- Step 7: Delivered -->
          <div class="tracking-step <?= $currentLevel >= 6 ? 'completed' : '' ?>">
            <div class="step-indicator"><?= $currentLevel >= 6 ? '✓' : '7' ?></div>
            <div class="step-content">
              <h5>Delivered 🎉</h5>
              <p>Order delivered successfully. Enjoy your meal!</p>
            </div>
          </div>
        </div>

        <!-- Order Items Breakdown -->
        <div class="mt-4 pt-3 border-top">
          <h4 class="fs-base fw-bold mb-3">Items in This Order:</h4>
          <?php foreach ($items as $item): ?>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <div>
                <strong><?= sanitize($item['product_name']) ?></strong> × <?= $item['quantity'] ?>
                <?php if (!empty($item['extras'])): ?>
                  <div class="fs-xs text-muted">Extras: <?= implode(', ', array_column($item['extras'], 'extra_name')) ?></div>
                <?php endif; ?>
              </div>
              <div class="fw-bold"><?= formatPrice($item['subtotal']) ?></div>
            </div>
          <?php endforeach; ?>

          <div class="d-flex justify-content-between pt-3">
            <span class="fw-bold">Total Paid:</span>
            <span class="fs-lg fw-extrabold text-primary"><?= formatPrice($order['grand_total']) ?></span>
          </div>
        </div>

        <!-- Help Support Buttons -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 pt-3 border-top">
          <div>
            <span class="fs-xs text-muted">Need help with this order?</span>
          </div>
          <div class="d-flex gap-2">
            <a href="https://wa.me/<?= RESTAURANT_WHATSAPP ?>?text=<?= urlencode("Hello Madam 3 Kitchen, I'm checking on my order #{$order['order_number']}") ?>" target="_blank" class="btn btn-whatsapp btn-sm">
              💬 WhatsApp Support
            </a>
            <a href="tel:<?= RESTAURANT_PHONE ?>" class="btn btn-outline-secondary btn-sm">
              📞 Call Kitchen
            </a>
          </div>
        </div>
      </div>
    <?php elseif (!empty($orderNumber) || !empty($phone)): ?>
      <div class="card p-5 text-center shadow-sm">
        <div style="font-size: 3rem;" class="mb-2">🔍</div>
        <h3>No Order Found</h3>
        <p class="text-muted">We couldn't locate an order matching the provided details. Please double-check your order number or contact us on WhatsApp.</p>
        <a href="contact.php" class="btn btn-outline-primary btn-sm mx-auto">Contact Kitchen Support</a>
      </div>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
