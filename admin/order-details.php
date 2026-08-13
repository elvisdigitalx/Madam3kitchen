<?php
/**
 * Madam 3 Kitchen - Single Order Management Details
 */
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/functions.php';

requireAdmin();
$db = Database::getConnection();

$id = intval($_GET['id'] ?? 0);
$stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$id]);
$order = $stmt->fetch();

if (!$order) {
    header("Location: orders.php");
    exit;
}

// Fetch items
$itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
$itemStmt->execute([$id]);
$items = $itemStmt->fetchAll();

foreach ($items as &$item) {
    $eStmt = $db->prepare("SELECT * FROM order_item_extras WHERE order_item_id = ?");
    $eStmt->execute([$item['id']]);
    $item['extras'] = $eStmt->fetchAll();
}

// Fetch status history
$hStmt = $db->prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC");
$hStmt->execute([$id]);
$history = $hStmt->fetchAll();

$pageTitle = 'Order #' . $order['order_number'];
require_once __DIR__ . '/includes/admin-header.php';
?>

<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
  <div>
    <a href="orders.php" class="fs-sm text-muted">&larr; Back to Orders</a>
    <h1 class="h3 fw-extrabold text-secondary mb-0">Order: <?= sanitize($order['order_number']) ?></h1>
    <div class="fs-xs text-muted">Placed on <?= date('F d, Y h:i A', strtotime($order['created_at'])) ?></div>
  </div>

  <div class="d-flex gap-2">
    <a href="receipt.php?id=<?= $order['id'] ?>" target="_blank" class="btn btn-secondary btn-sm">
      🖨️ Print Kitchen Receipt
    </a>
    <a href="<?= getWhatsAppOrderLink($order, $items) ?>" target="_blank" class="btn btn-whatsapp btn-sm">
      💬 Send WhatsApp to Customer
    </a>
  </div>
</div>

<div class="row g-4">
  <!-- Left: Ordered Items & Instructions -->
  <div class="col-12 col-lg-8">
    <div class="card p-4 shadow-sm mb-4">
      <h3 class="h5 fw-extrabold text-secondary mb-3">Order Items</h3>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Item Details</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th class="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($items as $item): ?>
              <tr>
                <td>
                  <strong><?= sanitize($item['product_name']) ?></strong>
                  <?php if (!empty($item['extras'])): ?>
                    <div class="fs-xs text-muted">
                      Extras: <?= implode(', ', array_map(function($e) { return $e['extra_name'] . ' (+'.formatPrice($e['extra_price']).')'; }, $item['extras'])) ?>
                    </div>
                  <?php endif; ?>
                  <?php if (!empty($item['instructions'])): ?>
                    <div class="fs-xs text-warning fst-italic">Note: <?= sanitize($item['instructions']) ?></div>
                  <?php endif; ?>
                </td>
                <td><?= formatPrice($item['unit_price']) ?></td>
                <td><span class="badge badge-secondary"><?= $item['quantity'] ?></span></td>
                <td class="text-end fw-bold"><?= formatPrice($item['subtotal']) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>

      <!-- Financial Calculation Summary -->
      <div class="row justify-content-end mt-3">
        <div class="col-12 col-sm-6">
          <div class="d-flex justify-content-between mb-2 fs-sm">
            <span class="text-muted">Food Subtotal:</span>
            <strong><?= formatPrice($order['subtotal']) ?></strong>
          </div>
          <div class="d-flex justify-content-between mb-2 fs-sm">
            <span class="text-muted">Delivery Fee (<?= sanitize($order['zone_name'] ?: 'Benin City') ?>):</span>
            <strong><?= formatPrice($order['delivery_fee']) ?></strong>
          </div>
          <?php if ($order['discount_amount'] > 0): ?>
            <div class="d-flex justify-content-between mb-2 fs-sm text-danger">
              <span>Promo Discount (<?= sanitize($order['promo_code']) ?>):</span>
              <strong>- <?= formatPrice($order['discount_amount']) ?></strong>
            </div>
          <?php endif; ?>
          <hr>
          <div class="d-flex justify-content-between fs-lg fw-extrabold text-secondary">
            <span>Grand Total:</span>
            <span class="text-primary"><?= formatPrice($order['grand_total']) ?></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Status History Audit Trail -->
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">Order Status History & Audit Log</h3>
      <div class="d-flex flex-column gap-2">
        <?php foreach ($history as $h): ?>
          <div class="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
            <div>
              <span class="badge badge-primary me-2"><?= sanitize($h['status']) ?></span>
              <span class="fs-sm"><?= sanitize($h['notes'] ?: 'No notes') ?></span>
              <div class="fs-xs text-muted">Changed by: <?= sanitize($h['changed_by']) ?></div>
            </div>
            <div class="fs-xs text-muted"><?= date('M d, h:i A', strtotime($h['created_at'])) ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>

  <!-- Right: Status Changer & Customer Info -->
  <div class="col-12 col-lg-4">
    <!-- Status Changer Card -->
    <div class="card p-4 shadow-sm mb-4">
      <h3 class="h5 fw-extrabold text-secondary mb-3">Update Order Status</h3>

      <div class="form-group mb-3">
        <label class="form-label">Current Status</label>
        <select id="update-order-status-select" class="form-select fw-bold">
          <option value="Pending" <?= $order['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
          <option value="Payment Confirmed" <?= $order['status'] === 'Payment Confirmed' ? 'selected' : '' ?>>Payment Confirmed</option>
          <option value="Confirmed" <?= $order['status'] === 'Confirmed' ? 'selected' : '' ?>>Confirmed</option>
          <option value="Preparing" <?= $order['status'] === 'Preparing' ? 'selected' : '' ?>>Preparing</option>
          <option value="Ready" <?= $order['status'] === 'Ready' ? 'selected' : '' ?>>Ready</option>
          <option value="Out for Delivery" <?= $order['status'] === 'Out for Delivery' ? 'selected' : '' ?>>Out for Delivery</option>
          <option value="Delivered" <?= $order['status'] === 'Delivered' ? 'selected' : '' ?>>Delivered</option>
          <option value="Cancelled" <?= $order['status'] === 'Cancelled' ? 'selected' : '' ?>>Cancelled</option>
          <option value="Rejected" <?= $order['status'] === 'Rejected' ? 'selected' : '' ?>>Rejected</option>
        </select>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Status Notes</label>
        <input type="text" id="update-order-notes" class="form-control" placeholder="e.g. Rider dispatched with bag #3">
      </div>

      <button type="button" class="btn btn-primary w-100" onclick="saveStatusChange(<?= $order['id'] ?>)">
        Update Status
      </button>
    </div>

    <!-- Customer Information Card -->
    <div class="card p-4 shadow-sm">
      <h3 class="h5 fw-extrabold text-secondary mb-3">Customer Details</h3>
      <div class="d-flex flex-column gap-2 fs-sm">
        <div><strong>Name:</strong> <?= sanitize($order['customer_name']) ?></div>
        <div><strong>Phone:</strong> <a href="tel:<?= sanitize($order['phone']) ?>"><?= sanitize($order['phone']) ?></a></div>
        <div><strong>WhatsApp:</strong> <a href="https://wa.me/<?= sanitize($order['whatsapp']) ?>" target="_blank"><?= sanitize($order['whatsapp'] ?: $order['phone']) ?></a></div>
        <?php if ($order['email']): ?>
          <div><strong>Email:</strong> <?= sanitize($order['email']) ?></div>
        <?php endif; ?>
        <hr class="my-2">
        <div><strong>Delivery Zone:</strong> <?= sanitize($order['zone_name'] ?: 'Benin City') ?></div>
        <div><strong>Street Address:</strong> <?= sanitize($order['delivery_address']) ?></div>
        <div><strong>Landmark:</strong> <?= sanitize($order['landmark'] ?: 'N/A') ?></div>
        <?php if ($order['instructions']): ?>
          <div class="p-2 bg-warning bg-opacity-10 border rounded mt-2">
            <strong>Kitchen/Delivery Note:</strong><br>
            <?= sanitize($order['instructions']) ?>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<script>
async function saveStatusChange(orderId) {
  const select = document.getElementById('update-order-status-select');
  const notesInput = document.getElementById('update-order-notes');
  const status = select.value;
  const notes = notesInput.value.trim() || `Status updated to ${status}`;

  try {
    const response = await fetch('../api/orders.php?action=update_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status: status, notes: notes })
    });
    const data = await response.json();
    if (data.success) {
      showToast(data.message, 'success');
      setTimeout(() => location.reload(), 500);
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (e) {
    location.reload();
  }
}
</script>

<?php require_once __DIR__ . '/includes/admin-footer.php'; ?>
