<?php
/**
 * Madam 3 Kitchen - Categories Management
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
        $db->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
        logAdminActivity($_SESSION['admin_name'], "Deleted category ID #{$id}");
        header("Location: categories.php?msg=deleted");
        exit;
    }
}

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Security token invalid.';
    } else {
        $id = intval($_POST['id'] ?? 0);
        $name = sanitize($_POST['name'] ?? '');
        $icon = sanitize($_POST['icon'] ?? '🍲');
        $displayOrder = intval($_POST['display_order'] ?? 0);
        $isActive = isset($_POST['is_active']) ? 1 : 0;
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));

        if (empty($name)) {
            $errorMessage = 'Please enter a category name.';
        } else {
            try {
                if ($id > 0) {
                    $stmt = $db->prepare("UPDATE categories SET name = ?, slug = ?, icon = ?, display_order = ?, is_active = ? WHERE id = ?");
                    $stmt->execute([$name, $slug, $icon, $displayOrder, $isActive, $id]);
                    logAdminActivity($_SESSION['admin_name'], "Updated category: {$name}");
                    $message = 'Category updated successfully!';
                } else {
                    $stmt = $db->prepare("INSERT INTO categories (name, slug, icon, display_order, is_active) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $slug, $icon, $displayOrder, $isActive]);
                    logAdminActivity($_SESSION['admin_name'], "Created category: {$name}");
                    $message = 'New category added!';
                }
            } catch (Exception $e) {
                $errorMessage = 'Error saving category: ' . $e->getMessage();
            }
        }
    }
}

// Fetch all categories
$categories = $db->query("SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY c.display_order ASC")->fetchAll();

$pageTitle = 'Category Management';
require_once __DIR__ . '/includes/admin-header.php';
?>

<?php if ($message): ?>
  <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<?php if ($errorMessage): ?>
  <div class="alert alert-danger"><?= $errorMessage ?></div>
<?php endif; ?>

<div class="row g-4">
  <!-- Left: Add / Edit Category Form -->
  <div class="col-12 col-md-5">
    <?php
    $editCat = null;
    if ($action === 'edit') {
        $editId = intval($_GET['id'] ?? 0);
        $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$editId]);
        $editCat = $stmt->fetch();
    }
    ?>
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3"><?= $action === 'edit' ? 'Edit Category' : 'Create New Category' ?></h3>
      <form action="categories.php" method="POST">
        <?= csrfInputField() ?>
        <input type="hidden" name="id" value="<?= $editCat['id'] ?? 0 ?>">

        <div class="form-group mb-3">
          <label class="form-label">Category Name *</label>
          <input type="text" name="name" class="form-control" placeholder="e.g. Rice Dishes, Soups, Drinks" required value="<?= sanitize($editCat['name'] ?? '') ?>">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Emoji Icon</label>
          <input type="text" name="icon" class="form-control" placeholder="🍲, 🍚, 🍗, 🍹" value="<?= sanitize($editCat['icon'] ?? '🍲') ?>">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Display Order</label>
          <input type="number" name="display_order" class="form-control" value="<?= $editCat['display_order'] ?? 0 ?>">
        </div>

        <div class="form-group mb-4">
          <label class="d-flex align-items-center gap-2">
            <input type="checkbox" name="is_active" value="1" <?= (!isset($editCat) || $editCat['is_active']) ? 'checked' : '' ?>>
            <span class="fw-bold fs-sm">Active Category</span>
          </label>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary w-100">
            <?= $action === 'edit' ? 'Save Changes' : '+ Add Category' ?>
          </button>
          <?php if ($action === 'edit'): ?>
            <a href="categories.php" class="btn btn-outline-secondary">Cancel</a>
          <?php endif; ?>
        </div>
      </form>
    </div>
  </div>

  <!-- Right: Categories List Table -->
  <div class="col-12 col-md-7">
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">All Categories (<?= count($categories) ?>)</h3>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Meals</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($categories as $cat): ?>
              <tr>
                <td style="font-size: 1.5rem;"><?= $cat['icon'] ?></td>
                <td>
                  <strong><?= sanitize($cat['name']) ?></strong>
                  <div class="fs-xs text-muted">slug: <?= sanitize($cat['slug']) ?></div>
                </td>
                <td><span class="badge badge-secondary"><?= $cat['product_count'] ?> dishes</span></td>
                <td><?= $cat['display_order'] ?></td>
                <td>
                  <span class="badge <?= $cat['is_active'] ? 'badge-success' : 'badge-danger' ?>">
                    <?= $cat['is_active'] ? 'Active' : 'Disabled' ?>
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <a href="categories.php?action=edit&id=<?= $cat['id'] ?>" class="btn btn-outline-primary btn-sm">Edit</a>
                    <a href="categories.php?action=delete&id=<?= $cat['id'] ?>" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this category?')">Delete</a>
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
