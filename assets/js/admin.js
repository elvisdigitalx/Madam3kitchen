/**
 * Madam 3 Kitchen - Admin Management Dashboard Controller
 */

let lastKnownOrderCount = null;

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle
  const toggleBtn = document.querySelector('.admin-mobile-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  // Sound Toggle Button
  const soundBtn = document.getElementById('admin-sound-toggle');
  if (soundBtn && window.orderNotifier) {
    const updateSoundBtn = () => {
      if (window.orderNotifier.isMuted) {
        soundBtn.innerHTML = '🔇 Sound Off';
        soundBtn.classList.add('muted');
      } else {
        soundBtn.innerHTML = '🔊 Sound On';
        soundBtn.classList.remove('muted');
      }
    };
    updateSoundBtn();

    soundBtn.addEventListener('click', () => {
      window.orderNotifier.toggleMute();
      updateSoundBtn();
      if (!window.orderNotifier.isMuted) {
        window.orderNotifier.playOrderChime();
      }
    });
  }

  // Live Order Poller & Notification Engine
  function pollLiveOrders() {
    fetch('api/live-notifications.php')
      .then(res => res.json())
      .then(data => {
        if (data && data.pending_count !== undefined) {
          const badge = document.getElementById('pending-order-badge');
          if (badge) {
            badge.textContent = data.pending_count;
            badge.style.display = data.pending_count > 0 ? 'inline-flex' : 'none';
          }

          // Check if new order arrived
          if (lastKnownOrderCount !== null && data.pending_count > lastKnownOrderCount) {
            // New order received!
            if (window.orderNotifier) {
              window.orderNotifier.playOrderChime();
            }
            if (typeof showToast === 'function') {
              showToast(`🔔 NEW ORDER: Order #${data.latest_order_number || ''} just arrived!`, 'warning');
            }
          }
          lastKnownOrderCount = data.pending_count;
        }
      })
      .catch(e => console.log('Live poller idle'));
  }

  // Poll every 15 seconds
  setInterval(pollLiveOrders, 15000);
  // Initial poll
  setTimeout(pollLiveOrders, 1000);
});

// Quick Order Status Updater
async function updateOrderStatus(orderId, newStatus) {
  if (!confirm(`Change order #${orderId} status to "${newStatus}"?`)) return;

  try {
    const response = await fetch('api/orders.php?action=update_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status: newStatus })
    });
    const data = await response.json();
    if (data.success) {
      if (typeof showToast === 'function') {
        showToast(`Order status updated to ${newStatus}!`, 'success');
      }
      setTimeout(() => location.reload(), 600);
    } else {
      alert(data.message || 'Failed to update order status.');
    }
  } catch (err) {
    console.error('Status update error:', err);
    location.reload();
  }
}
