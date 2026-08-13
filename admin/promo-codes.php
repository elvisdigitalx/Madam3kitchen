<?php
/**
 * Madam 3 Kitchen - Promo Codes & Discounts Management
 */
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/csrf.php';
require_once __DIR__ . '/../../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$message = '';
$errorMessage = '';
$action = $_GET['action'] ?? 'list';

// Handle Delete
if ($action === 'delete') {
    $id = intval($_GET['id'] ?? 0);
    if ($id > 0) {
        $db->prepare("DELETE FROM promo_codes WHERE id = ?")->execute([$id]);
        logAdminActivity($_SESSION['admin_name'], "Deleted promo code ID #{$id}");
        header("Location: promo-codes.php?msg=deleted");
        exit;
    }
}

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Security session expired.';
    } else {
        $id = intval($_POST['id'] ?? 0);
        $code = strtoupper(trim(sanitize($_POST['code'] ?? '')));
        $discountType = $_POST['discount_type'] === 'fixed' ? 'fixed' : 'percentage';
        $discountValue = floatval($_POST['discount_value'] ?? 0);
        $minOrder = floatval($_POST['min_order_amount'] ?? 0);
        $maxDiscount = !empty($_POST['max_discount_amount']) ? floatval($_POST['max_discount_amount']) : null;
        $startDate = !empty($_POST['start_date']) ? $_POST['start_date'] : null;
        $expiryDate = !empty($_POST['expiry_date']) ? $_POST['expiry_date'] : null;
        $usageLimit = intval($_POST['usage_limit'] ?? 100);
        $isActive = isset($_POST['is_active']) ? 1 : 0;

        if (empty($code) || $discountValue <= 0) {
            $errorMessage = 'Please provide a valid code and discount value.';
        } else {
            try {
                if ($id > 0) {
                    $stmt = $db->prepare("UPDATE promo_codes SET code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, max_discount_amount = ?, start_date = ?, expiry_date = ?, usage_limit = ?, is_active = ? WHERE id = ?");
                    $stmt->execute([$code, $discountType, $discountValue, $minOrder, $maxDiscount, $startDate, $expiryDate, $usageLimit, $isActive, $id]);
                    logAdminActivity($_SESSION['admin_name'], "Updated promo code: {$code}");
                    $message = 'Promo code updated successfully!';
                } else {
                    $stmt = $db->prepare("INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, expiry_date, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$code, $discountType, $discountValue, $minOrder, $maxDiscount, $startDate, $expiryDate, $usageLimit, $isActive]);
                    logAdminActivity($_SESSION['admin_name'], "Created promo coupon: {$code}");
                    $message = 'New promo code created!';
                }
            } catch (Exception $e) {
                $errorMessage = 'Error saving promo code: ' . $e->getMessage();
            }
        }
    }
}

$promos = $db->query("SELECT * FROM promo_codes ORDER BY id DESC")->fetchAll();

$pageTitle = 'Promotions & Coupons';
require_once __DIR__ . '/includes/admin-header.php';
?>

<?php if ($message): ?>
  <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<?php if ($errorMessage): ?>
  <div class="alert alert-danger"><?= $errorMessage ?></div>
<?php endif; ?>

<div class="row g-4">
  <!-- Left: Create / Edit Promo Form -->
  <div class="col-12 col-md-5">
    <?php
    $editPromo = null;
    if ($action === 'edit') {
        $editId = intval($_GET['id'] ?? 0);
        $stmt = $db->prepare("SELECT * FROM promo_codes WHERE id = ?");
        $stmt->execute([$editId]);
        $editPromo = $stmt->fetch();
    }
    ?>
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3"><?= $action === 'edit' ? 'Edit Promo Code' : 'Create Promo Code' ?></h3>
      
      <form action="promo-codes.php" method="POST">
        <?= csrfInputField() ?>
        <input type="hidden" name="id" value="<?= $editPromo['id'] ?? 0 ?>">

        <div class="form-group mb-3">
          <label class="form-label">Promo Code (Uppercase) *</label>
          <input type="text" name="code" class="form-control text-uppercase" placeholder="e.g. WELCOME10, MADAM3BENIN" required value="<?= sanitize($editPromo['code'] ?? '') ?>">
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Discount Type</label>
            <select name="discount_type" class="form-select">
              <option value="percentage" <?= ($editPromo['discount_type'] ?? '') === 'percentage' ? 'selected' : '' ?>>Percentage (%)</option>
              <option value="fixed" <?= ($editPromo['discount_type'] ?? '') === 'fixed' ? 'selected' : '' ?>>Fixed (₦)</option>
            </select>
          </div>

          <div class="col-6">
            <label class="form-label">Discount Value *</label>
            <input type="number" step="1" name="discount_value" class="form-control" placeholder="10 or 500" required value="<?= $editPromo['discount_value'] ?? '10' ?>">
          </div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Min Order (₦)</label>
            <input type="number" step="100" name="min_order_amount" class="form-control" placeholder="3000" value="<?= $editPromo['min_order_amount'] ?? '0' ?>">
          </div>

          <div class="col-6">
            <label class="form-label">Max Discount (₦)</label>
            <input type="number" step="100" name="max_discount_amount" class="form-control" placeholder="2000" value="<?= $editPromo['max_discount_amount'] ?? '' ?>">
          </div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Expiry Date</label>
            <input type="date" name="expiry_date" class="form-control" value="<?= $editPromo['expiry_date'] ?? '' ?>">
          </div>

          <div class="col-6">
            <label class="form-label">Usage Limit</label>
            <input type="number" name="usage_limit" class="form-control" value="<?= $editPromo['usage_limit'] ?? '100' ?>">
          </div>
        </div>

        <div class="form-group mb-4">
          <label class="d-flex align-items-center gap-2">
            <input type="checkbox" name="is_active" value="1" <?= (!isset($editPromo) || $editPromo['is_active']) ? 'checked' : '' ?>>
            <span class="fw-bold fs-sm">Active & Usable</span>
          </label>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary w-100">
            <?= $action === 'edit' ? 'Save Changes' : '+ Create Promo Code' ?>
          </button>
          <?php if ($action === 'edit'): ?>
            <a href="promo-codes.php" class="btn btn-outline-secondary">Cancel</a>
          <?php endif; ?>
        </div>
      </form>
    </div>
  </div>

  <!-- Right: Promos Table -->
  <div class="col-12 col-md-7">
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">All Promo Codes (<?= count($promos) ?>)</h3>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($promos as $promo): ?>
              <tr>
                <td>
                  <strong class="text-primary"><?= sanitize($promo['code']) ?></strong>
                </td>
                <td class="fw-bold">
                  <?= $promo['discount_type'] === 'percentage' ? "{$promo['discount_value']}%" : formatPrice($promo['discount_value']) ?>
                </td>
                <td class="fs-xs"><?= formatPrice($promo['min_order_amount']) ?></td>
                <td class="fs-xs"><?= $promo['usage_count'] ?> / <?= $promo['usage_limit'] ?></td>
                <td>
                  <span class="badge <?= $promo['is_active'] ? 'badge-success' : 'badge-danger' ?>">
                    <?= $promo['is_active'] ? 'Active' : 'Expired' ?>
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <a href="promo-codes.php?action=edit&id=<?= $promo['id'] ?>" class="btn btn-outline-primary btn-sm">Edit</a>
                    <a href="promo-codes.php?action=delete&id=<?= $promo['id'] ?>" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this coupon code?')">Delete</a>
                  </div>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
