<?php
/**
 * Madam 3 Kitchen - Admin Sidebar Navigation
 */
$currentAdminPage = basename($_SERVER['PHP_SELF']);
?>
<aside class="admin-sidebar">
  <div class="admin-sidebar-header">
    <img src="../assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 38px; filter: brightness(0) invert(1);">
  </div>

  <ul class="admin-nav">
    <li class="admin-nav-item <?= $currentAdminPage === 'index.php' ? 'active' : '' ?>">
      <a href="index.php">
        <span>📊</span>
        <span>Dashboard</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'orders.php' || $currentAdminPage === 'order-details.php' ? 'active' : '' ?>">
      <a href="orders.php">
        <span>📦</span>
        <span>Orders</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'products.php' ? 'active' : '' ?>">
      <a href="products.php">
        <span>🍲</span>
        <span>Menu & Meals</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'categories.php' ? 'active' : '' ?>">
      <a href="categories.php">
        <span>📑</span>
        <span>Categories</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'delivery-zones.php' ? 'active' : '' ?>">
      <a href="delivery-zones.php">
        <span>🛵</span>
        <span>Delivery Zones</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'promo-codes.php' ? 'active' : '' ?>">
      <a href="promo-codes.php">
        <span>🎟️</span>
        <span>Promo Codes</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'customers.php' ? 'active' : '' ?>">
      <a href="customers.php">
        <span>👥</span>
        <span>Customers</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'reviews.php' ? 'active' : '' ?>">
      <a href="reviews.php">
        <span>⭐</span>
        <span>Reviews</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'reports.php' ? 'active' : '' ?>">
      <a href="reports.php">
        <span>📈</span>
        <span>Sales Reports</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'messages.php' ? 'active' : '' ?>">
      <a href="messages.php">
        <span>✉️</span>
        <span>Messages</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'settings.php' ? 'active' : '' ?>">
      <a href="settings.php">
        <span>⚙️</span>
        <span>Settings</span>
      </a>
    </li>

    <li class="admin-nav-item <?= $currentAdminPage === 'activity-logs.php' ? 'active' : '' ?>">
      <a href="activity-logs.php">
        <span>📜</span>
        <span>Audit Logs</span>
      </a>
    </li>

    <li class="admin-nav-item mt-auto border-top pt-2">
      <a href="logout.php" style="color: #EF5350;">
        <span>🚪</span>
        <span>Sign Out</span>
      </a>
    </li>
  </ul>
</aside>
