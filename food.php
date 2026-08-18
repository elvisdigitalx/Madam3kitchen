<?php
/**
 * Madam 3 Kitchen - Single Food Details Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$db = Database::getConnection();
$id = intval($_GET['id'] ?? 0);

$stmt = $db->prepare("SELECT p.*, c.name as category_name, c.slug as category_slug 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE p.id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    header("Location: menu.php");
    exit;
}

$pageTitle = sanitize($product['name']) . ' — Madam 3 Kitchen Benin City';
$pageDescription = sanitize($product['description'] ?? 'Order ' . $product['name'] . ' from Madam 3 Kitchen at Asoro Bus Stop, Benin City.');
require_once __DIR__ . '/includes/header.php';

// Fetch Extras
$extraStmt = $db->prepare("SELECT * FROM product_extras WHERE product_id = ? AND is_active = 1");
$extraStmt->execute([$id]);
$extras = $extraStmt->fetchAll();

// Fetch Related Products
$relStmt = $db->prepare("SELECT * FROM products WHERE category_id = ? AND id != ? AND is_available = 1 LIMIT 4");
$relStmt->execute([$product['category_id'], $id]);
$related = $relStmt->fetchAll();

$effectivePrice = ($product['discount_price'] !== null && $product['discount_price'] > 0) ? $product['discount_price'] : $product['price'];
?>

<div class="container py-4">
  <!-- Breadcrumb -->
  <nav aria-label="breadcrumb" class="mb-4">
    <ol class="d-flex align-items-center gap-2 list-unstyled fs-sm text-muted">
      <li><a href="index.php" class="text-muted">Home</a></li>
      <li>/</li>
      <li><a href="menu.php" class="text-muted">Menu</a></li>
      <li>/</li>
      <li><a href="menu.php?category=<?= urlencode($product['category_slug'] ?? 'all') ?>" class="text-muted"><?= sanitize($product['category_name'] ?? 'Dishes') ?></a></li>
      <li>/</li>
      <li class="text-secondary fw-bold"><?= sanitize($product['name']) ?></li>
    </ol>
  </nav>

  <div class="row g-4">
    <!-- Left: Image Gallery -->
    <div class="col-12 col-md-6">
      <div class="card p-2" style="background: #FFFFFF; border-radius: var(--radius-xl); overflow: hidden;">
        <img src="<?= $product['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($product['name']) ?>" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-lg);">
      </div>
    </div>

    <!-- Right: Meal Customizer & Details -->
    <div class="col-12 col-md-6">
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="badge badge-primary"><?= sanitize($product['category_name'] ?? 'Madam 3 Delicacy') ?></span>
        <span class="badge badge-warning">★ <?= number_format($product['rating'], 1) ?> Rating</span>
        <span class="badge badge-secondary">⏱️ ~<?= $product['prep_time_minutes'] ?> mins prep</span>
      </div>

      <h1 class="h2 fw-extrabold mb-2" style="color: var(--secondary);"><?= sanitize($product['name']) ?></h1>
      
      <!-- Price Display -->
      <div class="d-flex align-items-center gap-3 mb-3">
        <?php if ($product['discount_price'] !== null && $product['discount_price'] > 0): ?>
          <span class="fs-2xl fw-extrabold" style="color: var(--primary-dark);"><?= formatPrice($product['discount_price']) ?></span>
          <span class="fs-lg text-muted text-decoration-line-through"><?= formatPrice($product['price']) ?></span>
          <span class="badge badge-danger">SAVE <?= formatPrice($product['price'] - $product['discount_price']) ?></span>
        <?php else: ?>
          <span class="fs-2xl fw-extrabold" style="color: var(--primary-dark);"><?= formatPrice($product['price']) ?></span>
        <?php endif; ?>
      </div>

      <p class="text-muted mb-4" style="line-height: 1.6;"><?= sanitize($product['description']) ?></p>

      <?php if (!$product['is_available']): ?>
        <div class="alert alert-warning">
          <strong>Currently Unavailable:</strong> This meal is temporarily sold out for today. Please check back shortly or explore our other delicious options.
        </div>
      <?php else: ?>
        <!-- Extras / Add-ons Selector -->
        <?php if (!empty($extras)): ?>
          <div class="mb-4">
            <label class="form-label fw-extrabold">Customize Your Meal / Add Delicious Extras:</label>
            <div class="d-flex flex-column gap-2">
              <?php foreach ($extras as $extra): ?>
                <label class="extra-option-card" for="extra_<?= $extra['id'] ?>">
                  <div class="d-flex align-items-center gap-2">
                    <input type="checkbox" id="extra_<?= $extra['id'] ?>" class="extra-option-check" data-id="<?= $extra['id'] ?>" data-name="<?= sanitize($extra['name']) ?>" data-price="<?= floatval($extra['price']) ?>">
                    <span class="fw-semibold"><?= sanitize($extra['name']) ?></span>
                  </div>
                  <span class="extra-price">+ <?= formatPrice($extra['price']) ?></span>
                </label>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>

        <!-- Special Instructions -->
        <div class="form-group mb-4">
          <label for="food-special-instructions" class="form-label">Special Cooking Instructions (Optional):</label>
          <input type="text" id="food-special-instructions" class="form-control" placeholder="e.g. Less pepper, separate stew, add extra cutlery">
        </div>

        <!-- Quantity & Add to Cart -->
        <div class="card p-3" style="background: var(--bg-warm); border: 1.5px solid var(--border-color);">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div class="fs-xs text-muted fw-bold mb-1">SELECT QUANTITY</div>
              <div class="qty-control">
                <button type="button" class="qty-btn" id="qty-minus">-</button>
                <input type="text" id="food-qty-input" class="qty-input" value="1" readonly>
                <button type="button" class="qty-btn" id="qty-plus">+</button>
              </div>
            </div>

            <div class="flex-grow-1 text-end">
              <div class="fs-xs text-muted fw-bold mb-1">TOTAL AMOUNT</div>
              <div class="fs-xl fw-extrabold text-secondary mb-2" id="food-calculated-total">
                <?= formatPrice($effectivePrice) ?>
              </div>
              <button type="button" class="btn btn-primary btn-lg w-100" id="btn-add-meal-to-cart">
                🛍️ Add to Order Cart
              </button>
            </div>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </div>

  <!-- Related Dishes -->
  <?php if (!empty($related)): ?>
    <div class="mt-5 pt-4 border-top">
      <h3 class="mb-4">You Might Also Love 😋</h3>
      <div class="row g-4">
        <?php foreach ($related as $rel): ?>
          <div class="col-6 col-md-3">
            <div class="food-card">
              <div class="food-card-img-wrap">
                <img src="<?= $rel['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($rel['name']) ?>" class="food-card-img" loading="lazy">
              </div>
              <div class="food-card-body p-3">
                <h4 class="fs-sm fw-bold mb-1"><a href="food.php?id=<?= $rel['id'] ?>"><?= sanitize($rel['name']) ?></a></h4>
                <div class="price-main fs-base"><?= formatPrice(($rel['discount_price'] !== null && $rel['discount_price'] > 0) ? $rel['discount_price'] : $rel['price']) ?></div>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endif; ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const basePrice = <?= floatval($effectivePrice) ?>;
  const qtyInput = document.getElementById('food-qty-input');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const totalEl = document.getElementById('food-calculated-total');
  const addBtn = document.getElementById('btn-add-meal-to-cart');
  const checkboxes = document.querySelectorAll('.extra-option-check');

  function calculateTotal() {
    const qty = parseInt(qtyInput.value) || 1;
    let unit = basePrice;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        unit += parseFloat(cb.dataset.price || 0);
      }
    });
    const total = unit * qty;
    totalEl.textContent = formatNaira(total);
  }

  if (minusBtn && plusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let q = parseInt(qtyInput.value) || 1;
      if (q > 1) {
        qtyInput.value = q - 1;
        calculateTotal();
      }
    });

    plusBtn.addEventListener('click', () => {
      let q = parseInt(qtyInput.value) || 1;
      qtyInput.value = q + 1;
      calculateTotal();
    });
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const parent = e.target.closest('.extra-option-card');
      if (parent) {
        if (e.target.checked) parent.classList.add('selected');
        else parent.classList.remove('selected');
      }
      calculateTotal();
    });
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      const instructions = document.getElementById('food-special-instructions').value.trim();
      const selectedExtras = [];

      checkboxes.forEach(cb => {
        if (cb.checked) {
          selectedExtras.push({
            id: cb.dataset.id,
            name: cb.dataset.name,
            price: parseFloat(cb.dataset.price)
          });
        }
      });

      const productObj = {
        id: <?= $product['id'] ?>,
        name: <?= json_encode($product['name']) ?>,
        image: <?= json_encode($product['image'] ?: 'assets/images/products/jollof-rice.jpg') ?>,
        price: <?= floatval($effectivePrice) ?>
      };

      window.cart.addItem(productObj, qty, selectedExtras, instructions);
      setTimeout(() => {
        window.location.href = 'cart.php';
      }, 500);
    });
  }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
