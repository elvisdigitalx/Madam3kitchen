<?php
/**
 * Madam 3 Kitchen - Financial & Sales Reports
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

// Handle CSV Export
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=madam3_sales_report_' . date('Ymd_His') . '.csv');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['Order Number', 'Date', 'Customer Name', 'Phone', 'Delivery Zone', 'Subtotal (NGN)', 'Delivery (NGN)', 'Discount (NGN)', 'Grand Total (NGN)', 'Payment Method', 'Payment Status', 'Order Status']);

    $rows = $db->query("SELECT order_number, created_at, customer_name, phone, zone_name, subtotal, delivery_fee, discount_amount, grand_total, payment_method, payment_status, status FROM orders ORDER BY id DESC");
    while ($r = $rows->fetch()) {
        fputcsv($output, [
            $r['order_number'],
            $r['created_at'],
            $r['customer_name'],
            $r['phone'],
            $r['zone_name'],
            $r['subtotal'],
            $r['delivery_fee'],
            $r['discount_amount'],
            $r['grand_total'],
            $r['payment_method'],
            $r['payment_status'],
            $r['status']
        ]);
    }
    fclose($output);
    exit;
}

// Analytics Queries
// Total revenue (non-cancelled)
$totRev = floatval($db->query("SELECT COALESCE(SUM(grand_total), 0) FROM orders WHERE status NOT IN ('Cancelled', 'Rejected')")->fetchColumn());
$totOrders = intval($db->query("SELECT COUNT(*) FROM orders WHERE status NOT IN ('Cancelled', 'Rejected')")->fetchColumn());
$aov = $totOrders > 0 ? ($totRev / $totOrders) : 0;

// Daily Sales (Last 7 days)
$dailySales = $db->query("SELECT DATE(created_at) as sale_date, COUNT(*) as order_count, SUM(grand_total) as daily_total FROM orders WHERE status NOT IN ('Cancelled', 'Rejected') GROUP BY DATE(created_at) ORDER BY sale_date DESC LIMIT 7")->fetchAll();

// Top Dishes
$topMeals = $db->query("SELECT product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_revenue FROM order_items GROUP BY product_name ORDER BY total_qty DESC LIMIT 8")->fetchAll();

// Payment Methods stats
$payStats = $db->query("SELECT payment_method, COUNT(*) as count, SUM(grand_total) as total_amount FROM orders GROUP BY payment_method")->fetchAll();

// Delivery Zone stats
$zoneStats = $db->query("SELECT zone_name, COUNT(*) as count, SUM(grand_total) as total_amount FROM orders GROUP BY zone_name ORDER BY count DESC LIMIT 8")->fetchAll();

$pageTitle = 'Sales & Financial Reports';
require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
  <div>
    <h1 class="h4 fw-extrabold text-secondary mb-0">Sales & Financial Analytics</h1>
    <p class="text-muted fs-xs mb-0">Performance metrics and accounting reports for Madam 3 Kitchen</p>
  </div>
  <a href="reports.php?export=csv" class="btn btn-primary btn-sm">
    📥 Export All Sales to CSV
  </a>
</div>

<!-- High-Level Financial KPI Cards -->
<div class="row g-3 mb-4">
  <div class="col-12 col-sm-4">
    <div class="stat-card">
      <div>
        <div class="stat-title">Total Lifetime Revenue</div>
        <div class="stat-value text-primary"><?= formatPrice($totRev) ?></div>
        <div class="fs-xs text-muted">All completed orders</div>
      </div>
      <div class="stat-icon orange">💰</div>
    </div>
  </div>

  <div class="col-12 col-sm-4">
    <div class="stat-card">
      <div>
        <div class="stat-title">Total Orders Fulfilled</div>
        <div class="stat-value text-success"><?= $totOrders ?></div>
        <div class="fs-xs text-muted">Excluding cancellations</div>
      </div>
      <div class="stat-icon green">📦</div>
    </div>
  </div>

  <div class="col-12 col-sm-4">
    <div class="stat-card">
      <div>
        <div class="stat-title">Average Order Value (AOV)</div>
        <div class="stat-value text-info"><?= formatPrice($aov) ?></div>
        <div class="fs-xs text-muted">Average customer spend</div>
      </div>
      <div class="stat-icon blue">📊</div>
    </div>
  </div>
</div>

<div class="row g-4">
  <!-- Left: Top Selling Nigerian Meals -->
  <div class="col-12 col-lg-7">
    <div class="card p-4 shadow-sm mb-4">
      <h3 class="h5 fw-extrabold text-secondary mb-3">🔥 Most Ordered Nigerian Dishes</h3>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Quantity Sold</th>
              <th class="text-end">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($topMeals)): ?>
              <tr><td colspan="3" class="text-center text-muted">No meal sales recorded yet.</td></tr>
            <?php else: ?>
              <?php foreach ($topMeals as $tm): ?>
                <tr>
                  <td><strong><?= sanitize($tm['product_name']) ?></strong></td>
                  <td><span class="badge badge-primary"><?= $tm['total_qty'] ?> portions</span></td>
                  <td class="text-end fw-extrabold text-secondary"><?= formatPrice($tm['total_revenue']) ?></td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Daily Sales -->
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">📅 Recent Daily Revenue</h3>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders Count</th>
              <th class="text-end">Daily Revenue</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($dailySales)): ?>
              <tr><td colspan="3" class="text-center text-muted">No daily records found.</td></tr>
            <?php else: ?>
              <?php foreach ($dailySales as $ds): ?>
                <tr>
                  <td><strong><?= date('l, M d, Y', strtotime($ds['sale_date'])) ?></strong></td>
                  <td><?= $ds['order_count'] ?> orders</td>
                  <td class="text-end fw-bold text-success"><?= formatPrice($ds['daily_total']) ?></td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Right: Payment Methods & Zone Breakdown -->
  <div class="col-12 col-lg-5">
    <!-- Payment Methods Breakdown -->
    <div class="card p-4 shadow-sm mb-4">
      <h3 class="h5 fw-extrabold text-secondary mb-3">💳 Payment Method Statistics</h3>
      <div class="d-flex flex-column gap-2">
        <?php foreach ($payStats as $ps): ?>
          <div class="p-2 border rounded d-flex justify-content-between align-items-center">
            <div>
              <strong class="text-uppercase"><?= sanitize($ps['payment_method']) ?></strong>
              <div class="fs-xs text-muted"><?= $ps['count'] ?> transactions</div>
            </div>
            <div class="fw-bold text-primary"><?= formatPrice($ps['total_amount']) ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Delivery Zones Breakdown -->
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">🛵 Top Benin Delivery Zones</h3>
      <div class="d-flex flex-column gap-2">
        <?php foreach ($zoneStats as $zs): ?>
          <div class="p-2 border rounded d-flex justify-content-between align-items-center">
            <div>
              <strong><?= sanitize($zs['zone_name'] ?: 'Direct / Asoro') ?></strong>
              <div class="fs-xs text-muted"><?= $zs['count'] ?> deliveries</div>
            </div>
            <div class="fw-bold text-secondary"><?= formatPrice($zs['total_amount']) ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
