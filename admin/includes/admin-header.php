<?php
/**
 * Madam 3 Kitchen - Admin Top Header Component
 */
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

requireAdmin();
$adminName = $_SESSION['admin_name'] ?? 'Administrator';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= sanitize($pageTitle ?? 'Admin Dashboard') ?> — Madam 3 Kitchen</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/styles.css">
  <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="admin-body">

<?php require_once __DIR__ . '/admin-sidebar.php'; ?>

<div class="admin-main">
  <!-- Topbar -->
  <header class="admin-topbar">
    <div class="admin-topbar-left">
      <button type="button" class="admin-mobile-toggle" aria-label="Toggle Sidebar">☰</button>
      <h2 class="h5 mb-0 fw-extrabold text-secondary"><?= sanitize($pageTitle ?? 'Dashboard') ?></h2>
    </div>

    <div class="admin-topbar-right">
      <!-- Audio Chime Toggle -->
      <button type="button" class="sound-toggle-btn" id="admin-sound-toggle" title="Toggle New Order Audio Chime">
        🔊 Sound On
      </button>

      <!-- Bell Notification -->
      <a href="orders.php?status=Pending" class="admin-notification-bell" title="Live Pending Orders">
        🔔
        <span class="bell-badge" id="pending-order-badge" style="display:none;">0</span>
      </a>

      <!-- Quick Restaurant Status Badge -->
      <a href="settings.php" class="badge <?= isRestaurantOpen() ? 'badge-success' : 'badge-danger' ?> fs-xs">
        ● <?= isRestaurantOpen() ? 'RESTAURANT OPEN' : 'CLOSED' ?>
      </a>

      <!-- View Public Site -->
      <a href="../index.php" target="_blank" class="btn btn-outline-secondary btn-sm d-none d-sm-inline-flex">
        🌐 Live Site &rarr;
      </a>
    </div>
  </header>

  <div class="admin-container">
