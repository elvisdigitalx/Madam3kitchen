<?php
/**
 * Madam 3 Kitchen - Shopping Cart Page
 */
$pageTitle = 'Your Cart — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';

$db = Database::getConnection();
$zoneStmt = $db->query("SELECT * FROM delivery_zones WHERE is_active = 1 ORDER BY delivery_fee ASC");
$deliveryZones = $zoneStmt->fetchAll();
?>

<div class="container py-5">
  <div class="d-flex align-items-center justify-content-between mb-4">
    <h1 class="h2 mb-0">Your Order Cart 🛒</h1>
    <button type="button" class="btn btn-outline-danger btn-sm" id="btn-clear-cart" style="display:none;" onclick="if(confirm('Are you sure you want to clear your entire cart?')) { window.cart.clear(); renderCartPage(); }">
      Clear Cart
    </button>
  </div>

  <!-- Cart Grid Layout -->
  <div class="row g-4" id="cart-content-row">
    <!-- Left Column: Items Table / List -->
    <div class="col-12 col-lg-8">
      <div class="card shadow-sm" id="cart-items-card">
        <div class="card-body p-0">
          <div id="cart-items-wrapper">
            <!-- Items rendered via JS -->
          </div>
        </div>
      </div>

      <!-- Empty State View -->
      <div id="cart-empty-view" class="text-center py-5" style="display:none;">
        <div style="font-size: 4rem;" class="mb-3">😋</div>
        <h3>Your cart is hungry!</h3>
        <p class="text-muted max-w-500 mx-auto mb-4">
          Add something delicious from our authentic Nigerian menu to get started.
        </p>
        <a href="menu.php" class="btn btn-primary btn-lg">Browse Menu &rarr;</a>
      </div>
    </div>

    <!-- Right Column: Order Summary & Checkout -->
    <div class="col-12 col-lg-4" id="cart-summary-col">
      <div class="card shadow-sm p-4 sticky-top" style="top: 90px;">
        <h4 class="fw-extrabold mb-3 text-secondary">Order Summary</h4>

        <!-- Delivery Zone Selector for Estimation -->
        <div class="form-group mb-3">
          <label for="cart-delivery-zone" class="form-label">Delivery Location in Benin City:</label>
          <select id="cart-delivery-zone" class="form-select">
            <option value="" data-fee="0">-- Select Delivery Area --</option>
            <?php foreach ($deliveryZones as $zone): ?>
              <option value="<?= $zone['id'] ?>" data-fee="<?= $zone['delivery_fee'] ?>">
                <?= sanitize($zone['name']) ?> (+<?= formatPrice($zone['delivery_fee']) ?>)
              </option>
            <?php endforeach; ?>
          </select>
          <small class="text-muted fs-xs">No. 3 Asoro, Ekehuan Road, GRA, Ugbowo, Ring Rd, etc.</small>
        </div>

        <hr class="my-3">

        <!-- Calculation Breakdown -->
        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">Subtotal</span>
          <span class="fw-bold" id="cart-calc-subtotal">₦0</span>
        </div>

        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">Estimated Delivery</span>
          <span class="fw-bold" id="cart-calc-delivery">₦0</span>
        </div>

        <hr class="my-3">

        <div class="d-flex justify-content-between align-items-center mb-4">
          <span class="fs-lg fw-extrabold text-secondary">Estimated Total</span>
          <span class="fs-xl fw-extrabold text-primary" id="cart-calc-total">₦0</span>
        </div>

        <a href="checkout.php" class="btn btn-primary btn-lg w-100 mb-2" id="cart-btn-proceed">
          Proceed to Checkout 🚀
        </a>

        <a href="menu.php" class="btn btn-outline-secondary btn-sm w-100">
          + Add More Food Items
        </a>
      </div>
    </div>
  </div>
</div>

<script>
function renderCartPage() {
  const items = window.cart.items;
  const wrapper = document.getElementById('cart-items-wrapper');
  const emptyView = document.getElementById('cart-empty-view');
  const summaryCol = document.getElementById('cart-summary-col');
  const clearBtn = document.getElementById('btn-clear-cart');
  const itemsCard = document.getElementById('cart-items-card');
  const zoneSelect = document.getElementById('cart-delivery-zone');

  if (items.length === 0) {
    if (wrapper) wrapper.innerHTML = '';
    if (emptyView) emptyView.style.display = 'block';
    if (itemsCard) itemsCard.style.display = 'none';
    if (summaryCol) summaryCol.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  if (emptyView) emptyView.style.display = 'none';
  if (itemsCard) itemsCard.style.display = 'block';
  if (summaryCol) summaryCol.style.display = 'block';
  if (clearBtn) clearBtn.style.display = 'inline-flex';

  let html = '';
  items.forEach(item => {
    const extrasList = item.extras && item.extras.length > 0
      ? `<div class="fs-xs text-muted mt-1">Extras: ${item.extras.map(e => `${e.name} (+${formatNaira(e.price)})`).join(', ')}</div>`
      : '';
    const note = item.instructions
      ? `<div class="fs-xs text-warning mt-1">Note: ${item.instructions}</div>`
      : '';

    html += `
      <div class="p-3 border-bottom d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">
        <img src="${item.image || 'assets/images/products/jollof-rice.jpg'}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: var(--radius-md); flex-shrink: 0;">
        
        <div class="flex-grow-1">
          <h5 class="mb-0 fs-base fw-bold"><a href="food.php?id=${item.productId}" class="text-secondary">${item.name}</a></h5>
          <div class="fs-xs text-muted">Unit: ${formatNaira(item.unitPrice)}</div>
          ${extrasList}
          ${note}
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="window.cart.updateQuantity('${item.cartItemId}', ${item.quantity - 1}); renderCartPage();">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" readonly>
            <button type="button" class="qty-btn" onclick="window.cart.updateQuantity('${item.cartItemId}', ${item.quantity + 1}); renderCartPage();">+</button>
          </div>

          <div class="text-end" style="min-width: 80px;">
            <div class="fw-extrabold text-secondary">${formatNaira(item.subtotal)}</div>
          </div>

          <button type="button" class="btn btn-outline-danger btn-sm" onclick="window.cart.removeItem('${item.cartItemId}'); renderCartPage();" title="Remove Item">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  wrapper.innerHTML = html;

  // Calculate totals
  const subtotal = window.cart.getSubtotal();
  document.getElementById('cart-calc-subtotal').textContent = formatNaira(subtotal);

  let deliveryFee = 0;
  if (zoneSelect && zoneSelect.value) {
    const opt = zoneSelect.options[zoneSelect.selectedIndex];
    deliveryFee = parseFloat(opt.dataset.fee || 0);
  }
  document.getElementById('cart-calc-delivery').textContent = formatNaira(deliveryFee);
  document.getElementById('cart-calc-total').textContent = formatNaira(subtotal + deliveryFee);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  const zoneSelect = document.getElementById('cart-delivery-zone');
  if (zoneSelect) {
    zoneSelect.addEventListener('change', renderCartPage);
  }
  window.addEventListener('cart-updated', renderCartPage);
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
