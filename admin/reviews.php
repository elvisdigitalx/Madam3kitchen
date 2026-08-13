<?php
/**
 * Madam 3 Kitchen - Reviews Moderation
 */
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$action = $_GET['action'] ?? 'list';
$id = intval($_GET['id'] ?? 0);

if ($id > 0) {
    if ($action === 'approve') {
        $db->prepare("UPDATE reviews SET is_approved = 1 WHERE id = ?")->execute([$id]);
        header("Location: reviews.php");
        exit;
    } elseif ($action === 'unapprove') {
        $db->prepare("UPDATE reviews SET is_approved = 0 WHERE id = ?")->execute([$id]);
        header("Location: reviews.php");
        exit;
    } elseif ($action === 'delete') {
        $db->prepare("DELETE FROM reviews WHERE id = ?")->execute([$id]);
        header("Location: reviews.php");
        exit;
    }
}

$reviews = $db->query("SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.id DESC")->fetchAll();

$pageTitle = 'Customer Reviews Moderation';
require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
  <div>
    <h1 class="h4 fw-extrabold text-secondary mb-0">Customer Reviews & Ratings</h1>
    <p class="text-muted fs-xs mb-0">Moderate public testimonials shown on the Madam 3 Kitchen website</p>
  </div>
</div>

<div class="card shadow-sm p-4">
  <?php if (empty($reviews)): ?>
    <div class="text-center py-4 text-muted">No reviews submitted yet.</div>
  <?php else: ?>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Dish (If applicable)</th>
            <th>Rating</th>
            <th>Review Comment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($reviews as $rev): ?>
            <tr>
              <td><strong><?= sanitize($rev['customer_name']) ?></strong></td>
              <td class="fs-sm"><?= sanitize($rev['product_name'] ?? 'General Restaurant') ?></td>
              <td>
                <span class="text-gold fw-bold">
                  <?= str_repeat('★', $rev['rating']) ?>
                </span>
                <span class="fs-xs text-muted">(<?= $rev['rating'] ?>/5)</span>
              </td>
              <td class="fs-sm" style="max-width: 320px;">
                "<?= sanitize($rev['comment']) ?>"
                <div class="fs-xs text-muted"><?= date('M d, Y', strtotime($rev['created_at'])) ?></div>
              </td>
              <td>
                <span class="badge <?= $rev['is_approved'] ? 'badge-success' : 'badge-warning' ?>">
                  <?= $rev['is_approved'] ? 'Approved / Visible' : 'Pending Moderation' ?>
                </span>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <?php if ($rev['is_approved']): ?>
                    <a href="reviews.php?action=unapprove&id=<?= $rev['id'] ?>" class="btn btn-outline-warning btn-sm">Hide</a>
                  <?php else: ?>
                    <a href="reviews.php?action=approve&id=<?= $rev['id'] ?>" class="btn btn-outline-success btn-sm">Approve</a>
                  <?php endif; ?>
                  <a href="reviews.php?action=delete&id=<?= $rev['id'] ?>" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this review?')">Delete</a>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
