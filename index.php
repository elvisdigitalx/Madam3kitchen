<?php
/**
 * Madam 3 Kitchen - Homepage
 * Authentic Nigerian Restaurant & Delivery in Benin City
 */
$pageTitle = 'Madam 3 Kitchen — Delicious Nigerian Meals in Benin City';
require_once __DIR__ . '/includes/header.php';

$db = Database::getConnection();

// Fetch Categories
$catStmt = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC");
$categories = $catStmt->fetchAll();

// Fetch Popular Meals (6-8 items)
$popStmt = $db->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_popular = 1 AND p.is_available = 1 ORDER BY p.id ASC LIMIT 8");
$popularProducts = $popStmt->fetchAll();

// Fetch Today's Specials (Discounted items)
$specialsStmt = $db->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.discount_price IS NOT NULL AND p.is_available = 1 ORDER BY p.id ASC LIMIT 4");
$specials = $specialsStmt->fetchAll();

// Fetch Dynamic Reviews
$revStmt = $db->query("SELECT * FROM reviews WHERE is_approved = 1 ORDER BY id DESC LIMIT 4");
$reviews = $revStmt->fetchAll();
?>

<!-- Hero Section -->
<section class="hero-section">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-12 col-lg-6">
        <div class="hero-badge">
          <span>👑 Authentic Nigerian Taste in Benin City</span>
        </div>
        <h1 class="hero-title">
          Delicious Nigerian Meals, <span class="highlight">Made With Love.</span>
        </h1>
        <p class="hero-subtitle">
          Freshly prepared meals from <strong>Madam 3 Kitchen</strong>, delivered hot and fresh to your doorstep across Benin City.
        </p>

        <div class="d-flex align-items-center flex-wrap gap-3 mb-4">
          <a href="menu.php" class="btn btn-primary btn-lg">
            🍛 Order Food Now
          </a>
          <a href="menu.php" class="btn btn-outline-secondary btn-lg">
            📜 View Menu
          </a>
        </div>

        <div class="hero-location-card">
          <div class="hero-location-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <div class="fw-bold fs-sm text-secondary">Our Kitchen Location</div>
            <div class="fs-xs text-muted">Asoro Bus Stop, Ekhuan Road, Benin City, Edo State</div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="hero-image-wrapper">
          <img src="assets/images/hero-banner.jpg" alt="Madam 3 Kitchen Nigerian Feast" class="hero-img-main">
          
          <div class="hero-floating-card top-right">
            <div style="font-size: 1.75rem;">⭐</div>
            <div>
              <div class="fw-extrabold fs-sm text-secondary">4.9 / 5.0 Rating</div>
              <div class="fs-xs text-muted">Over 1,200+ Happy Foodies</div>
            </div>
          </div>

          <div class="hero-floating-card bottom-left">
            <div style="font-size: 1.75rem;">⚡</div>
            <div>
              <div class="fw-extrabold fs-sm text-secondary">Fast Benin Delivery</div>
              <div class="fs-xs text-muted">25-45 mins average</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Food Categories Section -->
<section class="py-5 bg-white">
  <div class="container">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <span class="badge badge-primary mb-2">Explore Menu</span>
        <h2 class="mb-0">Food Categories</h2>
      </div>
      <a href="menu.php" class="btn btn-outline-primary btn-sm">View All Menu &rarr;</a>
    </div>

    <div class="categories-wrapper">
      <a href="menu.php" class="category-pill active">
        <span class="pill-icon">✨</span>
        <span>All Dishes</span>
      </a>
      <?php foreach ($categories as $cat): ?>
        <a href="menu.php?category=<?= urlencode($cat['slug']) ?>" class="category-pill">
          <span class="pill-icon"><?= $cat['icon'] ?></span>
          <span><?= sanitize($cat['name']) ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Popular Meals Section -->
<section class="py-5" style="background-color: var(--bg-cream);">
  <div class="container">
    <div class="text-center max-w-700 mx-auto mb-5">
      <span class="badge badge-warning mb-2">Customer Favorites</span>
      <h2>Most Popular Meals</h2>
      <p class="text-muted">Cooked fresh daily with the finest local ingredients and authentic Edo spices.</p>
    </div>

    <div class="row g-4">
      <?php foreach ($popularProducts as $prod): ?>
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="food-card">
            <div class="food-card-img-wrap">
              <img src="<?= $prod['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($prod['name']) ?>" class="food-card-img" loading="lazy">
              <div class="food-card-badges">
                <?php if ($prod['discount_price']): ?>
                  <span class="food-badge-discount">SAVE <?= formatPrice($prod['price'] - $prod['discount_price']) ?></span>
                <?php endif; ?>
                <?php if ($prod['is_popular']): ?>
                  <span class="food-badge-popular">🔥 Popular</span>
                <?php endif; ?>
              </div>
            </div>

            <div class="food-card-body">
              <div class="food-card-header">
                <h3 class="food-card-title">
                  <a href="food.php?id=<?= $prod['id'] ?>"><?= sanitize($prod['name']) ?></a>
                </h3>
                <span class="food-card-rating">★ <?= number_format($prod['rating'], 1) ?></span>
              </div>
              <p class="food-card-desc"><?= sanitize($prod['description']) ?></p>

              <div class="food-card-meta">
                <div class="food-card-price">
                  <?php if ($prod['discount_price']): ?>
                    <span class="price-main"><?= formatPrice($prod['discount_price']) ?></span>
                    <span class="price-old"><?= formatPrice($prod['price']) ?></span>
                  <?php else: ?>
                    <span class="price-main"><?= formatPrice($prod['price']) ?></span>
                  <?php endif; ?>
                </div>

                <a href="food.php?id=<?= $prod['id'] ?>" class="btn btn-primary btn-sm food-card-btn">
                  + Add to Cart
                </a>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>

    <div class="text-center mt-5">
      <a href="menu.php" class="btn btn-secondary btn-lg">Explore Full Menu (<?= count($popularProducts) ?>+ Meals)</a>
    </div>
  </div>
</section>

<!-- Today's Specials Section -->
<?php if (!empty($specials)): ?>
<section class="py-5" style="background: linear-gradient(135deg, #2E1A11 0%, #1A0F0A 100%); color: #FFF8F0;">
  <div class="container">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <span class="badge badge-warning mb-2">Limited Time Offers</span>
        <h2 class="text-white mb-0">Today's Hot Specials & Combos 🔥</h2>
      </div>
      <a href="offers.php" class="btn btn-outline-primary btn-sm text-white border-white">View All Deals &rarr;</a>
    </div>

    <div class="row g-4">
      <?php foreach ($specials as $special): ?>
        <div class="col-12 col-md-6">
          <div class="card p-3" style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #FFF8F0;">
            <div class="row g-3 align-items-center">
              <div class="col-4">
                <img src="<?= $special['image'] ?: 'assets/images/products/jollof-rice.jpg' ?>" alt="<?= sanitize($special['name']) ?>" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: var(--radius-md);" loading="lazy">
              </div>
              <div class="col-8">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge badge-danger">PROMO DISCOUNT</span>
                </div>
                <h4 class="text-white mb-1 fs-base fw-bold"><?= sanitize($special['name']) ?></h4>
                <p class="text-muted fs-xs mb-2" style="color: #D7CCC8 !important;"><?= sanitize($special['description']) ?></p>
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="fs-lg fw-extrabold text-gold"><?= formatPrice($special['discount_price']) ?></span>
                    <span class="fs-xs text-muted text-decoration-line-through ms-2" style="color: #A1887F !important;"><?= formatPrice($special['price']) ?></span>
                  </div>
                  <a href="food.php?id=<?= $special['id'] ?>" class="btn btn-primary btn-sm">Claim Deal</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- Why Choose Madam 3 Kitchen -->
<section class="py-5 bg-white">
  <div class="container">
    <div class="text-center max-w-700 mx-auto mb-5">
      <span class="badge badge-primary mb-2">Our Quality Promise</span>
      <h2>Why Choose Madam 3 Kitchen</h2>
      <p class="text-muted">We pride ourselves in delivering unforgettable culinary experiences across Edo State.</p>
    </div>

    <div class="row g-4">
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feature-card">
          <div class="feature-icon-wrap">🍲</div>
          <h4>Freshly Prepared</h4>
          <p class="text-muted fs-sm">Every order is cooked fresh upon receipt with authentic ingredients and zero artificial preservatives.</p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feature-card">
          <div class="feature-icon-wrap">🇳🇬</div>
          <h4>Authentic Nigerian Taste</h4>
          <p class="text-muted fs-sm">Rich party Jollof, traditional Edo Banga soup, silky Amala, and spicy Asun seasoned to perfection.</p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feature-card">
          <div class="feature-icon-wrap">⚡</div>
          <h4>Fast Benin Delivery</h4>
          <p class="text-muted fs-sm">Prompt dispatch to Asoro, Ekhuan Road, GRA, Ugbowo, Ring Road, and beyond in insulated heat bags.</p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feature-card">
          <div class="feature-icon-wrap">💰</div>
          <h4>Affordable Prices</h4>
          <p class="text-muted fs-sm">Generous portion sizes and executive lunch combos at wallet-friendly prices for everyone.</p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feature-card">
          <div class="feature-icon-wrap">🧼</div>
          <h4>Hygienic Preparation</h4>
          <p class="text-muted fs-sm">Strict sanitary standards, spotless kitchen facilities, and tamper-evident food packaging.</p>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-4">
        <div class="feature-card">
          <div class="feature-icon-wrap">📱</div>
          <h4>Easy Online Ordering</h4>
          <p class="text-muted fs-sm">Order in under 2 minutes from any phone, pay online or bank transfer, and track live updates.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- How It Works Section -->
<section class="py-5" style="background-color: var(--bg-warm);">
  <div class="container">
    <div class="text-center max-w-700 mx-auto mb-5">
      <span class="badge badge-warning mb-2">Step-By-Step</span>
      <h2>How It Works</h2>
      <p class="text-muted">Getting your favorite meal from Madam 3 Kitchen is as easy as 1-2-3.</p>
    </div>

    <div class="row g-4 text-center">
      <div class="col-6 col-md-4 col-lg-2">
        <div class="step-card">
          <div class="step-number">1</div>
          <h5 class="fs-sm fw-bold">Choose Meal</h5>
          <p class="text-muted fs-xs">Browse our Nigerian menu</p>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <div class="step-card">
          <div class="step-number">2</div>
          <h5 class="fs-sm fw-bold">Add to Cart</h5>
          <p class="text-muted fs-xs">Customize your extras</p>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <div class="step-card">
          <div class="step-number">3</div>
          <h5 class="fs-sm fw-bold">Delivery Info</h5>
          <p class="text-muted fs-xs">Enter Benin City address</p>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <div class="step-card">
          <div class="step-number">4</div>
          <h5 class="fs-sm fw-bold">Make Payment</h5>
          <p class="text-muted fs-xs">Card, transfer, or cash</p>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <div class="step-card">
          <div class="step-number">5</div>
          <h5 class="fs-sm fw-bold">We Prepare</h5>
          <p class="text-muted fs-xs">Cooked fresh with love</p>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <div class="step-card">
          <div class="step-number">6</div>
          <h5 class="fs-sm fw-bold">Receive Order</h5>
          <p class="text-muted fs-xs">Delivered hot to your door</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Customer Reviews Section -->
<section class="py-5 bg-white">
  <div class="container">
    <div class="text-center max-w-700 mx-auto mb-5">
      <span class="badge badge-primary mb-2">Testimonials</span>
      <h2>What Our Customers Say</h2>
      <p class="text-muted">Read genuine feedback from our valued customers across Benin City.</p>
    </div>

    <div class="row g-4">
      <?php foreach ($reviews as $rev): ?>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="review-card">
            <div class="review-stars">
              <?= str_repeat('★', $rev['rating']) ?><?= str_repeat('☆', 5 - $rev['rating']) ?>
            </div>
            <p class="review-text">"<?= sanitize($rev['comment']) ?>"</p>
            <div class="review-author">
              <div class="review-avatar">
                <?= strtoupper(substr($rev['customer_name'], 0, 1)) ?>
              </div>
              <div>
                <div class="fw-bold fs-sm text-secondary"><?= sanitize($rev['customer_name']) ?></div>
                <div class="fs-xs text-muted">Verified Customer</div>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Benin City Location & Google Maps Section -->
<section class="py-5" style="background-color: var(--bg-cream);">
  <div class="container">
    <div class="location-box">
      <div class="row align-items-center g-4">
        <div class="col-12 col-lg-5">
          <span class="badge badge-warning mb-3">📍 Visit Us</span>
          <h2 class="text-white mb-3">Madam 3 Kitchen in Benin City</h2>
          <p style="color: #D7CCC8;">
            Conveniently located at <strong>Asoro Bus Stop, Ekhuan Road</strong>. Dine in with family or order delivery to your residence, office, or event venue anywhere in Benin City.
          </p>

          <div class="d-flex flex-column gap-2 mb-4" style="color: #FFF8F0; font-size: 0.95rem;">
            <div>🏢 <strong>Address:</strong> Asoro Bus Stop, Ekhuan Road, Benin City</div>
            <div>📞 <strong>Phone:</strong> <a href="tel:<?= RESTAURANT_PHONE ?>" style="color: var(--accent);"><?= RESTAURANT_PHONE_DISPLAY ?></a></div>
            <div>🕒 <strong>Opening Hours:</strong> Monday – Sunday: 8:00 AM – 10:00 PM</div>
          </div>

          <div class="d-flex gap-3">
            <a href="https://maps.google.com/?q=Asoro+Bus+Stop+Ekhuan+Road+Benin+City" target="_blank" class="btn btn-primary">
              🗺️ Get Directions
            </a>
            <a href="menu.php" class="btn btn-outline-secondary text-white border-white">
              Order Online
            </a>
          </div>
        </div>

        <div class="col-12 col-lg-7">
          <div class="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.733568285517!2d5.6037!3d6.3350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d346b81c2f9d%3A0x7d87b32274488344!2sAsoro%20Bus%20Stop%2C%20Ekehuan%20Rd%2C%20Benin%20City!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade"
              title="Madam 3 Kitchen Google Map Location">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
