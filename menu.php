<?php
/**
 * Madam 3 Kitchen - Full Dynamic Menu
 */
$pageTitle = 'Our Menu — Madam 3 Kitchen Nigerian Cuisine Benin City';
$pageDescription = 'Browse delicious authentic Nigerian meals: Party Jollof, Egusi Soup, Fried Rice, Banga, Ogbono, Asun, and Combos. Fast delivery across Benin City.';
require_once __DIR__ . '/includes/header.php';

$db = Database::getConnection();

// Fetch Categories
$catStmt = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC");
$categories = $catStmt->fetchAll();

// Selected category from query string
$selectedCategory = $_GET['category'] ?? 'all';
$selectedSort = $_GET['sort'] ?? 'popular';
$searchTerm = trim($_GET['search'] ?? '');

// Build Query
$sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE 1=1";
$params = [];

if ($selectedCategory !== 'all') {
    $sql .= " AND c.slug = ?";
    $params[] = $selectedCategory;
}

if (!empty($searchTerm)) {
    $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
    $params[] = "%{$searchTerm}%";
    $params[] = "%{$searchTerm}%";
}

switch ($selectedSort) {
    case 'price_asc':
        $sql .= " ORDER BY (CASE WHEN p.discount_price IS NOT NULL THEN p.discount_price ELSE p.price END) ASC";
        break;
    case 'price_desc':
        $sql .= " ORDER BY (CASE WHEN p.discount_price IS NOT NULL THEN p.discount_price ELSE p.price END) DESC";
        break;
    case 'newest':
        $sql .= " ORDER BY p.id DESC";
        break;
    case 'popular':
    default:
        $sql .= " ORDER BY p.is_popular DESC, p.id ASC";
        break;
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();
?>

<!-- Menu Header Banner -->
<div class="py-4" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFEED9 100%); border-bottom: 1px solid var(--border-color);">
  <div class="container">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <h1 class="h2 mb-1">Our Delicious Menu 🍲</h1>
        <p class="text-muted mb-0 fs-sm">Freshly prepared authentic Nigerian delicacies, made with love in Benin City.</p>
      </div>

      <!-- Search Box -->
      <div style="min-width: 280px; max-width: 400px; width: 100%;">
        <div style="position: relative;">
          <input type="text" id="menu-search-input" class="form-control" placeholder="Search Jollof, Soup, Chicken, Asun..." value="<?= sanitize($searchTerm) ?>">
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">🔍</span>
        </div>
      </div>
    </div>

    <!-- Category Filter Bar -->
    <div class="categories-wrapper mt-3">
      <a href="menu.php?category=all&sort=<?= urlencode($selectedSort) ?>" class="category-pill <?= $selectedCategory === 'all' ? 'active' : '' ?>">
        <span class="pill-icon">✨</span>
        <span>All Dishes</span>
      </a>
      <?php foreach ($categories as $cat): ?>
        <a href="menu.php?category=<?= urlencode($cat['slug']) ?>&sort=<?= urlencode($selectedSort) ?>" class="category-pill <?= $selectedCategory === $cat['slug'] ? 'active' : '' ?>">
          <span class="pill-icon"><?= $cat['icon'] ?></span>
          <span><?= sanitize($cat['name']) ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<!-- Menu Grid Content -->
<div class="container py-5">
  <!-- Sort & Result Count -->
  <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
    <div class="fs-sm fw-bold text-muted">
      Showing <?= count($products) ?> delicious meal<?= count($products) === 1 ? '' : 's' ?>
    </div>

    <div class="d-flex align-items-center gap-2">
      <label for="sort-select" class="fs-sm fw-bold text-secondary mb-0">Sort By:</label>
      <select id="sort-select" class="form-select form-select-sm" style="width: auto;" onchange="window.location.href='menu.php?category=<?= urlencode($selectedCategory) ?>&search=<?= urlencode($searchTerm) ?>&sort=' + this.value;">
        <option value="popular" <?= $selectedSort === 'popular' ? 'selected' : '' ?>>🔥 Most Popular</option>
        <option value="price_asc" <?= $selectedSort === 'price_asc' ? 'selected' : '' ?>>💰 Price: Low to High</option>
        <option value="price_desc" <?= $selectedSort === 'price_desc' ? 'selected' : '' ?>>💎 Price: High to Low</option>
        <option value="newest" <?= $selectedSort === 'newest' ? 'selected' : '' ?>>✨ Newest Additions</option>
      </select>
    </div>
  </div>

  <!-- Products Grid -->
  <?php if (empty($products)): ?>
    <div class="text-center py-5">
      <div style="font-size: 3.5rem;" class="mb-3">🍲</div>
      <h3>No meals found</h3>
      <p class="text-muted">We couldn't find any dishes matching your current selection or search criteria.</p>
      <a href="menu.php" class="btn btn-primary mt-2">View Full Menu</a>
    </div>
  <?php else: ?>
    <div class="row g-4" id="menu-items-grid">
      <?php foreach ($products as $prod): ?>
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 menu-grid-item" 
             data-name="<?= strtolower(sanitize($prod['name'])) ?>" 
             data-desc="<?= strtolower(sanitize($prod['description'] ?? '')) ?>" 
             data-category="<?= strtolower(sanitize($prod['category_slug'] ?? '')) ?>">
          
          <div class="food-card">
            <?php if (!$prod['is_available']): ?>
              <div class="food-unavailable-overlay">
                <span class="food-unavailable-badge">Currently Unavailable</span>
              </div>
            <?php endif; ?>

            <div class="food-card-img-wrap">
              <img src="<?= $prod['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($prod['name']) ?>" class="food-card-img" loading="lazy">
              <div class="food-card-badges">
                <?php if ($prod['discount_price'] !== null && $prod['discount_price'] > 0): ?>
                  <span class="food-badge-discount">SAVE <?= formatPrice($prod['price'] - $prod['discount_price']) ?></span>
                <?php endif; ?>
                <?php if ($prod['is_popular']): ?>
                  <span class="food-badge-popular">🔥 Popular</span>
                <?php endif; ?>
              </div>
            </div>

            <div class="food-card-body">
              <div class="food-card-header">
                <h3 class="food-card-title">
                  <a href="food.php?id=<?= $prod['id'] ?>"><?= sanitize($prod['name']) ?></a>
                </h3>
                <span class="food-card-rating">★ <?= number_format($prod['rating'], 1) ?></span>
              </div>
              <p class="food-card-desc"><?= sanitize($prod['description']) ?></p>

              <div class="food-card-meta">
                <div class="food-card-price">
                  <?php if ($prod['discount_price'] !== null && $prod['discount_price'] > 0): ?>
                    <span class="price-main"><?= formatPrice($prod['discount_price']) ?></span>
                    <span class="price-old"><?= formatPrice($prod['price']) ?></span>
                  <?php else: ?>
                    <span class="price-main"><?= formatPrice($prod['price']) ?></span>
                  <?php endif; ?>
                </div>

                <?php if ($prod['is_available']): ?>
                  <a href="food.php?id=<?= $prod['id'] ?>" class="btn btn-primary btn-sm food-card-btn">
                    + Order Meal
                  </a>
                <?php else: ?>
                  <button class="btn btn-outline-secondary btn-sm" disabled>Unavailable</button>
                <?php endif; ?>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>

    <!-- Hidden dynamic search empty state -->
    <div id="no-menu-results" class="text-center py-5" style="display: none;">
      <div style="font-size: 3rem;">🔍</div>
      <h4 class="mt-2">No matching dishes</h4>
      <p class="text-muted">Try searching for another delicious item like Jollof, Egusi, Chicken, or Drinks.</p>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
