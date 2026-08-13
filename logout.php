<?php
/**
 * Madam 3 Kitchen - Customer Logout
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';

logoutUser();
header("Location: login.php");
exit;
