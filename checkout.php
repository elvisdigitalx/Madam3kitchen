<?php
/**
 * Madam 3 Kitchen - Checkout Page
 */
$pageTitle = 'Checkout — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';

$db = Database::getConnection();
$currentUser = getCurrentUser();

// Fetch Active Delivery Zones
$zoneStmt = $db->query("SELECT * FROM delivery_zones WHERE is_active = 1 ORDER BY delivery_fee ASC");
$zones = $zoneStmt->fetchAll();

// Payment settings
$enableCod = getSetting('enable_cod', '1');
$enableBankTransfer = getSetting('enable_bank_transfer', '1');
$bankName = getSetting('bank_name', 'Moniepoint Microfinance Bank');
$bankAccNo = getSetting('bank_account_number', '8030001234');
$bankAccName = getSetting('bank_account_name', 'Madam 3 Kitchen Benin');
?>

<div class="container py-5">
  <div class="max-w-900 mx-auto">
    <div class="mb-4 text-center text-sm-start">
      <h1 class="h2 mb-1">Complete Your Food Order 🍛</h1>
      <p class="text-muted fs-sm">Quick & easy checkout for delivery anywhere across Benin City.</p>
    </div>

    <form id="checkout-form">
      <?= csrfInputField() ?>
      <div class="row g-4">
        <!-- Left: Customer & Delivery Details -->
        <div class="col-12 col-lg-7">
          <!-- Step 1: Customer Contact -->
          <div class="card p-4 mb-4 shadow-sm">
            <h4 class="fs-base fw-extrabold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <span>1️⃣</span> Customer Information
            </h4>

            <div class="row g-3">
              <div class="col-12 col-sm-6">
                <div class="form-group mb-0">
                  <label for="customer_name" class="form-label">Full Name *</label>
                  <input type="text" id="customer_name" name="customer_name" class="form-control" placeholder="e.g. Osasogie Igbinosa" required value="<?= $currentUser ? sanitize($currentUser['name']) : '' ?>">
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="form-group mb-0">
                  <label for="phone" class="form-label">Phone Number (Calls) *</label>
                  <input type="tel" id="phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" required value="<?= $currentUser ? sanitize($currentUser['phone']) : '' ?>">
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="form-group mb-0">
                  <label for="whatsapp" class="form-label">WhatsApp Number (For Updates)</label>
                  <input type="tel" id="whatsapp" name="whatsapp" class="form-control" placeholder="e.g. 0803 000 1234" value="<?= $currentUser ? sanitize($currentUser['whatsapp']) : '' ?>">
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="form-group mb-0">
                  <label for="email" class="form-label">Email Address (Optional)</label>
                  <input type="email" id="email" name="email" class="form-control" placeholder="e.g. name@example.com" value="<?= $currentUser ? sanitize($currentUser['email']) : '' ?>">
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Delivery Location in Benin City -->
          <div class="card p-4 mb-4 shadow-sm">
            <div class="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
              <h4 class="fs-base fw-extrabold text-secondary mb-0 d-flex align-items-center gap-2">
                <span>2️⃣</span> Delivery Address (Benin City)
              </h4>
              <button type="button" class="btn btn-outline-secondary btn-sm" id="use_my_location_btn" style="font-size: 0.75rem;">
                📍 Use My Location
              </button>
            </div>

            <div class="form-group mb-3">
              <label for="delivery_zone_id" class="form-label">Delivery Zone / Area *</label>
              <select id="delivery_zone_id" name="delivery_zone_id" class="form-select" required>
                <option value="">-- Choose Your Area in Benin City --</option>
                <?php foreach ($zones as $zone): ?>
                  <option value="<?= $zone['id'] ?>" data-fee="<?= $zone['delivery_fee'] ?>">
                    <?= sanitize($zone['name']) ?> — <?= formatPrice($zone['delivery_fee']) ?> (⏱️ <?= sanitize($zone['estimated_time']) ?>)
                  </option>
                <?php endforeach; ?>
              </select>
            </div>

            <div class="form-group mb-3">
              <label for="delivery_address" class="form-label">Street Address / House No. *</label>
              <textarea id="delivery_address" name="address" class="form-control" rows="2" placeholder="e.g. Flat 3, Block B, 14 Boundary Road, off Airport Rd" required><?= $currentUser ? sanitize($currentUser['address']) : '' ?></textarea>
            </div>

            <div class="form-group mb-3">
              <label for="landmark" class="form-label">Nearest Popular Landmark / Bus Stop *</label>
              <input type="text" id="landmark" name="landmark" class="form-control" placeholder="e.g. Opposite Edo Golf Club / Beside Total Filling Station" required value="<?= $currentUser ? sanitize($currentUser['landmark']) : '' ?>">
            </div>

            <div class="form-group mb-0">
              <label for="instructions" class="form-label">Special Delivery / Kitchen Instructions</label>
              <input type="text" id="instructions" name="instructions" class="form-control" placeholder="e.g. Ring bell at the gate, call when arriving">
            </div>
          </div>

          <!-- Step 3: Order Schedule & Payment Method -->
          <div class="card p-4 mb-4 shadow-sm">
            <h4 class="fs-base fw-extrabold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <span>3️⃣</span> Schedule & Payment
            </h4>

            <!-- ASAP vs Scheduled -->
            <label class="form-label">Delivery Timing:</label>
            <div class="d-flex gap-3 mb-3">
              <label class="d-flex align-items-center gap-2 p-2 border rounded" style="cursor: pointer; flex: 1;">
                <input type="radio" name="order_timing" value="asap" checked>
                <span class="fw-bold fs-sm">⚡ Deliver ASAP (25-45m)</span>
              </label>
              <label class="d-flex align-items-center gap-2 p-2 border rounded" style="cursor: pointer; flex: 1;">
                <input type="radio" name="order_timing" value="scheduled">
                <span class="fw-bold fs-sm">📅 Schedule For Later</span>
              </label>
            </div>

            <!-- Scheduled Picker (Hidden by default) -->
            <div id="scheduled_time_container" style="display: none;" class="p-3 bg-light rounded mb-3 border">
              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label fs-xs">Delivery Date</label>
                  <input type="date" name="scheduled_date" class="form-control form-control-sm" min="<?= date('Y-m-d') ?>">
                </div>
                <div class="col-6">
                  <label class="form-label fs-xs">Preferred Time</label>
                  <input type="time" name="scheduled_time" class="form-control form-control-sm">
                </div>
              </div>
            </div>

            <!-- Payment Methods -->
            <label class="form-label mt-2">Select Payment Method:</label>
            <div class="d-flex flex-column gap-2 mb-3">
              <label class="extra-option-card">
                <div class="d-flex align-items-center gap-2">
                  <input type="radio" name="payment_method" value="online" checked>
                  <div>
                    <span class="fw-bold">💳 Online Card / USSD / Paystack</span>
                    <div class="fs-xs text-muted">Instant secure payment with debit card or Nigerian bank transfer</div>
                  </div>
                </div>
              </label>

              <?php if ($enableBankTransfer): ?>
                <label class="extra-option-card">
                  <div class="d-flex align-items-center gap-2">
                    <input type="radio" name="payment_method" value="bank_transfer">
                    <div>
                      <span class="fw-bold">🏦 Direct Bank Transfer to Madam 3 Kitchen</span>
                      <div class="fs-xs text-muted">Transfer directly to our Moniepoint account</div>
                    </div>
                  </div>
                </label>
              <?php endif; ?>

              <?php if ($enableCod): ?>
                <label class="extra-option-card">
                  <div class="d-flex align-items-center gap-2">
                    <input type="radio" name="payment_method" value="cod">
                    <div>
                      <span class="fw-bold">💵 Cash / POS on Delivery</span>
                      <div class="fs-xs text-muted">Pay the rider when your food arrives</div>
                    </div>
                  </div>
                </label>
              <?php endif; ?>
            </div>

            <!-- Bank Transfer Details Box -->
            <div id="bank-transfer-details" style="display: none;" class="p-3 border rounded bg-warning bg-opacity-10 mb-3">
              <div class="fw-bold text-secondary mb-1">Madam 3 Kitchen Bank Details:</div>
              <div class="fs-sm"><strong>Bank:</strong> <?= sanitize($bankName) ?></div>
              <div class="fs-sm"><strong>Account Number:</strong> <span class="badge badge-dark fs-sm"><?= sanitize($bankAccNo) ?></span></div>
              <div class="fs-sm"><strong>Account Name:</strong> <?= sanitize($bankAccName) ?></div>
              <div class="fs-xs text-muted mt-2">Please use your Order Number or Phone Number as the transfer remark/narration.</div>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary & Promo Code -->
        <div class="col-12 col-lg-5">
          <div class="card p-4 shadow-sm sticky-top" style="top: 90px;">
            <h4 class="fs-base fw-extrabold text-secondary mb-3 pb-2 border-bottom">
              Order Summary
            </h4>

            <!-- Selected Items List -->
            <div id="checkout-items-list" class="mb-3" style="max-height: 280px; overflow-y: auto;">
              <!-- Rendered via checkout.js -->
            </div>

            <!-- Promo Code Input -->
            <div class="mb-3">
              <label class="form-label fs-xs fw-bold">Have a Promo Code?</label>
              <div class="d-flex gap-2">
                <input type="text" id="promo_code_input" class="form-control form-control-sm text-uppercase" placeholder="e.g. WELCOME10">
                <button type="button" id="apply_promo_btn" class="btn btn-secondary btn-sm">Apply</button>
              </div>
              <div id="promo-status-msg" class="fs-xs mt-1"></div>
            </div>

            <hr class="my-2">

            <!-- Cost Summary Breakdown -->
            <div class="d-flex justify-content-between mb-2 fs-sm">
              <span class="text-muted">Subtotal</span>
              <span class="fw-bold" id="summary-subtotal">₦0</span>
            </div>

            <div class="d-flex justify-content-between mb-2 fs-sm">
              <span class="text-muted">Delivery Fee</span>
              <span class="fw-bold" id="summary-delivery">₦0</span>
            </div>

            <div class="d-flex justify-content-between mb-2 fs-sm text-danger" id="discount-row" style="display: none;">
              <span>Promo Discount</span>
              <span class="fw-bold" id="summary-discount">- ₦0</span>
            </div>

            <hr class="my-3">

            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="fs-lg fw-extrabold text-secondary">Grand Total</span>
              <span class="fs-xl fw-extrabold text-primary" id="summary-grand-total">₦0</span>
            </div>

            <button type="submit" id="place-order-submit-btn" class="btn btn-primary btn-lg w-100 mb-2">
              Place Order 🍛
            </button>

            <div class="text-center fs-xs text-muted">
              🔒 Safe & Secure Checkout • Encrypted Delivery Data
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>

<script src="assets/js/checkout.js"></script>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
