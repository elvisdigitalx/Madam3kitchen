<?php
/**
 * Madam 3 Kitchen - Admin Activity Audit Trail
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$logs = $db->query("SELECT * FROM admin_activity_logs ORDER BY id DESC LIMIT 100")->fetchAll();

$pageTitle = 'Admin Audit Logs';
require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
  <div>
    <h1 class="h4 fw-extrabold text-secondary mb-0">Admin Activity Logs</h1>
    <p class="text-muted fs-xs mb-0">System audit trail of administrative changes, logins, and status updates</p>
  </div>
</div>

<div class="card shadow-sm p-4">
  <div class="table-responsive">
    <table class="table align-middle">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Admin User</th>
          <th>Action Description</th>
          <th>IP Address</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($logs)): ?>
          <tr><td colspan="4" class="text-center text-muted">No logs recorded yet.</td></tr>
        <?php else: ?>
          <?php foreach ($logs as $log): ?>
            <tr>
              <td class="fs-xs"><?= date('M d, Y h:i:s A', strtotime($log['created_at'])) ?></td>
              <td><strong><?= sanitize($log['admin_user']) ?></strong></td>
              <td class="fs-sm"><?= sanitize($log['action']) ?></td>
              <td class="fs-xs text-muted"><?= sanitize($log['ip_address'] ?? '127.0.0.1') ?></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
