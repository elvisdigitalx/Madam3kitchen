<?php
/**
 * Madam 3 Kitchen - Header & Meta Layout
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/functions.php';

$pageTitle = $pageTitle ?? 'Madam 3 Kitchen — Authentic Nigerian Restaurant & Food Delivery in Benin City';
$pageDescription = $pageDescription ?? 'Delicious Nigerian meals freshly prepared with love in Benin City. Fast delivery across Asoro, Ekhuan Road, GRA, Ugbowo, and environs. Order online today!';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title><?= sanitize($pageTitle) ?></title>
  <meta name="description" content="<?= sanitize($pageDescription) ?>">
  <meta name="keywords" content="Madam 3 Kitchen, Nigerian food Benin City, food delivery Benin City, Jollof rice Benin City, Egusi soup, Asoro bus stop, Ekhuan Road, Edo state restaurant">
  <meta name="author" content="Madam 3 Kitchen">
  <meta name="theme-color" content="#FF6B00">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="restaurant.restaurant">
  <meta property="og:title" content="<?= sanitize($pageTitle) ?>">
  <meta property="og:description" content="<?= sanitize($pageDescription) ?>">
  <meta property="og:image" content="<?= BASE_URL ?>/assets/images/hero-banner.jpg">
  <meta property="og:url" content="<?= BASE_URL ?>">

  <!-- Schema.org Restaurant Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Madam 3 Kitchen",
    "image": "<?= BASE_URL ?>/assets/images/hero-banner.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Asoro Bus Stop, Ekhuan Road",
      "addressLocality": "Benin City",
      "addressRegion": "Edo State",
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "6.3350",
      "longitude": "5.6037"
    },
    "telephone": "<?= RESTAURANT_PHONE ?>",
    "servesCuisine": "Nigerian",
    "priceRange": "₦₦",
    "openingHours": "Mo-Su 08:00-22:00"
  }
  </script>

  <!-- Google Fonts Preconnect & Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Core Stylesheets -->
  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/styles.css">
  <link rel="manifest" href="manifest.json">
</head>
<body>
<?php require_once __DIR__ . '/navbar.php'; ?>
