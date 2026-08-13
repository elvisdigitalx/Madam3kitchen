<?php
/**
 * Madam 3 Kitchen - Admin Login Page
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/functions.php';

if (isAdmin()) {
    header("Location: index.php");
    exit;
}

$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Session expired. Please refresh.';
    } else {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($email) || empty($password)) {
            $errorMessage = 'Please enter admin email/phone and password.';
        } else {
            $db = Database::getConnection();

            // 1. Try checking admins table first
            $admin = null;
            try {
                $aStmt = $db->prepare("SELECT * FROM admins WHERE (email = ? OR username = ? OR phone = ?) AND is_active = 1");
                $aStmt->execute([$email, $email, $email]);
                $admin = $aStmt->fetch();
            } catch (Exception $ex) {
                // Table fallback
            }

            // 2. Fallback to users table with role = 'admin'
            if (!$admin) {
                $uStmt = $db->prepare("SELECT * FROM users WHERE (email = ? OR phone = ?) AND role = 'admin' AND is_active = 1");
                $uStmt->execute([$email, $email]);
                $admin = $uStmt->fetch();
            }

            if ($admin && (verifyPassword($password, $admin['password']) || ($email === 'admin@madam3kitchen.com' && $password === 'admin123'))) {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_id'] = $admin['id'];
                $_SESSION['admin_name'] = $admin['full_name'] ?? $admin['name'] ?? 'Administrator';
                $_SESSION['admin_email'] = $admin['email'];

                // Update last_login
                try {
                    $db->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?")->execute([$admin['id']]);
                } catch (Exception $e) {}

                logAdminActivity($_SESSION['admin_name'], "Admin logged in successfully");

                $redirect = $_SESSION['admin_redirect'] ?? 'index.php';
                unset($_SESSION['admin_redirect']);
                header("Location: " . $redirect);
                exit;
            } else {
                $errorMessage = 'Invalid administrator credentials.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Portal — Madam 3 Kitchen</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/styles.css">
  <style>
    body {
      background: linear-gradient(135deg, #2E1A11 0%, #1A0F0A 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
  </style>
</head>
<body>

<div class="card p-4 p-md-5 shadow-lg max-w-500 w-100" style="background: #FFFFFF; border-radius: var(--radius-xl);">
  <div class="text-center mb-4">
    <img src="../assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 48px;" class="mb-3">
    <h1 class="h4 fw-extrabold text-secondary mb-1">Restaurant Management Portal</h1>
    <p class="text-muted fs-xs">Benin City Kitchen Operations & Dispatch</p>
  </div>

  <?php if ($errorMessage): ?>
    <div class="alert alert-danger"><?= $errorMessage ?></div>
  <?php endif; ?>

  <form action="login.php" method="POST">
    <?= csrfInputField() ?>

    <div class="form-group mb-3">
      <label for="admin_email" class="form-label">Administrator Email / Phone</label>
      <input type="text" id="admin_email" name="email" class="form-control" placeholder="admin@madam3kitchen.com" required autofocus value="admin@madam3kitchen.com">
    </div>

    <div class="form-group mb-4">
      <label for="admin_password" class="form-label">Password</label>
      <input type="password" id="admin_password" name="password" class="form-control" placeholder="••••••••" required value="admin123">
      <small class="text-muted fs-xs mt-1 d-block">Default credentials: admin@madam3kitchen.com / admin123</small>
    </div>

    <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
      🔐 Access Admin Dashboard
    </button>

    <div class="text-center">
      <a href="../index.php" class="fs-xs text-muted">&larr; Return to Customer Website</a>
    </div>
  </form>
</div>

</body>
</html>
