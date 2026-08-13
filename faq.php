<?php
/**
 * Madam 3 Kitchen - FAQs Page
 */
$pageTitle = 'Frequently Asked Questions — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';
?>

<div class="py-5" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFEED9 100%); border-bottom: 1px solid var(--border-color);">
  <div class="container text-center max-w-700 mx-auto">
    <span class="badge badge-warning mb-2">Got Questions?</span>
    <h1 class="h2 mb-2">Frequently Asked Questions</h1>
    <p class="text-muted fs-sm mb-0">Learn about our Benin City delivery zones, payment options, and kitchen operations.</p>
  </div>
</div>

<div class="container py-5 max-w-800 mx-auto">
  <div class="d-flex flex-column gap-3">
    <div class="card p-4 shadow-sm">
      <h4 class="fs-base fw-bold text-secondary mb-2">📍 Where is Madam 3 Kitchen located?</h4>
      <p class="text-muted fs-sm mb-0">Our kitchen and restaurant is located at <strong>Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria</strong>. We offer both dine-in and fast doorstep delivery.</p>
    </div>

    <div class="card p-4 shadow-sm">
      <h4 class="fs-base fw-bold text-secondary mb-2">🛵 Which areas in Benin City do you deliver to?</h4>
      <p class="text-muted fs-sm mb-0">We deliver across Asoro, Ekhuan Road, GRA, Boundary Road, Ring Road, King Square, Airport Road, Ugbowo (UNIBEN Campus), Sapele Road, Ikpoba Hill, New Benin, Aduwawa, and Upper Sakponba.</p>
    </div>

    <div class="card p-4 shadow-sm">
      <h4 class="fs-base fw-bold text-secondary mb-2">⏱️ How long does food delivery take?</h4>
      <p class="text-muted fs-sm mb-0">Most orders are prepared fresh and delivered within <strong>25 to 45 minutes</strong> depending on your delivery zone and traffic conditions.</p>
    </div>

    <div class="card p-4 shadow-sm">
      <h4 class="fs-base fw-bold text-secondary mb-2">💳 What payment methods do you accept?</h4>
      <p class="text-muted fs-sm mb-0">We accept Debit Cards (Mastercard, Visa, Verve via Paystack), Direct Bank Transfers to our Moniepoint account, and Cash / POS on Delivery.</p>
    </div>

    <div class="card p-4 shadow-sm">
      <h4 class="fs-base fw-bold text-secondary mb-2">🎉 Do you cater for large parties and office events?</h4>
      <p class="text-muted fs-sm mb-0">Yes! We provide bulk food catering, family party trays, and corporate lunch packs. Contact us on WhatsApp or call <strong><?= RESTAURANT_PHONE_DISPLAY ?></strong> for custom event orders.</p>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
