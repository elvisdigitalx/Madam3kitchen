<?php
/**
 * Madam 3 Kitchen - Customer Inquiries & Messages
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$action = $_GET['action'] ?? 'list';
$id = intval($_GET['id'] ?? 0);

if ($id > 0 && $action === 'delete') {
    $db->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([$id]);
    header("Location: messages.php");
    exit;
}

if ($id > 0 && $action === 'mark_read') {
    $db->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?")->execute([$id]);
    header("Location: messages.php");
    exit;
}

$messages = $db->query("SELECT * FROM contact_messages ORDER BY id DESC")->fetchAll();

$pageTitle = 'Customer Inquiries & Messages';
require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
  <div>
    <h1 class="h4 fw-extrabold text-secondary mb-0">Customer Inquiries Inbox</h1>
    <p class="text-muted fs-xs mb-0">Messages submitted via the contact form on the Madam 3 Kitchen website</p>
  </div>
</div>

<div class="card shadow-sm p-4">
  <?php if (empty($messages)): ?>
    <div class="text-center py-4 text-muted">No messages received yet.</div>
  <?php else: ?>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($messages as $msg): ?>
            <tr class="<?= $msg['is_read'] ? '' : 'table-warning' ?>">
              <td class="fs-xs"><?= date('M d, h:i A', strtotime($msg['created_at'])) ?></td>
              <td><strong><?= sanitize($msg['name']) ?></strong></td>
              <td class="fs-sm">
                <div>📞 <a href="tel:<?= sanitize($msg['phone']) ?>"><?= sanitize($msg['phone']) ?></a></div>
                <?php if ($msg['email']): ?>
                  <div class="fs-xs text-muted">✉️ <?= sanitize($msg['email']) ?></div>
                <?php endif; ?>
              </td>
              <td><span class="badge badge-secondary"><?= sanitize($msg['subject'] ?: 'Inquiry') ?></span></td>
              <td class="fs-sm" style="max-width: 320px;"><?= nl2br(sanitize($msg['message'])) ?></td>
              <td>
                <div class="d-flex gap-1">
                  <?php if (!$msg['is_read']): ?>
                    <a href="messages.php?action=mark_read&id=<?= $msg['id'] ?>" class="btn btn-outline-success btn-sm">Mark Read</a>
                  <?php endif; ?>
                  <a href="https://wa.me/234<?= ltrim(preg_replace('/[^0-9]/', '', $msg['phone']), '0') ?>?text=<?= urlencode("Hello {$msg['name']}, regarding your inquiry to Madam 3 Kitchen:") ?>" target="_blank" class="btn btn-whatsapp btn-sm">WhatsApp</a>
                  <a href="messages.php?action=delete&id=<?= $msg['id'] ?>" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this message?')">Delete</a>
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
