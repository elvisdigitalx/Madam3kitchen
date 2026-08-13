<?php
/**
 * Madam 3 Kitchen - Customer Account Dashboard
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$currentUser = getCurrentUser();
$db = Database::getConnection();

$updateMessage = '';
$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Session expired. Please try again.';
    } else {
        $name = sanitize($_POST['name'] ?? '');
        $whatsapp = sanitize($_POST['whatsapp'] ?? '');
        $email = sanitize($_POST['email'] ?? '');
        $address = sanitize($_POST['address'] ?? '');
        $landmark = sanitize($_POST['landmark'] ?? '');
        $newPassword = $_POST['new_password'] ?? '';

        try {
            if (!empty($newPassword)) {
                $hash = hashPassword($newPassword);
                $stmt = $db->prepare("UPDATE users SET name = ?, whatsapp = ?, email = ?, address = ?, landmark = ?, password = ? WHERE id = ?");
                $stmt->execute([$name, $whatsapp, $email ?: null, $address, $landmark, $hash, $currentUser['id']]);
            } else {
                $stmt = $db->prepare("UPDATE users SET name = ?, whatsapp = ?, email = ?, address = ?, landmark = ? WHERE id = ?");
                $stmt->execute([$name, $whatsapp, $email ?: null, $address, $landmark, $currentUser['id']]);
            }
            $updateMessage = 'Profile updated successfully!';
            $currentUser = getCurrentUser();
        } catch (Exception $e) {
            $errorMessage = 'Failed to update profile: ' . $e->getMessage();
        }
    }
}

// Fetch recent customer orders
$orderStmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? OR phone = ? ORDER BY id DESC LIMIT 5");
$orderStmt->execute([$currentUser['id'], $currentUser['phone']]);
$recentOrders = $orderStmt->fetchAll();

$pageTitle = 'My Account — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <div class="row g-4">
    <!-- Sidebar Account Nav -->
    <div class="col-12 col-md-4">
      <div class="card p-4 shadow-sm mb-4">
        <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
          <div class="review-avatar" style="width: 50px; height: 50px; font-size: 1.25rem;">
            <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
          </div>
          <div>
            <h4 class="h5 mb-0 fw-extrabold text-secondary"><?= sanitize($currentUser['name']) ?></h4>
            <div class="fs-xs text-muted"><?= sanitize($currentUser['phone']) ?></div>
          </div>
        </div>

        <div class="d-flex flex-column gap-2">
          <a href="account.php" class="btn btn-primary text-start">👤 Profile & Address</a>
          <a href="orders.php" class="btn btn-outline-secondary text-start">📦 My Order History</a>
          <a href="menu.php" class="btn btn-outline-secondary text-start">🍲 Order Food</a>
          <a href="logout.php" class="btn btn-outline-danger text-start">Sign Out</a>
        </div>
      </div>
    </div>

    <!-- Main Profile Edit Form -->
    <div class="col-12 col-md-8">
      <div class="card p-4 p-md-5 shadow-sm">
        <h3 class="h4 fw-extrabold text-secondary mb-3">Account Details</h3>

        <?php if ($updateMessage): ?>
          <div class="alert alert-success"><?= $updateMessage ?></div>
        <?php endif; ?>

        <?php if ($errorMessage): ?>
          <div class="alert alert-danger"><?= $errorMessage ?></div>
        <?php endif; ?>

        <form action="account.php" method="POST">
          <?= csrfInputField() ?>

          <div class="row g-3">
            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="name" class="form-label">Full Name</label>
                <input type="text" id="name" name="name" class="form-control" value="<?= sanitize($currentUser['name']) ?>" required>
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label class="form-label">Registered Phone Number</label>
                <input type="text" class="form-control" value="<?= sanitize($currentUser['phone']) ?>" disabled>
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="whatsapp" class="form-label">WhatsApp Number</label>
                <input type="tel" id="whatsapp" name="whatsapp" class="form-control" value="<?= sanitize($currentUser['whatsapp'] ?? '') ?>">
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="email" class="form-label">Email Address</label>
                <input type="email" id="email" name="email" class="form-control" value="<?= sanitize($currentUser['email'] ?? '') ?>">
              </div>
            </div>

            <div class="col-12">
              <div class="form-group mb-0">
                <label for="address" class="form-label">Default Delivery Address (Benin City)</label>
                <input type="text" id="address" name="address" class="form-control" value="<?= sanitize($currentUser['address'] ?? '') ?>" placeholder="House/Flat number, Street name">
              </div>
            </div>

            <div class="col-12">
              <div class="form-group mb-0">
                <label for="landmark" class="form-label">Nearest Landmark</label>
                <input type="text" id="landmark" name="landmark" class="form-control" value="<?= sanitize($currentUser['landmark'] ?? '') ?>" placeholder="Bus stop or well known building">
              </div>
            </div>

            <div class="col-12">
              <div class="form-group mb-0">
                <label for="new_password" class="form-label">Change Password (Leave blank to keep current)</label>
                <input type="password" id="new_password" name="new_password" class="form-control" placeholder="New password">
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg mt-4">
            💾 Save Changes
          </button>
        </form>
      </div>

      <!-- Recent Orders Quick Preview -->
      <div class="card p-4 shadow-sm mt-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h4 class="h5 fw-extrabold text-secondary mb-0">Recent Orders</h4>
          <a href="orders.php" class="btn btn-outline-primary btn-sm">View All Orders</a>
        </div>

        <?php if (empty($recentOrders)): ?>
          <div class="text-center py-3 text-muted">
            No orders placed yet. <a href="menu.php">Start Ordering!</a>
          </div>
        <?php else: ?>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($recentOrders as $ro): ?>
                  <tr>
                    <td><strong><?= sanitize($ro['order_number']) ?></strong></td>
                    <td class="fs-xs"><?= date('M d, Y', strtotime($ro['created_at'])) ?></td>
                    <td class="fw-bold"><?= formatPrice($ro['grand_total']) ?></td>
                    <td><span class="badge badge-primary"><?= sanitize($ro['status']) ?></span></td>
                    <td>
                      <a href="track-order.php?order_number=<?= urlencode($ro['order_number']) ?>" class="btn btn-outline-secondary btn-sm">Track</a>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
