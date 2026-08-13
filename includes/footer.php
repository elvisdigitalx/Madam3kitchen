<?php
/**
 * Madam 3 Kitchen - Footer Component
 */
?>
<!-- Footer -->
<footer class="site-footer">
  <div class="container">
    <div class="row g-4">
      <!-- Col 1: Brand & About -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="mb-3">
          <img src="assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 48px; filter: brightness(0) invert(1);">
        </div>
        <p style="font-size: 0.9rem; line-height: 1.6;">
          Welcome to <strong>Madam 3 Kitchen</strong>, your home for authentic Nigerian delicacies in Benin City. From party Jollof rice to traditional soups and tender peppered proteins, we bring the best taste to your doorstep.
        </p>
        <div class="d-flex align-items-center gap-2 mt-3">
          <span class="badge badge-warning">📍 No. 3 Asoro Bus Stop, Ekehuan Road</span>
        </div>
      </div>

      <!-- Col 2: Quick Links -->
      <div class="col-6 col-md-3 col-lg-2">
        <h5>Quick Links</h5>
        <ul class="footer-links">
          <li><a href="index.php">Home</a></li>
          <li><a href="menu.php">Full Menu</a></li>
          <li><a href="offers.php">Today's Deals</a></li>
          <li><a href="track-order.php">Track Order</a></li>
          <li><a href="about.php">About Madam 3</a></li>
          <li><a href="contact.php">Contact Us</a></li>
          <li><a href="faq.php">FAQs</a></li>
        </ul>
      </div>

      <!-- Col 3: Legal & Delivery Areas -->
      <div class="col-6 col-md-3 col-lg-3">
        <h5>Delivery Areas</h5>
        <ul class="footer-links">
          <li><a href="menu.php">No. 3 Asoro / Ekehuan Road</a></li>
          <li><a href="menu.php">GRA & Boundary Rd</a></li>
          <li><a href="menu.php">Ugbowo / UNIBEN</a></li>
          <li><a href="menu.php">Ring Road & City Center</a></li>
          <li><a href="menu.php">Sapele Road & Limit</a></li>
          <li><a href="menu.php">Airport Road</a></li>
          <li><a href="privacy.php">Privacy Policy</a></li>
          <li><a href="terms.php">Terms & Conditions</a></li>
        </ul>
      </div>

      <!-- Col 4: Contact & Operating Hours -->
      <div class="col-12 col-md-6 col-lg-3">
        <h5>Get in Touch</h5>
        <div class="footer-contact-item">
          <span>📍</span>
          <div>No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State, Nigeria</div>
        </div>
        <div class="footer-contact-item">
          <span>📞</span>
          <div><a href="tel:<?= RESTAURANT_PHONE ?>" style="color: inherit;"><?= RESTAURANT_PHONE_DISPLAY ?></a></div>
        </div>
        <div class="footer-contact-item">
          <span>💬</span>
          <div><a href="https://wa.me/<?= RESTAURANT_WHATSAPP ?>" target="_blank" style="color: inherit;">WhatsApp Orders</a></div>
        </div>
        <div class="footer-contact-item">
          <span>🕒</span>
          <div>Mon – Sun: 8:00 AM – 10:00 PM</div>
        </div>
      </div>
    </div>

    <!-- Bottom Copyright -->
    <div class="footer-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        &copy; <?= date('Y') ?> <strong>Madam 3 Kitchen</strong>. All rights reserved. Made with love in Benin City.
      </div>
      <div>
        <a href="admin/login.php" style="color: #8D6E63; font-size: 0.75rem; text-decoration: none;">Admin Access</a>
      </div>
    </div>
  </div>
</footer>

<!-- Floating WhatsApp Button -->
<?php require_once __DIR__ . '/whatsapp-btn.php'; ?>

<!-- Mobile Bottom Navigation -->
<?php require_once __DIR__ . '/mobile-nav.php'; ?>

<!-- Global Scripts -->
<script src="assets/js/app.js"></script>
</body>
</html>
