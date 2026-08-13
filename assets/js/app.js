/**
 * Madam 3 Kitchen - Customer Frontend Application JS
 * Fast, Responsive, Mobile-First Nigerian Food Ordering
 */

// Cart Manager
class CartManager {
  constructor() {
    this.storageKey = 'madam3_cart';
    this.items = this.load();
    this.initBadge();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from storage', e);
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.initBadge();
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: this.items } }));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }

  addItem(product, quantity = 1, extras = [], instructions = '') {
    // Generate unique key based on id and selected extras
    const extrasKey = extras.map(e => `${e.id || e.name}`).sort().join('-');
    const cartItemId = `${product.id}_${extrasKey}`;

    const existingIndex = this.items.findIndex(item => item.cartItemId === cartItemId);
    const extrasTotal = extras.reduce((sum, e) => sum + parseFloat(e.price || 0), 0);
    const unitPrice = parseFloat(product.price) + extrasTotal;

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
      this.items[existingIndex].subtotal = this.items[existingIndex].quantity * this.items[existingIndex].unitPrice;
      if (instructions) this.items[existingIndex].instructions = instructions;
    } else {
      this.items.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        basePrice: parseFloat(product.price),
        unitPrice: unitPrice,
        quantity: quantity,
        extras: extras,
        subtotal: unitPrice * quantity,
        instructions: instructions
      });
    }

    this.save();
    showToast(`Added ${quantity}x "${product.name}" to cart! 🍛`, 'success');
  }

  updateQuantity(cartItemId, newQty) {
    const item = this.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    if (newQty <= 0) {
      this.removeItem(cartItemId);
    } else {
      item.quantity = newQty;
      item.subtotal = item.quantity * item.unitPrice;
      this.save();
    }
  }

  removeItem(cartItemId) {
    const item = this.items.find(i => i.cartItemId === cartItemId);
    const name = item ? item.name : 'Item';
    this.items = this.items.filter(i => i.cartItemId !== cartItemId);
    this.save();
    showToast(`Removed "${name}" from cart`, 'info');
  }

  clear() {
    this.items = [];
    this.save();
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  initBadge() {
    const count = this.getCount();
    document.querySelectorAll('.cart-counter, .mobile-nav-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }
}

// Global Cart Instance
window.cart = new CartManager();

// Toast Notifications Helper
function showToast(message, type = 'primary') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast alert-${type}`;
  toast.innerHTML = `
    <div style="font-size: 1.25rem;">${type === 'success' ? '✅' : (type === 'danger' ? '❌' : 'ℹ️')}</div>
    <div style="flex-grow: 1; font-weight: 600; font-size: 0.9rem;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Format Price to Nigerian Naira
function formatNaira(amount) {
  const num = parseFloat(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Meal Customizer Modal
function openMealCustomizer(productData) {
  let modal = document.getElementById('meal-customizer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'meal-customizer-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const extrasHtml = (productData.extras && productData.extras.length > 0) ? `
    <div class="mb-3">
      <label class="form-label fw-bold">Customize Your Meal / Add Extras:</label>
      <div class="extras-list">
        ${productData.extras.map((extra, idx) => `
          <label class="extra-option-card" for="modal_extra_${idx}">
            <div class="d-flex align-items-center gap-2">
              <input type="checkbox" id="modal_extra_${idx}" class="extra-checkbox" data-name="${extra.name}" data-price="${extra.price}" data-id="${extra.id || idx}">
              <span class="fw-semibold">${extra.name}</span>
            </div>
            <span class="extra-price">+${formatNaira(extra.price)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  ` : '';

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h4 class="mb-0 fw-bold" style="color: var(--secondary);">${productData.name}</h4>
        <button type="button" class="modal-close-btn" onclick="closeMealCustomizer()">&times;</button>
      </div>
      <div class="modal-body">
        <img src="${productData.image}" alt="${productData.name}" style="width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1rem;">
        <p class="text-muted fs-sm mb-3">${productData.description || ''}</p>
        
        ${extrasHtml}

        <div class="form-group mb-3">
          <label class="form-label">Special Cooking Instructions (Optional):</label>
          <input type="text" id="modal-special-instructions" class="form-control" placeholder="e.g. Less pepper, extra sauce, pack separately">
        </div>

        <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="adjustModalQty(-1)">-</button>
            <input type="text" id="modal-qty" class="qty-input" value="1" readonly>
            <button type="button" class="qty-btn" onclick="adjustModalQty(1)">+</button>
          </div>
          <button type="button" class="btn btn-primary btn-lg" id="modal-add-cart-btn">
            Add to Cart (<span id="modal-total-price">${formatNaira(productData.price)}</span>)
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');

  // Update total calculation on changes
  const updateModalTotal = () => {
    const qty = parseInt(document.getElementById('modal-qty').value) || 1;
    let unitTotal = parseFloat(productData.price);
    modal.querySelectorAll('.extra-checkbox:checked').forEach(cb => {
      unitTotal += parseFloat(cb.dataset.price || 0);
    });
    document.getElementById('modal-total-price').textContent = formatNaira(unitTotal * qty);
  };

  modal.querySelectorAll('.extra-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const parent = e.target.closest('.extra-option-card');
      if (parent) {
        if (e.target.checked) parent.classList.add('selected');
        else parent.classList.remove('selected');
      }
      updateModalTotal();
    });
  });

  document.getElementById('modal-add-cart-btn').onclick = () => {
    const qty = parseInt(document.getElementById('modal-qty').value) || 1;
    const instructions = document.getElementById('modal-special-instructions').value.trim();
    const selectedExtras = [];
    modal.querySelectorAll('.extra-checkbox:checked').forEach(cb => {
      selectedExtras.push({
        id: cb.dataset.id,
        name: cb.dataset.name,
        price: parseFloat(cb.dataset.price)
      });
    });

    window.cart.addItem(productData, qty, selectedExtras, instructions);
    closeMealCustomizer();
  };
}

function adjustModalQty(delta) {
  const qtyInput = document.getElementById('modal-qty');
  if (!qtyInput) return;
  let current = parseInt(qtyInput.value) || 1;
  current = Math.max(1, current + delta);
  qtyInput.value = current;
  const event = new Event('change');
  qtyInput.dispatchEvent(event);
  
  // Recalculate price
  const totalSpan = document.getElementById('modal-total-price');
  if (totalSpan) {
    const baseBtn = document.getElementById('modal-add-cart-btn');
    const checkedExtras = document.querySelectorAll('#meal-customizer-modal .extra-checkbox:checked');
    let unit = 0;
    // Extract base price from context
    const modal = document.getElementById('meal-customizer-modal');
    if (window._currentModalProduct) {
      let unitPrice = parseFloat(window._currentModalProduct.price);
      checkedExtras.forEach(cb => unitPrice += parseFloat(cb.dataset.price || 0));
      totalSpan.textContent = formatNaira(unitPrice * current);
    }
  }
}

function closeMealCustomizer() {
  const modal = document.getElementById('meal-customizer-modal');
  if (modal) modal.classList.remove('active');
}

// Mobile Menu Drawer Toggler
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');

  if (toggleBtn && drawer && backdrop) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      backdrop.classList.add('active');
    });

    backdrop.addEventListener('click', () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }

  // Live Menu Search filter
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.menu-grid-item');
      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.dataset.name || '').toLowerCase();
        const desc = (card.dataset.desc || '').toLowerCase();
        const cat = (card.dataset.category || '').toLowerCase();

        if (title.includes(term) || desc.includes(term) || cat.includes(term)) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const noResults = document.getElementById('no-menu-results');
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  }
});
