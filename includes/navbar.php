<?php
/**
 * Madam 3 Kitchen - Navigation Bar
 */
$currentUser = getCurrentUser();
$currentPage = basename($_SERVER['PHP_SELF']);
$isOpen = isRestaurantOpen();
?>
<!-- Top Notice Bar -->
<div class="top-notice-bar">
  <div class="container d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
      <span>📍 Asoro Bus Stop, Ekhuan Road, Benin City, Edo State</span>
      <span class="d-none d-md-inline ms-3">🕒 Daily: 8:00 AM – 10:00 PM</span>
    </div>
    <div class="d-flex align-items-center gap-3">
      <?php if ($isOpen): ?>
        <span class="badge badge-success"><span style="display:inline-block; width:6px; height:6px; background:#4CAF50; border-radius:50%; margin-right:4px;"></span> WE ARE OPEN</span>
      <?php else: ?>
        <span class="badge badge-danger">CURRENTLY CLOSED</span>
      <?php endif; ?>
      <a href="tel:<?= RESTAURANT_PHONE ?>" class="d-none d-sm-inline">📞 <?= RESTAURANT_PHONE_DISPLAY ?></a>
    </div>
  </div>
</div>

<!-- Main Sticky Navbar -->
<nav class="site-navbar">
  <div class="container">
    <div class="navbar-inner">
      <!-- Logo -->
      <a href="index.php" class="brand-logo" title="Madam 3 Kitchen Benin City">
        <img src="assets/images/logo.svg" alt="Madam 3 Kitchen Logo">
      </a>

      <!-- Desktop Navigation Links -->
      <ul class="nav-links">
        <li><a href="index.php" class="nav-link <?= $currentPage === 'index.php' ? 'active' : '' ?>">Home</a></li>
        <li><a href="menu.php" class="nav-link <?= $currentPage === 'menu.php' ? 'active' : '' ?>">Menu</a></li>
        <li><a href="offers.php" class="nav-link <?= $currentPage === 'offers.php' ? 'active' : '' ?>">Today's Deals</a></li>
        <li><a href="track-order.php" class="nav-link <?= $currentPage === 'track-order.php' ? 'active' : '' ?>">Track Order</a></li>
        <li><a href="about.php" class="nav-link <?= $currentPage === 'about.php' ? 'active' : '' ?>">About Us</a></li>
        <li><a href="contact.php" class="nav-link <?= $currentPage === 'contact.php' ? 'active' : '' ?>">Contact</a></li>
      </ul>

      <!-- Action Buttons -->
      <div class="nav-actions">
        <?php if ($currentUser): ?>
          <div class="d-none d-md-flex align-items-center gap-2">
            <a href="account.php" class="btn btn-outline-secondary btn-sm">
              👤 <?= sanitize(explode(' ', $currentUser['name'])[0]) ?>
            </a>
          </div>
        <?php else: ?>
          <a href="login.php" class="btn btn-outline-secondary btn-sm d-none d-md-inline-flex">Sign In</a>
        <?php endif; ?>

        <!-- Cart Trigger -->
        <a href="cart.php" class="nav-cart-btn" title="View Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <span class="cart-counter" style="display:none;">0</span>
        </a>

        <!-- Mobile Drawer Toggle -->
        <button type="button" class="mobile-menu-toggle" aria-label="Toggle Menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>

<!-- Mobile Navigation Drawer -->
<div class="drawer-backdrop"></div>
<div class="mobile-drawer">
  <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
    <img src="assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 38px;">
  </div>

  <div class="d-flex flex-column gap-2 mb-4">
    <a href="index.php" class="btn btn-outline-secondary text-start <?= $currentPage === 'index.php' ? 'btn-primary text-white' : '' ?>">🏠 Home</a>
    <a href="menu.php" class="btn btn-outline-secondary text-start <?= $currentPage === 'menu.php' ? 'btn-primary text-white' : '' ?>">🍲 Food Menu</a>
    <a href="offers.php" class="btn btn-outline-secondary text-start <?= $currentPage === 'offers.php' ? 'btn-primary text-white' : '' ?>">🔥 Today's Specials</a>
    <a href="track-order.php" class="btn btn-outline-secondary text-start <?= $currentPage === 'track-order.php' ? 'btn-primary text-white' : '' ?>">📍 Track My Order</a>
    <a href="about.php" class="btn btn-outline-secondary text-start <?= $currentPage === 'about.php' ? 'btn-primary text-white' : '' ?>">ℹ️ About Madam 3</a>
    <a href="contact.php" class="btn btn-outline-secondary text-start <?= $currentPage === 'contact.php' ? 'btn-primary text-white' : '' ?>">📞 Contact & Location</a>
  </div>

  <div class="mt-auto pt-3 border-top">
    <?php if ($currentUser): ?>
      <a href="account.php" class="btn btn-primary w-100 mb-2">My Account (<?= sanitize($currentUser['name']) ?>)</a>
      <a href="orders.php" class="btn btn-outline-secondary w-100 mb-2">My Order History</a>
      <a href="logout.php" class="btn btn-outline-secondary w-100">Sign Out</a>
    <?php else: ?>
      <a href="login.php" class="btn btn-primary w-100 mb-2">Sign In</a>
      <a href="register.php" class="btn btn-outline-secondary w-100">Create Account</a>
    <?php endif; ?>

    <div class="mt-3 text-center fs-xs text-muted">
      Asoro Bus Stop, Ekhuan Rd, Benin City
    </div>
  </div>
</div>
