<?php
/**
 * Madam 3 Kitchen - Menu & Food Products Management
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$action = $_GET['action'] ?? 'list';
$message = '';
$errorMessage = '';

// Handle Delete Product
if ($action === 'delete') {
    $id = intval($_GET['id'] ?? 0);
    if ($id > 0) {
        $p = $db->prepare("SELECT name FROM products WHERE id = ?");
        $p->execute([$id]);
        $name = $p->fetchColumn() ?: 'Product';

        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        logAdminActivity($_SESSION['admin_name'], "Deleted menu meal: {$name}");
        header("Location: products.php?msg=deleted");
        exit;
    }
}

// Handle Save (Create / Edit)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Invalid security session token.';
    } else {
        $id = intval($_POST['id'] ?? 0);
        $name = sanitize($_POST['name'] ?? '');
        $categoryId = intval($_POST['category_id'] ?? 0);
        $description = sanitize($_POST['description'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $discountPrice = !empty($_POST['discount_price']) ? floatval($_POST['discount_price']) : null;
        $image = sanitize($_POST['image'] ?? 'assets/images/products/jollof-rice.jpg');
        $isAvailable = isset($_POST['is_available']) ? 1 : 0;
        $isPopular = isset($_POST['is_popular']) ? 1 : 0;
        $isFeatured = isset($_POST['is_featured']) ? 1 : 0;
        $prepTime = intval($_POST['prep_time_minutes'] ?? 20);

        // Auto-generate slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));

        if (empty($name) || $price <= 0) {
            $errorMessage = 'Please provide a valid meal name and price.';
        } else {
            try {
                if ($id > 0) {
                    // Update
                    $stmt = $db->prepare("UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, discount_price = ?, image = ?, is_available = ?, is_popular = ?, is_featured = ?, prep_time_minutes = ? WHERE id = ?");
                    $stmt->execute([$categoryId ?: null, $name, $slug, $description, $price, $discountPrice, $image, $isAvailable, $isPopular, $isFeatured, $prepTime, $id]);
                    $productId = $id;
                    logAdminActivity($_SESSION['admin_name'], "Updated food item: {$name}");
                    $message = 'Food item updated successfully!';
                } else {
                    // Insert
                    $stmt = $db->prepare("INSERT INTO products (category_id, name, slug, description, price, discount_price, image, is_available, is_popular, is_featured, prep_time_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$categoryId ?: null, $name, $slug, $description, $price, $discountPrice, $image, $isAvailable, $isPopular, $isFeatured, $prepTime]);
                    $productId = $db->lastInsertId();
                    logAdminActivity($_SESSION['admin_name'], "Created new food item: {$name}");
                    $message = 'New food item added to menu!';
                }

                // Handle Extras
                $extraNames = $_POST['extra_names'] ?? [];
                $extraPrices = $_POST['extra_prices'] ?? [];

                // Delete old extras for this product
                $db->prepare("DELETE FROM product_extras WHERE product_id = ?")->execute([$productId]);

                // Insert new extras
                $insExtra = $db->prepare("INSERT INTO product_extras (product_id, name, price, is_active) VALUES (?, ?, ?, 1)");
                for ($i = 0; $i < count($extraNames); $i++) {
                    $eName = sanitize($extraNames[$i]);
                    $ePrice = floatval($extraPrices[$i] ?? 0);
                    if (!empty($eName)) {
                        $insExtra->execute([$productId, $eName, $ePrice]);
                    }
                }

                $action = 'list';
            } catch (Exception $e) {
                $errorMessage = 'Database error: ' . $e->getMessage();
            }
        }
    }
}

// Fetch categories for form select
$categories = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC")->fetchAll();

$pageTitle = 'Menu & Food Management';
require_once __DIR__ . '/includes/admin-header.php';
?>

<?php if ($message): ?>
  <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<?php if ($errorMessage): ?>
  <div class="alert alert-danger"><?= $errorMessage ?></div>
<?php endif; ?>

<?php if ($action === 'create' || $action === 'edit'): ?>
  <?php
  $editProduct = null;
  $existingExtras = [];
  if ($action === 'edit') {
      $editId = intval($_GET['id'] ?? 0);
      $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
      $stmt->execute([$editId]);
      $editProduct = $stmt->fetch();

      $exStmt = $db->prepare("SELECT * FROM product_extras WHERE product_id = ?");
      $exStmt->execute([$editId]);
      $existingExtras = $exStmt->fetchAll();
  }
  ?>
  <!-- Create / Edit Form Card -->
  <div class="card p-4 p-md-5 shadow-sm max-w-800 mx-auto">
    <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
      <h3 class="h4 fw-extrabold text-secondary mb-0"><?= $action === 'edit' ? 'Edit Food Item' : 'Add New Meal to Menu' ?></h3>
      <a href="products.php" class="btn btn-outline-secondary btn-sm">&larr; Back to Menu List</a>
    </div>

    <form action="products.php" method="POST">
      <?= csrfInputField() ?>
      <input type="hidden" name="id" value="<?= $editProduct['id'] ?? 0 ?>">

      <div class="row g-3">
        <div class="col-12 col-sm-8">
          <div class="form-group mb-0">
            <label for="p_name" class="form-label">Meal / Dish Name *</label>
            <input type="text" id="p_name" name="name" class="form-control" placeholder="e.g. Party Jollof Rice with Chicken" required value="<?= sanitize($editProduct['name'] ?? '') ?>">
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="form-group mb-0">
            <label for="p_category" class="form-label">Category *</label>
            <select id="p_category" name="category_id" class="form-select" required>
              <option value="">-- Choose Category --</option>
              <?php foreach ($categories as $cat): ?>
                <option value="<?= $cat['id'] ?>" <?= (isset($editProduct['category_id']) && $editProduct['category_id'] == $cat['id']) ? 'selected' : '' ?>>
                  <?= $cat['icon'] ?> <?= sanitize($cat['name']) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>
        </div>

        <div class="col-12">
          <div class="form-group mb-0">
            <label for="p_desc" class="form-label">Description</label>
            <textarea id="p_desc" name="description" class="form-control" rows="3" placeholder="Describe the ingredients, flavors, and sides..."><?= sanitize($editProduct['description'] ?? '') ?></textarea>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="form-group mb-0">
            <label for="p_price" class="form-label">Regular Price (₦) *</label>
            <input type="number" step="50" id="p_price" name="price" class="form-control" placeholder="3500" required value="<?= $editProduct['price'] ?? '' ?>">
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="form-group mb-0">
            <label for="p_discount" class="form-label">Discount Price (₦) (Optional)</label>
            <input type="number" step="50" id="p_discount" name="discount_price" class="form-control" placeholder="3000" value="<?= $editProduct['discount_price'] ?? '' ?>">
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="form-group mb-0">
            <label for="p_prep" class="form-label">Prep Time (Mins)</label>
            <input type="number" id="p_prep" name="prep_time_minutes" class="form-control" value="<?= $editProduct['prep_time_minutes'] ?? 20 ?>">
          </div>
        </div>

        <div class="col-12">
          <div class="form-group mb-0">
            <label for="p_image" class="form-label">Product Image Path</label>
            <select id="p_image" name="image" class="form-select">
              <option value="assets/images/products/jollof-rice.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/jollof-rice.jpg' ? 'selected' : '' ?>>Party Jollof Rice</option>
              <option value="assets/images/products/egusi-soup.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/egusi-soup.jpg' ? 'selected' : '' ?>>Egusi Soup with Pounded Yam</option>
              <option value="assets/images/products/fried-rice.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/fried-rice.jpg' ? 'selected' : '' ?>>Special Fried Rice</option>
              <option value="assets/images/products/ogbono-soup.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/ogbono-soup.jpg' ? 'selected' : '' ?>>Ogbono Draw Soup</option>
              <option value="assets/images/products/peppered-chicken.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/peppered-chicken.jpg' ? 'selected' : '' ?>>Spicy Peppered Chicken</option>
              <option value="assets/images/products/banga-soup.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/banga-soup.jpg' ? 'selected' : '' ?>>Banga Soup Special</option>
              <option value="assets/images/products/amala-abula.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/amala-abula.jpg' ? 'selected' : '' ?>>Amala Abula Ewedu</option>
              <option value="assets/images/products/asun-goat.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/asun-goat.jpg' ? 'selected' : '' ?>>Spicy Asun Goat Meat</option>
              <option value="assets/images/products/chapman-drink.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/products/chapman-drink.jpg' ? 'selected' : '' ?>>Chapman Mocktail</option>
              <option value="assets/images/hero-banner.jpg" <?= ($editProduct['image'] ?? '') === 'assets/images/hero-banner.jpg' ? 'selected' : '' ?>>Grand Feast Platter</option>
            </select>
          </div>
        </div>

        <!-- Toggles -->
        <div class="col-12">
          <div class="d-flex flex-wrap gap-4 pt-2">
            <label class="d-flex align-items-center gap-2">
              <input type="checkbox" name="is_available" value="1" <?= (!isset($editProduct) || $editProduct['is_available']) ? 'checked' : '' ?>>
              <span class="fw-bold fs-sm">In Stock & Available</span>
            </label>

            <label class="d-flex align-items-center gap-2">
              <input type="checkbox" name="is_popular" value="1" <?= (isset($editProduct['is_popular']) && $editProduct['is_popular']) ? 'checked' : '' ?>>
              <span class="fw-bold fs-sm">Mark as Popular 🔥</span>
            </label>

            <label class="d-flex align-items-center gap-2">
              <input type="checkbox" name="is_featured" value="1" <?= (isset($editProduct['is_featured']) && $editProduct['is_featured']) ? 'checked' : '' ?>>
              <span class="fw-bold fs-sm">Mark as Featured ⭐</span>
            </label>
          </div>
        </div>

        <!-- Dynamic Extras Builder -->
        <div class="col-12 mt-4 pt-3 border-top">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label fw-bold mb-0">Customizable Meal Extras (e.g. Chicken, Plantain, Drinks)</label>
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="addExtraRow()">+ Add Extra Option</button>
          </div>

          <div id="extras-builder-container" class="d-flex flex-column gap-2">
            <?php if (!empty($existingExtras)): ?>
              <?php foreach ($existingExtras as $ex): ?>
                <div class="d-flex gap-2 align-items-center extra-row">
                  <input type="text" name="extra_names[]" class="form-control form-control-sm" placeholder="Extra Name (e.g. Fried Plantain)" value="<?= sanitize($ex['name']) ?>">
                  <input type="number" step="50" name="extra_prices[]" class="form-control form-control-sm" style="max-width: 130px;" placeholder="Price (₦)" value="<?= $ex['price'] ?>">
                  <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.extra-row').remove()">&times;</button>
                </div>
              <?php endforeach; ?>
            <?php else: ?>
              <div class="d-flex gap-2 align-items-center extra-row">
                <input type="text" name="extra_names[]" class="form-control form-control-sm" placeholder="Extra Name (e.g. Fried Plantain)">
                <input type="number" step="50" name="extra_prices[]" class="form-control form-control-sm" style="max-width: 130px;" placeholder="Price (₦)" value="500">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.extra-row').remove()">&times;</button>
              </div>
            <?php endif; ?>
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-100 mt-4">
        💾 Save Food Item
      </button>
    </form>
  </div>

  <script>
  function addExtraRow() {
    const container = document.getElementById('extras-builder-container');
    const row = document.createElement('div');
    row.className = 'd-flex gap-2 align-items-center extra-row';
    row.innerHTML = `
      <input type="text" name="extra_names[]" class="form-control form-control-sm" placeholder="Extra Name (e.g. Peppered Chicken)">
      <input type="number" step="50" name="extra_prices[]" class="form-control form-control-sm" style="max-width: 130px;" placeholder="Price (₦)" value="1000">
      <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.extra-row').remove()">&times;</button>
    `;
    container.appendChild(row);
  }
  </script>

<?php else: ?>
  <!-- Products List Table View -->
  <?php
  $catFilter = $_GET['cat'] ?? 'all';
  $searchP = trim($_GET['search'] ?? '');

  $pSql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
  $pParams = [];

  if ($catFilter !== 'all') {
      $pSql .= " AND p.category_id = ?";
      $pParams[] = intval($catFilter);
  }

  if (!empty($searchP)) {
      $pSql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
      $pParams[] = "%{$searchP}%";
      $pParams[] = "%{$searchP}%";
  }

  $pSql .= " ORDER BY p.id DESC";
  $pStmt = $db->prepare($pSql);
  $pStmt->execute($pParams);
  $allProducts = $pStmt->fetchAll();
  ?>

  <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
    <div>
      <h1 class="h4 fw-extrabold text-secondary mb-0">Menu Management</h1>
      <p class="text-muted fs-xs mb-0">Manage Nigerian dishes, portion prices, availability, and meal extras</p>
    </div>
    <a href="products.php?action=create" class="btn btn-primary btn-sm">+ Add New Food Item</a>
  </div>

  <!-- Search & Category Filters -->
  <div class="card p-3 shadow-sm mb-4">
    <form action="products.php" method="GET" class="row g-2 align-items-end">
      <div class="col-12 col-sm-6">
        <label class="form-label fs-xs mb-1">Search Meal Name</label>
        <input type="text" name="search" class="form-control form-control-sm" placeholder="e.g. Jollof, Egusi, Asun..." value="<?= sanitize($searchP) ?>">
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label fs-xs mb-1">Filter by Category</label>
        <select name="cat" class="form-select form-select-sm">
          <option value="all">-- All Categories --</option>
          <?php foreach ($categories as $cat): ?>
            <option value="<?= $cat['id'] ?>" <?= $catFilter == $cat['id'] ? 'selected' : '' ?>>
              <?= $cat['icon'] ?> <?= sanitize($cat['name']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="col-12 col-sm-2">
        <button type="submit" class="btn btn-primary btn-sm w-100">Filter</button>
      </div>
    </form>
  </div>

  <!-- Products List Table -->
  <div class="card shadow-sm p-4">
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Dish</th>
            <th>Category</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Status</th>
            <th>Badges</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($allProducts as $prod): ?>
            <tr>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <img src="../<?= $prod['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($prod['name']) ?>" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);">
                  <div>
                    <a href="products.php?action=edit&id=<?= $prod['id'] ?>" class="fw-bold text-secondary">
                      <?= sanitize($prod['name']) ?>
                    </a>
                    <div class="fs-xs text-muted"><?= sanitize($prod['prep_time_minutes']) ?> mins prep</div>
                  </div>
                </div>
              </td>

              <td class="fs-sm"><?= sanitize($prod['category_name'] ?? 'Uncategorized') ?></td>

              <td class="fw-bold text-primary"><?= formatPrice($prod['price']) ?></td>

              <td class="fs-sm">
                <?= $prod['discount_price'] ? formatPrice($prod['discount_price']) : '<span class="text-muted">—</span>' ?>
              </td>

              <td>
                <span class="badge <?= $prod['is_available'] ? 'badge-success' : 'badge-danger' ?> fs-xs">
                  <?= $prod['is_available'] ? 'In Stock' : 'Out of Stock' ?>
                </span>
              </td>

              <td>
                <?php if ($prod['is_popular']): ?>
                  <span class="badge badge-warning fs-xs">🔥 Popular</span>
                <?php endif; ?>
                <?php if ($prod['is_featured']): ?>
                  <span class="badge badge-primary fs-xs">⭐ Featured</span>
                <?php endif; ?>
              </td>

              <td>
                <div class="d-flex gap-2">
                  <a href="products.php?action=edit&id=<?= $prod['id'] ?>" class="btn btn-outline-primary btn-sm">Edit</a>
                  <a href="products.php?action=delete&id=<?= $prod['id'] ?>" class="btn btn-outline-danger btn-sm" onclick="return confirm('Are you sure you want to delete this dish?')">Delete</a>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
