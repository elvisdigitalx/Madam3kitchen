<?php
/**
 * Madam 3 Kitchen - Offers & Promotions Page
 */
$pageTitle = 'Today\'s Offers & Promo Codes — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';

$db = Database::getConnection();

// Fetch Active Promos
$promoStmt = $db->query("SELECT * FROM promo_codes WHERE is_active = 1 ORDER BY id ASC");
$promos = $promoStmt->fetchAll();

// Fetch Discounted Meals
$discStmt = $db->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.discount_price IS NOT NULL AND p.is_available = 1");
$discountedMeals = $discStmt->fetchAll();
?>

<div class="py-5" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFEED9 100%); border-bottom: 1px solid var(--border-color);">
  <div class="container text-center max-w-700 mx-auto">
    <span class="badge badge-danger mb-2">Exclusive Savings</span>
    <h1 class="h2 mb-2">Madam 3 Hot Deals & Promo Codes 🔥</h1>
    <p class="text-muted fs-sm mb-0">Use our coupon codes during checkout to enjoy massive discounts on authentic Nigerian food.</p>
  </div>
</div>

<div class="container py-5">
  <!-- Active Promo Codes Grid -->
  <h3 class="mb-4">Active Coupon Codes</h3>
  <div class="row g-4 mb-5">
    <?php foreach ($promos as $promo): ?>
      <div class="col-12 col-md-4">
        <div class="card p-4 h-100 shadow-sm border-2" style="border-color: var(--primary); background: #FFFDF9;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge badge-primary fs-sm fw-extrabold"><?= $promo['code'] ?></span>
            <span class="badge badge-success">ACTIVE</span>
          </div>

          <h4 class="text-secondary fw-extrabold mb-1">
            <?= $promo['discount_type'] === 'percentage' ? "{$promo['discount_value']}% OFF" : formatPrice($promo['discount_value']) . " OFF" ?>
          </h4>

          <p class="text-muted fs-xs mb-3">
            Valid on orders above <?= formatPrice($promo['min_order_amount']) ?>.
            <?php if ($promo['max_discount_amount']): ?>
              Max discount: <?= formatPrice($promo['max_discount_amount']) ?>.
            <?php endif; ?>
          </p>

          <div class="mt-auto">
            <button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="navigator.clipboard.writeText('<?= $promo['code'] ?>'); showToast('Copied code <?= $promo['code'] ?> to clipboard! 📋', 'success');">
              📋 Copy Coupon Code
            </button>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <!-- Discounted Food Specials -->
  <h3 class="mb-4">Discounted Meals & Combos</h3>
  <div class="row g-4">
    <?php foreach ($discountedMeals as $meal): ?>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="food-card">
          <div class="food-card-img-wrap">
            <img src="<?= $meal['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($meal['name']) ?>" class="food-card-img" loading="lazy">
            <div class="food-card-badges">
              <span class="food-badge-discount">SAVE <?= formatPrice($meal['price'] - $meal['discount_price']) ?></span>
            </div>
          </div>

          <div class="food-card-body">
            <h4 class="food-card-title"><a href="food.php?id=<?= $meal['id'] ?>"><?= sanitize($meal['name']) ?></a></h4>
            <p class="food-card-desc"><?= sanitize($meal['description']) ?></p>
            <div class="food-card-meta">
              <div class="food-card-price">
                <span class="price-main"><?= formatPrice($meal['discount_price']) ?></span>
                <span class="price-old"><?= formatPrice($meal['price']) ?></span>
              </div>
              <a href="food.php?id=<?= $meal['id'] ?>" class="btn btn-primary btn-sm food-card-btn">Order Now</a>
            </div>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
