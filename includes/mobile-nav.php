<?php
/**
 * Madam 3 Kitchen - Mobile Bottom Navigation Bar
 */
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<div class="mobile-bottom-nav">
  <a href="index.php" class="mobile-nav-item <?= $currentPage === 'index.php' ? 'active' : '' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    <span>Home</span>
  </a>

  <a href="menu.php" class="mobile-nav-item <?= $currentPage === 'menu.php' ? 'active' : '' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
    <span>Menu</span>
  </a>

  <a href="cart.php" class="mobile-nav-item <?= $currentPage === 'cart.php' ? 'active' : '' ?>">
    <div style="position: relative; display: inline-flex;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
      </svg>
      <span class="mobile-nav-badge" style="display:none;">0</span>
    </div>
    <span>Cart</span>
  </a>

  <a href="track-order.php" class="mobile-nav-item <?= $currentPage === 'track-order.php' || $currentPage === 'orders.php' ? 'active' : '' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>
    </svg>
    <span>Orders</span>
  </a>

  <a href="<?= isLoggedIn() ? 'account.php' : 'login.php' ?>" class="mobile-nav-item <?= in_array($currentPage, ['login.php', 'register.php', 'account.php']) ? 'active' : '' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
    <span>Account</span>
  </a>
</div>
