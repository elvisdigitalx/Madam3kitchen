<?php
/**
 * Madam 3 Kitchen - Customers Directory
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$search = trim($_GET['search'] ?? '');

$sql = "SELECT u.*, 
        COUNT(o.id) as total_orders, 
        COALESCE(SUM(o.grand_total), 0) as total_spend 
        FROM users u 
        LEFT JOIN orders o ON u.id = o.user_id 
        WHERE u.role = 'customer'";
$params = [];

if (!empty($search)) {
    $sql .= " AND (u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.address LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

$sql .= " GROUP BY u.id ORDER BY total_spend DESC, u.id DESC";
$stmt = $db->prepare($sql);
$stmt->execute($params);
$customers = $stmt->fetchAll();

$pageTitle = 'Customers Directory';
require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
  <div>
    <h1 class="h4 fw-extrabold text-secondary mb-0">Customer Directory</h1>
    <p class="text-muted fs-xs mb-0">View registered foodies, total orders, and total lifetime spend</p>
  </div>
</div>

<!-- Search -->
<div class="card p-3 shadow-sm mb-4">
  <form action="customers.php" method="GET" class="row g-2">
    <div class="col-10">
      <input type="text" name="search" class="form-control form-control-sm" placeholder="Search customer by name, phone, email, or Benin address..." value="<?= sanitize($search) ?>">
    </div>
    <div class="col-2">
      <button type="submit" class="btn btn-primary btn-sm w-100">Search</button>
    </div>
  </form>
</div>

<!-- Customer Table -->
<div class="card shadow-sm p-4">
  <div class="table-responsive">
    <table class="table align-middle">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Contact</th>
          <th>Saved Address</th>
          <th>Total Orders</th>
          <th>Lifetime Spend</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($customers as $cust): ?>
          <tr>
            <td>
              <div class="d-flex align-items-center gap-2">
                <div class="review-avatar" style="width: 36px; height: 36px; font-size: 0.9rem;">
                  <?= strtoupper(substr($cust['name'], 0, 1)) ?>
                </div>
                <strong><?= sanitize($cust['name']) ?></strong>
              </div>
            </td>
            <td>
              <div>📞 <?= sanitize($cust['phone']) ?></div>
              <?php if ($cust['email']): ?>
                <div class="fs-xs text-muted">✉️ <?= sanitize($cust['email']) ?></div>
              <?php endif; ?>
            </td>
            <td class="fs-xs" style="max-width: 220px;">
              <?= sanitize($cust['address'] ?: 'No address saved') ?>
              <?php if ($cust['landmark']): ?>
                <div class="text-muted">Landmark: <?= sanitize($cust['landmark']) ?></div>
              <?php endif; ?>
            </td>
            <td><span class="badge badge-primary"><?= $cust['total_orders'] ?> orders</span></td>
            <td class="fw-bold text-success"><?= formatPrice($cust['total_spend']) ?></td>
            <td class="fs-xs text-muted"><?= date('M d, Y', strtotime($cust['created_at'])) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
