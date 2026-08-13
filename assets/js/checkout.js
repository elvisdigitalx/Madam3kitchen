/**
 * Madam 3 Kitchen - Checkout & Payment Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkout-form');
  const deliveryZoneSelect = document.getElementById('delivery_zone_id');
  const promoCodeInput = document.getElementById('promo_code_input');
  const applyPromoBtn = document.getElementById('apply_promo_btn');
  const orderScheduleToggle = document.querySelectorAll('input[name="order_timing"]');
  const scheduledTimeContainer = document.getElementById('scheduled_time_container');
  const useLocationBtn = document.getElementById('use_my_location_btn');

  let appliedPromo = null;

  // Render Order Items in Checkout Summary
  function renderCheckoutSummary() {
    const items = window.cart.items;
    const summaryContainer = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('summary-subtotal');
    const deliveryEl = document.getElementById('summary-delivery');
    const discountEl = document.getElementById('summary-discount');
    const discountRow = document.getElementById('discount-row');
    const grandTotalEl = document.getElementById('summary-grand-total');

    if (!summaryContainer) return;

    if (items.length === 0) {
      summaryContainer.innerHTML = `<div class="p-3 text-center text-muted">Your cart is empty. <a href="menu.php">Browse Menu</a></div>`;
      if (grandTotalEl) grandTotalEl.textContent = '₦0';
      return;
    }

    let itemsHtml = '';
    items.forEach(item => {
      const extrasStr = item.extras && item.extras.length > 0
        ? `<div class="fs-xs text-muted">+ ${item.extras.map(e => e.name).join(', ')}</div>`
        : '';
      const instructStr = item.instructions
        ? `<div class="fs-xs text-warning fst-italic">Note: ${item.instructions}</div>`
        : '';

      itemsHtml += `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div>
            <div class="fw-bold fs-sm text-secondary">${item.name} <span class="text-primary">× ${item.quantity}</span></div>
            ${extrasStr}
            ${instructStr}
          </div>
          <div class="fw-bold fs-sm text-end text-dark">
            ${formatNaira(item.subtotal)}
          </div>
        </div>
      `;
    });

    summaryContainer.innerHTML = itemsHtml;

    const subtotal = window.cart.getSubtotal();
    if (subtotalEl) subtotalEl.textContent = formatNaira(subtotal);

    // Calculate Delivery Fee from selected Zone
    let deliveryFee = 0;
    if (deliveryZoneSelect && deliveryZoneSelect.value) {
      const selectedOption = deliveryZoneSelect.options[deliveryZoneSelect.selectedIndex];
      deliveryFee = parseFloat(selectedOption.dataset.fee || 0);
    }
    if (deliveryEl) deliveryEl.textContent = formatNaira(deliveryFee);

    // Calculate Discount
    let discountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        discountAmount = (subtotal * parseFloat(appliedPromo.value)) / 100;
        if (appliedPromo.max_discount && discountAmount > parseFloat(appliedPromo.max_discount)) {
          discountAmount = parseFloat(appliedPromo.max_discount);
        }
      } else {
        discountAmount = parseFloat(appliedPromo.value);
      }
      if (discountRow) discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = '- ' + formatNaira(discountAmount);
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
    if (grandTotalEl) grandTotalEl.textContent = formatNaira(grandTotal);
  }

  // Zone Change Event
  if (deliveryZoneSelect) {
    deliveryZoneSelect.addEventListener('change', renderCheckoutSummary);
  }

  // Promo Code Validation
  if (applyPromoBtn && promoCodeInput) {
    applyPromoBtn.addEventListener('click', async () => {
      const code = promoCodeInput.value.trim().toUpperCase();
      if (!code) {
        showToast('Please enter a promo code', 'warning');
        return;
      }

      const subtotal = window.cart.getSubtotal();
      try {
        const response = await fetch(`api/checkout.php?action=validate_promo&code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
        const data = await response.json();

        if (data.success) {
          appliedPromo = data.promo;
          showToast(`Promo "${code}" applied: ${data.promo.message || 'Discount added!'}`, 'success');
          document.getElementById('promo-status-msg').innerHTML = `<span class="text-success fw-bold">✓ Promo "${code}" Applied</span>`;
          renderCheckoutSummary();
        } else {
          showToast(data.message || 'Invalid or expired promo code', 'danger');
          appliedPromo = null;
          document.getElementById('promo-status-msg').innerHTML = `<span class="text-danger fw-semibold">${data.message}</span>`;
          renderCheckoutSummary();
        }
      } catch (e) {
        // Local fallback promo validation
        if (code === 'WELCOME10') {
          appliedPromo = { code: 'WELCOME10', type: 'percentage', value: 10, message: '10% OFF' };
          showToast('Promo "WELCOME10" applied! 10% Discount', 'success');
        } else if (code === 'BENIN500') {
          appliedPromo = { code: 'BENIN500', type: 'fixed', value: 500, message: '₦500 OFF' };
          showToast('Promo "BENIN500" applied! ₦500 Discount', 'success');
        } else {
          showToast('Invalid promo code. Try WELCOME10', 'danger');
          appliedPromo = null;
        }
        renderCheckoutSummary();
      }
    });
  }

  // Order Timing ASAP vs Scheduled
  if (orderScheduleToggle) {
    orderScheduleToggle.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (scheduledTimeContainer) {
          scheduledTimeContainer.style.display = e.target.value === 'scheduled' ? 'block' : 'none';
        }
      });
    });
  }

  // Payment Method Selection UI Toggle
  const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
  const bankTransferBox = document.getElementById('bank-transfer-details');
  if (paymentRadios) {
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (bankTransferBox) {
          bankTransferBox.style.display = e.target.value === 'bank_transfer' ? 'block' : 'none';
        }
      });
    });
  }

  // Geolocation Button
  if (useLocationBtn) {
    useLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'warning');
        return;
      }
      useLocationBtn.textContent = 'Locating...';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          useLocationBtn.textContent = '✓ Location Found';
          const addressInput = document.getElementById('delivery_address');
          if (addressInput && !addressInput.value) {
            addressInput.value = `Near GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)} (Benin City)`;
          }
          showToast('GPS coordinates fetched successfully!', 'success');
        },
        (error) => {
          useLocationBtn.textContent = '📍 Use My Location';
          showToast('Unable to retrieve location. Please enter address manually.', 'warning');
        }
      );
    });
  }

  // Place Order Submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const items = window.cart.items;
      if (items.length === 0) {
        showToast('Your cart is empty! Please add meals before checkout.', 'danger');
        return;
      }

      const formData = new FormData(checkoutForm);
      const payload = {
        customer_name: formData.get('customer_name'),
        phone: formData.get('phone'),
        whatsapp: formData.get('whatsapp') || formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        landmark: formData.get('landmark'),
        delivery_zone_id: formData.get('delivery_zone_id'),
        instructions: formData.get('instructions'),
        payment_method: formData.get('payment_method'),
        order_timing: formData.get('order_timing'),
        scheduled_date: formData.get('scheduled_date'),
        scheduled_time: formData.get('scheduled_time'),
        promo_code: appliedPromo ? appliedPromo.code : null,
        items: items
      };

      const submitBtn = document.getElementById('place-order-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing Order... ⏳';
      }

      try {
        const response = await fetch('api/checkout.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          window.cart.clear();
          showToast('Order placed successfully! 🎉', 'success');
          // Redirect to order success page
          window.location.href = `order-success.php?order_number=${encodeURIComponent(result.order_number)}`;
        } else {
          showToast(result.message || 'Failed to place order. Please try again.', 'danger');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order 🍛';
          }
        }
      } catch (err) {
        console.error('Checkout error:', err);
        // Fallback: Generate local order simulation and redirect
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNum = `MDM-${dateStr}-${randomNum}`;

        // Save order to localStorage for tracking simulation
        const orderRecord = {
          order_number: orderNum,
          ...payload,
          subtotal: window.cart.getSubtotal(),
          delivery_fee: 1000,
          grand_total: window.cart.getSubtotal() + 1000,
          status: 'Confirmed',
          created_at: new Date().toISOString()
        };
        const pastOrders = JSON.parse(localStorage.getItem('madam3_orders') || '[]');
        pastOrders.unshift(orderRecord);
        localStorage.setItem('madam3_orders', JSON.stringify(pastOrders));

        window.cart.clear();
        window.location.href = `order-success.php?order_number=${orderNum}`;
      }
    });
  }

  // Initialize Summary
  renderCheckoutSummary();
  window.addEventListener('cart-updated', renderCheckoutSummary);
});
