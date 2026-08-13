<?php
/**
 * Madam 3 Kitchen - Customer Login
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Invalid session token. Please try again.';
    } else {
        $loginId = trim($_POST['login_id'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($loginId) || empty($password)) {
            $errorMessage = 'Please enter your phone number / email and password.';
        } else {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM users WHERE phone = ? OR email = ?");
            $stmt->execute([$loginId, $loginId]);
            $user = $stmt->fetch();

            if ($user && verifyPassword($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_phone'] = $user['phone'];

                $redirect = $_SESSION['redirect_url'] ?? 'account.php';
                unset($_SESSION['redirect_url']);
                header("Location: " . $redirect);
                exit;
            } else {
                $errorMessage = 'Invalid login credentials. Please try again.';
            }
        }
    }
}

$pageTitle = 'Sign In — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
  <div class="card max-w-500 mx-auto shadow-sm p-4 p-md-5" style="border-radius: var(--radius-xl);">
    <div class="text-center mb-4">
      <h1 class="h3 fw-extrabold text-secondary mb-1">Welcome Back! 👋</h1>
      <p class="text-muted fs-sm">Sign in to track orders and save your delivery addresses.</p>
    </div>

    <?php if ($errorMessage): ?>
      <div class="alert alert-danger"><?= $errorMessage ?></div>
    <?php endif; ?>

    <form action="login.php" method="POST">
      <?= csrfInputField() ?>

      <div class="form-group mb-3">
        <label for="login_id" class="form-label">Phone Number or Email</label>
        <input type="text" id="login_id" name="login_id" class="form-control" placeholder="e.g. 0803 000 1234 or name@email.com" required autofocus>
      </div>

      <div class="form-group mb-4">
        <label for="password" class="form-label">Password</label>
        <input type="password" id="password" name="password" class="form-control" placeholder="Enter your password" required>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
        Sign In 🚀
      </button>

      <div class="text-center fs-sm text-muted">
        Don't have an account yet? <a href="register.php" class="fw-bold">Create Account</a>
      </div>

      <div class="mt-3 pt-3 border-top text-center fs-xs text-muted">
        Want to order without signing in? <a href="menu.php" class="text-secondary fw-bold">Guest Checkout</a> is supported!
      </div>
    </form>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
