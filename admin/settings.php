<?php
/**
 * Madam 3 Kitchen - Restaurant Settings
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Security token invalid.';
    } else {
        $settingsToSave = [
            'restaurant_name' => sanitize($_POST['restaurant_name'] ?? 'Madam 3 Kitchen'),
            'restaurant_tagline' => sanitize($_POST['restaurant_tagline'] ?? 'Delicious Nigerian Meals, Made With Love'),
            'restaurant_address' => sanitize($_POST['restaurant_address'] ?? 'No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State, Nigeria'),
            'restaurant_phone' => sanitize($_POST['restaurant_phone'] ?? '+2348030001234'),
            'restaurant_whatsapp' => sanitize($_POST['restaurant_whatsapp'] ?? '2348030001234'),
            'restaurant_email' => sanitize($_POST['restaurant_email'] ?? 'orders@madam3kitchen.com'),
            'opening_time' => sanitize($_POST['opening_time'] ?? '08:00'),
            'closing_time' => sanitize($_POST['closing_time'] ?? '22:00'),
            'restaurant_status' => sanitize($_POST['restaurant_status'] ?? 'OPEN'),
            'closed_message' => sanitize($_POST['closed_message'] ?? 'Madam 3 Kitchen is currently closed.'),
            'default_delivery_fee' => floatval($_POST['default_delivery_fee'] ?? 1000),
            'minimum_order_amount' => floatval($_POST['minimum_order_amount'] ?? 2000),
            'enable_cod' => isset($_POST['enable_cod']) ? '1' : '0',
            'enable_bank_transfer' => isset($_POST['enable_bank_transfer']) ? '1' : '0',
            'bank_name' => sanitize($_POST['bank_name'] ?? 'Moniepoint Microfinance Bank'),
            'bank_account_number' => sanitize($_POST['bank_account_number'] ?? '8030001234'),
            'bank_account_name' => sanitize($_POST['bank_account_name'] ?? 'Madam 3 Kitchen Benin'),
            'enable_paystack' => isset($_POST['enable_paystack']) ? '1' : '0',
            'paystack_public_key' => sanitize($_POST['paystack_public_key'] ?? ''),
            'google_maps_url' => sanitize($_POST['google_maps_url'] ?? '')
        ];

        foreach ($settingsToSave as $key => $val) {
            setSetting($key, (string)$val);
        }

        logAdminActivity($_SESSION['admin_name'], "Updated restaurant settings & operations");
        $message = 'Settings updated successfully!';
    }
}

$pageTitle = 'Restaurant Settings';
require_once __DIR__ . '/includes/admin-header.php';
?>

<?php if ($message): ?>
  <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<?php if ($errorMessage): ?>
  <div class="alert alert-danger"><?= $errorMessage ?></div>
<?php endif; ?>

<form action="settings.php" method="POST" class="max-w-900 mx-auto">
  <?= csrfInputField() ?>

  <!-- 1. Operations & Kitchen Status -->
  <div class="card p-4 shadow-sm mb-4">
    <h3 class="h5 fw-extrabold text-secondary mb-3 pb-2 border-bottom">1️⃣ Kitchen Status & Operational Hours</h3>
    <div class="row g-3">
      <div class="col-12 col-sm-6">
        <label class="form-label">Manual Kitchen Status</label>
        <select name="restaurant_status" class="form-select fw-bold">
          <option value="OPEN" <?= getSetting('restaurant_status', 'OPEN') === 'OPEN' ? 'selected' : '' ?>>🟢 OPEN (Accepting Orders)</option>
          <option value="CLOSED" <?= getSetting('restaurant_status', 'OPEN') === 'CLOSED' ? 'selected' : '' ?>>🔴 CLOSED (Temporarily Closed)</option>
        </select>
      </div>

      <div class="col-12 col-sm-6">
        <label class="form-label">Closed Notice Message</label>
        <input type="text" name="closed_message" class="form-control" value="<?= sanitize(getSetting('closed_message', 'Madam 3 Kitchen is currently closed.')) ?>">
      </div>

      <div class="col-6 col-sm-3">
        <label class="form-label">Opening Time</label>
        <input type="time" name="opening_time" class="form-control" value="<?= sanitize(getSetting('opening_time', '08:00')) ?>">
      </div>

      <div class="col-6 col-sm-3">
        <label class="form-label">Closing Time</label>
        <input type="time" name="closing_time" class="form-control" value="<?= sanitize(getSetting('closing_time', '22:00')) ?>">
      </div>

      <div class="col-6 col-sm-3">
        <label class="form-label">Min Order (₦)</label>
        <input type="number" step="100" name="minimum_order_amount" class="form-control" value="<?= sanitize(getSetting('minimum_order_amount', '2000')) ?>">
      </div>

      <div class="col-6 col-sm-3">
        <label class="form-label">Default Delivery Fee (₦)</label>
        <input type="number" step="100" name="default_delivery_fee" class="form-control" value="<?= sanitize(getSetting('default_delivery_fee', '1000')) ?>">
      </div>
    </div>
  </div>

  <!-- 2. Restaurant Brand & Contact Details -->
  <div class="card p-4 shadow-sm mb-4">
    <h3 class="h5 fw-extrabold text-secondary mb-3 pb-2 border-bottom">2️⃣ Brand & Contact Information</h3>
    <div class="row g-3">
      <div class="col-12 col-sm-6">
        <label class="form-label">Restaurant Name</label>
        <input type="text" name="restaurant_name" class="form-control" value="<?= sanitize(getSetting('restaurant_name', 'Madam 3 Kitchen')) ?>" required>
      </div>

      <div class="col-12 col-sm-6">
        <label class="form-label">Tagline</label>
        <input type="text" name="restaurant_tagline" class="form-control" value="<?= sanitize(getSetting('restaurant_tagline', 'Delicious Nigerian Meals, Made With Love')) ?>">
      </div>

      <div class="col-12">
        <label class="form-label">Physical Address</label>
        <input type="text" name="restaurant_address" class="form-control" value="<?= sanitize(getSetting('restaurant_address', 'No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State, Nigeria')) ?>" required>
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label">Phone Number</label>
        <input type="text" name="restaurant_phone" class="form-control" value="<?= sanitize(getSetting('restaurant_phone', '+2348030001234')) ?>">
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label">WhatsApp Number (Digits only with country code)</label>
        <input type="text" name="restaurant_whatsapp" class="form-control" value="<?= sanitize(getSetting('restaurant_whatsapp', '2348030001234')) ?>">
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label">Email Address</label>
        <input type="email" name="restaurant_email" class="form-control" value="<?= sanitize(getSetting('restaurant_email', 'orders@madam3kitchen.com')) ?>">
      </div>
    </div>
  </div>

  <!-- 3. Payment Gateway & Bank Transfer Settings -->
  <div class="card p-4 shadow-sm mb-4">
    <h3 class="h5 fw-extrabold text-secondary mb-3 pb-2 border-bottom">3️⃣ Payment Gateway & Bank Accounts</h3>
    
    <div class="row g-3">
      <div class="col-12">
        <label class="d-flex align-items-center gap-2">
          <input type="checkbox" name="enable_cod" value="1" <?= getSetting('enable_cod', '1') == '1' ? 'checked' : '' ?>>
          <span class="fw-bold fs-sm">Enable Cash / POS on Delivery</span>
        </label>
      </div>

      <div class="col-12">
        <label class="d-flex align-items-center gap-2">
          <input type="checkbox" name="enable_bank_transfer" value="1" <?= getSetting('enable_bank_transfer', '1') == '1' ? 'checked' : '' ?>>
          <span class="fw-bold fs-sm">Enable Direct Bank Transfer Payments</span>
        </label>
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label">Bank Name</label>
        <input type="text" name="bank_name" class="form-control" value="<?= sanitize(getSetting('bank_name', 'Moniepoint Microfinance Bank')) ?>">
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label">Account Number</label>
        <input type="text" name="bank_account_number" class="form-control" value="<?= sanitize(getSetting('bank_account_number', '8030001234')) ?>">
      </div>

      <div class="col-12 col-sm-4">
        <label class="form-label">Account Name</label>
        <input type="text" name="bank_account_name" class="form-control" value="<?= sanitize(getSetting('bank_account_name', 'Madam 3 Kitchen Benin')) ?>">
      </div>

      <div class="col-12 mt-3 pt-3 border-top">
        <label class="d-flex align-items-center gap-2">
          <input type="checkbox" name="enable_paystack" value="1" <?= getSetting('enable_paystack', '1') == '1' ? 'checked' : '' ?>>
          <span class="fw-bold fs-sm">Enable Paystack Online Card / USSD Gateway</span>
        </label>
      </div>

      <div class="col-12 col-sm-6">
        <label class="form-label">Paystack Public Key</label>
        <input type="text" name="paystack_public_key" class="form-control" value="<?= sanitize(getSetting('paystack_public_key', 'pk_test_sample_key_12345')) ?>">
      </div>
    </div>
  </div>

  <button type="submit" class="btn btn-primary btn-lg w-100 mb-5">
    💾 Save All Restaurant Settings
  </button>
</form>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
