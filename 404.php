<?php
/**
 * Madam 3 Kitchen - 404 Not Found Page
 */
http_response_code(404);
$pageTitle = 'Page Not Found — Madam 3 Kitchen Benin City';
require_once __DIR__ . '/includes/header.php';
?>
<div class="container py-5 text-center max-w-600 mx-auto my-5">
  <div style="font-size: 5rem;" class="mb-3">🍲</div>
  <h1 class="h2 fw-extrabold text-secondary mb-2">404 — Page Not Found</h1>
  <p class="text-muted fs-base mb-4">
    Oops! The page or delicious recipe you are looking for seems to have moved or does not exist.
  </p>
  <div class="d-flex justify-content-center gap-3">
    <a href="index.php" class="btn btn-primary">Go to Homepage</a>
    <a href="menu.php" class="btn btn-outline-secondary">Browse Food Menu</a>
  </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
