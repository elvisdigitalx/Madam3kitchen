<?php
/**
 * Madam 3 Kitchen - Admin Logout Handler
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

if (isAdmin()) {
    logAdminActivity($_SESSION['admin_name'] ?? 'Admin', "Admin logged out");
    logoutAdmin();
}

header("Location: login.php");
exit;
