<?php
/**
 * Madam 3 Kitchen - Admin Dashboard Main Overview
 */
$pageTitle = 'Restaurant Overview';
require_once __DIR__ . '/includes/admin-header.php';

$db = Database::getConnection();

// Today's date
$today = date('Y-m-d');

// 1. Today's Revenue
$revStmt = $db->prepare("SELECT COALESCE(SUM(grand_total), 0) FROM orders WHERE DATE(created_at) = ? AND status != 'Cancelled' AND status != 'Rejected'");
$revStmt->execute([$today]);
$todayRevenue = floatval($revStmt->fetchColumn());

// 2. Today's Orders
$ordStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = ?");
$ordStmt->execute([$today]);
$todayOrdersCount = intval($ordStmt->fetchColumn());

// 3. Status Counts
$pendingCount = intval($db->query("SELECT COUNT(*) FROM orders WHERE status = 'Pending'")->fetchColumn());
$preparingCount = intval($db->query("SELECT COUNT(*) FROM orders WHERE status = 'Preparing'")->fetchColumn());
$completedCount = intval($db->query("SELECT COUNT(*) FROM orders WHERE status = 'Delivered'")->fetchColumn());
$cancelledCount = intval($db->query("SELECT COUNT(*) FROM orders WHERE status IN ('Cancelled', 'Rejected')")->fetchColumn());

// 4. Customers & Products
$totalCustomers = intval($db->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn());
$totalProducts = intval($db->query("SELECT COUNT(*) FROM products")->fetchColumn());

// 5. Recent Incoming Orders
$recentOrders = $db->query("SELECT * FROM orders ORDER BY id DESC LIMIT 10")->fetchAll();

// 6. Top Selling Dishes
$topDishes = $db->query("SELECT product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_sales FROM order_items GROUP BY product_name ORDER BY total_qty DESC LIMIT 5")->fetchAll();
?>

<!-- Restaurant Open/Closed Notice Banner -->
<div class="card p-3 mb-4 shadow-sm <?= isRestaurantOpen() ? 'bg-success' : 'bg-danger' ?> text-white d-flex flex-row justify-content-between align-items-center flex-wrap gap-2">
  <div class="d-flex align-items-center gap-2">
    <span style="font-size: 1.5rem;"><?= isRestaurantOpen() ? '🟢' : '🔴' ?></span>
    <div>
      <h4 class="h6 mb-0 text-white fw-bold">Restaurant is Currently: <?= isRestaurantOpen() ? 'OPEN FOR ORDERS' : 'CLOSED' ?></h4>
      <div class="fs-xs opacity-75">Operating Hours: 8:00 AM – 10:00 PM • Asoro Bus Stop, Ekhuan Road, Benin City</div>
    </div>
  </div>
  <a href="settings.php" class="btn btn-light btn-sm text-dark fw-bold">⚙️ Adjust Kitchen Status</a>
</div>

<!-- Stats Counter Cards Grid -->
<div class="row g-3 mb-4">
  <!-- Today's Revenue -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card">
      <div>
        <div class="stat-title">Today's Revenue</div>
        <div class="stat-value text-primary"><?= formatPrice($todayRevenue) ?></div>
        <div class="fs-xs text-muted mt-1"><?= $todayOrdersCount ?> orders placed today</div>
      </div>
      <div class="stat-icon orange">💰</div>
    </div>
  </div>

  <!-- Pending Orders -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card">
      <div>
        <div class="stat-title">Pending Orders</div>
        <div class="stat-value text-warning"><?= $pendingCount ?></div>
        <div class="fs-xs text-muted mt-1">Requires kitchen confirmation</div>
      </div>
      <div class="stat-icon purple">🔔</div>
    </div>
  </div>

  <!-- Preparing in Kitchen -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card">
      <div>
        <div class="stat-title">Cooking / Preparing</div>
        <div class="stat-value text-info"><?= $preparingCount ?></div>
        <div class="fs-xs text-muted mt-1">Active in kitchen</div>
      </div>
      <div class="stat-icon blue">🍳</div>
    </div>
  </div>

  <!-- Delivered / Completed -->
  <div class="col-12 col-sm-6 col-xl-3">
    <div class="stat-card">
      <div>
        <div class="stat-title">Completed Deliveries</div>
        <div class="stat-value text-success"><?= $completedCount ?></div>
        <div class="fs-xs text-muted mt-1">All-time delivered</div>
      </div>
      <div class="stat-icon green">✅</div>
    </div>
  </div>
</div>

<div class="row g-4">
  <!-- Left: Recent Incoming Orders Table -->
  <div class="col-12 col-xl-8">
    <div class="card shadow-sm p-4 h-100">
      <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h3 class="h5 fw-extrabold text-secondary mb-0">Recent Incoming Orders</h3>
          <p class="text-muted fs-xs mb-0">Real-time live queue for Benin City kitchen staff</p>
        </div>
        <a href="orders.php" class="btn btn-outline-primary btn-sm">View All Orders &rarr;</a>
      </div>

      <?php if (empty($recentOrders)): ?>
        <div class="text-center py-5 text-muted">
          <div style="font-size: 2.5rem;">📦</div>
          <p class="mt-2">No orders received yet today.</p>
        </div>
      <?php else: ?>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Area</th>
                <th>Total</th>
                <th>Status</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($recentOrders as $ro): ?>
                <tr>
                  <td>
                    <a href="order-details.php?id=<?= $ro['id'] ?>" class="fw-bold text-primary">
                      <?= sanitize($ro['order_number']) ?>
                    </a>
                    <div class="fs-xs text-muted"><?= date('h:i A', strtotime($ro['created_at'])) ?></div>
                  </td>
                  <td>
                    <div class="fw-bold fs-sm"><?= sanitize($ro['customer_name']) ?></div>
                    <div class="fs-xs text-muted"><?= sanitize($ro['phone']) ?></div>
                  </td>
                  <td class="fs-sm"><?= sanitize($ro['zone_name'] ?: 'Benin City') ?></td>
                  <td class="fw-extrabold text-secondary"><?= formatPrice($ro['grand_total']) ?></td>
                  <td>
                    <span class="status-badge status-<?= strtolower(str_replace(' ', '-', $ro['status'])) ?>">
                      <?= sanitize($ro['status']) ?>
                    </span>
                  </td>
                  <td>
                    <div class="dropdown">
                      <select class="form-select form-select-sm" style="width: auto;" onchange="updateOrderStatus(<?= $ro['id'] ?>, this.value)">
                        <option value="Pending" <?= $ro['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
                        <option value="Confirmed" <?= $ro['status'] === 'Confirmed' ? 'selected' : '' ?>>Confirmed</option>
                        <option value="Preparing" <?= $ro['status'] === 'Preparing' ? 'selected' : '' ?>>Preparing</option>
                        <option value="Ready" <?= $ro['status'] === 'Ready' ? 'selected' : '' ?>>Ready</option>
                        <option value="Out for Delivery" <?= $ro['status'] === 'Out for Delivery' ? 'selected' : '' ?>>Out for Delivery</option>
                        <option value="Delivered" <?= $ro['status'] === 'Delivered' ? 'selected' : '' ?>>Delivered</option>
                        <option value="Cancelled" <?= $ro['status'] === 'Cancelled' ? 'selected' : '' ?>>Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>
  </div>

  <!-- Right: Top Selling Meals & Restaurant Quick Info -->
  <div class="col-12 col-xl-4">
    <!-- Top Selling Meals -->
    <div class="card shadow-sm p-4 mb-4">
      <h3 class="h5 fw-extrabold text-secondary mb-3">🔥 Top Selling Meals</h3>
      <div class="d-flex flex-column gap-3">
        <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
          <div>
            <div class="fw-bold fs-sm">Party Jollof Rice with Chicken</div>
            <div class="fs-xs text-muted">Customer Favorite • Smoky Firewood</div>
          </div>
          <span class="badge badge-primary">★ #1 Best Seller</span>
        </div>

        <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
          <div>
            <div class="fw-bold fs-sm">Egusi Soup with Pounded Yam</div>
            <div class="fs-xs text-muted">Assorted Meat & Stockfish</div>
          </div>
          <span class="badge badge-warning">★ #2</span>
        </div>

        <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
          <div>
            <div class="fw-bold fs-sm">Spicy Asun Peppered Goat Meat</div>
            <div class="fs-xs text-muted">Fire Grilled Chunks</div>
          </div>
          <span class="badge badge-secondary">★ #3</span>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-bold fs-sm">Madam 3 Chapman Mocktail</div>
            <div class="fs-xs text-muted">Chilled Citrus & Cucumber</div>
          </div>
          <span class="badge badge-success">★ #4</span>
        </div>
      </div>
    </div>

    <!-- Quick Info Card -->
    <div class="card shadow-sm p-4">
      <h3 class="h5 fw-extrabold text-secondary mb-3">Kitchen Quick Info</h3>
      <div class="d-flex flex-column gap-2 fs-sm">
        <div><strong>Location:</strong> Asoro Bus Stop, Ekhuan Road, Benin City</div>
        <div><strong>Phone:</strong> <?= RESTAURANT_PHONE_DISPLAY ?></div>
        <div><strong>Menu Items:</strong> <?= $totalProducts ?> Active Dishes</div>
        <div><strong>Registered Customers:</strong> <?= $totalCustomers ?> Foodies</div>
      </div>
      <div class="mt-3 pt-3 border-top">
        <a href="products.php?action=create" class="btn btn-primary btn-sm w-100 mb-2">+ Add New Food to Menu</a>
        <a href="reports.php" class="btn btn-outline-secondary btn-sm w-100">📊 View Sales Reports</a>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
