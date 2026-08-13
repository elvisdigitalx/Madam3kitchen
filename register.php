<?php
/**
 * Madam 3 Kitchen - Customer Registration
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

if (isLoggedIn()) {
    header("Location: account.php");
    exit;
}

$errorMessage = '';
$successMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Security session expired. Please refresh.';
    } else {
        $name = sanitize($_POST['name'] ?? '');
        $phone = sanitize($_POST['phone'] ?? '');
        $whatsapp = sanitize($_POST['whatsapp'] ?? $phone);
        $email = sanitize($_POST['email'] ?? '');
        $address = sanitize($_POST['address'] ?? '');
        $landmark = sanitize($_POST['landmark'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($name) || empty($phone) || empty($password)) {
            $errorMessage = 'Please provide your full name, phone number, and password.';
        } elseif (strlen($password) < 6) {
            $errorMessage = 'Password must be at least 6 characters long.';
        } else {
            try {
                $db = Database::getConnection();

                // Check existing phone/email
                $checkStmt = $db->prepare("SELECT id FROM users WHERE phone = ? OR (email = ? AND email != '')");
                $checkStmt->execute([$phone, $email]);
                if ($checkStmt->fetch()) {
                    $errorMessage = 'An account with this phone number or email already exists.';
                } else {
                    $hash = hashPassword($password);
                    $stmt = $db->prepare("INSERT INTO users (name, email, phone, whatsapp, password, address, landmark, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'customer')");
                    $stmt->execute([$name, $email ?: null, $phone, $whatsapp, $hash, $address, $landmark]);

                    $newId = $db->lastInsertId();
                    $_SESSION['user_id'] = $newId;
                    $_SESSION['user_name'] = $name;
                    $_SESSION['user_phone'] = $phone;

                    header("Location: account.php");
                    exit;
                }
            } catch (Exception $e) {
                $errorMessage = 'Failed to register account: ' . $e->getMessage();
            }
        }
    }
}

$pageTitle = 'Create Account — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <div class="card max-w-600 mx-auto shadow-sm p-4 p-md-5" style="border-radius: var(--radius-xl);">
    <div class="text-center mb-4">
      <h1 class="h3 fw-extrabold text-secondary mb-1">Create an Account ✨</h1>
      <p class="text-muted fs-sm">Enjoy faster checkout, saved Benin City addresses, and easy re-orders.</p>
    </div>

    <?php if ($errorMessage): ?>
      <div class="alert alert-danger"><?= $errorMessage ?></div>
    <?php endif; ?>

    <form action="register.php" method="POST">
      <?= csrfInputField() ?>

      <div class="row g-3">
        <div class="col-12">
          <div class="form-group mb-0">
            <label for="reg_name" class="form-label">Full Name *</label>
            <input type="text" id="reg_name" name="name" class="form-control" placeholder="e.g. Osasogie Igbinosa" required>
          </div>
        </div>

        <div class="col-12 col-sm-6">
          <div class="form-group mb-0">
            <label for="reg_phone" class="form-label">Phone Number *</label>
            <input type="tel" id="reg_phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" required>
          </div>
        </div>

        <div class="col-12 col-sm-6">
          <div class="form-group mb-0">
            <label for="reg_whatsapp" class="form-label">WhatsApp Number</label>
            <input type="tel" id="reg_whatsapp" name="whatsapp" class="form-control" placeholder="e.g. 0803 000 1234">
          </div>
        </div>

        <div class="col-12">
          <div class="form-group mb-0">
            <label for="reg_email" class="form-label">Email Address (Optional)</label>
            <input type="email" id="reg_email" name="email" class="form-control" placeholder="name@example.com">
          </div>
        </div>

        <div class="col-12">
          <div class="form-group mb-0">
            <label for="reg_address" class="form-label">Default Delivery Address (Benin City)</label>
            <input type="text" id="reg_address" name="address" class="form-control" placeholder="e.g. 14 Boundary Road, GRA, Benin City">
          </div>
        </div>

        <div class="col-12">
          <div class="form-group mb-0">
            <label for="reg_landmark" class="form-label">Nearest Landmark</label>
            <input type="text" id="reg_landmark" name="landmark" class="form-control" placeholder="e.g. Near Edo Golf Club">
          </div>
        </div>

        <div class="col-12">
          <div class="form-group mb-2">
            <label for="reg_password" class="form-label">Password * (Min. 6 characters)</label>
            <input type="password" id="reg_password" name="password" class="form-control" placeholder="Create a secure password" required minlength="6">
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-100 mt-4 mb-3">
        Complete Registration 🚀
      </button>

      <div class="text-center fs-sm text-muted">
        Already have an account? <a href="login.php" class="fw-bold">Sign In Here</a>
      </div>
    </form>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
