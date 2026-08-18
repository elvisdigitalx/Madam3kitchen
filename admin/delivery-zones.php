<?php
/**
 * Madam 3 Kitchen - Delivery Zones Management (Benin City)
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$message = '';
$errorMessage = '';
$action = $_GET['action'] ?? 'list';

// Handle Delete
if ($action === 'delete') {
    $id = intval($_GET['id'] ?? 0);
    if ($id > 0) {
        $db->prepare("DELETE FROM delivery_zones WHERE id = ?")->execute([$id]);
        logAdminActivity($_SESSION['admin_name'], "Deleted delivery zone ID #{$id}");
        header("Location: delivery-zones.php?msg=deleted");
        exit;
    }
}

// Handle Form Submission (Create / Edit)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Invalid token.';
    } else {
        $id = intval($_POST['id'] ?? 0);
        $name = sanitize($_POST['name'] ?? '');
        $description = sanitize($_POST['description'] ?? '');
        $deliveryFee = floatval($_POST['delivery_fee'] ?? 1000);
        $estimatedTime = sanitize($_POST['estimated_time'] ?? '25-45 mins');
        $isActive = isset($_POST['is_active']) ? 1 : 0;

        if (empty($name)) {
            $errorMessage = 'Zone name is required.';
        } else {
            try {
                if ($id > 0) {
                    $stmt = $db->prepare("UPDATE delivery_zones SET name = ?, description = ?, delivery_fee = ?, estimated_time = ?, is_active = ? WHERE id = ?");
                    $stmt->execute([$name, $description, $deliveryFee, $estimatedTime, $isActive, $id]);
                    logAdminActivity($_SESSION['admin_name'], "Updated delivery zone: {$name}");
                    $message = 'Delivery zone updated successfully!';
                } else {
                    $stmt = $db->prepare("INSERT INTO delivery_zones (name, description, delivery_fee, estimated_time, is_active) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $description, $deliveryFee, $estimatedTime, $isActive]);
                    logAdminActivity($_SESSION['admin_name'], "Added new delivery zone: {$name}");
                    $message = 'New delivery zone created!';
                }
            } catch (Exception $e) {
                $errorMessage = 'Error saving delivery zone: ' . $e->getMessage();
            }
        }
    }
}

// Fetch all delivery zones
$zones = $db->query("SELECT * FROM delivery_zones ORDER BY delivery_fee ASC")->fetchAll();

$pageTitle = 'Benin City Delivery Zones';
require_once __DIR__ . '/includes/admin-header.php';
?>

<?php if ($message): ?>
  <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<?php if ($errorMessage): ?>
  <div class="alert alert-danger"><?= $errorMessage ?></div>
<?php endif; ?>

<div class="row g-4">
  <!-- Left: Add / Edit Zone Form -->
  <div class="col-12 col-md-5">
    <?php
    $editZone = null;
    if ($action === 'edit') {
        $editId = intval($_GET['id'] ?? 0);
        $stmt = $db->prepare("SELECT * FROM delivery_zones WHERE id = ?");
        $stmt->execute([$editId]);
        $editZone = $stmt->fetch();
    }
    ?>
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3"><?= $action === 'edit' ? 'Edit Delivery Zone' : 'Add Benin City Delivery Zone' ?></h3>
      
      <form action="delivery-zones.php" method="POST">
        <?= csrfInputField() ?>
        <input type="hidden" name="id" value="<?= $editZone['id'] ?? 0 ?>">

        <div class="form-group mb-3">
          <label class="form-label">Zone / Area Name *</label>
          <input type="text" name="name" class="form-control" placeholder="e.g. GRA & Boundary Road" required value="<?= sanitize($editZone['name'] ?? '') ?>">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Description / Landmarks Covered</label>
          <input type="text" name="description" class="form-control" placeholder="e.g. Golf Club, Country Club, Boundary Rd" value="<?= sanitize($editZone['description'] ?? '') ?>">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Delivery Fee (₦) *</label>
          <input type="number" step="50" name="delivery_fee" class="form-control" placeholder="1000" required value="<?= $editZone['delivery_fee'] ?? '1000' ?>">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Estimated Delivery Time</label>
          <input type="text" name="estimated_time" class="form-control" placeholder="e.g. 25-35 mins" value="<?= sanitize($editZone['estimated_time'] ?? '25-45 mins') ?>">
        </div>

        <div class="form-group mb-4">
          <label class="d-flex align-items-center gap-2">
            <input type="checkbox" name="is_active" value="1" <?= (!isset($editZone) || $editZone['is_active']) ? 'checked' : '' ?>>
            <span class="fw-bold fs-sm">Active for Dispatch</span>
          </label>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary w-100">
            <?= $action === 'edit' ? 'Save Changes' : '+ Add Delivery Zone' ?>
          </button>
          <?php if ($action === 'edit'): ?>
            <a href="delivery-zones.php" class="btn btn-outline-secondary">Cancel</a>
          <?php endif; ?>
        </div>
      </form>
    </div>
  </div>

  <!-- Right: Zones Table -->
  <div class="col-12 col-md-7">
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">Configured Delivery Zones (<?= count($zones) ?>)</h3>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Zone Area</th>
              <th>Delivery Fee</th>
              <th>Est. Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($zones as $zone): ?>
              <tr>
                <td>
                  <strong><?= sanitize($zone['name']) ?></strong>
                  <div class="fs-xs text-muted"><?= sanitize($zone['description'] ?? 'Benin City') ?></div>
                </td>
                <td class="fw-bold text-primary"><?= formatPrice($zone['delivery_fee']) ?></td>
                <td class="fs-xs"><?= sanitize($zone['estimated_time']) ?></td>
                <td>
                  <span class="badge <?= $zone['is_active'] ? 'badge-success' : 'badge-danger' ?>">
                    <?= $zone['is_active'] ? 'Active' : 'Disabled' ?>
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <a href="delivery-zones.php?action=edit&id=<?= $zone['id'] ?>" class="btn btn-outline-primary btn-sm">Edit</a>
                    <a href="delivery-zones.php?action=delete&id=<?= $zone['id'] ?>" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this delivery zone?')">Delete</a>
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
