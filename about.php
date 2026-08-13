<?php
/**
 * Madam 3 Kitchen - About Us Page
 */
$pageTitle = 'About Us — Madam 3 Kitchen Nigerian Cuisine Benin City';
$pageDescription = 'Discover the story behind Madam 3 Kitchen, our culinary heritage at No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, and our passion for authentic Nigerian food.';
require_once __DIR__ . '/includes/header.php';
?>

<div class="py-5" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFEED9 100%); border-bottom: 1px solid var(--border-color);">
  <div class="container text-center max-w-700 mx-auto">
    <span class="badge badge-warning mb-2">Our Culinary Heritage</span>
    <h1 class="h2 mb-3">About Madam 3 Kitchen</h1>
    <p class="text-muted fs-base mb-0">
      Celebrating rich Edo traditions and authentic Nigerian gastronomy with every pot we stir.
    </p>
  </div>
</div>

<div class="container py-5">
  <!-- Story Section -->
  <div class="row align-items-center g-5 mb-5">
    <div class="col-12 col-lg-6">
      <img src="assets/images/hero-banner.jpg" alt="Madam 3 Kitchen Story" class="img-fluid rounded-xl shadow-md" style="width: 100%; border-radius: var(--radius-xl);">
    </div>

    <div class="col-12 col-lg-6">
      <span class="badge badge-primary mb-2">Since Benin City</span>
      <h2 class="mb-3">Delicious Nigerian Meals, Made With Love.</h2>
      <p class="text-muted" style="line-height: 1.7;">
        Located at the vibrant <strong>No. 3 Asoro Bus Stop, Ekehuan Road, Benin City</strong>, Madam 3 Kitchen was founded on a simple yet unyielding philosophy: Nigerian food should be rich, authentic, hygienic, and affordable.
      </p>
      <p class="text-muted" style="line-height: 1.7;">
        Whether you are craving the deep smoky flavor of firewood party Jollof rice, traditional Delta/Edo Banga palm nut soup, velvety pounded yam with assorted meat Egusi soup, or sizzling peppered Asun, our master chefs cook each recipe with age-old secrets and the freshest ingredients sourced daily from local farmers in Edo State.
      </p>

      <div class="row g-3 mt-2">
        <div class="col-6">
          <div class="p-3 bg-white border rounded">
            <h3 class="h4 text-primary fw-extrabold mb-0">100%</h3>
            <div class="fs-xs text-muted">Fresh Daily Preparation</div>
          </div>
        </div>
        <div class="col-6">
          <div class="p-3 bg-white border rounded">
            <h3 class="h4 text-primary fw-extrabold mb-0">15,000+</h3>
            <div class="fs-xs text-muted">Satisfied Meals Delivered</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Core Values -->
  <div class="text-center max-w-700 mx-auto my-5">
    <span class="badge badge-warning mb-2">Our Standards</span>
    <h2>The Madam 3 Pillars</h2>
  </div>

  <div class="row g-4 mb-5">
    <div class="col-12 col-md-4">
      <div class="feature-card">
        <div class="feature-icon-wrap">🍲</div>
        <h4>Authentic Flavors</h4>
        <p class="text-muted fs-sm">We never compromise on traditional recipes. Every spice blend is curated for authentic Nigerian comfort.</p>
      </div>
    </div>

    <div class="col-12 col-md-4">
      <div class="feature-card">
        <div class="feature-icon-wrap">🧼</div>
        <h4>Impeccable Hygiene</h4>
        <p class="text-muted fs-sm">Strict food safety guidelines, pristine prep environments, and premium tamper-evident packaging.</p>
      </div>
    </div>

    <div class="col-12 col-md-4">
      <div class="feature-card">
        <div class="feature-icon-wrap">⚡</div>
        <h4>Speedy Delivery</h4>
        <p class="text-muted fs-sm">Hot insulated delivery across Benin City: No. 3 Asoro, Ekehuan Road, GRA, Ugbowo, Ring Road, and environs.</p>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
