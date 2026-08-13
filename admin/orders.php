<?php
/**
 * Madam 3 Kitchen - Admin Order Management
 */
$pageTitle = 'Orders Management';
require_once __DIR__ . '/includes/admin-header.php';

$db = Database::getConnection();

$statusFilter = $_GET['status'] ?? 'all';
$search = trim($_GET['search'] ?? '');
$fromDate = $_GET['from_date'] ?? '';
$toDate = $_GET['to_date'] ?? '';

$sql = "SELECT * FROM orders WHERE 1=1";
$params = [];

if ($statusFilter !== 'all') {
    $sql .= " AND status = ?";
    $params[] = $statusFilter;
}

if (!empty($search)) {
    $sql .= " AND (order_number LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR delivery_address LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

if (!empty($fromDate)) {
    $sql .= " AND DATE(created_at) >= ?";
    $params[] = $fromDate;
}

if (!empty($toDate)) {
    $sql .= " AND DATE(created_at) <= ?";
    $params[] = $toDate;
}

$sql .= " ORDER BY id DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();
?>

<!-- Filter Tabs -->
<div class="filter-tabs mb-3">
  <a href="orders.php?status=all" class="filter-tab <?= $statusFilter === 'all' ? 'active' : '' ?>">All Orders</a>
  <a href="orders.php?status=Pending" class="filter-tab <?= $statusFilter === 'Pending' ? 'active' : '' ?>">🔔 Pending</a>
  <a href="orders.php?status=Confirmed" class="filter-tab <?= $statusFilter === 'Confirmed' ? 'active' : '' ?>">✓ Confirmed</a>
  <a href="orders.php?status=Preparing" class="filter-tab <?= $statusFilter === 'Preparing' ? 'active' : '' ?>">🍳 Preparing</a>
  <a href="orders.php?status=Ready" class="filter-tab <?= $statusFilter === 'Ready' ? 'active' : '' ?>">📦 Ready</a>
  <a href="orders.php?status=Out for Delivery" class="filter-tab <?= $statusFilter === 'Out for Delivery' ? 'active' : '' ?>">🛵 Out for Delivery</a>
  <a href="orders.php?status=Delivered" class="filter-tab <?= $statusFilter === 'Delivered' ? 'active' : '' ?>">🎉 Delivered</a>
  <a href="orders.php?status=Cancelled" class="filter-tab <?= $statusFilter === 'Cancelled' ? 'active' : '' ?>">❌ Cancelled</a>
</div>

<!-- Search & Filter Card -->
<div class="card p-3 shadow-sm mb-4">
  <form action="orders.php" method="GET" class="row g-2 align-items-end">
    <input type="hidden" name="status" value="<?= sanitize($statusFilter) ?>">
    
    <div class="col-12 col-sm-4">
      <label class="form-label fs-xs mb-1">Search Order / Customer / Phone</label>
      <input type="text" name="search" class="form-control form-control-sm" placeholder="e.g. MDM-2026, Osas, 0803..." value="<?= sanitize($search) ?>">
    </div>

    <div class="col-6 col-sm-3">
      <label class="form-label fs-xs mb-1">From Date</label>
      <input type="date" name="from_date" class="form-control form-control-sm" value="<?= sanitize($fromDate) ?>">
    </div>

    <div class="col-6 col-sm-3">
      <label class="form-label fs-xs mb-1">To Date</label>
      <input type="date" name="to_date" class="form-control form-control-sm" value="<?= sanitize($toDate) ?>">
    </div>

    <div class="col-12 col-sm-2 d-flex gap-1">
      <button type="submit" class="btn btn-primary btn-sm flex-grow-1">Filter</button>
      <a href="orders.php" class="btn btn-outline-secondary btn-sm">Reset</a>
    </div>
  </form>
</div>

<!-- Orders Table -->
<div class="card shadow-sm p-4">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="h5 fw-extrabold text-secondary mb-0">Orders List (<?= count($orders) ?>)</h3>
  </div>

  <?php if (empty($orders)): ?>
    <div class="text-center py-5 text-muted">
      <div style="font-size: 3rem;">📦</div>
      <p class="mt-2">No orders match the selected filters.</p>
    </div>
  <?php else: ?>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer Info</th>
            <th>Delivery Area</th>
            <th>Timing</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($orders as $order): ?>
            <tr>
              <td>
                <a href="order-details.php?id=<?= $order['id'] ?>" class="fw-extrabold text-primary">
                  <?= sanitize($order['order_number']) ?>
                </a>
                <div class="fs-xs text-muted"><?= date('M d, Y h:i A', strtotime($order['created_at'])) ?></div>
              </td>

              <td>
                <div class="fw-bold fs-sm"><?= sanitize($order['customer_name']) ?></div>
                <div class="fs-xs text-muted">📞 <?= sanitize($order['phone']) ?></div>
              </td>

              <td class="fs-sm">
                <strong><?= sanitize($order['zone_name'] ?: 'Benin City') ?></strong>
                <div class="fs-xs text-muted text-truncate" style="max-width: 180px;"><?= sanitize($order['delivery_address']) ?></div>
              </td>

              <td>
                <?php if ($order['order_timing'] === 'scheduled'): ?>
                  <span class="badge badge-warning fs-xs">📅 <?= sanitize($order['scheduled_date']) ?> <?= sanitize($order['scheduled_time']) ?></span>
                <?php else: ?>
                  <span class="badge badge-primary fs-xs">⚡ ASAP</span>
                <?php endif; ?>
              </td>

              <td class="fw-extrabold text-secondary">
                <?= formatPrice($order['grand_total']) ?>
              </td>

              <td>
                <span class="badge <?= $order['payment_status'] === 'Paid' ? 'badge-success' : 'badge-secondary' ?> fs-xs">
                  <?= strtoupper(sanitize($order['payment_status'])) ?> (<?= sanitize($order['payment_method']) ?>)
                </span>
              </td>

              <td>
                <select class="form-select form-select-sm" style="width: auto; font-weight: 700;" onchange="updateOrderStatus(<?= $order['id'] ?>, this.value)">
                  <option value="Pending" <?= $order['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
                  <option value="Confirmed" <?= $order['status'] === 'Confirmed' ? 'selected' : '' ?>>Confirmed</option>
                  <option value="Preparing" <?= $order['status'] === 'Preparing' ? 'selected' : '' ?>>Preparing</option>
                  <option value="Ready" <?= $order['status'] === 'Ready' ? 'selected' : '' ?>>Ready</option>
                  <option value="Out for Delivery" <?= $order['status'] === 'Out for Delivery' ? 'selected' : '' ?>>Out for Delivery</option>
                  <option value="Delivered" <?= $order['status'] === 'Delivered' ? 'selected' : '' ?>>Delivered</option>
                  <option value="Cancelled" <?= $order['status'] === 'Cancelled' ? 'selected' : '' ?>>Cancelled</option>
                </select>
              </td>

              <td>
                <div class="d-flex gap-1">
                  <a href="order-details.php?id=<?= $order['id'] ?>" class="btn btn-outline-primary btn-sm" title="View Full Details">👁️</a>
                  <a href="receipt.php?id=<?= $order['id'] ?>" target="_blank" class="btn btn-outline-secondary btn-sm" title="Print Receipt">🖨️</a>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
