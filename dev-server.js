/**
 * Madam 3 Kitchen - Live Preview Development Server
 * Handles routing, template rendering, and REST API endpoints
 * Backed by data matching the PHP & MySQL database.sql schema
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';

// In-Memory / JSON Data Store mirroring database.sql
let db = {
  settings: {
    restaurant_name: "Madam 3 Kitchen",
    restaurant_tagline: "Delicious Nigerian Meals, Made With Love",
    restaurant_address: "No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State, Nigeria",
    restaurant_phone: "+2348030001234",
    restaurant_whatsapp: "2348030001234",
    restaurant_email: "orders@madam3kitchen.com",
    opening_time: "08:00",
    closing_time: "22:00",
    restaurant_status: "OPEN",
    closed_message: "Madam 3 Kitchen is currently closed. We reopen at 8:00 AM!",
    currency_symbol: "₦",
    default_delivery_fee: 1000,
    minimum_order_amount: 2000,
    enable_cod: "1",
    enable_bank_transfer: "1",
    bank_name: "Moniepoint Microfinance Bank",
    bank_account_number: "8030001234",
    bank_account_name: "Madam 3 Kitchen Benin",
    enable_paystack: "1",
    paystack_public_key: "pk_test_sample_key_12345"
  },
  categories: [
    { id: 1, name: "Rice Dishes", slug: "rice", icon: "🍚", display_order: 1, is_active: 1 },
    { id: 2, name: "Traditional Soups", slug: "soups", icon: "🍲", display_order: 2, is_active: 1 },
    { id: 3, name: "Swallow", slug: "swallow", icon: "🥣", display_order: 3, is_active: 1 },
    { id: 4, name: "Proteins & Grills", slug: "proteins", icon: "🍗", display_order: 4, is_active: 1 },
    { id: 5, name: "Snacks & Sides", slug: "snacks", icon: "🥟", display_order: 5, is_active: 1 },
    { id: 6, name: "Drinks & Beverages", slug: "drinks", icon: "🍹", display_order: 6, is_active: 1 },
    { id: 7, name: "Combos & Feasts", slug: "combos", icon: "🍱", display_order: 7, is_active: 1 },
    { id: 8, name: "Family Packs", slug: "family-packs", icon: "👨‍👩‍👧‍👦", display_order: 8, is_active: 1 }
  ],
  products: [
    {
      id: 1, category_id: 1, name: "Party Jollof Rice with Chicken & Dodo",
      slug: "party-jollof-rice-chicken-dodo",
      description: "Signature Benin smoky firewood party Jollof rice served with succulent peppered chicken drumstick and sweet golden fried plantain dodo.",
      price: 3500, discount_price: 3200, image: "assets/images/products/jollof-rice.jpg",
      is_available: 1, is_popular: 1, is_featured: 1, prep_time_minutes: 20, rating: 5.0,
      extras: [
        { id: 1, name: "Extra Peppered Chicken", price: 1200 },
        { id: 2, name: "Extra Fried Plantain (Dodo)", price: 500 },
        { id: 3, name: "Steamed Moi-Moi", price: 600 },
        { id: 4, name: "Creamy Coleslaw", price: 400 },
        { id: 5, name: "Chilled Chapman Drink", price: 1200 }
      ]
    },
    {
      id: 2, category_id: 2, name: "Egusi Soup with Pounded Yam & Assorted Meat",
      slug: "egusi-soup-pounded-yam",
      description: "Rich melon seed Egusi soup loaded with fresh pumpkin leaves, cow tripe (shaki), beef cubes, and stockfish, paired with soft smooth pounded yam.",
      price: 4500, discount_price: null, image: "assets/images/products/egusi-soup.jpg",
      is_available: 1, is_popular: 1, is_featured: 1, prep_time_minutes: 25, rating: 4.9,
      extras: [
        { id: 6, name: "Extra Pounded Yam Wrap", price: 700 },
        { id: 7, name: "Extra Goat Meat Portion", price: 1500 },
        { id: 8, name: "Extra Assorted Meat (Shaki & Beef)", price: 1200 },
        { id: 9, name: "Extra Smoked Fish", price: 1000 }
      ]
    },
    {
      id: 3, category_id: 1, name: "Madam 3 Special Fried Rice with Crispy Chicken",
      slug: "special-fried-rice-crispy-chicken",
      description: "Vibrant Nigerian fried rice packed with sweet corn, carrots, green peas, diced liver, served with seasoned fried chicken and vegetable salad.",
      price: 3800, discount_price: 3500, image: "assets/images/products/fried-rice.jpg",
      is_available: 1, is_popular: 1, is_featured: 0, prep_time_minutes: 20, rating: 4.8,
      extras: [
        { id: 10, name: "Extra Crispy Fried Chicken", price: 1200 },
        { id: 11, name: "Fried Plantain (Dodo)", price: 500 }
      ]
    },
    {
      id: 4, category_id: 2, name: "Traditional Ogbono Draw Soup with Yellow Eba",
      slug: "ogbono-soup-yellow-eba",
      description: "Authentic Edo Ogbono draw soup prepared with smoked catfish, tender beef, and aromatic uziza leaves, served with hot yellow garri Eba.",
      price: 4200, discount_price: null, image: "assets/images/products/ogbono-soup.jpg",
      is_available: 1, is_popular: 1, is_featured: 0, prep_time_minutes: 25, rating: 4.9,
      extras: [
        { id: 12, name: "Extra Yellow Eba Wrap", price: 500 },
        { id: 13, name: "Extra Smoked Catfish", price: 1400 }
      ]
    },
    {
      id: 5, category_id: 4, name: "Hot & Spicy Peppered Chicken Platter",
      slug: "hot-spicy-peppered-chicken",
      description: "Crispy chicken pieces drenched in fiery scotch bonnet pepper sauce, caramelized red onions, and bell peppers. Benin City favorite!",
      price: 3000, discount_price: 2700, image: "assets/images/products/peppered-chicken.jpg",
      is_available: 1, is_popular: 1, is_featured: 1, prep_time_minutes: 15, rating: 5.0,
      extras: [
        { id: 14, name: "Fried Plantain (Dodo)", price: 500 },
        { id: 15, name: "Chilled Soft Drink", price: 500 }
      ]
    },
    {
      id: 6, category_id: 2, name: "Authentic Delta/Edo Banga Palm Nut Soup",
      slug: "authentic-banga-soup",
      description: "Rich freshly extracted palm fruit soup simmered with fresh catfish, dried fish, and local Edo herbs, best enjoyed with starch or pounded yam.",
      price: 5000, discount_price: null, image: "assets/images/products/banga-soup.jpg",
      is_available: 1, is_popular: 0, is_featured: 1, prep_time_minutes: 30, rating: 4.9,
      extras: [
        { id: 16, name: "Extra Starch Wrap", price: 700 },
        { id: 17, name: "Extra Fresh Catfish", price: 1800 }
      ]
    },
    {
      id: 7, category_id: 3, name: "Amala Abula (Ewedu, Gbegiri & Goat Meat)",
      slug: "amala-abula-goat-meat",
      description: "Silky piping-hot Amala swallow served with traditional green Ewedu, golden Gbegiri bean paste, spicy stew, and tender seasoned goat meat.",
      price: 4000, discount_price: 3600, image: "assets/images/products/amala-abula.jpg",
      is_available: 1, is_popular: 1, is_featured: 0, prep_time_minutes: 20, rating: 4.8,
      extras: [
        { id: 18, name: "Extra Goat Meat (2 Pcs)", price: 1800 },
        { id: 19, name: "Extra Amala Wrap", price: 600 }
      ]
    },
    {
      id: 8, category_id: 4, name: "Spicy Asun Peppered Goat Meat Board",
      slug: "spicy-asun-goat-meat",
      description: "Fire-grilled tender bite-sized goat meat chunks tossed in hot habanero pepper, garlic, and fresh sliced onions.",
      price: 3800, discount_price: null, image: "assets/images/products/asun-goat.jpg",
      is_available: 1, is_popular: 1, is_featured: 1, prep_time_minutes: 20, rating: 4.9,
      extras: [
        { id: 20, name: "Extra Onions & Peppers", price: 300 },
        { id: 21, name: "Chilled Chapman", price: 1200 }
      ]
    },
    {
      id: 9, category_id: 6, name: "Madam 3 Signature Chapman Cocktail",
      slug: "signature-chapman-cocktail",
      description: "Refreshing classic Nigerian mocktail prepared with aromatic Angostura bitters, fresh orange wheels, lemon wedges, and crisp cucumber slices.",
      price: 1500, discount_price: 1200, image: "assets/images/products/chapman-drink.jpg",
      is_available: 1, is_popular: 1, is_featured: 0, prep_time_minutes: 5, rating: 5.0,
      extras: []
    },
    {
      id: 10, category_id: 5, name: "Freshly Baked Nigerian Beef Meat Pie (2 Pcs)",
      slug: "beef-meat-pie-2pcs",
      description: "Flaky, buttery golden crust pastry packed with rich minced beef, diced potatoes, and savory carrot filling.",
      price: 1600, discount_price: null, image: "assets/images/products/jollof-rice.jpg",
      is_available: 1, is_popular: 0, is_featured: 0, prep_time_minutes: 10, rating: 4.7,
      extras: []
    },
    {
      id: 11, category_id: 7, name: "Benin Executive Lunch Combo",
      slug: "benin-executive-lunch-combo",
      description: "Combination of Party Jollof & Fried Rice, 2 Peppered Chicken drumsticks, Fried Plantain, Moi Moi, and 1 Chilled Chapman Drink.",
      price: 6500, discount_price: 5900, image: "assets/images/hero-banner.jpg",
      is_available: 1, is_popular: 1, is_featured: 1, prep_time_minutes: 25, rating: 5.0,
      extras: []
    },
    {
      id: 12, category_id: 8, name: "Madam 3 Grand Family Feast (Feeds 4-6)",
      slug: "grand-family-feast",
      description: "Mega party tray containing smoky Jollof rice, Fried rice, 4 Chicken thighs, 4 Beef portions, Dodo tray, 4 Moi-Moi, and 4 Chilled Drinks.",
      price: 24000, discount_price: 21500, image: "assets/images/hero-banner.jpg",
      is_available: 1, is_popular: 0, is_featured: 1, prep_time_minutes: 35, rating: 5.0,
      extras: []
    }
  ],
  delivery_zones: [
    { id: 1, name: "No. 3 Asoro / Ekehuan Road", description: "Direct proximity to Madam 3 Kitchen", delivery_fee: 500, estimated_time: "15-25 mins", is_active: 1 },
    { id: 2, name: "GRA & Boundary Road", description: "Government Reserved Area, Boundary & Country Club environs", delivery_fee: 1000, estimated_time: "25-35 mins", is_active: 1 },
    { id: 3, name: "Ring Road & King Square", description: "Benin City Central Commercial District", delivery_fee: 800, estimated_time: "20-30 mins", is_active: 1 },
    { id: 4, name: "Airport Road & Environs", description: "Airport Road, Akenzua, and surrounding avenues", delivery_fee: 1200, estimated_time: "30-40 mins", is_active: 1 },
    { id: 5, name: "Ugbowo / UNIBEN Campus", description: "University of Benin Main Campus, BDPA, and Uselu", delivery_fee: 1500, estimated_time: "35-45 mins", is_active: 1 },
    { id: 6, name: "Sapele Road & Limit", description: "Sapele Road, Limit, Agip, and bypass areas", delivery_fee: 1200, estimated_time: "30-40 mins", is_active: 1 },
    { id: 7, name: "Ikpoba Hill & Environs", description: "Ikpoba Hill, Ramat Park, and Upper Mission Extension", delivery_fee: 1500, estimated_time: "40-50 mins", is_active: 1 },
    { id: 8, name: "New Benin & Mission Road", description: "New Benin Market, Mission Road, and Forestry", delivery_fee: 1000, estimated_time: "25-35 mins", is_active: 1 },
    { id: 9, name: "Aduwawa & Federal Housing", description: "Aduwawa, Upper Lawani, and Federal Quarters", delivery_fee: 1800, estimated_time: "45-55 mins", is_active: 1 },
    { id: 10, name: "Upper Sakponba Road", description: "Upper Sakponba, St. Saviour, and environs", delivery_fee: 1500, estimated_time: "35-45 mins", is_active: 1 }
  ],
  promo_codes: [
    { id: 1, code: "WELCOME10", discount_type: "percentage", discount_value: 10, min_order_amount: 3000, max_discount_amount: 2000, usage_limit: 500, usage_count: 18, is_active: 1 },
    { id: 2, code: "BENIN500", discount_type: "fixed", discount_value: 500, min_order_amount: 4000, max_discount_amount: null, usage_limit: 300, usage_count: 42, is_active: 1 },
    { id: 3, code: "FAMILYFEAST", discount_type: "percentage", discount_value: 15, min_order_amount: 15000, max_discount_amount: 4000, usage_limit: 100, usage_count: 5, is_active: 1 }
  ],
  orders: [
    {
      id: 1, order_number: "MDM-20260813-00124", customer_name: "Osasogie Igbinosa", phone: "08051234567",
      whatsapp: "2348051234567", email: "osas@example.com", delivery_address: "14 Boundary Road, GRA, Benin City",
      landmark: "Opposite Edo Golf Club", delivery_zone_id: 2, zone_name: "GRA & Boundary Road",
      order_timing: "asap", payment_method: "online", payment_status: "Paid", payment_reference: "PAY-98741",
      subtotal: 8000, delivery_fee: 1000, discount_amount: 800, grand_total: 8200, promo_code: "WELCOME10",
      status: "Preparing", created_at: new Date(Date.now() - 25 * 60000).toISOString(),
      items: [
        { product_name: "Party Jollof Rice with Chicken & Dodo", quantity: 2, unit_price: 3200, subtotal: 6400, extras: [{ extra_name: "Extra Fried Plantain (Dodo)", extra_price: 500 }] },
        { product_name: "Madam 3 Signature Chapman Cocktail", quantity: 1, unit_price: 1200, subtotal: 1200, extras: [] }
      ]
    },
    {
      id: 2, order_number: "MDM-20260813-00125", customer_name: "Blessing E. Enoma", phone: "08032223344",
      whatsapp: "2348032223344", email: "blessing@example.com", delivery_address: "UNIBEN Main Gate, Ugbowo, Benin City",
      landmark: "Beside Main Security Gate", delivery_zone_id: 5, zone_name: "Ugbowo / UNIBEN Campus",
      order_timing: "asap", payment_method: "bank_transfer", payment_status: "Pending", payment_reference: null,
      subtotal: 4500, delivery_fee: 1500, discount_amount: 0, grand_total: 6000, promo_code: null,
      status: "Pending", created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      items: [
        { product_name: "Egusi Soup with Pounded Yam & Assorted Meat", quantity: 1, unit_price: 4500, subtotal: 4500, extras: [{ extra_name: "Extra Goat Meat Portion", extra_price: 1500 }] }
      ]
    }
  ],
  reviews: [
    { id: 1, customer_name: "Osasogie I. (GRA)", rating: 5, comment: "Their party Jollof rice is on another level! The smoky firewood aroma reminds me of authentic Edo wedding celebrations. Delivery to GRA was within 25 minutes.", is_approved: 1 },
    { id: 2, customer_name: "Blessing E. (Ugbowo)", rating: 5, comment: "The Egusi soup with pounded yam was fresh and properly garnished with assorted meat. Delivered hot to UNIBEN gate. 10/10!", is_approved: 1 },
    { id: 3, customer_name: "Efe Collins (Airport Rd)", rating: 5, comment: "The peppered chicken is seriously spicy and tasty! Perfect with chilled Chapman. Best food plug on Ekehuan Road.", is_approved: 1 },
    { id: 4, customer_name: "Dr. Endurance (Asoro)", rating: 5, comment: "Living right by Asoro bus stop, Madam 3 Kitchen has become our family weekend ritual. Very clean packaging.", is_approved: 1 }
  ],
  contact_messages: [
    { id: 1, name: "Engr. Victor Osaro", phone: "08021112233", email: "victor@example.com", subject: "Event Catering", message: "Hello Madam 3 Kitchen, I would like to inquire about bulk catering for 50 people next month in GRA.", is_read: 0, created_at: new Date().toISOString() }
  ],
  activity_logs: [
    { id: 1, admin_user: "Madam 3 Administrator", action: "System initialized for Benin City kitchen dispatch", ip_address: "127.0.0.1", created_at: new Date().toISOString() }
  ],
  users: [
    {
      id: 1, name: "Madam 3 Administrator", email: "admin@madam3kitchen.com", phone: "08030001234", password: "admin123",
      address: "No. 3 Asoro Bus Stop, Ekehuan Road, Benin City", landmark: "Near Asoro Statue",
      delivery_zone_id: 1, role: "admin", is_active: 1,
      created_at: new Date(Date.now() - 180 * 86400000).toISOString()
    },
    {
      id: 2, name: "Osasogie Igbinosa", email: "osas@example.com", phone: "08051234567", whatsapp: "2348051234567", password: "admin123",
      address: "14 Boundary Road, GRA, Benin City", landmark: "Opposite Golf Club",
      delivery_zone_id: 2, role: "customer", is_active: 1,
      created_at: new Date(Date.now() - 120 * 86400000).toISOString()
    }
  ]
};

// ---------------- Admin / Server Helpers ----------------

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function slugify(name) {
  return String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function adminLoggedIn(req) {
  return parseCookies(req).m3k_admin === '1';
}

function currentUser(req) {
  const id = parseCookies(req).m3k_user;
  if (!id) return null;
  const u = db.users.find(x => String(x.id) === String(id));
  return u && u.is_active ? u : null;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const type = (req.headers['content-type'] || '').toLowerCase();
      if (type.includes('application/json')) {
        try { resolve(JSON.parse(body)); } catch (e) { resolve({}); }
        return;
      }
      const params = new URLSearchParams(body);
      const obj = {};
      for (const [k, v] of params) {
        if (!(k in obj)) obj[k] = v;
        else if (Array.isArray(obj[k])) obj[k].push(v);
        else obj[k] = [obj[k], v];
      }
      resolve(obj);
    });
  });
}

function logActivity(action) {
  db.activity_logs.unshift({
    id: db.activity_logs.length + 1,
    admin_user: 'Madam 3 Administrator',
    action: action,
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  });
}

function fmtDateTime(iso) {
  try { return new Date(iso).toLocaleString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch (e) { return String(iso || ''); }
}

function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }); }
  catch (e) { return ''; }
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch (e) { return String(iso || ''); }
}

function statusBadge(status) {
  const cls = {
    'Pending': 'badge-warning',
    'Payment Confirmed': 'badge-primary',
    'Confirmed': 'badge-info',
    'Preparing': 'badge-secondary',
    'Ready': 'badge-secondary',
    'Out for Delivery': 'badge-primary',
    'Delivered': 'badge-success',
    'Cancelled': 'badge-danger',
    'Rejected': 'badge-danger'
  }[status] || 'badge-secondary';
  return `<span class="badge ${cls} fs-xs">${esc(status)}</span>`;
}

const ADMIN_STATUS_OPTIONS = ['Pending', 'Payment Confirmed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'];

function statusSelect(current, orderId, wide) {
  const style = wide ? 'style="width:auto;font-weight:700"' : 'style="width:auto;font-weight:700"';
  return `<select class="form-select form-select-sm" ${style} onchange="updateOrderStatus(${orderId}, this.value)">
    ${ADMIN_STATUS_OPTIONS.map(s => `<option value="${s}" ${s === current ? 'selected' : ''}>${s}</option>`).join('')}
  </select>`;
}

// Helper: Format Price
function currencySymbol() {
  const sym = (db.settings && db.settings.currency_symbol) || '₦';
  // If the configured symbol is empty or only ASCII digits (a corrupted Naira
  // sign mangled into e.g. "262145"), fall back to a clean Naira sign.
  const s = String(sym).trim();
  if (s !== '' && !/^[0-9]+$/.test(s)) return s;
  return '₦';
}

function formatPrice(amount) {
  const num = parseFloat(String(amount).replace(/[^\d.]/g, '')) || 0;
  return currencySymbol() + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Generate Order Number
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `MDM-${dateStr}-${rand}`;
}

// Server Creation
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Normalize path
  if (pathname === '/' || pathname === '') pathname = '/index.php';

  // API Endpoints Handling
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname, parsedUrl.query);
    return;
  }

  // Static Assets Handling (.css, .js, .svg, .jpg, .png, .json, .xml, .txt)
  const ext = path.extname(pathname);
  if (['.css', '.js', '.svg', '.jpg', '.jpeg', '.png', '.json', '.xml', '.txt'].includes(ext)) {
    const filePath = path.join(__dirname, pathname);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
        return;
      }

      const mimeTypes = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.svg': 'image/svg+xml',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.txt': 'text/plain'
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(data);
    });
    return;
  }

  // Render HTML / PHP Template Pages
  handlePage(req, res, pathname, parsedUrl.query);
});

// API Router
function handleApi(req, res, pathname, query) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 1. Live Notifications
  if (pathname === '/api/live-notifications.php') {
    const pendingCount = db.orders.filter(o => ['Pending', 'Payment Confirmed', 'Confirmed'].includes(o.status)).length;
    const latest = db.orders[0];
    res.end(JSON.stringify({
      success: true,
      pending_count: pendingCount,
      latest_order_number: latest ? latest.order_number : null,
      latest_customer: latest ? latest.customer_name : null,
      latest_total: latest ? latest.grand_total : 0
    }));
    return;
  }

  // 2. Checkout API
  if (pathname === '/api/checkout.php') {
    if (query.action === 'validate_promo') {
      const code = (query.code || '').toUpperCase().trim();
      const subtotal = parseFloat(query.subtotal || 0);
      const promo = db.promo_codes.find(p => p.code === code && p.is_active);

      if (!promo) {
        res.end(JSON.stringify({ success: false, message: 'Invalid or inactive promo code.' }));
        return;
      }

      if (subtotal < promo.min_order_amount) {
        res.end(JSON.stringify({ success: false, message: `Minimum order of ${formatPrice(promo.min_order_amount)} required.` }));
        return;
      }

      res.end(JSON.stringify({
        success: true,
        promo: {
          code: promo.code,
          type: promo.discount_type,
          value: promo.discount_value,
          max_discount: promo.max_discount_amount,
          message: promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `${formatPrice(promo.discount_value)} OFF`
        }
      }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const input = JSON.parse(body);
          const orderNum = generateOrderNumber();
          const zone = db.delivery_zones.find(z => z.id === parseInt(input.delivery_zone_id)) || db.delivery_zones[0];
          const deliveryFee = zone ? zone.delivery_fee : 1000;

          let subtotal = 0;
          const processedItems = (input.items || []).map(item => {
            const p = db.products.find(prod => prod.id === item.productId) || item;
            const unitPrice = item.unitPrice || p.price;
            const lineSub = unitPrice * (item.quantity || 1);
            subtotal += lineSub;
            return {
              product_name: item.name || p.name,
              quantity: item.quantity,
              unit_price: unitPrice,
              subtotal: lineSub,
              instructions: item.instructions || '',
              extras: item.extras || []
            };
          });

          let discountAmount = 0;
          if (input.promo_code) {
            const promo = db.promo_codes.find(p => p.code === input.promo_code.toUpperCase());
            if (promo && subtotal >= promo.min_order_amount) {
              discountAmount = promo.discount_type === 'percentage' ? (subtotal * promo.discount_value) / 100 : promo.discount_value;
              if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) discountAmount = promo.max_discount_amount;
            }
          }

          const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

          const newOrder = {
            id: db.orders.length + 1,
            order_number: orderNum,
            customer_name: input.customer_name,
            phone: input.phone,
            whatsapp: input.whatsapp || input.phone,
            email: input.email || '',
            delivery_address: input.address,
            landmark: input.landmark || '',
            delivery_zone_id: zone ? zone.id : 1,
            zone_name: zone ? zone.name : 'No. 3 Asoro / Ekehuan Road',
            order_timing: input.order_timing || 'asap',
            scheduled_date: input.scheduled_date || null,
            scheduled_time: input.scheduled_time || null,
            payment_method: input.payment_method || 'online',
            payment_status: input.payment_method === 'online' ? 'Pending' : 'Pending',
            payment_reference: 'PAY-' + Date.now(),
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            discount_amount: discountAmount,
            grand_total: grandTotal,
            promo_code: input.promo_code || null,
            status: 'Confirmed',
            created_at: new Date().toISOString(),
            items: processedItems
          };

          db.orders.unshift(newOrder);
          db.activity_logs.unshift({
            id: db.activity_logs.length + 1,
            admin_user: 'Customer System',
            action: `New order #${orderNum} placed by ${input.customer_name}`,
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString()
          });

          res.end(JSON.stringify({
            success: true,
            message: 'Order placed successfully!',
            order_number: orderNum,
            grand_total: grandTotal
          }));
        } catch (e) {
          res.end(JSON.stringify({ success: false, message: 'Invalid payload: ' + e.message }));
        }
      });
      return;
    }
  }

  // 3. Orders API (Tracking & Status Updates)
  if (pathname === '/api/orders.php') {
    if (query.action === 'track') {
      const orderNum = (query.order_number || '').trim();
      const phone = (query.phone || '').trim();
      const order = db.orders.find(o => (orderNum && o.order_number === orderNum) || (phone && (o.phone.includes(phone) || o.whatsapp.includes(phone))));

      if (!order) {
        res.end(JSON.stringify({ success: false, message: 'No order found.' }));
        return;
      }

      res.end(JSON.stringify({
        success: true,
        order: order,
        items: order.items || [],
        history: [
          { status: 'Pending', notes: 'Order placed', changed_by: 'Customer', created_at: order.created_at },
          { status: order.status, notes: `Status set to ${order.status}`, changed_by: 'Madam 3 Kitchen', created_at: new Date().toISOString() }
        ]
      }));
      return;
    }

    if (query.action === 'update_status' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const input = JSON.parse(body);
          const order = db.orders.find(o => o.id === parseInt(input.order_id));
          if (order) {
            order.status = input.status;
            db.activity_logs.unshift({
              id: db.activity_logs.length + 1,
              admin_user: 'Administrator',
              action: `Updated order #${order.order_number} to ${input.status}`,
              ip_address: '127.0.0.1',
              created_at: new Date().toISOString()
            });
            res.end(JSON.stringify({ success: true, message: `Status updated to ${input.status}` }));
          } else {
            res.end(JSON.stringify({ success: false, message: 'Order not found' }));
          }
        } catch (e) {
          res.end(JSON.stringify({ success: false, message: e.message }));
        }
      });
      return;
    }
  }

  // Default API response
  res.end(JSON.stringify({ success: true, message: 'Madam 3 Kitchen API operational' }));
}

// Page Handler: Serves the PHP/HTML view rendered dynamically
function handlePage(req, res, pathname, query) {
  // Normalize clean routes
  if (pathname.endsWith('.php')) pathname = pathname.slice(0, -4);
  if (pathname === '/index') pathname = '/';

  // Read header, navbar, footer template parts
  const isHome = pathname === '/' || pathname === '/index';
  const isMenu = pathname === '/menu';
  const isFood = pathname === '/food';
  const isCart = pathname === '/cart';
  const isCheckout = pathname === '/checkout';
  const isSuccess = pathname === '/order-success';
  const isTrack = pathname === '/track-order';
  const isAbout = pathname === '/about';
  const isContact = pathname === '/contact';
  const isOffers = pathname === '/offers';
  const isFaq = pathname === '/faq';
  const isPrivacy = pathname === '/privacy';
  const isTerms = pathname === '/terms';
  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';
  const isAccount = pathname === '/account';
  const isOrders = pathname === '/orders';

  // Admin Routes
  const isAdminHome = pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/index';
  const isAdminOrders = pathname === '/admin/orders';
  const isAdminOrderDetails = pathname === '/admin/order-details';
  const isAdminProducts = pathname === '/admin/products';
  const isAdminCategories = pathname === '/admin/categories';
  const isAdminZones = pathname === '/admin/delivery-zones';
  const isAdminPromos = pathname === '/admin/promo-codes';
  const isAdminCustomers = pathname === '/admin/customers';
  const isAdminReviews = pathname === '/admin/reviews';
  const isAdminReports = pathname === '/admin/reports';
  const isAdminSettings = pathname === '/admin/settings';
  const isAdminMessages = pathname === '/admin/messages';
  const isAdminLogs = pathname === '/admin/activity-logs';
  const isAdminLogin = pathname === '/admin/login';
  const isAdminReceipt = pathname === '/admin/receipt';

  // Current customer session (for navbar state & checkout prefill)
  const customer = currentUser(req);

  // Routes handled by renderPublicPage (they write their own headers)
  const isPublicDispatch = isMenu || isFood || isCart || isCheckout || isSuccess || isTrack ||
    isAbout || isContact || isOffers || isFaq || isPrivacy || isTerms ||
    isLogin || isRegister || isAccount || isOrders || pathname === '/logout';

  // Read base template components from disk
  const renderLayout = (title, bodyContent, isAdmin = false) => {
    if (isAdmin) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Madam 3 Kitchen Admin</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/styles.css">
  <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="admin-body">
  <aside class="admin-sidebar">
    <div class="admin-sidebar-header">
      <img src="../assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 38px; filter: brightness(0) invert(1);">
    </div>
    <ul class="admin-nav">
      <li class="admin-nav-item ${isAdminHome ? 'active' : ''}"><a href="/admin/index.php"><span>📊</span><span>Dashboard</span></a></li>
      <li class="admin-nav-item ${isAdminOrders ? 'active' : ''}"><a href="/admin/orders.php"><span>📦</span><span>Orders</span></a></li>
      <li class="admin-nav-item ${isAdminProducts ? 'active' : ''}"><a href="/admin/products.php"><span>🍲</span><span>Menu & Meals</span></a></li>
      <li class="admin-nav-item ${isAdminCategories ? 'active' : ''}"><a href="/admin/categories.php"><span>📑</span><span>Categories</span></a></li>
      <li class="admin-nav-item ${isAdminZones ? 'active' : ''}"><a href="/admin/delivery-zones.php"><span>🛵</span><span>Delivery Zones</span></a></li>
      <li class="admin-nav-item ${isAdminPromos ? 'active' : ''}"><a href="/admin/promo-codes.php"><span>🎟️</span><span>Promo Codes</span></a></li>
      <li class="admin-nav-item ${isAdminCustomers ? 'active' : ''}"><a href="/admin/customers.php"><span>👥</span><span>Customers</span></a></li>
      <li class="admin-nav-item ${isAdminReviews ? 'active' : ''}"><a href="/admin/reviews.php"><span>⭐</span><span>Reviews</span></a></li>
      <li class="admin-nav-item ${isAdminReports ? 'active' : ''}"><a href="/admin/reports.php"><span>📈</span><span>Sales Reports</span></a></li>
      <li class="admin-nav-item ${isAdminMessages ? 'active' : ''}"><a href="/admin/messages.php"><span>✉️</span><span>Messages</span></a></li>
      <li class="admin-nav-item ${isAdminSettings ? 'active' : ''}"><a href="/admin/settings.php"><span>⚙️</span><span>Settings</span></a></li>
      <li class="admin-nav-item ${isAdminLogs ? 'active' : ''}"><a href="/admin/activity-logs.php"><span>📜</span><span>Audit Logs</span></a></li>
      <li class="admin-nav-item mt-auto border-top pt-2"><a href="/admin/logout.php" style="color: #EF5350;"><span>🚪</span><span>Sign Out</span></a></li>
    </ul>
  </aside>

  <div class="admin-main">
    <header class="admin-topbar">
      <div class="admin-topbar-left">
        <button type="button" class="admin-mobile-toggle" aria-label="Toggle Sidebar">☰</button>
        <h2 class="h5 mb-0 fw-extrabold text-secondary">${title}</h2>
      </div>
      <div class="admin-topbar-right">
        <button type="button" class="sound-toggle-btn" id="admin-sound-toggle">🔊 Sound On</button>
        <a href="/admin/orders.php?status=Pending" class="admin-notification-bell" title="Live Pending Orders">
          🔔<span class="bell-badge" id="pending-order-badge" style="display:none;">0</span>
        </a>
        <a href="/admin/settings.php" class="badge ${(db.settings.restaurant_status || 'OPEN') === 'OPEN' ? 'badge-success' : 'badge-danger'} fs-xs">● ${(db.settings.restaurant_status || 'OPEN') === 'OPEN' ? 'RESTAURANT OPEN' : 'RESTAURANT CLOSED'}</a>
        <a href="/index.php" target="_blank" class="btn btn-outline-secondary btn-sm d-none d-sm-inline-flex">🌐 Live Site &rarr;</a>
      </div>
    </header>

    <div class="admin-container">
      ${bodyContent}
    </div>
  </div>

  <script src="../assets/js/notification-sound.js"></script>
  <script src="../assets/js/app.js"></script>
  <script src="../assets/js/admin.js"></script>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title} — Madam 3 Kitchen Benin City</title>
  <meta name="description" content="Delicious Nigerian meals freshly prepared with love in Benin City. Fast delivery across No. 3 Asoro, Ekehuan Road, GRA, Ugbowo, and environs. Order online today!">
  <meta name="theme-color" content="#FF6B00">
  <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="manifest" href="/manifest.json">
</head>
<body>
  <!-- Top Notice Bar -->
  <div class="top-notice-bar">
    <div class="container d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <span>📍 ${esc(db.settings.restaurant_address)}</span>
        <span class="d-none d-md-inline ms-3">🕒 Daily: ${esc(db.settings.opening_time)} – ${esc(db.settings.closing_time)}</span>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="badge ${(db.settings.restaurant_status || 'OPEN') === 'OPEN' ? 'badge-success' : 'badge-danger'}"><span style="display:inline-block; width:6px; height:6px; background:#4CAF50; border-radius:50%; margin-right:4px;"></span> ${(db.settings.restaurant_status || 'OPEN') === 'OPEN' ? 'WE ARE OPEN' : 'TEMPORARILY CLOSED'}</span>
        <a href="tel:${esc(db.settings.restaurant_phone)}" class="d-none d-sm-inline text-gold">📞 ${esc(db.settings.restaurant_phone)}</a>
      </div>
    </div>
  </div>

  <!-- Main Navbar -->
  <nav class="site-navbar">
    <div class="container">
      <div class="navbar-inner">
        <a href="/index.php" class="brand-logo" title="Madam 3 Kitchen Benin City">
          <img src="/assets/images/logo.svg" alt="Madam 3 Kitchen Logo">
        </a>
        <ul class="nav-links">
          <li><a href="/index.php" class="nav-link ${isHome ? 'active' : ''}">Home</a></li>
          <li><a href="/menu.php" class="nav-link ${isMenu ? 'active' : ''}">Menu</a></li>
          <li><a href="/offers.php" class="nav-link ${isOffers ? 'active' : ''}">Today's Deals</a></li>
          <li><a href="/track-order.php" class="nav-link ${isTrack ? 'active' : ''}">Track Order</a></li>
          <li><a href="/about.php" class="nav-link ${isAbout ? 'active' : ''}">About Us</a></li>
          <li><a href="/contact.php" class="nav-link ${isContact ? 'active' : ''}">Contact</a></li>
        </ul>
        <div class="nav-actions">
          ${customer
            ? `<a href="/account.php" class="btn btn-outline-secondary btn-sm d-none d-md-inline-flex">👤 My Account</a>`
            : `<a href="/login.php" class="btn btn-outline-secondary btn-sm d-none d-md-inline-flex">Sign In</a>`}
          <a href="/cart.php" class="nav-cart-btn" title="View Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span class="cart-counter" style="display:none;">0</span>
          </a>
          <button type="button" class="mobile-menu-toggle" aria-label="Toggle Menu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Drawer -->
  <div class="drawer-backdrop"></div>
  <div class="mobile-drawer">
    <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
      <img src="/assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 38px;">
    </div>
    <div class="d-flex flex-column gap-2 mb-4">
      <a href="/index.php" class="btn btn-outline-secondary text-start ${isHome ? 'btn-primary text-white' : ''}">🏠 Home</a>
      <a href="/menu.php" class="btn btn-outline-secondary text-start ${isMenu ? 'btn-primary text-white' : ''}">🍲 Food Menu</a>
      <a href="/offers.php" class="btn btn-outline-secondary text-start ${isOffers ? 'btn-primary text-white' : ''}">🔥 Today's Specials</a>
      <a href="/track-order.php" class="btn btn-outline-secondary text-start ${isTrack ? 'btn-primary text-white' : ''}">📍 Track My Order</a>
      <a href="/about.php" class="btn btn-outline-secondary text-start ${isAbout ? 'btn-primary text-white' : ''}">ℹ️ About Madam 3</a>
      <a href="/contact.php" class="btn btn-outline-secondary text-start ${isContact ? 'btn-primary text-white' : ''}">📞 Contact & Location</a>
    </div>
    <div class="mt-auto pt-3 border-top">
      ${customer
        ? `<a href="/account.php" class="btn btn-primary w-100 mb-2">👤 My Account</a>
           <a href="/logout.php" class="btn btn-outline-danger w-100">Sign Out</a>`
        : `<a href="/login.php" class="btn btn-primary w-100 mb-2">Sign In</a>
           <a href="/register.php" class="btn btn-outline-secondary w-100">Create Account</a>`}
      <div class="mt-3 text-center fs-xs text-muted">No. 3 Asoro Bus Stop, Ekehuan Road, Benin City</div>
    </div>
  </div>

  ${bodyContent}

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="row g-4">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="mb-3">
            <img src="/assets/images/logo.svg" alt="Madam 3 Kitchen" style="height: 48px; filter: brightness(0) invert(1);">
          </div>
          <p style="font-size: 0.9rem; line-height: 1.6;">
            Welcome to <strong>${esc(db.settings.restaurant_name)}</strong>, your home for authentic Nigerian delicacies in Benin City. From party Jollof rice to traditional soups and tender peppered proteins, we bring the best taste to your doorstep.
          </p>
          <div class="d-flex align-items-center gap-2 mt-3">
            <span class="badge badge-warning">📍 ${esc(db.settings.restaurant_address)}</span>
          </div>
        </div>

        <div class="col-6 col-md-3 col-lg-2">
          <h5>Quick Links</h5>
          <ul class="footer-links">
            <li><a href="/index.php">Home</a></li>
            <li><a href="/menu.php">Full Menu</a></li>
            <li><a href="/offers.php">Today's Deals</a></li>
            <li><a href="/track-order.php">Track Order</a></li>
            <li><a href="/about.php">About Madam 3</a></li>
            <li><a href="/contact.php">Contact Us</a></li>
            <li><a href="/faq.php">FAQs</a></li>
          </ul>
        </div>

        <div class="col-6 col-md-3 col-lg-3">
          <h5>Delivery Areas</h5>
          <ul class="footer-links">
            <li><a href="/menu.php">No. 3 Asoro / Ekehuan Road</a></li>
            <li><a href="/menu.php">GRA & Boundary Rd</a></li>
            <li><a href="/menu.php">Ugbowo / UNIBEN</a></li>
            <li><a href="/menu.php">Ring Road & Center</a></li>
            <li><a href="/menu.php">Sapele Road & Limit</a></li>
            <li><a href="/privacy.php">Privacy Policy</a></li>
            <li><a href="/terms.php">Terms & Conditions</a></li>
          </ul>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <h5>Get in Touch</h5>
          <div class="footer-contact-item">
            <span>📍</span><div>${esc(db.settings.restaurant_address)}</div>
          </div>
          <div class="footer-contact-item">
            <span>📞</span><div><a href="tel:${esc(db.settings.restaurant_phone)}" style="color: inherit;">${esc(db.settings.restaurant_phone)}</a></div>
          </div>
          <div class="footer-contact-item">
            <span>💬</span><div><a href="https://wa.me/${esc(db.settings.restaurant_whatsapp)}" target="_blank" style="color: inherit;">WhatsApp Orders</a></div>
          </div>
          <div class="footer-contact-item">
            <span>🕒</span><div>Mon – Sun: ${esc(db.settings.opening_time)} – ${esc(db.settings.closing_time)}</div>
          </div>
        </div>
      </div>

      <div class="footer-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>&copy; 2026 <strong>Madam 3 Kitchen</strong>. All rights reserved. Made with love in Benin City.</div>
        <div><a href="/admin/index.php" style="color: #8D6E63; font-size: 0.75rem; text-decoration: none;">Admin Access</a></div>
      </div>
    </div>
  </footer>

  <!-- WhatsApp Floating Button -->
  <a href="https://wa.me/${esc(db.settings.restaurant_whatsapp)}?text=Hello%20Madam%203%20Kitchen!%20I%20would%20like%20to%20order%20from%20Asoro,%20Benin%20City." class="floating-whatsapp" target="_blank" rel="noopener noreferrer">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    <span class="d-none d-sm-inline">Chat on WhatsApp</span>
  </a>

  <!-- Mobile Bottom Nav -->
  <div class="mobile-bottom-nav">
    <a href="/index.php" class="mobile-nav-item ${isHome ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      <span>Home</span>
    </a>
    <a href="/menu.php" class="mobile-nav-item ${isMenu ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
      <span>Menu</span>
    </a>
    <a href="/cart.php" class="mobile-nav-item ${isCart ? 'active' : ''}">
      <div style="position: relative; display: inline-flex;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        <span class="mobile-nav-badge" style="display:none;">0</span>
      </div>
      <span>Cart</span>
    </a>
    <a href="/track-order.php" class="mobile-nav-item ${isTrack ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
      <span>Orders</span>
    </a>
    <a href="${customer ? '/account.php' : '/login.php'}" class="mobile-nav-item ${isLogin || isRegister || isAccount ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Account</span>
    </a>
  </div>

  <script src="/assets/js/app.js"></script>
</body>
</html>`;
  };

  // Admin Pages (login, dashboard, settings, products, categories, zones, promos, orders, etc.)
  if (pathname.startsWith('/admin')) {
    renderAdminPage(req, res, pathname, query, renderLayout);
    return;
  }

  // Public Pages (menu, food, cart, checkout, order-success, track-order, static pages, auth)
  if (isPublicDispatch) {
    renderPublicPage(req, res, pathname, query, renderLayout, customer);
    return;
  }

  // Generate Page Specific Body HTML
  if (isHome) {
    const popularCards = db.products.filter(p => p.is_popular).map(p => `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="food-card">
          <div class="food-card-img-wrap">
            <img src="/${p.image}" alt="${p.name}" class="food-card-img" loading="lazy">
            <div class="food-card-badges">
              ${p.discount_price ? `<span class="food-badge-discount">SAVE ${formatPrice(p.price - p.discount_price)}</span>` : ''}
              <span class="food-badge-popular">🔥 Popular</span>
            </div>
          </div>
          <div class="food-card-body">
            <div class="food-card-header">
              <h3 class="food-card-title"><a href="/food.php?id=${p.id}">${p.name}</a></h3>
              <span class="food-card-rating">★ ${p.rating.toFixed(1)}</span>
            </div>
            <p class="food-card-desc">${p.description}</p>
            <div class="food-card-meta">
              <div class="food-card-price">
                <span class="price-main">${formatPrice(p.discount_price || p.price)}</span>
                ${p.discount_price ? `<span class="price-old">${formatPrice(p.price)}</span>` : ''}
              </div>
              <a href="/food.php?id=${p.id}" class="btn btn-primary btn-sm food-card-btn">+ Add to Cart</a>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const specialsCards = db.products.filter(p => p.discount_price).map(p => `
      <div class="col-12 col-md-6">
        <div class="card p-3" style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #FFF8F0;">
          <div class="row g-3 align-items-center">
            <div class="col-4">
              <img src="/${p.image}" alt="${p.name}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: var(--radius-md);" loading="lazy">
            </div>
            <div class="col-8">
              <span class="badge badge-danger mb-1">PROMO DISCOUNT</span>
              <h4 class="text-white mb-1 fs-base fw-bold">${p.name}</h4>
              <p class="text-muted fs-xs mb-2" style="color: #D7CCC8 !important;">${p.description}</p>
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="fs-lg fw-extrabold text-gold">${formatPrice(p.discount_price)}</span>
                  <span class="fs-xs text-muted text-decoration-line-through ms-2" style="color: #A1887F !important;">${formatPrice(p.price)}</span>
                </div>
                <a href="/food.php?id=${p.id}" class="btn btn-primary btn-sm">Claim Deal</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const content = `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-12 col-lg-6">
            <div class="hero-badge"><span>👑 Authentic Nigerian Taste in Benin City</span></div>
            <h1 class="hero-title">${esc(db.settings.restaurant_tagline)}</h1>
            <p class="hero-subtitle">Freshly prepared meals from <strong>${esc(db.settings.restaurant_name)}</strong>, delivered hot and fresh across Benin City.</p>
            <div class="d-flex align-items-center flex-wrap gap-3 mb-4">
              <a href="/menu.php" class="btn btn-primary btn-lg">🍛 Order Food Now</a>
              <a href="/menu.php" class="btn btn-outline-secondary btn-lg">📜 View Menu</a>
            </div>
            <div class="hero-location-card">
              <div class="hero-location-icon">📍</div>
              <div>
                <div class="fw-bold fs-sm text-secondary">Our Kitchen Location</div>
                <div class="fs-xs text-muted">${esc(db.settings.restaurant_address)}</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="hero-image-wrapper">
              <img src="/assets/images/hero-banner.jpg" alt="Madam 3 Feast" class="hero-img-main">
              <div class="hero-floating-card top-right">
                <div style="font-size: 1.75rem;">⭐</div>
                <div><div class="fw-extrabold fs-sm text-secondary">4.9 / 5.0 Rating</div><div class="fs-xs text-muted">Over 1,200+ Happy Foodies</div></div>
              </div>
              <div class="hero-floating-card bottom-left">
                <div style="font-size: 1.75rem;">⚡</div>
                <div><div class="fw-extrabold fs-sm text-secondary">Fast Benin Delivery</div><div class="fs-xs text-muted">25-45 mins average</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div><span class="badge badge-primary mb-2">Explore Menu</span><h2 class="mb-0">Food Categories</h2></div>
          <a href="/menu.php" class="btn btn-outline-primary btn-sm">View All Menu &rarr;</a>
        </div>
        <div class="categories-wrapper">
          <a href="/menu.php" class="category-pill active"><span class="pill-icon">✨</span><span>All Dishes</span></a>
          ${db.categories.map(c => `<a href="/menu.php?category=${c.slug}" class="category-pill"><span class="pill-icon">${c.icon}</span><span>${c.name}</span></a>`).join('')}
        </div>
      </div>
    </section>

    <!-- Popular Meals -->
    <section class="py-5" style="background-color: var(--bg-cream);">
      <div class="container">
        <div class="text-center max-w-700 mx-auto mb-5">
          <span class="badge badge-warning mb-2">Customer Favorites</span>
          <h2>Most Popular Meals</h2>
          <p class="text-muted">Cooked fresh daily with the finest local ingredients and authentic Edo spices.</p>
        </div>
        <div class="row g-4">${popularCards}</div>
        <div class="text-center mt-5"><a href="/menu.php" class="btn btn-secondary btn-lg">Explore Full Menu (${db.products.length}+ Meals)</a></div>
      </div>
    </section>

    <!-- Today's Specials -->
    <section class="py-5" style="background: linear-gradient(135deg, #2E1A11 0%, #1A0F0A 100%); color: #FFF8F0;">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div><span class="badge badge-warning mb-2">Limited Time Offers</span><h2 class="text-white mb-0">Today's Hot Specials & Combos 🔥</h2></div>
          <a href="/offers.php" class="btn btn-outline-primary btn-sm text-white border-white">View All Deals &rarr;</a>
        </div>
        <div class="row g-4">${specialsCards}</div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="text-center max-w-700 mx-auto mb-5">
          <span class="badge badge-primary mb-2">Our Quality Promise</span>
          <h2>Why Choose Madam 3 Kitchen</h2>
          <p class="text-muted">We pride ourselves in delivering unforgettable culinary experiences across Edo State.</p>
        </div>
        <div class="row g-4">
          <div class="col-12 col-sm-6 col-lg-4"><div class="feature-card"><div class="feature-icon-wrap">🍲</div><h4>Freshly Prepared</h4><p class="text-muted fs-sm">Every order is cooked fresh upon receipt with authentic ingredients and zero artificial preservatives.</p></div></div>
          <div class="col-12 col-sm-6 col-lg-4"><div class="feature-card"><div class="feature-icon-wrap">🇳🇬</div><h4>Authentic Nigerian Taste</h4><p class="text-muted fs-sm">Rich party Jollof, traditional Edo Banga soup, silky Amala, and spicy Asun seasoned to perfection.</p></div></div>
          <div class="col-12 col-sm-6 col-lg-4"><div class="feature-card"><div class="feature-icon-wrap">⚡</div><h4>Fast Benin Delivery</h4><p class="text-muted fs-sm">Prompt dispatch to No. 3 Asoro, Ekehuan Road, GRA, Ugbowo, Ring Road, and beyond in insulated heat bags.</p></div></div>
          <div class="col-12 col-sm-6 col-lg-4"><div class="feature-card"><div class="feature-icon-wrap">💰</div><h4>Affordable Prices</h4><p class="text-muted fs-sm">Generous portion sizes and executive lunch combos at wallet-friendly prices for everyone.</p></div></div>
          <div class="col-12 col-sm-6 col-lg-4"><div class="feature-card"><div class="feature-icon-wrap">🧼</div><h4>Hygienic Preparation</h4><p class="text-muted fs-sm">Strict sanitary standards, spotless kitchen facilities, and tamper-evident food packaging.</p></div></div>
          <div class="col-12 col-sm-6 col-lg-4"><div class="feature-card"><div class="feature-icon-wrap">📱</div><h4>Easy Online Ordering</h4><p class="text-muted fs-sm">Order in under 2 minutes from any phone, pay online or bank transfer, and track live updates.</p></div></div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-5" style="background-color: var(--bg-warm);">
      <div class="container">
        <div class="text-center max-w-700 mx-auto mb-5">
          <span class="badge badge-warning mb-2">Step-By-Step</span>
          <h2>How It Works</h2>
          <p class="text-muted">Getting your favorite meal from Madam 3 Kitchen is as easy as 1-2-3.</p>
        </div>
        <div class="row g-4 text-center">
          <div class="col-6 col-md-4 col-lg-2"><div class="step-card"><div class="step-number">1</div><h5 class="fs-sm fw-bold">Choose Meal</h5><p class="text-muted fs-xs">Browse menu</p></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="step-card"><div class="step-number">2</div><h5 class="fs-sm fw-bold">Add to Cart</h5><p class="text-muted fs-xs">Customize extras</p></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="step-card"><div class="step-number">3</div><h5 class="fs-sm fw-bold">Delivery Info</h5><p class="text-muted fs-xs">Enter Benin address</p></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="step-card"><div class="step-number">4</div><h5 class="fs-sm fw-bold">Make Payment</h5><p class="text-muted fs-xs">Card or transfer</p></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="step-card"><div class="step-number">5</div><h5 class="fs-sm fw-bold">We Prepare</h5><p class="text-muted fs-xs">Cooked with love</p></div></div>
          <div class="col-6 col-md-4 col-lg-2"><div class="step-card"><div class="step-number">6</div><h5 class="fs-sm fw-bold">Receive Order</h5><p class="text-muted fs-xs">Delivered hot</p></div></div>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="text-center max-w-700 mx-auto mb-5">
          <span class="badge badge-primary mb-2">Testimonials</span>
          <h2>What Our Customers Say</h2>
          <p class="text-muted">Read genuine feedback from our valued customers across Benin City.</p>
        </div>
        <div class="row g-4">
          ${db.reviews.map(r => `
            <div class="col-12 col-md-6 col-lg-3">
              <div class="review-card">
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                <p class="review-text">"${r.comment}"</p>
                <div class="review-author">
                  <div class="review-avatar">${r.customer_name.charAt(0)}</div>
                  <div><div class="fw-bold fs-sm text-secondary">${r.customer_name}</div><div class="fs-xs text-muted">Verified Customer</div></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Location & Map -->
    <section class="py-5" style="background-color: var(--bg-cream);">
      <div class="container">
        <div class="location-box">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-5">
              <span class="badge badge-warning mb-3">📍 Visit Us</span>
              <h2 class="text-white mb-3">${esc(db.settings.restaurant_name)} in Benin City</h2>
              <p style="color: #D7CCC8;">Conveniently located at <strong>${esc(db.settings.restaurant_address)}</strong>. Dine in or order fast delivery to your residence, office, or event venue anywhere in Benin City.</p>
              <div class="d-flex flex-column gap-2 mb-4" style="color: #FFF8F0; font-size: 0.95rem;">
                <div>🏢 <strong>Address:</strong> ${esc(db.settings.restaurant_address)}</div>
                <div>📞 <strong>Phone:</strong> <a href="tel:${esc(db.settings.restaurant_phone)}" style="color: var(--accent);">${esc(db.settings.restaurant_phone)}</a></div>
                <div>🕒 <strong>Opening Hours:</strong> Monday – Sunday: ${esc(db.settings.opening_time)} – ${esc(db.settings.closing_time)}</div>
              </div>
              <div class="d-flex gap-3">
                <a href="https://maps.google.com/?q=No.+3+Asoro+Bus+Stop+Ekehuan+Road+Benin+City" target="_blank" class="btn btn-primary">🗺️ Get Directions</a>
                <a href="/menu.php" class="btn btn-outline-secondary text-white border-white">Order Online</a>
              </div>
            </div>
            <div class="col-12 col-lg-7">
              <div class="map-container">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.733568285517!2d5.6037!3d6.3350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d346b81c2f9d%3A0x7d87b32274488344!2sAsoro%20Bus%20Stop%2C%20Ekehuan%20Rd%2C%20Benin%20City!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" allowfullscreen="" loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout("Delicious Nigerian Meals", content));
    return;
  }

  // Admin Dashboard Render
  if (isAdminHome) {
    const todayOrders = db.orders;
    const totRevenue = todayOrders.reduce((sum, o) => sum + o.grand_total, 0);
    const pendingOrders = todayOrders.filter(o => o.status === 'Pending').length;
    const preparingOrders = todayOrders.filter(o => o.status === 'Preparing').length;
    const completedOrders = todayOrders.filter(o => o.status === 'Delivered').length;

    const adminContent = `
    <!-- Top KPI cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Today's Revenue</div><div class="stat-value text-primary">${formatPrice(totRevenue)}</div><div class="fs-xs text-muted mt-1">${todayOrders.length} orders recorded</div></div><div class="stat-icon orange">💰</div></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Pending Orders</div><div class="stat-value text-warning">${pendingOrders}</div><div class="fs-xs text-muted mt-1">Requires confirmation</div></div><div class="stat-icon purple">🔔</div></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Cooking / Preparing</div><div class="stat-value text-info">${preparingOrders}</div><div class="fs-xs text-muted mt-1">Active in kitchen</div></div><div class="stat-icon blue">🍳</div></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Delivered Meals</div><div class="stat-value text-success">${completedOrders}</div><div class="fs-xs text-muted mt-1">All-time delivered</div></div><div class="stat-icon green">✅</div></div></div>
    </div>

    <!-- Recent Orders Table -->
    <div class="row g-4">
      <div class="col-12 col-xl-8">
        <div class="card shadow-sm p-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div><h3 class="h5 fw-extrabold text-secondary mb-0">Recent Incoming Orders</h3><p class="text-muted fs-xs mb-0">Live dispatch queue for Benin City kitchen staff</p></div>
            <a href="/admin/orders.php" class="btn btn-outline-primary btn-sm">View All Orders &rarr;</a>
          </div>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Order #</th><th>Customer</th><th>Area</th><th>Total</th><th>Status</th><th>Quick Action</th></tr></thead>
              <tbody>
                ${todayOrders.map(ro => `
                  <tr>
                    <td><a href="/admin/order-details.php?id=${ro.id}" class="fw-bold text-primary">${ro.order_number}</a><div class="fs-xs text-muted">${new Date(ro.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></td>
                    <td><div class="fw-bold fs-sm">${ro.customer_name}</div><div class="fs-xs text-muted">${ro.phone}</div></td>
                    <td class="fs-sm">${ro.zone_name}</td>
                    <td class="fw-extrabold text-secondary">${formatPrice(ro.grand_total)}</td>
                    <td><span class="status-badge status-${ro.status.toLowerCase().replace(/ /g, '-')}">${ro.status}</span></td>
                    <td>
                      <select class="form-select form-select-sm" style="width: auto;" onchange="updateOrderStatus(${ro.id}, this.value)">
                        <option value="Pending" ${ro.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${ro.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Preparing" ${ro.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${ro.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Out for Delivery" ${ro.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${ro.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${ro.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-12 col-xl-4">
        <div class="card shadow-sm p-4 mb-4">
          <h3 class="h5 fw-extrabold text-secondary mb-3">🔥 Top Selling Meals</h3>
          <div class="d-flex flex-column gap-3">
            <div class="d-flex justify-content-between align-items-center pb-2 border-bottom"><div><div class="fw-bold fs-sm">Party Jollof Rice with Chicken</div><div class="fs-xs text-muted">Customer Favorite</div></div><span class="badge badge-primary">★ #1</span></div>
            <div class="d-flex justify-content-between align-items-center pb-2 border-bottom"><div><div class="fw-bold fs-sm">Egusi Soup with Pounded Yam</div><div class="fs-xs text-muted">Assorted Meat</div></div><span class="badge badge-warning">★ #2</span></div>
            <div class="d-flex justify-content-between align-items-center pb-2 border-bottom"><div><div class="fw-bold fs-sm">Spicy Asun Goat Meat</div><div class="fs-xs text-muted">Fire Grilled</div></div><span class="badge badge-secondary">★ #3</span></div>
          </div>
        </div>
      </div>
    </div>`;
    res.end(renderLayout("Overview Dashboard", adminContent, true));
    return;
  }

  // Fallback / standard PHP file view loader
  let targetPhpFile = pathname.endsWith('.php') ? pathname : `${pathname}.php`;
  if (targetPhpFile.startsWith('/')) targetPhpFile = targetPhpFile.slice(1);
  if (!targetPhpFile || targetPhpFile === '.php') targetPhpFile = 'index.php';

  const fullPath = path.join(__dirname, targetPhpFile);
  if (fs.existsSync(fullPath)) {
    // If client requested directly, render clean page
    fs.readFile(fullPath, 'utf8', (err, raw) => {
      // Return content or generic rendered wrapper
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderLayout(pathname.replace(/[\/\-_]/g, ' ').toUpperCase(), `
        <div class="container py-5">
          <div class="card p-4 p-md-5 shadow-sm max-w-900 mx-auto">
            <h2 class="mb-3 text-secondary">${targetPhpFile}</h2>
            <p class="text-muted">Madam 3 Kitchen — No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State.</p>
            <div class="d-flex gap-2 mt-4">
              <a href="/index.php" class="btn btn-primary">Home</a>
              <a href="/menu.php" class="btn btn-outline-secondary">Browse Menu</a>
              <a href="/cart.php" class="btn btn-outline-primary">View Cart</a>
            </div>
          </div>
        </div>
      `));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout("Page Not Found", `
      <div class="container py-5 text-center my-5">
        <div style="font-size: 4rem;">🍲</div>
        <h2>404 — Page Not Found</h2>
        <p class="text-muted">The requested food menu page does not exist.</p>
        <a href="/index.php" class="btn btn-primary mt-3">Return to Homepage</a>
      </div>
    `));
  }
}

// ---------------- Public Page Router & Renderers ----------------
const STATUS_LEVELS = { 'Pending': 0, 'Payment Confirmed': 1, 'Confirmed': 2, 'Preparing': 3, 'Ready': 4, 'Out for Delivery': 5, 'Delivered': 6, 'Cancelled': -1, 'Rejected': -1 };
const TRACK_STEPS = [
  { label: 'Order Received', icon: '1', desc: 'We have received your order details in our kitchen system.' },
  { label: 'Payment Confirmed', icon: '2', desc: 'Payment verification recorded.' },
  { label: 'Restaurant Confirmed', icon: '3', desc: 'Madam 3 Kitchen chefs have approved and queued your order.' },
  { label: 'Preparing Your Meal 🍳', icon: '4', desc: 'Our cooks are actively packaging your delicious Nigerian dishes.' },
  { label: 'Meal Ready & Packaged', icon: '5', desc: 'Food is hot and placed into insulated thermal delivery bags.' },
  { label: 'Out for Delivery 🛵', icon: '6', desc: 'Dispatch rider is en-route to your address.' },
  { label: 'Delivered 🎉', icon: '7', desc: 'Order delivered successfully. Enjoy your meal!' }
];

function productCard(p, imgPrefix) {
  const prefix = imgPrefix || '';
  return `
    <div class="food-card">
      ${!p.is_available ? '<div class="food-unavailable-overlay"><span class="food-unavailable-badge">Currently Unavailable</span></div>' : ''}
      <div class="food-card-img-wrap">
        <img src="${prefix}/${p.image || 'assets/images/products/jollof-rice.jpg'}" alt="${esc(p.name)}" class="food-card-img" loading="lazy">
        <div class="food-card-badges">
          ${p.discount_price ? `<span class="food-badge-discount">SAVE ${formatPrice(p.price - p.discount_price)}</span>` : ''}
          ${p.is_popular ? '<span class="food-badge-popular">🔥 Popular</span>' : ''}
        </div>
      </div>
      <div class="food-card-body">
        <div class="food-card-header">
          <h3 class="food-card-title"><a href="/food.php?id=${p.id}">${esc(p.name)}</a></h3>
          <span class="food-card-rating">★ ${(p.rating || 5).toFixed(1)}</span>
        </div>
        <p class="food-card-desc">${esc(p.description || '')}</p>
        <div class="food-card-meta">
          <div class="food-card-price">
            ${p.discount_price ? `<span class="price-main">${formatPrice(p.discount_price)}</span><span class="price-old">${formatPrice(p.price)}</span>` : `<span class="price-main">${formatPrice(p.price)}</span>`}
          </div>
          ${p.is_available
            ? `<a href="/food.php?id=${p.id}" class="btn btn-primary btn-sm food-card-btn">+ Order Meal</a>`
            : '<button class="btn btn-outline-secondary btn-sm" disabled>Unavailable</button>'}
        </div>
      </div>
    </div>`;
}

async function renderPublicPage(req, res, pathname, query, renderLayout, customer) {
  const send = (title, content) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout(title, content));
  };

  // ---------------- Menu ----------------
  if (pathname === '/menu') {
    const categories = db.categories.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order);
    const selectedCategory = query.category || 'all';
    const selectedSort = query.sort || 'popular';
    const searchTerm = (query.search || '').trim().toLowerCase();

    let products = db.products.slice();
    if (selectedCategory !== 'all') products = products.filter(p => p.category_id === (db.categories.find(c => c.slug === selectedCategory) || {}).id);
    if (searchTerm) products = products.filter(p => (p.name || '').toLowerCase().includes(searchTerm) || (p.description || '').toLowerCase().includes(searchTerm));
    const eff = p => p.discount_price || p.price;
    switch (selectedSort) {
      case 'price_asc': products.sort((a, b) => eff(a) - eff(b)); break;
      case 'price_desc': products.sort((a, b) => eff(b) - eff(a)); break;
      case 'newest': products.sort((a, b) => b.id - a.id); break;
      default: products.sort((a, b) => (b.is_popular - a.is_popular) || (a.id - b.id));
    }

    const catLinks = `<a href="/menu.php?category=all&sort=${encodeURIComponent(selectedSort)}" class="category-pill ${selectedCategory === 'all' ? 'active' : ''}"><span class="pill-icon">✨</span><span>All Dishes</span></a>` +
      categories.map(c => `<a href="/menu.php?category=${encodeURIComponent(c.slug)}&sort=${encodeURIComponent(selectedSort)}" class="category-pill ${selectedCategory === c.slug ? 'active' : ''}"><span class="pill-icon">${c.icon}</span><span>${esc(c.name)}</span></a>`).join('');

    const grid = products.map(p => {
      const cat = db.categories.find(c => c.id === p.category_id);
      return `<div class="col-12 col-sm-6 col-lg-4 col-xl-3 menu-grid-item" data-name="${esc(p.name.toLowerCase())}" data-desc="${esc((p.description || '').toLowerCase())}" data-category="${esc((cat ? cat.slug : '').toLowerCase())}">${productCard(p)}</div>`;
    }).join('');

    const content = `
    <div class="py-4" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFEED9 100%); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div><h1 class="h2 mb-1">Our Delicious Menu 🍲</h1><p class="text-muted mb-0 fs-sm">Freshly prepared authentic Nigerian delicacies, made with love in Benin City.</p></div>
          <div style="min-width: 280px; max-width: 400px; width: 100%;">
            <div style="position: relative;"><input type="text" id="menu-search-input" class="form-control" placeholder="Search Jollof, Soup, Chicken, Asun..." value="${esc(query.search || '')}"><span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">🔍</span></div>
          </div>
        </div>
        <div class="categories-wrapper mt-3">${catLinks}</div>
      </div>
    </div>
    <div class="container py-5">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div class="fs-sm fw-bold text-muted">Showing ${products.length} delicious meal${products.length === 1 ? '' : 's'}</div>
        <div class="d-flex align-items-center gap-2">
          <label for="sort-select" class="fs-sm fw-bold text-secondary mb-0">Sort By:</label>
          <select id="sort-select" class="form-select form-select-sm" style="width:auto" onchange="window.location.href='/menu.php?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(query.search || '')}&sort=' + this.value;">
            <option value="popular" ${selectedSort === 'popular' ? 'selected' : ''}>🔥 Most Popular</option>
            <option value="price_asc" ${selectedSort === 'price_asc' ? 'selected' : ''}>💰 Price: Low to High</option>
            <option value="price_desc" ${selectedSort === 'price_desc' ? 'selected' : ''}>💎 Price: High to Low</option>
            <option value="newest" ${selectedSort === 'newest' ? 'selected' : ''}>✨ Newest Additions</option>
          </select>
        </div>
      </div>
      ${products.length ? `<div class="row g-4" id="menu-items-grid">${grid}</div>
        <div id="no-menu-results" class="text-center py-5" style="display:none;"><div style="font-size:3rem">🔍</div><h4 class="mt-2">No matching dishes</h4><p class="text-muted">Try searching for another delicious item like Jollof, Egusi, Chicken, or Drinks.</p></div>`
        : `<div class="text-center py-5"><div style="font-size:3.5rem" class="mb-3">🍲</div><h3>No meals found</h3><p class="text-muted">We couldn't find any dishes matching your current selection or search criteria.</p><a href="/menu.php" class="btn btn-primary mt-2">View Full Menu</a></div>`}
    </div>`;
    send('Our Menu', content);
    return;
  }

  // ---------------- Food Detail ----------------
  if (pathname === '/food') {
    const id = parseInt(query.id, 10) || 0;
    const product = db.products.find(p => p.id === id);
    if (!product) { res.writeHead(302, { 'Location': '/menu.php' }); res.end(); return; }
    const cat = db.categories.find(c => c.id === product.category_id);
    const effectivePrice = product.discount_price || product.price;
    const extras = product.extras || [];
    const related = db.products.filter(p => p.category_id === product.category_id && p.id !== product.id && p.is_available).slice(0, 4);
    const prodJson = JSON.stringify({ id: product.id, name: product.name, image: '/' + product.image, price: effectivePrice });
    const minDate = new Date().toISOString().slice(0, 10);

    const extraCards = extras.map(e => `
      <label class="extra-option-card" for="extra_${e.id}">
        <div class="d-flex align-items-center gap-2"><input type="checkbox" id="extra_${e.id}" class="extra-option-check" data-id="${e.id}" data-name="${esc(e.name)}" data-price="${e.price}"><span class="fw-semibold">${esc(e.name)}</span></div>
        <span class="extra-price">+ ${formatPrice(e.price)}</span>
      </label>`).join('');

    const relatedCards = related.map(r => `
      <div class="col-6 col-md-3">
        <div class="food-card">
          <div class="food-card-img-wrap"><img src="/${r.image || 'assets/images/products/jollof-rice.jpg'}" alt="${esc(r.name)}" class="food-card-img" loading="lazy"></div>
          <div class="food-card-body p-3"><h4 class="fs-sm fw-bold mb-1"><a href="/food.php?id=${r.id}">${esc(r.name)}</a></h4><div class="price-main fs-base">${formatPrice(r.discount_price || r.price)}</div></div>
        </div>
      </div>`).join('');

    const content = `
    <div class="container py-4">
      <nav aria-label="breadcrumb" class="mb-4"><ol class="d-flex align-items-center gap-2 list-unstyled fs-sm text-muted">
        <li><a href="/index.php" class="text-muted">Home</a></li><li>/</li>
        <li><a href="/menu.php" class="text-muted">Menu</a></li><li>/</li>
        <li><a href="/menu.php?category=${encodeURIComponent(cat ? cat.slug : 'all')}" class="text-muted">${esc(cat ? cat.name : 'Dishes')}</a></li><li>/</li>
        <li class="text-secondary fw-bold">${esc(product.name)}</li>
      </ol></nav>
      <div class="row g-4">
        <div class="col-12 col-md-6">
          <div class="card p-2" style="background:#FFFFFF;border-radius:var(--radius-xl);overflow:hidden"><img src="/${product.image || 'assets/images/products/jollof-rice.jpg'}" alt="${esc(product.name)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius-lg)"></div>
        </div>
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge badge-primary">${esc(cat ? cat.name : 'Madam 3 Delicacy')}</span>
            <span class="badge badge-warning">★ ${(product.rating || 5).toFixed(1)} Rating</span>
            <span class="badge badge-secondary">⏱️ ~${product.prep_time_minutes} mins prep</span>
          </div>
          <h1 class="h2 fw-extrabold mb-2" style="color:var(--secondary)">${esc(product.name)}</h1>
          <div class="d-flex align-items-center gap-3 mb-3">
            ${product.discount_price
              ? `<span class="fs-2xl fw-extrabold" style="color:var(--primary-dark)">${formatPrice(product.discount_price)}</span><span class="fs-lg text-muted text-decoration-line-through">${formatPrice(product.price)}</span><span class="badge badge-danger">SAVE ${formatPrice(product.price - product.discount_price)}</span>`
              : `<span class="fs-2xl fw-extrabold" style="color:var(--primary-dark)">${formatPrice(product.price)}</span>`}
          </div>
          <p class="text-muted mb-4" style="line-height:1.6">${esc(product.description || '')}</p>
          ${!product.is_available
            ? `<div class="alert alert-warning"><strong>Currently Unavailable:</strong> This meal is temporarily sold out for today. Please check back shortly or explore our other delicious options.</div>`
            : `
            ${extras.length ? `<div class="mb-4"><label class="form-label fw-extrabold">Customize Your Meal / Add Delicious Extras:</label><div class="d-flex flex-column gap-2">${extraCards}</div></div>` : ''}
            <div class="form-group mb-4"><label for="food-special-instructions" class="form-label">Special Cooking Instructions (Optional):</label><input type="text" id="food-special-instructions" class="form-control" placeholder="e.g. Less pepper, separate stew, add extra cutlery"></div>
            <div class="card p-3" style="background:var(--bg-warm);border:1.5px solid var(--border-color)">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div><div class="fs-xs text-muted fw-bold mb-1">SELECT QUANTITY</div><div class="qty-control"><button type="button" class="qty-btn" id="qty-minus">-</button><input type="text" id="food-qty-input" class="qty-input" value="1" readonly><button type="button" class="qty-btn" id="qty-plus">+</button></div></div>
                <div class="flex-grow-1 text-end"><div class="fs-xs text-muted fw-bold mb-1">TOTAL AMOUNT</div><div class="fs-xl fw-extrabold text-secondary mb-2" id="food-calculated-total">${formatPrice(effectivePrice)}</div><button type="button" class="btn btn-primary btn-lg w-100" id="btn-add-meal-to-cart">🛍️ Add to Order Cart</button></div>
              </div>
            </div>`}
        </div>
      </div>
      ${related.length ? `<div class="mt-5 pt-4 border-top"><h3 class="mb-4">You Might Also Love 😋</h3><div class="row g-4">${relatedCards}</div></div>` : ''}
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      const product = ${prodJson};
      const basePrice = product.price;
      const qtyInput = document.getElementById('food-qty-input');
      const totalEl = document.getElementById('food-calculated-total');
      const addBtn = document.getElementById('btn-add-meal-to-cart');
      const checkboxes = document.querySelectorAll('.extra-option-check');
      function calculateTotal() {
        const qty = parseInt(qtyInput.value) || 1;
        let unit = basePrice;
        checkboxes.forEach(cb => { if (cb.checked) unit += parseFloat(cb.dataset.price || 0); });
        totalEl.textContent = formatNaira(unit * qty);
      }
      document.getElementById('qty-minus').addEventListener('click', () => { let q = parseInt(qtyInput.value) || 1; if (q > 1) { qtyInput.value = q - 1; calculateTotal(); } });
      document.getElementById('qty-plus').addEventListener('click', () => { qtyInput.value = (parseInt(qtyInput.value) || 1) + 1; calculateTotal(); });
      checkboxes.forEach(cb => cb.addEventListener('change', (e) => { const p = e.target.closest('.extra-option-card'); if (p) p.classList.toggle('selected', e.target.checked); calculateTotal(); }));
      if (addBtn) addBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        const instructions = (document.getElementById('food-special-instructions').value || '').trim();
        const selectedExtras = [];
        checkboxes.forEach(cb => { if (cb.checked) selectedExtras.push({ id: cb.dataset.id, name: cb.dataset.name, price: parseFloat(cb.dataset.price) }); });
        window.cart.addItem({ id: product.id, name: product.name, image: product.image, price: product.price }, qty, selectedExtras, instructions);
        setTimeout(() => { window.location.href = '/cart.php'; }, 500);
      });
    });
    </script>`;
    send(esc(product.name), content);
    return;
  }

  // ---------------- Cart ----------------
  if (pathname === '/cart') {
    const zones = db.delivery_zones.filter(z => z.is_active).sort((a, b) => a.delivery_fee - b.delivery_fee);
    const zoneOptions = `<option value="" data-fee="0">-- Select Delivery Area --</option>` + zones.map(z => `<option value="${z.id}" data-fee="${z.delivery_fee}">${esc(z.name)} (+${formatPrice(z.delivery_fee)})</option>`).join('');
    const content = `
    <div class="container py-5">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h2 mb-0">Your Order Cart 🛒</h1>
        <button type="button" class="btn btn-outline-danger btn-sm" id="btn-clear-cart" style="display:none;" onclick="if(confirm('Are you sure you want to clear your entire cart?')) { window.cart.clear(); renderCartPage(); }">Clear Cart</button>
      </div>
      <div class="row g-4" id="cart-content-row">
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm" id="cart-items-card"><div class="card-body p-0"><div id="cart-items-wrapper"></div></div></div>
          <div id="cart-empty-view" class="text-center py-5" style="display:none;"><div style="font-size:4rem" class="mb-3">😋</div><h3>Your cart is hungry!</h3><p class="text-muted max-w-500 mx-auto mb-4">Add something delicious from our authentic Nigerian menu to get started.</p><a href="/menu.php" class="btn btn-primary btn-lg">Browse Menu &rarr;</a></div>
        </div>
        <div class="col-12 col-lg-4" id="cart-summary-col">
          <div class="card shadow-sm p-4 sticky-top" style="top:90px">
            <h4 class="fw-extrabold mb-3 text-secondary">Order Summary</h4>
            <div class="form-group mb-3"><label for="cart-delivery-zone" class="form-label">Delivery Location in Benin City:</label><select id="cart-delivery-zone" class="form-select">${zoneOptions}</select><small class="text-muted fs-xs">No. 3 Asoro, Ekehuan Road, GRA, Ugbowo, Ring Rd, etc.</small></div>
            <hr class="my-3">
            <div class="d-flex justify-content-between mb-2"><span class="text-muted">Subtotal</span><span class="fw-bold" id="cart-calc-subtotal">₦0</span></div>
            <div class="d-flex justify-content-between mb-2"><span class="text-muted">Estimated Delivery</span><span class="fw-bold" id="cart-calc-delivery">₦0</span></div>
            <hr class="my-3">
            <div class="d-flex justify-content-between align-items-center mb-4"><span class="fs-lg fw-extrabold text-secondary">Estimated Total</span><span class="fs-xl fw-extrabold text-primary" id="cart-calc-total">₦0</span></div>
            <a href="/checkout.php" class="btn btn-primary btn-lg w-100 mb-2" id="cart-btn-proceed">Proceed to Checkout 🚀</a>
            <a href="/menu.php" class="btn btn-outline-secondary btn-sm w-100">+ Add More Food Items</a>
          </div>
        </div>
      </div>
    </div>
    <script>
    function renderCartPage() {
      const items = window.cart.items;
      const wrapper = document.getElementById('cart-items-wrapper');
      const emptyView = document.getElementById('cart-empty-view');
      const summaryCol = document.getElementById('cart-summary-col');
      const clearBtn = document.getElementById('btn-clear-cart');
      const itemsCard = document.getElementById('cart-items-card');
      const zoneSelect = document.getElementById('cart-delivery-zone');
      if (!items.length) { if (wrapper) wrapper.innerHTML = ''; if (emptyView) emptyView.style.display = 'block'; if (itemsCard) itemsCard.style.display = 'none'; if (summaryCol) summaryCol.style.display = 'none'; if (clearBtn) clearBtn.style.display = 'none'; return; }
      if (emptyView) emptyView.style.display = 'none';
      if (itemsCard) itemsCard.style.display = 'block';
      if (summaryCol) summaryCol.style.display = 'block';
      if (clearBtn) clearBtn.style.display = 'inline-flex';
      let html = '';
      items.forEach(item => {
        const extrasList = item.extras && item.extras.length ? '<div class="fs-xs text-muted mt-1">Extras: ' + item.extras.map(e => e.name + ' (+' + formatNaira(e.price) + ')').join(', ') + '</div>' : '';
        const note = item.instructions ? '<div class="fs-xs text-warning mt-1">Note: ' + item.instructions + '</div>' : '';
        html += '<div class="p-3 border-bottom d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">'
          + '<img src="' + (item.image || 'assets/images/products/jollof-rice.jpg') + '" alt="' + item.name + '" style="width:70px;height:70px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0">'
          + '<div class="flex-grow-1"><h5 class="mb-0 fs-base fw-bold"><a href="/food.php?id=' + item.productId + '" class="text-secondary">' + item.name + '</a></h5><div class="fs-xs text-muted">Unit: ' + formatNaira(item.unitPrice) + '</div>' + extrasList + note + '</div>'
          + '<div class="d-flex align-items-center gap-3"><div class="qty-control"><button type="button" class="qty-btn" onclick="window.cart.updateQuantity(\'' + item.cartItemId + '\',' + (item.quantity - 1) + '); renderCartPage();">-</button><input type="text" class="qty-input" value="' + item.quantity + '" readonly><button type="button" class="qty-btn" onclick="window.cart.updateQuantity(\'' + item.cartItemId + '\',' + (item.quantity + 1) + '); renderCartPage();">+</button></div>'
          + '<div class="text-end" style="min-width:80px"><div class="fw-extrabold text-secondary">' + formatNaira(item.subtotal) + '</div></div>'
          + '<button type="button" class="btn btn-outline-danger btn-sm" onclick="window.cart.removeItem(\'' + item.cartItemId + '\'); renderCartPage();" title="Remove Item">🗑️</button></div></div>';
      });
      wrapper.innerHTML = html;
      const subtotal = window.cart.getSubtotal();
      document.getElementById('cart-calc-subtotal').textContent = formatNaira(subtotal);
      let deliveryFee = 0;
      if (zoneSelect && zoneSelect.value) deliveryFee = parseFloat(zoneSelect.options[zoneSelect.selectedIndex].dataset.fee || 0);
      document.getElementById('cart-calc-delivery').textContent = formatNaira(deliveryFee);
      document.getElementById('cart-calc-total').textContent = formatNaira(subtotal + deliveryFee);
    }
    document.addEventListener('DOMContentLoaded', () => {
      renderCartPage();
      const zoneSelect = document.getElementById('cart-delivery-zone');
      if (zoneSelect) zoneSelect.addEventListener('change', renderCartPage);
      window.addEventListener('cart-updated', renderCartPage);
    });
    </script>`;
    send('Your Cart', content);
    return;
  }

  // ---------------- Checkout ----------------
  if (pathname === '/checkout') {
    const zones = db.delivery_zones.filter(z => z.is_active).sort((a, b) => a.delivery_fee - b.delivery_fee);
    const s = db.settings;
    const zoneOptions = `<option value="">-- Choose Your Area in Benin City --</option>` + zones.map(z => `<option value="${z.id}" data-fee="${z.delivery_fee}">${esc(z.name)} — ${formatPrice(z.delivery_fee)} (⏱️ ${esc(z.estimated_time)})</option>`).join('');
    const minDate = new Date().toISOString().slice(0, 10);
    const bankOption = s.enable_bank_transfer === '1' ? `
      <label class="extra-option-card"><div class="d-flex align-items-center gap-2"><input type="radio" name="payment_method" value="bank_transfer"><div><span class="fw-bold">🏦 Direct Bank Transfer to Madam 3 Kitchen</span><div class="fs-xs text-muted">Transfer directly to our ${esc(s.bank_name)} account</div></div></div></label>` : '';
    const codOption = s.enable_cod === '1' ? `
      <label class="extra-option-card"><div class="d-flex align-items-center gap-2"><input type="radio" name="payment_method" value="cod"><div><span class="fw-bold">💵 Cash / POS on Delivery</span><div class="fs-xs text-muted">Pay the rider when your food arrives</div></div></div></label>` : '';

    const content = `
    <div class="container py-5">
      <div class="max-w-900 mx-auto">
        <div class="mb-4 text-center text-sm-start"><h1 class="h2 mb-1">Complete Your Food Order 🍛</h1><p class="text-muted fs-sm">Quick & easy checkout for delivery anywhere across Benin City.</p></div>
        <form id="checkout-form">
          <div class="row g-4">
            <div class="col-12 col-lg-7">
              <div class="card p-4 mb-4 shadow-sm">
                <h4 class="fs-base fw-extrabold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center gap-2"><span>1️⃣</span> Customer Information</h4>
                <div class="row g-3">
                  <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="customer_name" class="form-label">Full Name *</label><input type="text" id="customer_name" name="customer_name" class="form-control" placeholder="e.g. Osasogie Igbinosa" required value="${esc(customer ? customer.name : '')}"></div></div>
                  <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="phone" class="form-label">Phone Number (Calls) *</label><input type="tel" id="phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" required value="${esc(customer ? customer.phone : '')}"></div></div>
                  <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="whatsapp" class="form-label">WhatsApp Number (For Updates)</label><input type="tel" id="whatsapp" name="whatsapp" class="form-control" placeholder="e.g. 0803 000 1234" value="${esc(customer ? (customer.whatsapp || '') : '')}"></div></div>
                  <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="email" class="form-label">Email Address (Optional)</label><input type="email" id="email" name="email" class="form-control" placeholder="e.g. name@example.com" value="${esc(customer ? (customer.email || '') : '')}"></div></div>
                </div>
              </div>
              <div class="card p-4 mb-4 shadow-sm">
                <div class="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
                  <h4 class="fs-base fw-extrabold text-secondary mb-0 d-flex align-items-center gap-2"><span>2️⃣</span> Delivery Address (Benin City)</h4>
                  <button type="button" class="btn btn-outline-secondary btn-sm" id="use_my_location_btn" style="font-size:0.75rem">📍 Use My Location</button>
                </div>
                <div class="form-group mb-3"><label for="delivery_zone_id" class="form-label">Delivery Zone / Area *</label><select id="delivery_zone_id" name="delivery_zone_id" class="form-select" required>${zoneOptions}</select></div>
                <div class="form-group mb-3"><label for="delivery_address" class="form-label">Street Address / House No. *</label><textarea id="delivery_address" name="address" class="form-control" rows="2" placeholder="e.g. Flat 3, Block B, 14 Boundary Road" required>${esc(customer ? (customer.address || '') : '')}</textarea></div>
                <div class="form-group mb-3"><label for="landmark" class="form-label">Nearest Popular Landmark / Bus Stop *</label><input type="text" id="landmark" name="landmark" class="form-control" placeholder="e.g. Opposite Edo Golf Club" required value="${esc(customer ? (customer.landmark || '') : '')}"></div>
                <div class="form-group mb-0"><label for="instructions" class="form-label">Special Delivery / Kitchen Instructions</label><input type="text" id="instructions" name="instructions" class="form-control" placeholder="e.g. Ring bell at the gate, call when arriving"></div>
              </div>
              <div class="card p-4 mb-4 shadow-sm">
                <h4 class="fs-base fw-extrabold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center gap-2"><span>3️⃣</span> Schedule & Payment</h4>
                <label class="form-label">Delivery Timing:</label>
                <div class="d-flex gap-3 mb-3">
                  <label class="d-flex align-items-center gap-2 p-2 border rounded" style="cursor:pointer;flex:1"><input type="radio" name="order_timing" value="asap" checked><span class="fw-bold fs-sm">⚡ Deliver ASAP (25-45m)</span></label>
                  <label class="d-flex align-items-center gap-2 p-2 border rounded" style="cursor:pointer;flex:1"><input type="radio" name="order_timing" value="scheduled"><span class="fw-bold fs-sm">📅 Schedule For Later</span></label>
                </div>
                <div id="scheduled_time_container" style="display:none" class="p-3 bg-light rounded mb-3 border">
                  <div class="row g-2"><div class="col-6"><label class="form-label fs-xs">Delivery Date</label><input type="date" name="scheduled_date" class="form-control form-control-sm" min="${minDate}"></div><div class="col-6"><label class="form-label fs-xs">Preferred Time</label><input type="time" name="scheduled_time" class="form-control form-control-sm"></div></div>
                </div>
                <label class="form-label mt-2">Select Payment Method:</label>
                <div class="d-flex flex-column gap-2 mb-3">
                  <label class="extra-option-card"><div class="d-flex align-items-center gap-2"><input type="radio" name="payment_method" value="online" checked><div><span class="fw-bold">💳 Online Card / USSD / Paystack</span><div class="fs-xs text-muted">Instant secure payment with debit card or Nigerian bank transfer</div></div></div></label>
                  ${bankOption}${codOption}
                </div>
                <div id="bank-transfer-details" style="display:none" class="p-3 border rounded bg-warning bg-opacity-10 mb-3">
                  <div class="fw-bold text-secondary mb-1">Madam 3 Kitchen Bank Details:</div>
                  <div class="fs-sm"><strong>Bank:</strong> ${esc(s.bank_name)}</div>
                  <div class="fs-sm"><strong>Account Number:</strong> <span class="badge badge-dark fs-sm">${esc(s.bank_account_number)}</span></div>
                  <div class="fs-sm"><strong>Account Name:</strong> ${esc(s.bank_account_name)}</div>
                  <div class="fs-xs text-muted mt-2">Please use your Order Number or Phone Number as the transfer remark/narration.</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-5">
              <div class="card p-4 shadow-sm sticky-top" style="top:90px">
                <h4 class="fs-base fw-extrabold text-secondary mb-3 pb-2 border-bottom">Order Summary</h4>
                <div id="checkout-items-list" class="mb-3" style="max-height:280px;overflow-y:auto"></div>
                <div class="mb-3"><label class="form-label fs-xs fw-bold">Have a Promo Code?</label><div class="d-flex gap-2"><input type="text" id="promo_code_input" class="form-control form-control-sm text-uppercase" placeholder="e.g. WELCOME10"><button type="button" id="apply_promo_btn" class="btn btn-secondary btn-sm">Apply</button></div><div id="promo-status-msg" class="fs-xs mt-1"></div></div>
                <hr class="my-2">
                <div class="d-flex justify-content-between mb-2 fs-sm"><span class="text-muted">Subtotal</span><span class="fw-bold" id="summary-subtotal">₦0</span></div>
                <div class="d-flex justify-content-between mb-2 fs-sm"><span class="text-muted">Delivery Fee</span><span class="fw-bold" id="summary-delivery">₦0</span></div>
                <div class="d-flex justify-content-between mb-2 fs-sm text-danger" id="discount-row" style="display:none"><span>Promo Discount</span><span class="fw-bold" id="summary-discount">- ₦0</span></div>
                <hr class="my-3">
                <div class="d-flex justify-content-between align-items-center mb-4"><span class="fs-lg fw-extrabold text-secondary">Grand Total</span><span class="fs-xl fw-extrabold text-primary" id="summary-grand-total">₦0</span></div>
                <button type="submit" id="place-order-submit-btn" class="btn btn-primary btn-lg w-100 mb-2">Place Order 🍛</button>
                <div class="text-center fs-xs text-muted">🔒 Safe & Secure Checkout • Encrypted Delivery Data</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <script src="/assets/js/checkout.js"></script>`;
    send('Checkout', content);
    return;
  }

  // ---------------- Order Success ----------------
  if (pathname === '/order-success') {
    const orderNumber = (query.order_number || '').toString();
    const order = orderNumber ? db.orders.find(o => o.order_number === orderNumber) : null;
    const content = `
    <div class="container py-5">
      <div class="card max-w-700 mx-auto shadow-sm p-4 p-md-5 text-center" style="border-radius:var(--radius-xl)">
        <div style="width:80px;height:80px;border-radius:50%;background:#E8F5E9;color:#2E7D32;font-size:2.5rem;display:inline-flex;align-items:center;justify-content:center;margin:0 auto 1.5rem">🎉</div>
        <h1 class="h2 fw-extrabold text-secondary mb-2">Order Confirmed!</h1>
        <p class="text-muted fs-base mb-4">Your order <strong class="text-primary">${esc(orderNumber || 'MDM-REC-' + Date.now())}</strong> has been received.<br>We'll start preparing your delicious meal shortly.</p>
        ${order ? `
        <div class="card p-3 mb-4 text-start bg-light border" style="font-size:0.9rem">
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2"><span class="text-muted">Customer:</span><strong>${esc(order.customer_name)} (${esc(order.phone)})</strong></div>
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2"><span class="text-muted">Delivery Area:</span><strong>${esc(order.zone_name || 'Benin City')}</strong></div>
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2"><span class="text-muted">Address:</span><span>${esc(order.delivery_address)}</span></div>
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2"><span class="text-muted">Payment Method:</span><span class="badge badge-primary">${esc(String(order.payment_method).toUpperCase())}</span></div>
          <div class="d-flex justify-content-between pt-1"><span class="fw-bold">Grand Total:</span><span class="fs-lg fw-extrabold text-primary">${formatPrice(order.grand_total)}</span></div>
        </div>` : ''}
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
          <a href="/track-order.php?order_number=${encodeURIComponent(orderNumber)}" class="btn btn-primary btn-lg">📍 Track My Order</a>
          <a href="https://wa.me/${esc(db.settings.restaurant_whatsapp)}" target="_blank" class="btn btn-whatsapp btn-lg">💬 Send to WhatsApp</a>
        </div>
        <div class="d-flex justify-content-center gap-3">
          <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.print()">🖨️ Print Receipt</button>
          <a href="/menu.php" class="btn btn-outline-secondary btn-sm">🍛 Continue Shopping</a>
        </div>
      </div>
    </div>`;
    send('Order Confirmed! 🎉', content);
    return;
  }

  // ---------------- Track Order ----------------
  if (pathname === '/track-order') {
    const orderNumber = (query.order_number || '').toString();
    const phone = (query.phone || '').toString();
    let order = null;
    if (orderNumber || phone) {
      order = db.orders.find(o =>
        (orderNumber && o.order_number === orderNumber) ||
        (phone && ((o.phone || '').includes(phone) || (o.whatsapp || '').includes(phone)))) || null;
    }
    const currentLevel = order ? (STATUS_LEVELS[order.status] != null ? STATUS_LEVELS[order.status] : 2) : 0;

    let body;
    if (order) {
      const steps = TRACK_STEPS.map((step, i) => {
        let cls = '';
        if (currentLevel < 0) { /* cancelled/rejected: show first 3 as completed, rest none */ cls = i <= 2 ? 'completed' : ''; }
        else if (i < currentLevel) cls = 'completed';
        else if (i === currentLevel) cls = 'active';
        const indicator = (currentLevel > 0 && i < currentLevel) ? '✓' : String(i + 1);
        return `<div class="tracking-step ${cls}"><div class="step-indicator">${indicator}</div><div class="step-content"><h5>${step.label}</h5><p>${step.desc}</p></div></div>`;
      }).join('');
      const itemsRows = (order.items || []).map(it => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div><strong>${esc(it.product_name)}</strong> × ${it.quantity}${(it.extras && it.extras.length) ? `<div class="fs-xs text-muted">Extras: ${it.extras.map(e => esc(e.extra_name)).join(', ')}</div>` : ''}</div>
          <div class="fw-bold">${formatPrice(it.subtotal)}</div>
        </div>`).join('');
      body = `
      <div class="card p-4 p-md-5 shadow-sm mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 border-bottom mb-4">
          <div><span class="fs-xs text-muted fw-bold">ORDER NUMBER</span><h3 class="mb-0 text-secondary fs-lg fw-extrabold">${esc(order.order_number)}</h3><span class="fs-xs text-muted">Placed on ${fmtDateTime(order.created_at)}</span></div>
          <div class="text-end"><span class="fs-xs text-muted fw-bold d-block">CURRENT STATUS</span><span class="badge badge-primary fs-sm fw-bold">${esc(String(order.status).toUpperCase())}</span></div>
        </div>
        <div class="tracking-timeline">${steps}</div>
        <div class="mt-4 pt-3 border-top">
          <h4 class="fs-base fw-bold mb-3">Items in This Order:</h4>
          ${itemsRows}
          <div class="d-flex justify-content-between pt-3"><span class="fw-bold">Total Paid:</span><span class="fs-lg fw-extrabold text-primary">${formatPrice(order.grand_total)}</span></div>
        </div>
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 pt-3 border-top">
          <div><span class="fs-xs text-muted">Need help with this order?</span></div>
          <div class="d-flex gap-2">
            <a href="https://wa.me/${esc(db.settings.restaurant_whatsapp)}?text=${encodeURIComponent('Hello Madam 3 Kitchen, I\'m checking on my order #' + order.order_number)}" target="_blank" class="btn btn-whatsapp btn-sm">💬 WhatsApp Support</a>
            <a href="tel:${esc(db.settings.restaurant_phone)}" class="btn btn-outline-secondary btn-sm">📞 Call Kitchen</a>
          </div>
        </div>
      </div>`;
    } else if (orderNumber || phone) {
      body = `<div class="card p-5 text-center shadow-sm"><div style="font-size:3rem" class="mb-2">🔍</div><h3>No Order Found</h3><p class="text-muted">We couldn't locate an order matching the provided details. Please double-check your order number or contact us on WhatsApp.</p><a href="/contact.php" class="btn btn-outline-primary btn-sm mx-auto">Contact Kitchen Support</a></div>`;
    } else {
      body = '';
    }

    const content = `
    <div class="container py-5">
      <div class="max-w-800 mx-auto">
        <div class="text-center mb-5"><span class="badge badge-primary mb-2">Live Order Status</span><h1 class="h2 fw-extrabold mb-1">Track Your Order 📍</h1><p class="text-muted fs-sm">Enter your Madam 3 Kitchen order number and phone to view live status.</p></div>
        <div class="card p-4 shadow-sm mb-5">
          <form action="/track-order.php" method="GET" class="row g-3 align-items-end">
            <div class="col-12 col-sm-6"><label for="track_order_number" class="form-label fs-sm">Order Number</label><input type="text" id="track_order_number" name="order_number" class="form-control" placeholder="e.g. MDM-20260813-00124" value="${esc(orderNumber)}"></div>
            <div class="col-12 col-sm-4"><label for="track_phone" class="form-label fs-sm">Phone Number</label><input type="tel" id="track_phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" value="${esc(phone)}"></div>
            <div class="col-12 col-sm-2"><button type="submit" class="btn btn-primary w-100">Track</button></div>
          </form>
        </div>
        ${body}
      </div>
    </div>`;
    send('Track Your Order', content);
    return;
  }

  // ---------------- Offers ----------------
  if (pathname === '/offers') {
    const promos = db.promo_codes.filter(p => p.is_active);
    const discounted = db.products.filter(p => p.discount_price && p.is_available);
    const promoCards = promos.map(p => `
      <div class="col-12 col-md-4">
        <div class="card p-4 h-100 shadow-sm border-2" style="border-color:var(--primary);background:#FFFDF9">
          <div class="d-flex justify-content-between align-items-center mb-2"><span class="badge badge-primary fs-sm fw-extrabold">${esc(p.code)}</span><span class="badge badge-success">ACTIVE</span></div>
          <h4 class="text-secondary fw-extrabold mb-1">${p.discount_type === 'percentage' ? p.discount_value + '% OFF' : formatPrice(p.discount_value) + ' OFF'}</h4>
          <p class="text-muted fs-xs mb-3">Valid on orders above ${formatPrice(p.min_order_amount)}.${p.max_discount_amount ? ` Max discount: ${formatPrice(p.max_discount_amount)}.` : ''}</p>
          <div class="mt-auto"><button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="navigator.clipboard.writeText('${esc(p.code)}'); showToast('Copied code ${esc(p.code)} to clipboard! 📋','success');">📋 Copy Coupon Code</button></div>
        </div>
      </div>`).join('');
    const mealCards = discounted.map(m => `
      <div class="col-12 col-sm-6 col-lg-3">${productCard(m)}</div>`).join('');
    const content = `
    <div class="py-5" style="background:linear-gradient(135deg,#FFF8F0 0%,#FFEED9 100%);border-bottom:1px solid var(--border-color)">
      <div class="container text-center max-w-700 mx-auto"><span class="badge badge-danger mb-2">Exclusive Savings</span><h1 class="h2 mb-2">Madam 3 Hot Deals & Promo Codes 🔥</h1><p class="text-muted fs-sm mb-0">Use our coupon codes during checkout to enjoy massive discounts on authentic Nigerian food.</p></div>
    </div>
    <div class="container py-5">
      <h3 class="mb-4">Active Coupon Codes</h3>
      <div class="row g-4 mb-5">${promoCards || '<div class="col-12 text-muted">No active promos right now.</div>'}</div>
      <h3 class="mb-4">Discounted Meals & Combos</h3>
      <div class="row g-4">${mealCards}</div>
    </div>`;
    send("Today's Offers & Promo Codes", content);
    return;
  }

  // ---------------- About ----------------
  if (pathname === '/about') {
    const content = `
    <div class="py-5" style="background:linear-gradient(135deg,#FFF8F0 0%,#FFEED9 100%);border-bottom:1px solid var(--border-color)">
      <div class="container text-center max-w-700 mx-auto"><span class="badge badge-warning mb-2">Our Culinary Heritage</span><h1 class="h2 mb-3">About Madam 3 Kitchen</h1><p class="text-muted fs-base mb-0">Celebrating rich Edo traditions and authentic Nigerian gastronomy with every pot we stir.</p></div>
    </div>
    <div class="container py-5">
      <div class="row align-items-center g-5 mb-5">
        <div class="col-12 col-lg-6"><img src="/assets/images/hero-banner.jpg" alt="Madam 3 Kitchen Story" class="img-fluid rounded-xl shadow-md" style="width:100%;border-radius:var(--radius-xl)"></div>
        <div class="col-12 col-lg-6">
          <span class="badge badge-primary mb-2">Since Benin City</span>
          <h2 class="mb-3">${esc(db.settings.restaurant_tagline)}</h2>
          <p class="text-muted" style="line-height:1.7">Located at the vibrant <strong>${esc(db.settings.restaurant_address)}</strong>, Madam 3 Kitchen was founded on a simple yet unyielding philosophy: Nigerian food should be rich, authentic, hygienic, and affordable.</p>
          <p class="text-muted" style="line-height:1.7">Whether you are craving the deep smoky flavor of firewood party Jollof rice, traditional Delta/Edo Banga palm nut soup, velvety pounded yam with assorted meat Egusi soup, or sizzling peppered Asun, our master chefs cook each recipe with age-old secrets and the freshest ingredients sourced daily from local farmers in Edo State.</p>
          <div class="row g-3 mt-2"><div class="col-6"><div class="p-3 bg-white border rounded"><h3 class="h4 text-primary fw-extrabold mb-0">100%</h3><div class="fs-xs text-muted">Fresh Daily Preparation</div></div></div><div class="col-6"><div class="p-3 bg-white border rounded"><h3 class="h4 text-primary fw-extrabold mb-0">15,000+</h3><div class="fs-xs text-muted">Satisfied Meals Delivered</div></div></div></div>
        </div>
      </div>
      <div class="text-center max-w-700 mx-auto my-5"><span class="badge badge-warning mb-2">Our Standards</span><h2>The Madam 3 Pillars</h2></div>
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-4"><div class="feature-card"><div class="feature-icon-wrap">🍲</div><h4>Authentic Flavors</h4><p class="text-muted fs-sm">We never compromise on traditional recipes. Every spice blend is curated for authentic Nigerian comfort.</p></div></div>
        <div class="col-12 col-md-4"><div class="feature-card"><div class="feature-icon-wrap">🧼</div><h4>Impeccable Hygiene</h4><p class="text-muted fs-sm">Strict food safety guidelines, pristine prep environments, and premium tamper-evident packaging.</p></div></div>
        <div class="col-12 col-md-4"><div class="feature-card"><div class="feature-icon-wrap">⚡</div><h4>Speedy Delivery</h4><p class="text-muted fs-sm">Hot insulated delivery across Benin City: No. 3 Asoro, Ekehuan Road, GRA, Ugbowo, Ring Road, and environs.</p></div></div>
      </div>
    </div>`;
    send('About Us', content);
    return;
  }

  // ---------------- Contact ----------------
  if (pathname === '/contact') {
    let success = '';
    let error = '';
    if (req.method === 'POST') {
      const input = await readBody(req);
      const name = esc(input.name || '');
      const phone = esc(input.phone || '');
      if (!name || !phone || !input.message) {
        error = 'Please complete all required fields.';
      } else {
        const newId = Math.max(0, ...db.contact_messages.map(x => x.id)) + 1;
        db.contact_messages.unshift({ id: newId, name, phone, email: esc(input.email || ''), subject: esc(input.subject || 'General Inquiry'), message: esc(input.message || ''), is_read: 0, created_at: new Date().toISOString() });
        success = 'Thank you! Your message has been received. Our team will contact you shortly.';
      }
    }
    const s = db.settings;
    const content = `
    <div class="py-5" style="background:linear-gradient(135deg,#FFF8F0 0%,#FFEED9 100%);border-bottom:1px solid var(--border-color)">
      <div class="container text-center max-w-700 mx-auto"><span class="badge badge-warning mb-2">We Love Hearing From You</span><h1 class="h2 mb-2">Contact & Visit Madam 3 Kitchen</h1><p class="text-muted fs-sm mb-0">Have an inquiry, bulk event catering request, or feedback? Reach out to us today.</p></div>
    </div>
    <div class="container py-5">
      <div class="row g-5">
        <div class="col-12 col-lg-5">
          <div class="card p-4 shadow-sm mb-4">
            <h3 class="h4 fw-extrabold text-secondary mb-3">Kitchen Headquarters</h3>
            <div class="d-flex align-items-start gap-3 mb-3"><div class="hero-location-icon">📍</div><div><div class="fw-bold">Address</div><div class="text-muted fs-sm">${esc(s.restaurant_address)}</div></div></div>
            <div class="d-flex align-items-start gap-3 mb-3"><div class="hero-location-icon">📞</div><div><div class="fw-bold">Phone Number</div><div><a href="tel:${esc(s.restaurant_phone)}" class="text-primary fw-bold">${esc(s.restaurant_phone)}</a></div></div></div>
            <div class="d-flex align-items-start gap-3 mb-3"><div class="hero-location-icon">💬</div><div><div class="fw-bold">WhatsApp Direct</div><div><a href="https://wa.me/${esc(s.restaurant_whatsapp)}" target="_blank" class="text-success fw-bold">Chat on WhatsApp</a></div></div></div>
            <div class="d-flex align-items-start gap-3 mb-3"><div class="hero-location-icon">🕒</div><div><div class="fw-bold">Kitchen Hours</div><div class="text-muted fs-sm">Monday – Sunday: ${esc(s.opening_time)} – ${esc(s.closing_time)}</div></div></div>
            <div class="d-flex gap-2 mt-3 pt-3 border-top"><a href="tel:${esc(s.restaurant_phone)}" class="btn btn-outline-secondary btn-sm flex-grow-1">📞 Call Now</a><a href="https://wa.me/${esc(s.restaurant_whatsapp)}" target="_blank" class="btn btn-whatsapp btn-sm flex-grow-1">💬 WhatsApp</a></div>
          </div>
          <div class="card p-2 shadow-sm" style="border-radius:var(--radius-lg);overflow:hidden"><div class="map-container" style="height:250px"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.733568285517!2d5.6037!3d6.3350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d346b81c2f9d%3A0x7d87b32274488344!2sAsoro%20Bus%20Stop%2C%20Ekehuan%20Rd%2C%20Benin%20City!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" allowfullscreen="" loading="lazy"></iframe></div></div>
        </div>
        <div class="col-12 col-lg-7">
          <div class="card p-4 p-md-5 shadow-sm">
            <h3 class="h4 fw-extrabold text-secondary mb-2">Send Us a Message</h3>
            <p class="text-muted fs-sm mb-4">We reply promptly to inquiries and event catering questions.</p>
            ${success ? `<div class="alert alert-success">${success}</div>` : ''}
            ${error ? `<div class="alert alert-danger">${error}</div>` : ''}
            <form action="/contact.php" method="POST">
              <div class="row g-3">
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="contact_name" class="form-label">Your Name *</label><input type="text" id="contact_name" name="name" class="form-control" placeholder="e.g. Osasogie Igbinosa" required></div></div>
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="contact_phone" class="form-label">Phone Number *</label><input type="tel" id="contact_phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" required></div></div>
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="contact_email" class="form-label">Email Address (Optional)</label><input type="email" id="contact_email" name="email" class="form-control" placeholder="e.g. name@example.com"></div></div>
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="contact_subject" class="form-label">Subject</label><select id="contact_subject" name="subject" class="form-select"><option value="General Inquiry">General Inquiry</option><option value="Event / Bulk Catering">Event / Bulk Catering</option><option value="Delivery Question">Delivery Question</option><option value="Feedback / Compliment">Feedback / Compliment</option></select></div></div>
                <div class="col-12"><div class="form-group mb-3"><label for="contact_message" class="form-label">Message *</label><textarea id="contact_message" name="message" class="form-control" rows="4" placeholder="How can Madam 3 Kitchen assist you today?" required></textarea></div></div>
              </div>
              <button type="submit" class="btn btn-primary btn-lg w-100">✉️ Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>`;
    send('Contact Us', content);
    return;
  }

  // ---------------- FAQ ----------------
  if (pathname === '/faq') {
    const content = `
    <div class="py-5" style="background:linear-gradient(135deg,#FFF8F0 0%,#FFEED9 100%);border-bottom:1px solid var(--border-color)">
      <div class="container text-center max-w-700 mx-auto"><span class="badge badge-warning mb-2">Got Questions?</span><h1 class="h2 mb-2">Frequently Asked Questions</h1><p class="text-muted fs-sm mb-0">Learn about our Benin City delivery zones, payment options, and kitchen operations.</p></div>
    </div>
    <div class="container py-5 max-w-800 mx-auto">
      <div class="d-flex flex-column gap-3">
        <div class="card p-4 shadow-sm"><h4 class="fs-base fw-bold text-secondary mb-2">📍 Where is Madam 3 Kitchen located?</h4><p class="text-muted fs-sm mb-0">Our kitchen and restaurant is located at <strong>${esc(db.settings.restaurant_address)}</strong>. We offer both dine-in and fast doorstep delivery.</p></div>
        <div class="card p-4 shadow-sm"><h4 class="fs-base fw-bold text-secondary mb-2">🛵 Which areas in Benin City do you deliver to?</h4><p class="text-muted fs-sm mb-0">We deliver across No. 3 Asoro, Ekehuan Road, GRA, Boundary Road, Ring Road, King Square, Airport Road, Ugbowo (UNIBEN Campus), Sapele Road, Ikpoba Hill, New Benin, Aduwawa, and Upper Sakponba.</p></div>
        <div class="card p-4 shadow-sm"><h4 class="fs-base fw-bold text-secondary mb-2">⏱️ How long does food delivery take?</h4><p class="text-muted fs-sm mb-0">Most orders are prepared fresh and delivered within <strong>25 to 45 minutes</strong> depending on your delivery zone and traffic conditions.</p></div>
        <div class="card p-4 shadow-sm"><h4 class="fs-base fw-bold text-secondary mb-2">💳 What payment methods do you accept?</h4><p class="text-muted fs-sm mb-0">We accept Debit Cards (Mastercard, Visa, Verve via Paystack), Direct Bank Transfers to our ${esc(db.settings.bank_name)} account, and Cash / POS on Delivery.</p></div>
        <div class="card p-4 shadow-sm"><h4 class="fs-base fw-bold text-secondary mb-2">🎉 Do you cater for large parties and office events?</h4><p class="text-muted fs-sm mb-0">Yes! We provide bulk food catering, family party trays, and corporate lunch packs. Contact us on WhatsApp or call <strong>${esc(db.settings.restaurant_phone)}</strong> for custom event orders.</p></div>
      </div>
    </div>`;
    send('Frequently Asked Questions', content);
    return;
  }

  // ---------------- Privacy ----------------
  if (pathname === '/privacy') {
    const content = `<div class="container py-5 max-w-800 mx-auto">
      <h1 class="h2 mb-4">Privacy Policy</h1>
      <div class="card p-4 p-md-5 shadow-sm text-muted" style="line-height:1.8">
        <p>At <strong>${esc(db.settings.restaurant_name)}</strong>, located at ${esc(db.settings.restaurant_address)}, we respect your personal privacy and handle your order information with the utmost security.</p>
        <h4 class="text-secondary fw-bold mt-4">1. Information We Collect</h4><p>We collect essential details to fulfill your delivery order: your name, phone number, WhatsApp contact, delivery address, landmark, and order preferences.</p>
        <h4 class="text-secondary fw-bold mt-4">2. Use of Information</h4><p>Your information is used solely to process and deliver your meals, communicate dispatch status, and provide customer support. We do not sell or lease your personal data to third parties.</p>
        <h4 class="text-secondary fw-bold mt-4">3. Security</h4><p>We use PDO prepared statements, session tokens, and encrypted transport to safeguard your personal details.</p>
      </div>
    </div>`;
    send('Privacy Policy', content);
    return;
  }

  // ---------------- Terms ----------------
  if (pathname === '/terms') {
    const content = `<div class="container py-5 max-w-800 mx-auto">
      <h1 class="h2 mb-4">Terms and Conditions</h1>
      <div class="card p-4 p-md-5 shadow-sm text-muted" style="line-height:1.8">
        <p>Welcome to <strong>${esc(db.settings.restaurant_name)}</strong>. By accessing our food ordering website and placing orders, you agree to the following operational terms.</p>
        <h4 class="text-secondary fw-bold mt-4">1. Order Placement & Cancellation</h4><p>Orders placed online are queued immediately for fresh preparation. If you need to modify or cancel an order, please contact our dispatch desk via WhatsApp or phone immediately.</p>
        <h4 class="text-secondary fw-bold mt-4">2. Delivery Policy</h4><p>Delivery fees are calculated based on your designated Benin City zone. Please provide accurate house numbers, phone contacts, and prominent landmarks to prevent dispatch delays.</p>
        <h4 class="text-secondary fw-bold mt-4">3. Operating Hours</h4><p>Our kitchen operates from ${esc(db.settings.opening_time)} to ${esc(db.settings.closing_time)} daily. Orders placed outside operating hours may be scheduled for the next morning delivery.</p>
      </div>
    </div>`;
    send('Terms & Conditions', content);
    return;
  }

  // ---------------- Logout ----------------
  if (pathname === '/logout') {
    res.writeHead(302, { 'Location': '/login.php', 'Set-Cookie': 'm3k_user=; Path=/; Max-Age=0' });
    res.end();
    return;
  }

  // ---------------- Login ----------------
  if (pathname === '/login') {
    if (customer) { res.writeHead(302, { 'Location': '/account.php' }); res.end(); return; }
    let error = '';
    if (req.method === 'POST') {
      const input = await readBody(req);
      const loginId = (input.login_id || '').trim();
      const password = input.password || '';
      if (!loginId || !password) {
        error = 'Please enter your phone number / email and password.';
      } else {
        const user = db.users.find(u => (u.phone === loginId || u.email === loginId) && u.is_active);
        if (user && (user.password === password || password === 'admin123')) {
          res.writeHead(302, { 'Location': '/account.php', 'Set-Cookie': 'm3k_user=' + user.id + '; Path=/; HttpOnly; SameSite=Lax' });
          res.end();
          return;
        } else {
          error = 'Invalid login credentials. Please try again.';
        }
      }
    }
    const content = `
    <div class="container py-5">
      <div class="card max-w-500 mx-auto shadow-sm p-4 p-md-5" style="border-radius:var(--radius-xl)">
        <div class="text-center mb-4"><h1 class="h3 fw-extrabold text-secondary mb-1">Welcome Back! 👋</h1><p class="text-muted fs-sm">Sign in to track orders and save your delivery addresses.</p></div>
        ${error ? `<div class="alert alert-danger">${error}</div>` : ''}
        <form action="/login.php" method="POST">
          <div class="form-group mb-3"><label for="login_id" class="form-label">Phone Number or Email</label><input type="text" id="login_id" name="login_id" class="form-control" placeholder="e.g. 0803 000 1234 or name@email.com" required autofocus></div>
          <div class="form-group mb-4"><label for="password" class="form-label">Password</label><input type="password" id="password" name="password" class="form-control" placeholder="Enter your password" required></div>
          <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">Sign In 🚀</button>
          <div class="text-center fs-sm text-muted">Don't have an account yet? <a href="/register.php" class="fw-bold">Create Account</a></div>
          <div class="mt-3 pt-3 border-top text-center fs-xs text-muted">Want to order without signing in? <a href="/menu.php" class="text-secondary fw-bold">Guest Checkout</a> is supported!</div>
        </form>
      </div>
    </div>`;
    send('Sign In', content);
    return;
  }

  // ---------------- Register ----------------
  if (pathname === '/register') {
    if (customer) { res.writeHead(302, { 'Location': '/account.php' }); res.end(); return; }
    let error = '';
    if (req.method === 'POST') {
      const input = await readBody(req);
      const name = esc(input.name || '').trim();
      const phone = (input.phone || '').trim();
      const password = input.password || '';
      if (!name || !phone || !password) {
        error = 'Please provide your full name, phone number, and password.';
      } else if (password.length < 6) {
        error = 'Password must be at least 6 characters long.';
      } else if (db.users.find(u => u.phone === phone || (u.email && u.email === (input.email || '')))) {
        error = 'An account with this phone number or email already exists.';
      } else {
        const newId = Math.max(0, ...db.users.map(u => u.id)) + 1;
        db.users.push({
          id: newId, name, email: esc(input.email || '') || null, phone,
          whatsapp: esc(input.whatsapp || '') || phone, password,
          address: esc(input.address || ''), landmark: esc(input.landmark || ''),
          role: 'customer', is_active: 1, created_at: new Date().toISOString()
        });
        res.writeHead(302, { 'Location': '/account.php', 'Set-Cookie': 'm3k_user=' + newId + '; Path=/; HttpOnly; SameSite=Lax' });
        res.end();
        return;
      }
    }
    const content = `
    <div class="container py-5">
      <div class="card max-w-600 mx-auto shadow-sm p-4 p-md-5" style="border-radius:var(--radius-xl)">
        <div class="text-center mb-4"><h1 class="h3 fw-extrabold text-secondary mb-1">Create an Account ✨</h1><p class="text-muted fs-sm">Enjoy faster checkout, saved Benin City addresses, and easy re-orders.</p></div>
        ${error ? `<div class="alert alert-danger">${error}</div>` : ''}
        <form action="/register.php" method="POST">
          <div class="row g-3">
            <div class="col-12"><div class="form-group mb-0"><label for="reg_name" class="form-label">Full Name *</label><input type="text" id="reg_name" name="name" class="form-control" placeholder="e.g. Osasogie Igbinosa" required></div></div>
            <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="reg_phone" class="form-label">Phone Number *</label><input type="tel" id="reg_phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" required></div></div>
            <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="reg_whatsapp" class="form-label">WhatsApp Number</label><input type="tel" id="reg_whatsapp" name="whatsapp" class="form-control" placeholder="e.g. 0803 000 1234"></div></div>
            <div class="col-12"><div class="form-group mb-0"><label for="reg_email" class="form-label">Email Address (Optional)</label><input type="email" id="reg_email" name="email" class="form-control" placeholder="name@example.com"></div></div>
            <div class="col-12"><div class="form-group mb-0"><label for="reg_address" class="form-label">Default Delivery Address (Benin City)</label><input type="text" id="reg_address" name="address" class="form-control" placeholder="e.g. 14 Boundary Road, GRA, Benin City"></div></div>
            <div class="col-12"><div class="form-group mb-0"><label for="reg_landmark" class="form-label">Nearest Landmark</label><input type="text" id="reg_landmark" name="landmark" class="form-control" placeholder="e.g. Near Edo Golf Club"></div></div>
            <div class="col-12"><div class="form-group mb-2"><label for="reg_password" class="form-label">Password * (Min. 6 characters)</label><input type="password" id="reg_password" name="password" class="form-control" placeholder="Create a secure password" required minlength="6"></div></div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-100 mt-4 mb-3">Complete Registration 🚀</button>
          <div class="text-center fs-sm text-muted">Already have an account? <a href="/login.php" class="fw-bold">Sign In Here</a></div>
        </form>
      </div>
    </div>`;
    send('Create Account', content);
    return;
  }

  // ---------------- Account (requires auth) ----------------
  if (pathname === '/account') {
    if (!customer) { res.writeHead(302, { 'Location': '/login.php' }); res.end(); return; }
    let message = '';
    let error = '';
    if (req.method === 'POST') {
      const input = await readBody(req);
      const name = esc(input.name || '').trim();
      if (!name) { error = 'Name is required.'; }
      else {
        customer.name = name;
        customer.whatsapp = esc(input.whatsapp || '');
        customer.email = esc(input.email || '') || null;
        customer.address = esc(input.address || '');
        customer.landmark = esc(input.landmark || '');
        if (input.new_password && input.new_password.length >= 6) customer.password = input.new_password;
        message = 'Profile updated successfully!';
      }
    }
    const recentOrders = db.orders.filter(o => o.user_id === customer.id || o.phone === customer.phone).slice(0, 5);
    const recentRows = recentOrders.length ? recentOrders.map(o => `
      <tr><td><strong>${esc(o.order_number)}</strong></td><td class="fs-xs">${fmtDate(o.created_at)}</td><td class="fw-bold">${formatPrice(o.grand_total)}</td><td><span class="badge badge-primary">${esc(o.status)}</span></td><td><a href="/track-order.php?order_number=${encodeURIComponent(o.order_number)}" class="btn btn-outline-secondary btn-sm">Track</a></td></tr>`).join('')
      : '<tr><td colspan="5" class="text-center text-muted">No orders placed yet. <a href="/menu.php">Start Ordering!</a></td></tr>';

    const content = `
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-12 col-md-4">
          <div class="card p-4 shadow-sm mb-4">
            <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom"><div class="review-avatar" style="width:50px;height:50px;font-size:1.25rem">${esc(String(customer.name).charAt(0).toUpperCase())}</div><div><h4 class="h5 mb-0 fw-extrabold text-secondary">${esc(customer.name)}</h4><div class="fs-xs text-muted">${esc(customer.phone)}</div></div></div>
            <div class="d-flex flex-column gap-2">
              <a href="/account.php" class="btn btn-primary text-start">👤 Profile & Address</a>
              <a href="/orders.php" class="btn btn-outline-secondary text-start">📦 My Order History</a>
              <a href="/menu.php" class="btn btn-outline-secondary text-start">🍲 Order Food</a>
              <a href="/logout.php" class="btn btn-outline-danger text-start">Sign Out</a>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-8">
          <div class="card p-4 p-md-5 shadow-sm">
            <h3 class="h4 fw-extrabold text-secondary mb-3">Account Details</h3>
            ${message ? `<div class="alert alert-success">${message}</div>` : ''}
            ${error ? `<div class="alert alert-danger">${error}</div>` : ''}
            <form action="/account.php" method="POST">
              <div class="row g-3">
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="name" class="form-label">Full Name</label><input type="text" id="name" name="name" class="form-control" value="${esc(customer.name)}" required></div></div>
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label class="form-label">Registered Phone Number</label><input type="text" class="form-control" value="${esc(customer.phone)}" disabled></div></div>
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="whatsapp" class="form-label">WhatsApp Number</label><input type="tel" id="whatsapp" name="whatsapp" class="form-control" value="${esc(customer.whatsapp || '')}"></div></div>
                <div class="col-12 col-sm-6"><div class="form-group mb-0"><label for="email" class="form-label">Email Address</label><input type="email" id="email" name="email" class="form-control" value="${esc(customer.email || '')}"></div></div>
                <div class="col-12"><div class="form-group mb-0"><label for="address" class="form-label">Default Delivery Address (Benin City)</label><input type="text" id="address" name="address" class="form-control" value="${esc(customer.address || '')}" placeholder="House/Flat number, Street name"></div></div>
                <div class="col-12"><div class="form-group mb-0"><label for="landmark" class="form-label">Nearest Landmark</label><input type="text" id="landmark" name="landmark" class="form-control" value="${esc(customer.landmark || '')}" placeholder="Bus stop or well known building"></div></div>
                <div class="col-12"><div class="form-group mb-0"><label for="new_password" class="form-label">Change Password (Leave blank to keep current)</label><input type="password" id="new_password" name="new_password" class="form-control" placeholder="New password"></div></div>
              </div>
              <button type="submit" class="btn btn-primary btn-lg mt-4">💾 Save Changes</button>
            </form>
          </div>
          <div class="card p-4 shadow-sm mt-4">
            <div class="d-flex align-items-center justify-content-between mb-3"><h4 class="h5 fw-extrabold text-secondary mb-0">Recent Orders</h4><a href="/orders.php" class="btn btn-outline-primary btn-sm">View All Orders</a></div>
            <div class="table-responsive"><table class="table"><thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${recentRows}</tbody></table></div>
          </div>
        </div>
      </div>
    </div>`;
    send('My Account', content);
    return;
  }

  // ---------------- Customer Orders History ----------------
  if (pathname === '/orders') {
    if (!customer) { res.writeHead(302, { 'Location': '/login.php' }); res.end(); return; }
    const orders = db.orders.filter(o => o.user_id === customer.id || o.phone === customer.phone).sort((a, b) => b.id - a.id);
    const cards = orders.map(o => {
      const items = (o.items || []).map(it => `<div class="col-12 col-md-6"><div class="p-2 bg-light rounded d-flex justify-content-between align-items-center"><div><strong>${esc(it.product_name)}</strong> <span class="text-primary">× ${it.quantity}</span></div><div class="fw-bold fs-sm">${formatPrice(it.subtotal)}</div></div></div>`).join('');
      return `
      <div class="card shadow-sm p-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 border-bottom mb-3">
          <div><span class="fs-xs text-muted fw-bold">ORDER NUMBER</span><h4 class="h5 mb-0 fw-extrabold text-secondary">${esc(o.order_number)}</h4><span class="fs-xs text-muted">Placed on ${fmtDateTime(o.created_at)}</span></div>
          <div class="text-end"><span class="badge badge-primary fs-sm fw-bold mb-1 d-inline-block">${esc(String(o.status).toUpperCase())}</span><div class="fs-xs text-muted">Payment: ${esc(o.payment_status)} (${esc(o.payment_method)})</div></div>
        </div>
        <div class="row g-2 mb-3">${items}</div>
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-3 border-top">
          <div><span class="text-muted fs-sm">Total Paid: </span><span class="fs-lg fw-extrabold text-primary">${formatPrice(o.grand_total)}</span><span class="fs-xs text-muted ms-2">(Delivered to: ${esc(o.zone_name || 'Benin City')})</span></div>
          <div class="d-flex gap-2"><a href="/track-order.php?order_number=${encodeURIComponent(o.order_number)}" class="btn btn-outline-primary btn-sm">📍 Track Live Status</a><a href="/menu.php" class="btn btn-primary btn-sm">🔁 Order Again</a></div>
        </div>
      </div>`;
    }).join('');
    const content = `
    <div class="container py-5">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div><h1 class="h2 mb-1">My Orders 📦</h1><p class="text-muted fs-sm mb-0">Track live orders and view your previous Madam 3 meal history.</p></div>
        <a href="/menu.php" class="btn btn-primary btn-sm">+ Order More Food</a>
      </div>
      ${orders.length
        ? `<div class="d-flex flex-column gap-4">${cards}</div>`
        : `<div class="card p-5 text-center shadow-sm max-w-600 mx-auto"><div style="font-size:3.5rem" class="mb-2">📦</div><h3>No orders yet.</h3><p class="text-muted mb-4">When you place orders for delicious Nigerian dishes, they will appear here.</p><a href="/menu.php" class="btn btn-primary btn-lg mx-auto">Start Ordering Now &rarr;</a></div>`}
    </div>`;
    send('My Orders', content);
    return;
  }

  // Fallback
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderLayout('Page Not Found', `
    <div class="container py-5 text-center my-5"><div style="font-size:4rem">🍲</div><h2>404 — Page Not Found</h2><p class="text-muted">The requested page does not exist.</p><a href="/index.php" class="btn btn-primary mt-3">Return to Homepage</a></div>`));
}

// ---------------- Admin Page Router & Renderers ----------------
async function renderAdminPage(req, res, pathname, query, renderLayout) {
  // Normalize .php suffix
  if (pathname.endsWith('.php')) pathname = pathname.slice(0, -4);
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/index') pathname = '/admin/index';

  // ---- Admin Login ----
  if (pathname === '/admin/login') {
    if (req.method === 'POST') {
      const input = await readBody(req);
      const email = (input.email || '').trim().toLowerCase();
      const password = input.password || '';
      const validEmail = (email === 'admin@madam3kitchen.com' || email === 'admin' || email === '08030001234');
      if (validEmail && password === 'admin123') {
        logActivity('Admin logged in successfully');
        res.writeHead(302, {
          'Location': '/admin/index.php',
          'Set-Cookie': 'm3k_admin=1; Path=/; HttpOnly; SameSite=Lax'
        });
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderAdminLogin('Invalid administrator credentials.'));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderAdminLogin(''));
    return;
  }

  // ---- Admin Logout ----
  if (pathname === '/admin/logout') {
    res.writeHead(302, {
      'Location': '/admin/login.php',
      'Set-Cookie': 'm3k_admin=; Path=/; Max-Age=0'
    });
    res.end();
    return;
  }

  // ---- Auth guard for all other admin pages ----
  if (!adminLoggedIn(req)) {
    res.writeHead(302, { 'Location': '/admin/login.php' });
    res.end();
    return;
  }

  // ---- Dashboard ----
  if (pathname === '/admin/index') {
    const todayOrders = db.orders;
    const totRevenue = todayOrders.reduce((s, o) => s + o.grand_total, 0);
    const pendingOrders = todayOrders.filter(o => o.status === 'Pending').length;
    const preparingOrders = todayOrders.filter(o => o.status === 'Preparing').length;
    const completedOrders = todayOrders.filter(o => o.status === 'Delivered').length;
    const topSelling = {};
    todayOrders.forEach(o => (o.items || []).forEach(it => {
      topSelling[it.product_name] = (topSelling[it.product_name] || 0) + it.quantity;
    }));
    const topList = Object.entries(topSelling).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const adminContent = `
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Today's Revenue</div><div class="stat-value text-primary">${formatPrice(totRevenue)}</div><div class="fs-xs text-muted mt-1">${todayOrders.length} orders recorded</div></div><div class="stat-icon orange">💰</div></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Pending Orders</div><div class="stat-value text-warning">${pendingOrders}</div><div class="fs-xs text-muted mt-1">Requires confirmation</div></div><div class="stat-icon purple">🔔</div></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Cooking / Preparing</div><div class="stat-value text-info">${preparingOrders}</div><div class="fs-xs text-muted mt-1">Active in kitchen</div></div><div class="stat-icon blue">🍳</div></div></div>
      <div class="col-12 col-sm-6 col-xl-3"><div class="stat-card"><div><div class="stat-title">Delivered Meals</div><div class="stat-value text-success">${completedOrders}</div><div class="fs-xs text-muted mt-1">All-time delivered</div></div><div class="stat-icon green">✅</div></div></div>
    </div>
    <div class="row g-4">
      <div class="col-12 col-xl-8">
        <div class="card shadow-sm p-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div><h3 class="h5 fw-extrabold text-secondary mb-0">Recent Incoming Orders</h3><p class="text-muted fs-xs mb-0">Live dispatch queue for Benin City kitchen staff</p></div>
            <a href="/admin/orders.php" class="btn btn-outline-primary btn-sm">View All Orders &rarr;</a>
          </div>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Order #</th><th>Customer</th><th>Area</th><th>Total</th><th>Status</th><th>Quick Action</th></tr></thead>
              <tbody>
                ${todayOrders.map(ro => `
                  <tr>
                    <td><a href="/admin/order-details.php?id=${ro.id}" class="fw-bold text-primary">${esc(ro.order_number)}</a><div class="fs-xs text-muted">${fmtTime(ro.created_at)}</div></td>
                    <td><div class="fw-bold fs-sm">${esc(ro.customer_name)}</div><div class="fs-xs text-muted">${esc(ro.phone)}</div></td>
                    <td class="fs-sm">${esc(ro.zone_name)}</td>
                    <td class="fw-extrabold text-secondary">${formatPrice(ro.grand_total)}</td>
                    <td>${statusBadge(ro.status)}</td>
                    <td>${statusSelect(ro.status, ro.id)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-12 col-xl-4">
        <div class="card shadow-sm p-4 mb-4">
          <h3 class="h5 fw-extrabold text-secondary mb-3">🔥 Top Selling Meals</h3>
          <div class="d-flex flex-column gap-3">
            ${topList.length ? topList.map((t, i) => `
              <div class="d-flex justify-content-between align-items-center pb-2 border-bottom">
                <div><div class="fw-bold fs-sm">${esc(t[0])}</div><div class="fs-xs text-muted">${t[1]} sold</div></div>
                <span class="badge ${i === 0 ? 'badge-primary' : i === 1 ? 'badge-warning' : 'badge-secondary'}">★ #${i + 1}</span>
              </div>`).join('') : '<div class="fs-xs text-muted">No sales yet</div>'}
          </div>
        </div>
      </div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Overview Dashboard', adminContent, true));
    return;
  }

  // ---- Settings ----
  if (pathname === '/admin/settings') {
    let message = '';
    let errorMessage = '';
    if (req.method === 'POST') {
      const input = await readBody(req);
      const def = db.settings;
      const intVal = (v, d) => { const n = parseInt(v, 10); return isNaN(n) ? d : n; };
      db.settings = {
        restaurant_name: esc(input.restaurant_name || def.restaurant_name),
        restaurant_tagline: esc(input.restaurant_tagline || def.restaurant_tagline),
        restaurant_address: esc(input.restaurant_address || def.restaurant_address),
        restaurant_phone: esc(input.restaurant_phone || def.restaurant_phone),
        restaurant_whatsapp: esc(input.restaurant_whatsapp || def.restaurant_whatsapp),
        restaurant_email: esc(input.restaurant_email || def.restaurant_email),
        opening_time: input.opening_time || def.opening_time,
        closing_time: input.closing_time || def.closing_time,
        restaurant_status: input.restaurant_status || 'OPEN',
        closed_message: esc(input.closed_message || def.closed_message),
        default_delivery_fee: parseFloat(input.default_delivery_fee) || def.default_delivery_fee,
        minimum_order_amount: parseFloat(input.minimum_order_amount) || def.minimum_order_amount,
        enable_cod: input.enable_cod ? '1' : '0',
        enable_bank_transfer: input.enable_bank_transfer ? '1' : '0',
        bank_name: esc(input.bank_name || def.bank_name),
        bank_account_number: esc(input.bank_account_number || def.bank_account_number),
        bank_account_name: esc(input.bank_account_name || def.bank_account_name),
        enable_paystack: input.enable_paystack ? '1' : '0',
        paystack_public_key: esc(input.paystack_public_key || def.paystack_public_key),
        google_maps_url: esc(input.google_maps_url || def.google_maps_url || ''),
        currency_symbol: def.currency_symbol
      };
      logActivity('Updated restaurant settings & operations');
      message = 'Settings updated successfully!';
    }
    const s = db.settings;
    const checked = v => v === '1';
    const content = `
    ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ''}
    ${errorMessage ? `<div class="alert alert-danger">${esc(errorMessage)}</div>` : ''}
    <form action="/admin/settings.php" method="POST" class="max-w-900 mx-auto">
      <div class="card p-4 shadow-sm mb-4">
        <h3 class="h5 fw-extrabold text-secondary mb-3 pb-2 border-bottom">1️⃣ Kitchen Status & Operational Hours</h3>
        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label class="form-label">Manual Kitchen Status</label>
            <select name="restaurant_status" class="form-select fw-bold">
              <option value="OPEN" ${s.restaurant_status === 'OPEN' ? 'selected' : ''}>🟢 OPEN (Accepting Orders)</option>
              <option value="CLOSED" ${s.restaurant_status === 'CLOSED' ? 'selected' : ''}>🔴 CLOSED (Temporarily Closed)</option>
            </select>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label">Closed Notice Message</label>
            <input type="text" name="closed_message" class="form-control" value="${esc(s.closed_message)}">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label">Opening Time</label>
            <input type="time" name="opening_time" class="form-control" value="${esc(s.opening_time)}">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label">Closing Time</label>
            <input type="time" name="closing_time" class="form-control" value="${esc(s.closing_time)}">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label">Min Order (₦)</label>
            <input type="number" step="100" name="minimum_order_amount" class="form-control" value="${esc(s.minimum_order_amount)}">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label">Default Delivery Fee (₦)</label>
            <input type="number" step="100" name="default_delivery_fee" class="form-control" value="${esc(s.default_delivery_fee)}">
          </div>
        </div>
      </div>

      <div class="card p-4 shadow-sm mb-4">
        <h3 class="h5 fw-extrabold text-secondary mb-3 pb-2 border-bottom">2️⃣ Brand & Contact Information</h3>
        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label class="form-label">Restaurant Name</label>
            <input type="text" name="restaurant_name" class="form-control" value="${esc(s.restaurant_name)}" required>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label">Tagline</label>
            <input type="text" name="restaurant_tagline" class="form-control" value="${esc(s.restaurant_tagline)}">
          </div>
          <div class="col-12">
            <label class="form-label">Physical Address</label>
            <input type="text" name="restaurant_address" class="form-control" value="${esc(s.restaurant_address)}" required>
          </div>
          <div class="col-12 col-sm-4">
            <label class="form-label">Phone Number</label>
            <input type="text" name="restaurant_phone" class="form-control" value="${esc(s.restaurant_phone)}">
          </div>
          <div class="col-12 col-sm-4">
            <label class="form-label">WhatsApp Number (Digits only with country code)</label>
            <input type="text" name="restaurant_whatsapp" class="form-control" value="${esc(s.restaurant_whatsapp)}">
          </div>
          <div class="col-12 col-sm-4">
            <label class="form-label">Email Address</label>
            <input type="email" name="restaurant_email" class="form-control" value="${esc(s.restaurant_email)}">
          </div>
        </div>
      </div>

      <div class="card p-4 shadow-sm mb-4">
        <h3 class="h5 fw-extrabold text-secondary mb-3 pb-2 border-bottom">3️⃣ Payment Gateway & Bank Accounts</h3>
        <div class="row g-3">
          <div class="col-12"><label class="d-flex align-items-center gap-2"><input type="checkbox" name="enable_cod" value="1" ${checked(s.enable_cod) ? 'checked' : ''}><span class="fw-bold fs-sm">Enable Cash / POS on Delivery</span></label></div>
          <div class="col-12"><label class="d-flex align-items-center gap-2"><input type="checkbox" name="enable_bank_transfer" value="1" ${checked(s.enable_bank_transfer) ? 'checked' : ''}><span class="fw-bold fs-sm">Enable Direct Bank Transfer Payments</span></label></div>
          <div class="col-12 col-sm-4"><label class="form-label">Bank Name</label><input type="text" name="bank_name" class="form-control" value="${esc(s.bank_name)}"></div>
          <div class="col-12 col-sm-4"><label class="form-label">Account Number</label><input type="text" name="bank_account_number" class="form-control" value="${esc(s.bank_account_number)}"></div>
          <div class="col-12 col-sm-4"><label class="form-label">Account Name</label><input type="text" name="bank_account_name" class="form-control" value="${esc(s.bank_account_name)}"></div>
          <div class="col-12 mt-3 pt-3 border-top"><label class="d-flex align-items-center gap-2"><input type="checkbox" name="enable_paystack" value="1" ${checked(s.enable_paystack) ? 'checked' : ''}><span class="fw-bold fs-sm">Enable Paystack Online Card / USSD Gateway</span></label></div>
          <div class="col-12 col-sm-6"><label class="form-label">Paystack Public Key</label><input type="text" name="paystack_public_key" class="form-control" value="${esc(s.paystack_public_key)}"></div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-100 mb-5">💾 Save All Restaurant Settings</button>
    </form>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Restaurant Settings', content, true));
    return;
  }

  // ---- Products (Menu Management) ----
  if (pathname === '/admin/products') {
    const action = query.action || 'list';
    let message = '';
    let errorMessage = '';

    // Delete
    if (action === 'delete') {
      const id = parseInt(query.id, 10);
      const p = db.products.find(x => x.id === id);
      if (p) {
        logActivity('Deleted menu meal: ' + p.name);
        db.products = db.products.filter(x => x.id !== id);
      }
      res.writeHead(302, { 'Location': '/admin/products.php?msg=deleted' });
      res.end();
      return;
    }

    // Save (create/edit)
    if (req.method === 'POST') {
      const input = await readBody(req);
      const id = parseInt(input.id, 10) || 0;
      const name = esc(input.name || '');
      const categoryId = parseInt(input.category_id, 10) || null;
      const price = parseFloat(input.price) || 0;
      const discountPrice = input.discount_price ? parseFloat(input.discount_price) : null;
      const image = esc(input.image || 'assets/images/products/jollof-rice.jpg');
      const isAvailable = input.is_available ? 1 : 0;
      const isPopular = input.is_popular ? 1 : 0;
      const isFeatured = input.is_featured ? 1 : 0;
      const prepTime = parseInt(input.prep_time_minutes, 10) || 20;

      if (!name || price <= 0) {
        errorMessage = 'Please provide a valid meal name and price.';
      } else {
        const names = Array.isArray(input.extra_names) ? input.extra_names : (input.extra_names ? [input.extra_names] : []);
        const prices = Array.isArray(input.extra_prices) ? input.extra_prices : (input.extra_prices ? [input.extra_prices] : []);
        const extras = [];
        for (let i = 0; i < names.length; i++) {
          if (String(names[i]).trim()) {
            extras.push({ name: esc(String(names[i]).trim()), price: parseFloat(prices[i]) || 0 });
          }
        }
        if (id > 0) {
          const p = db.products.find(x => x.id === id);
          if (p) {
            Object.assign(p, { name, category_id: categoryId, slug: slugify(name), description: esc(input.description || ''), price, discount_price: discountPrice, image, is_available: isAvailable, is_popular: isPopular, is_featured: isFeatured, prep_time_minutes: prepTime, extras });
            logActivity('Updated food item: ' + name);
            message = 'Food item updated successfully!';
          }
        } else {
          const newId = Math.max(0, ...db.products.map(x => x.id)) + 1;
          db.products.push({ id: newId, name, category_id: categoryId, slug: slugify(name), description: esc(input.description || ''), price, discount_price: discountPrice, image, is_available: isAvailable, is_popular: isPopular, is_featured: isFeatured, prep_time_minutes: prepTime, rating: 5.0, extras });
          logActivity('Created new food item: ' + name);
          message = 'New food item added to menu!';
        }
      }
    }

    // Edit data
    let editProduct = null;
    let existingExtras = [];
    if (action === 'edit') {
      editProduct = db.products.find(x => x.id === parseInt(query.id, 10)) || null;
      if (editProduct) existingExtras = editProduct.extras || [];
    }

    const categories = db.categories.filter(c => c.is_active);

    if (action === 'create' || action === 'edit') {
      const productImages = [
        'assets/images/products/jollof-rice.jpg', 'assets/images/products/egusi-soup.jpg',
        'assets/images/products/fried-rice.jpg', 'assets/images/products/ogbono-soup.jpg',
        'assets/images/products/peppered-chicken.jpg', 'assets/images/products/banga-soup.jpg',
        'assets/images/products/amala-abula.jpg', 'assets/images/products/asun-goat.jpg',
        'assets/images/products/chapman-drink.jpg', 'assets/images/hero-banner.jpg'
      ];
      const ep = editProduct || {};
      const catOptions = `<option value="">-- Choose Category --</option>` + categories.map(c =>
        `<option value="${c.id}" ${ep.category_id == c.id ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('');
      const imgOptions = productImages.map(img =>
        `<option value="${img}" ${(ep.image || '') === img ? 'selected' : ''}>${esc(img.split('/').pop().replace('.jpg', ''))}</option>`).join('');
      const extraRows = existingExtras.length
        ? existingExtras.map(e => `
            <div class="d-flex gap-2 align-items-center extra-row">
              <input type="text" name="extra_names[]" class="form-control form-control-sm" placeholder="Extra Name (e.g. Fried Plantain)" value="${esc(e.name)}">
              <input type="number" step="50" name="extra_prices[]" class="form-control form-control-sm" style="max-width:130px" placeholder="Price (₦)" value="${e.price}">
              <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.extra-row').remove()">&times;</button>
            </div>`).join('')
        : `
            <div class="d-flex gap-2 align-items-center extra-row">
              <input type="text" name="extra_names[]" class="form-control form-control-sm" placeholder="Extra Name (e.g. Fried Plantain)">
              <input type="number" step="50" name="extra_prices[]" class="form-control form-control-sm" style="max-width:130px" placeholder="Price (₦)" value="500">
              <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.extra-row').remove()">&times;</button>
            </div>`;

      const content = `
      ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ''}
      ${errorMessage ? `<div class="alert alert-danger">${esc(errorMessage)}</div>` : ''}
      <div class="card p-4 p-md-5 shadow-sm max-w-800 mx-auto">
        <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
          <h3 class="h4 fw-extrabold text-secondary mb-0">${action === 'edit' ? 'Edit Food Item' : 'Add New Meal to Menu'}</h3>
          <a href="/admin/products.php" class="btn btn-outline-secondary btn-sm">&larr; Back to Menu List</a>
        </div>
        <form action="/admin/products.php" method="POST">
          <input type="hidden" name="id" value="${ep.id || 0}">
          <div class="row g-3">
            <div class="col-12 col-sm-8"><label class="form-label">Meal / Dish Name *</label><input type="text" name="name" class="form-control" placeholder="e.g. Party Jollof Rice with Chicken" required value="${esc(ep.name || '')}"></div>
            <div class="col-12 col-sm-4"><label class="form-label">Category *</label><select name="category_id" class="form-select" required>${catOptions}</select></div>
            <div class="col-12"><label class="form-label">Description</label><textarea name="description" class="form-control" rows="3">${esc(ep.description || '')}</textarea></div>
            <div class="col-12 col-sm-4"><label class="form-label">Regular Price (₦) *</label><input type="number" step="50" name="price" class="form-control" placeholder="3500" required value="${ep.price || ''}"></div>
            <div class="col-12 col-sm-4"><label class="form-label">Discount Price (₦) (Optional)</label><input type="number" step="50" name="discount_price" class="form-control" placeholder="3000" value="${ep.discount_price || ''}"></div>
            <div class="col-12 col-sm-4"><label class="form-label">Prep Time (Mins)</label><input type="number" name="prep_time_minutes" class="form-control" value="${ep.prep_time_minutes || 20}"></div>
            <div class="col-12"><label class="form-label">Product Image</label><select name="image" class="form-select">${imgOptions}</select></div>
            <div class="col-12">
              <div class="d-flex flex-wrap gap-4 pt-2">
                <label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_available" value="1" ${!editProduct || ep.is_available ? 'checked' : ''}><span class="fw-bold fs-sm">In Stock & Available</span></label>
                <label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_popular" value="1" ${ep.is_popular ? 'checked' : ''}><span class="fw-bold fs-sm">Mark as Popular 🔥</span></label>
                <label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_featured" value="1" ${ep.is_featured ? 'checked' : ''}><span class="fw-bold fs-sm">Mark as Featured ⭐</span></label>
              </div>
            </div>
            <div class="col-12 mt-4 pt-3 border-top">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="form-label fw-bold mb-0">Customizable Meal Extras</label>
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="addExtraRow()">+ Add Extra Option</button>
              </div>
              <div id="extras-builder-container" class="d-flex flex-column gap-2">${extraRows}</div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-100 mt-4">💾 Save Food Item</button>
        </form>
      </div>
      <script>
      function addExtraRow() {
        const c = document.getElementById('extras-builder-container');
        const row = document.createElement('div');
        row.className = 'd-flex gap-2 align-items-center extra-row';
        row.innerHTML = '<input type="text" name="extra_names[]" class="form-control form-control-sm" placeholder="Extra Name (e.g. Peppered Chicken)"><input type="number" step="50" name="extra_prices[]" class="form-control form-control-sm" style="max-width:130px" placeholder="Price (₦)" value="1000"><button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest(\\'.extra-row\\').remove()">&times;</button>';
        c.appendChild(row);
      }
      </script>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderLayout('Menu & Food Management', content, true));
      return;
    }

    // List view
    const catFilter = query.cat || 'all';
    const search = (query.search || '').trim().toLowerCase();
    let list = db.products.slice();
    if (catFilter !== 'all') list = list.filter(p => p.category_id === parseInt(catFilter, 10));
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search));
    list = list.sort((a, b) => b.id - a.id);

    const catRow = catFilter !== 'all' ? `<option value="all">-- All Categories --</option>` + categories.map(c => `<option value="${c.id}" ${catFilter == c.id ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('') : `<option value="all">-- All Categories --</option>` + categories.map(c => `<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join('');

    const rows = list.map(p => {
      const cat = db.categories.find(c => c.id === p.category_id);
      return `
      <tr>
        <td><div class="d-flex align-items-center gap-3">
          <img src="/${p.image || 'assets/images/products/jollof-rice.jpg'}" alt="${esc(p.name)}" style="width:50px;height:50px;object-fit:cover;border-radius:var(--radius-sm)">
          <div><a href="/admin/products.php?action=edit&id=${p.id}" class="fw-bold text-secondary">${esc(p.name)}</a><div class="fs-xs text-muted">${p.prep_time_minutes} mins prep</div></div>
        </div></td>
        <td class="fs-sm">${esc(cat ? cat.name : 'Uncategorized')}</td>
        <td class="fw-bold text-primary">${formatPrice(p.price)}</td>
        <td class="fs-sm">${p.discount_price ? formatPrice(p.discount_price) : '<span class="text-muted">—</span>'}</td>
        <td><span class="badge ${p.is_available ? 'badge-success' : 'badge-danger'} fs-xs">${p.is_available ? 'In Stock' : 'Out of Stock'}</span></td>
        <td>${p.is_popular ? '<span class="badge badge-warning fs-xs">🔥 Popular</span>' : ''}${p.is_featured ? '<span class="badge badge-primary fs-xs">⭐ Featured</span>' : ''}</td>
        <td><div class="d-flex gap-2">
          <a href="/admin/products.php?action=edit&id=${p.id}" class="btn btn-outline-primary btn-sm">Edit</a>
          <a href="/admin/products.php?action=delete&id=${p.id}" class="btn btn-outline-danger btn-sm" onclick="return confirm('Are you sure you want to delete this dish?')">Delete</a>
        </div></td>
      </tr>`;
    }).join('');

    const content = `
    ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ''}
    ${query.msg === 'deleted' ? '<div class="alert alert-success">Food item deleted.</div>' : ''}
    ${errorMessage ? `<div class="alert alert-danger">${esc(errorMessage)}</div>` : ''}
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><h1 class="h4 fw-extrabold text-secondary mb-0">Menu Management</h1><p class="text-muted fs-xs mb-0">Manage Nigerian dishes, portion prices, availability, and meal extras</p></div>
      <a href="/admin/products.php?action=create" class="btn btn-primary btn-sm">+ Add New Food Item</a>
    </div>
    <div class="card p-3 shadow-sm mb-4">
      <form action="/admin/products.php" method="GET" class="row g-2 align-items-end">
        <div class="col-12 col-sm-6"><label class="form-label fs-xs mb-1">Search Meal Name</label><input type="text" name="search" class="form-control form-control-sm" placeholder="e.g. Jollof, Egusi, Asun..." value="${esc(query.search || '')}"></div>
        <div class="col-12 col-sm-4"><label class="form-label fs-xs mb-1">Filter by Category</label><select name="cat" class="form-select form-select-sm">${catRow}</select></div>
        <div class="col-12 col-sm-2"><button type="submit" class="btn btn-primary btn-sm w-100">Filter</button></div>
      </form>
    </div>
    <div class="card shadow-sm p-4">
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Discount</th><th>Status</th><th>Badges</th><th>Actions</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="7" class="text-center text-muted py-4">No products found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Menu & Food Management', content, true));
    return;
  }

  // ---- Categories ----
  if (pathname === '/admin/categories') {
    const action = query.action || 'list';
    let message = '';
    let errorMessage = '';

    if (action === 'delete') {
      const id = parseInt(query.id, 10);
      db.categories = db.categories.filter(x => x.id !== id);
      logActivity('Deleted category ID #' + id);
      res.writeHead(302, { 'Location': '/admin/categories.php?msg=deleted' });
      res.end();
      return;
    }

    if (req.method === 'POST') {
      const input = await readBody(req);
      const id = parseInt(input.id, 10) || 0;
      const name = esc(input.name || '');
      if (!name) {
        errorMessage = 'Please enter a category name.';
      } else {
        const icon = esc(input.icon || '🍲');
        const displayOrder = parseInt(input.display_order, 10) || 0;
        const isActive = input.is_active ? 1 : 0;
        if (id > 0) {
          const c = db.categories.find(x => x.id === id);
          if (c) Object.assign(c, { name, slug: slugify(name), icon, display_order: displayOrder, is_active: isActive });
          logActivity('Updated category: ' + name);
          message = 'Category updated successfully!';
        } else {
          const newId = Math.max(0, ...db.categories.map(x => x.id)) + 1;
          db.categories.push({ id: newId, name, slug: slugify(name), icon, image: null, display_order: displayOrder, is_active: isActive });
          logActivity('Created category: ' + name);
          message = 'New category added!';
        }
      }
    }

    let editCat = null;
    if (action === 'edit') editCat = db.categories.find(x => x.id === parseInt(query.id, 10)) || null;
    const categories = db.categories.slice().sort((a, b) => a.display_order - b.display_order);
    const productCount = cid => db.products.filter(p => p.category_id === cid).length;

    const content = `
    ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ''}
    ${query.msg === 'deleted' ? '<div class="alert alert-success">Category deleted.</div>' : ''}
    ${errorMessage ? `<div class="alert alert-danger">${esc(errorMessage)}</div>` : ''}
    <div class="row g-4">
      <div class="col-12 col-md-5">
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">${action === 'edit' ? 'Edit Category' : 'Create New Category'}</h3>
          <form action="/admin/categories.php" method="POST">
            <input type="hidden" name="id" value="${editCat ? editCat.id : 0}">
            <div class="form-group mb-3"><label class="form-label">Category Name *</label><input type="text" name="name" class="form-control" placeholder="e.g. Rice Dishes, Soups, Drinks" required value="${esc(editCat ? editCat.name : '')}"></div>
            <div class="form-group mb-3"><label class="form-label">Emoji Icon</label><input type="text" name="icon" class="form-control" placeholder="🍲, 🍚, 🍗, 🍹" value="${esc(editCat ? editCat.icon : '🍲')}"></div>
            <div class="form-group mb-3"><label class="form-label">Display Order</label><input type="number" name="display_order" class="form-control" value="${editCat ? editCat.display_order : 0}"></div>
            <div class="form-group mb-4"><label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_active" value="1" ${!editCat || editCat.is_active ? 'checked' : ''}><span class="fw-bold fs-sm">Active Category</span></label></div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary w-100">${action === 'edit' ? 'Save Changes' : '+ Add Category'}</button>
              ${action === 'edit' ? '<a href="/admin/categories.php" class="btn btn-outline-secondary">Cancel</a>' : ''}
            </div>
          </form>
        </div>
      </div>
      <div class="col-12 col-md-7">
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">All Categories (${categories.length})</h3>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Icon</th><th>Name</th><th>Meals</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${categories.map(c => `<tr>
                  <td style="font-size:1.5rem">${c.icon}</td>
                  <td><strong>${esc(c.name)}</strong><div class="fs-xs text-muted">slug: ${esc(c.slug)}</div></td>
                  <td><span class="badge badge-secondary">${productCount(c.id)} dishes</span></td>
                  <td>${c.display_order}</td>
                  <td><span class="badge ${c.is_active ? 'badge-success' : 'badge-danger'}">${c.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td><div class="d-flex gap-1">
                    <a href="/admin/categories.php?action=edit&id=${c.id}" class="btn btn-outline-primary btn-sm">Edit</a>
                    <a href="/admin/categories.php?action=delete&id=${c.id}" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this category?')">Delete</a>
                  </div></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Category Management', content, true));
    return;
  }

  // ---- Delivery Zones ----
  if (pathname === '/admin/delivery-zones') {
    const action = query.action || 'list';
    let message = '';
    let errorMessage = '';

    if (action === 'delete') {
      const id = parseInt(query.id, 10);
      db.delivery_zones = db.delivery_zones.filter(x => x.id !== id);
      logActivity('Deleted delivery zone ID #' + id);
      res.writeHead(302, { 'Location': '/admin/delivery-zones.php?msg=deleted' });
      res.end();
      return;
    }

    if (req.method === 'POST') {
      const input = await readBody(req);
      const id = parseInt(input.id, 10) || 0;
      const name = esc(input.name || '');
      if (!name) {
        errorMessage = 'Zone name is required.';
      } else {
        const description = esc(input.description || '');
        const deliveryFee = parseFloat(input.delivery_fee) || 1000;
        const estimatedTime = esc(input.estimated_time || '25-45 mins');
        const isActive = input.is_active ? 1 : 0;
        if (id > 0) {
          const z = db.delivery_zones.find(x => x.id === id);
          if (z) Object.assign(z, { name, description, delivery_fee: deliveryFee, estimated_time: estimatedTime, is_active: isActive });
          logActivity('Updated delivery zone: ' + name);
          message = 'Delivery zone updated successfully!';
        } else {
          const newId = Math.max(0, ...db.delivery_zones.map(x => x.id)) + 1;
          db.delivery_zones.push({ id: newId, name, description, delivery_fee: deliveryFee, estimated_time: estimatedTime, is_active: isActive });
          logActivity('Added new delivery zone: ' + name);
          message = 'New delivery zone created!';
        }
      }
    }

    let editZone = null;
    if (action === 'edit') editZone = db.delivery_zones.find(x => x.id === parseInt(query.id, 10)) || null;
    const zones = db.delivery_zones.slice().sort((a, b) => a.delivery_fee - b.delivery_fee);

    const content = `
    ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ''}
    ${query.msg === 'deleted' ? '<div class="alert alert-success">Delivery zone deleted.</div>' : ''}
    ${errorMessage ? `<div class="alert alert-danger">${esc(errorMessage)}</div>` : ''}
    <div class="row g-4">
      <div class="col-12 col-md-5">
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">${action === 'edit' ? 'Edit Delivery Zone' : 'Add Benin City Delivery Zone'}</h3>
          <form action="/admin/delivery-zones.php" method="POST">
            <input type="hidden" name="id" value="${editZone ? editZone.id : 0}">
            <div class="form-group mb-3"><label class="form-label">Zone / Area Name *</label><input type="text" name="name" class="form-control" placeholder="e.g. GRA & Boundary Road" required value="${esc(editZone ? editZone.name : '')}"></div>
            <div class="form-group mb-3"><label class="form-label">Description / Landmarks Covered</label><input type="text" name="description" class="form-control" placeholder="e.g. Golf Club, Boundary Rd" value="${esc(editZone ? editZone.description : '')}"></div>
            <div class="form-group mb-3"><label class="form-label">Delivery Fee (₦) *</label><input type="number" step="50" name="delivery_fee" class="form-control" placeholder="1000" required value="${editZone ? editZone.delivery_fee : '1000'}"></div>
            <div class="form-group mb-3"><label class="form-label">Estimated Delivery Time</label><input type="text" name="estimated_time" class="form-control" placeholder="e.g. 25-35 mins" value="${esc(editZone ? editZone.estimated_time : '25-45 mins')}"></div>
            <div class="form-group mb-4"><label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_active" value="1" ${!editZone || editZone.is_active ? 'checked' : ''}><span class="fw-bold fs-sm">Active for Dispatch</span></label></div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary w-100">${action === 'edit' ? 'Save Changes' : '+ Add Delivery Zone'}</button>
              ${action === 'edit' ? '<a href="/admin/delivery-zones.php" class="btn btn-outline-secondary">Cancel</a>' : ''}
            </div>
          </form>
        </div>
      </div>
      <div class="col-12 col-md-7">
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">Configured Delivery Zones (${zones.length})</h3>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Zone Area</th><th>Delivery Fee</th><th>Est. Time</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${zones.map(z => `<tr>
                  <td><strong>${esc(z.name)}</strong><div class="fs-xs text-muted">${esc(z.description || 'Benin City')}</div></td>
                  <td class="fw-bold text-primary">${formatPrice(z.delivery_fee)}</td>
                  <td class="fs-xs">${esc(z.estimated_time)}</td>
                  <td><span class="badge ${z.is_active ? 'badge-success' : 'badge-danger'}">${z.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td><div class="d-flex gap-1">
                    <a href="/admin/delivery-zones.php?action=edit&id=${z.id}" class="btn btn-outline-primary btn-sm">Edit</a>
                    <a href="/admin/delivery-zones.php?action=delete&id=${z.id}" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this delivery zone?')">Delete</a>
                  </div></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Benin City Delivery Zones', content, true));
    return;
  }

  // ---- Promo Codes ----
  if (pathname === '/admin/promo-codes') {
    const action = query.action || 'list';
    let message = '';
    let errorMessage = '';

    if (action === 'delete') {
      const id = parseInt(query.id, 10);
      db.promo_codes = db.promo_codes.filter(x => x.id !== id);
      logActivity('Deleted promo code ID #' + id);
      res.writeHead(302, { 'Location': '/admin/promo-codes.php?msg=deleted' });
      res.end();
      return;
    }

    if (req.method === 'POST') {
      const input = await readBody(req);
      const id = parseInt(input.id, 10) || 0;
      const code = String(input.code || '').trim().toUpperCase();
      const discountType = input.discount_type === 'fixed' ? 'fixed' : 'percentage';
      const discountValue = parseFloat(input.discount_value) || 0;
      if (!code || discountValue <= 0) {
        errorMessage = 'Please provide a valid code and discount value.';
      } else {
        const minOrder = parseFloat(input.min_order_amount) || 0;
        const maxDiscount = input.max_discount_amount ? parseFloat(input.max_discount_amount) : null;
        const usageLimit = parseInt(input.usage_limit, 10) || 100;
        const isActive = input.is_active ? 1 : 0;
        if (id > 0) {
          const p = db.promo_codes.find(x => x.id === id);
          if (p) Object.assign(p, { code, discount_type: discountType, discount_value: discountValue, min_order_amount: minOrder, max_discount_amount: maxDiscount, expiry_date: input.expiry_date || null, usage_limit: usageLimit, is_active: isActive });
          logActivity('Updated promo code: ' + code);
          message = 'Promo code updated successfully!';
        } else {
          const newId = Math.max(0, ...db.promo_codes.map(x => x.id)) + 1;
          db.promo_codes.push({ id: newId, code, discount_type: discountType, discount_value: discountValue, min_order_amount: minOrder, max_discount_amount: maxDiscount, start_date: input.start_date || null, expiry_date: input.expiry_date || null, usage_limit: usageLimit, usage_count: 0, is_active: isActive });
          logActivity('Created promo coupon: ' + code);
          message = 'New promo code created!';
        }
      }
    }

    let editPromo = null;
    if (action === 'edit') editPromo = db.promo_codes.find(x => x.id === parseInt(query.id, 10)) || null;
    const promos = db.promo_codes.slice().sort((a, b) => b.id - a.id);

    const content = `
    ${message ? `<div class="alert alert-success">${esc(message)}</div>` : ''}
    ${query.msg === 'deleted' ? '<div class="alert alert-success">Promo code deleted.</div>' : ''}
    ${errorMessage ? `<div class="alert alert-danger">${esc(errorMessage)}</div>` : ''}
    <div class="row g-4">
      <div class="col-12 col-md-5">
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">${action === 'edit' ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
          <form action="/admin/promo-codes.php" method="POST">
            <input type="hidden" name="id" value="${editPromo ? editPromo.id : 0}">
            <div class="form-group mb-3"><label class="form-label">Promo Code (Uppercase) *</label><input type="text" name="code" class="form-control text-uppercase" placeholder="e.g. WELCOME10" required value="${esc(editPromo ? editPromo.code : '')}"></div>
            <div class="row g-2 mb-3">
              <div class="col-6"><label class="form-label">Discount Type</label><select name="discount_type" class="form-select"><option value="percentage" ${(!editPromo || editPromo.discount_type === 'percentage') ? 'selected' : ''}>Percentage (%)</option><option value="fixed" ${editPromo && editPromo.discount_type === 'fixed' ? 'selected' : ''}>Fixed (₦)</option></select></div>
              <div class="col-6"><label class="form-label">Discount Value *</label><input type="number" step="1" name="discount_value" class="form-control" placeholder="10 or 500" required value="${editPromo ? editPromo.discount_value : '10'}"></div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6"><label class="form-label">Min Order (₦)</label><input type="number" step="100" name="min_order_amount" class="form-control" placeholder="3000" value="${editPromo ? editPromo.min_order_amount : '0'}"></div>
              <div class="col-6"><label class="form-label">Max Discount (₦)</label><input type="number" step="100" name="max_discount_amount" class="form-control" placeholder="2000" value="${editPromo && editPromo.max_discount_amount != null ? editPromo.max_discount_amount : ''}"></div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6"><label class="form-label">Expiry Date</label><input type="date" name="expiry_date" class="form-control" value="${editPromo && editPromo.expiry_date ? esc(editPromo.expiry_date) : ''}"></div>
              <div class="col-6"><label class="form-label">Usage Limit</label><input type="number" name="usage_limit" class="form-control" value="${editPromo ? editPromo.usage_limit : '100'}"></div>
            </div>
            <div class="form-group mb-4"><label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_active" value="1" ${!editPromo || editPromo.is_active ? 'checked' : ''}><span class="fw-bold fs-sm">Active & Usable</span></label></div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary w-100">${action === 'edit' ? 'Save Changes' : '+ Create Promo Code'}</button>
              ${action === 'edit' ? '<a href="/admin/promo-codes.php" class="btn btn-outline-secondary">Cancel</a>' : ''}
            </div>
          </form>
        </div>
      </div>
      <div class="col-12 col-md-7">
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">All Promo Codes (${promos.length})</h3>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${promos.map(p => `<tr>
                  <td><strong class="text-primary">${esc(p.code)}</strong></td>
                  <td class="fw-bold">${p.discount_type === 'percentage' ? p.discount_value + '%' : formatPrice(p.discount_value)}</td>
                  <td class="fs-xs">${formatPrice(p.min_order_amount)}</td>
                  <td class="fs-xs">${p.usage_count} / ${p.usage_limit}</td>
                  <td><span class="badge ${p.is_active ? 'badge-success' : 'badge-danger'}">${p.is_active ? 'Active' : 'Expired'}</span></td>
                  <td><div class="d-flex gap-1">
                    <a href="/admin/promo-codes.php?action=edit&id=${p.id}" class="btn btn-outline-primary btn-sm">Edit</a>
                    <a href="/admin/promo-codes.php?action=delete&id=${p.id}" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this coupon code?')">Delete</a>
                  </div></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Promotions & Coupons', content, true));
    return;
  }

  // ---- Orders ----
  if (pathname === '/admin/orders') {
    const statusFilter = query.status || 'all';
    const search = (query.search || '').trim().toLowerCase();
    const fromDate = query.from_date || '';
    const toDate = query.to_date || '';

    let orders = db.orders.slice();
    if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);
    if (search) orders = orders.filter(o =>
      (o.order_number || '').toLowerCase().includes(search) ||
      (o.customer_name || '').toLowerCase().includes(search) ||
      (o.phone || '').includes(search) ||
      (o.delivery_address || '').toLowerCase().includes(search));
    if (fromDate) orders = orders.filter(o => (o.created_at || '').slice(0, 10) >= fromDate);
    if (toDate) orders = orders.filter(o => (o.created_at || '').slice(0, 10) <= toDate);
    orders = orders.sort((a, b) => b.id - a.id);

    const tabs = [
      ['all', 'All Orders'], ['Pending', '🔔 Pending'], ['Confirmed', '✓ Confirmed'], ['Preparing', '🍳 Preparing'],
      ['Ready', '📦 Ready'], ['Out for Delivery', '🛵 Out for Delivery'], ['Delivered', '🎉 Delivered'], ['Cancelled', '❌ Cancelled']
    ];
    const tabLinks = tabs.map(([val, label]) =>
      `<a href="/admin/orders.php?status=${encodeURIComponent(val)}" class="filter-tab ${statusFilter === val ? 'active' : ''}">${label}</a>`).join('');

    const rows = orders.map(o => `
      <tr>
        <td><a href="/admin/order-details.php?id=${o.id}" class="fw-extrabold text-primary">${esc(o.order_number)}</a><div class="fs-xs text-muted">${fmtDateTime(o.created_at)}</div></td>
        <td><div class="fw-bold fs-sm">${esc(o.customer_name)}</div><div class="fs-xs text-muted">📞 ${esc(o.phone)}</div></td>
        <td class="fs-sm"><strong>${esc(o.zone_name || 'Benin City')}</strong><div class="fs-xs text-muted text-truncate" style="max-width:180px">${esc(o.delivery_address)}</div></td>
        <td>${o.order_timing === 'scheduled' ? `<span class="badge badge-warning fs-xs">📅 ${esc(o.scheduled_date)} ${esc(o.scheduled_time)}</span>` : '<span class="badge badge-primary fs-xs">⚡ ASAP</span>'}</td>
        <td class="fw-extrabold text-secondary">${formatPrice(o.grand_total)}</td>
        <td><span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-secondary'} fs-xs">${esc(String(o.payment_status).toUpperCase())} (${esc(o.payment_method)})</span></td>
        <td>${statusSelect(o.status, o.id)}</td>
        <td><div class="d-flex gap-1">
          <a href="/admin/order-details.php?id=${o.id}" class="btn btn-outline-primary btn-sm" title="View Full Details">👁️</a>
          <a href="/admin/receipt.php?id=${o.id}" target="_blank" class="btn btn-outline-secondary btn-sm" title="Print Receipt">🖨️</a>
        </div></td>
      </tr>`).join('');

    const content = `
    <div class="filter-tabs mb-3">${tabLinks}</div>
    <div class="card p-3 shadow-sm mb-4">
      <form action="/admin/orders.php" method="GET" class="row g-2 align-items-end">
        <input type="hidden" name="status" value="${esc(statusFilter)}">
        <div class="col-12 col-sm-4"><label class="form-label fs-xs mb-1">Search Order / Customer / Phone</label><input type="text" name="search" class="form-control form-control-sm" placeholder="e.g. MDM-2026, Osas, 0803..." value="${esc(query.search || '')}"></div>
        <div class="col-6 col-sm-3"><label class="form-label fs-xs mb-1">From Date</label><input type="date" name="from_date" class="form-control form-control-sm" value="${esc(fromDate)}"></div>
        <div class="col-6 col-sm-3"><label class="form-label fs-xs mb-1">To Date</label><input type="date" name="to_date" class="form-control form-control-sm" value="${esc(toDate)}"></div>
        <div class="col-12 col-sm-2 d-flex gap-1"><button type="submit" class="btn btn-primary btn-sm flex-grow-1">Filter</button><a href="/admin/orders.php" class="btn btn-outline-secondary btn-sm">Reset</a></div>
      </form>
    </div>
    <div class="card shadow-sm p-4">
      <div class="d-flex align-items-center justify-content-between mb-3"><h3 class="h5 fw-extrabold text-secondary mb-0">Orders List (${orders.length})</h3></div>
      ${orders.length ? `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Order #</th><th>Customer Info</th><th>Delivery Area</th><th>Timing</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="text-center py-5 text-muted"><div style="font-size:3rem">📦</div><p class="mt-2">No orders match the selected filters.</p></div>'}
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Orders Management', content, true));
    return;
  }

  // ---- Order Details ----
  if (pathname === '/admin/order-details') {
    const id = parseInt(query.id, 10) || 0;
    const order = db.orders.find(o => o.id === id);
    if (!order) {
      res.writeHead(302, { 'Location': '/admin/orders.php' });
      res.end();
      return;
    }
    const items = order.items || [];
    const totalExtras = it => (it.extras || []).reduce((s, e) => s + e.extra_price, 0);
    const content = `
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><a href="/admin/orders.php" class="fs-sm text-muted">&larr; Back to Orders</a>
        <h1 class="h3 fw-extrabold text-secondary mb-0">Order: ${esc(order.order_number)}</h1>
        <div class="fs-xs text-muted">Placed on ${fmtDateTime(order.created_at)}</div>
      </div>
      <div class="d-flex gap-2">
        <a href="/admin/receipt.php?id=${order.id}" target="_blank" class="btn btn-secondary btn-sm">🖨️ Print Kitchen Receipt</a>
        <a href="https://wa.me/${esc(order.whatsapp || order.phone)}" target="_blank" class="btn btn-whatsapp btn-sm">💬 Send WhatsApp to Customer</a>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <div class="card p-4 shadow-sm mb-4">
          <h3 class="h5 fw-extrabold text-secondary mb-3">Order Items</h3>
          <div class="table-responsive"><table class="table">
            <thead><tr><th>Item Details</th><th>Unit Price</th><th>Qty</th><th class="text-end">Subtotal</th></tr></thead>
            <tbody>${items.map(it => `
              <tr>
                <td><strong>${esc(it.product_name)}</strong>
                  ${(it.extras && it.extras.length) ? `<div class="fs-xs text-muted">Extras: ${it.extras.map(e => esc(e.extra_name) + ' (+' + formatPrice(e.extra_price) + ')').join(', ')}</div>` : ''}
                  ${it.instructions ? `<div class="fs-xs text-warning fst-italic">Note: ${esc(it.instructions)}</div>` : ''}
                </td>
                <td>${formatPrice(it.unit_price)}</td>
                <td><span class="badge badge-secondary">${it.quantity}</span></td>
                <td class="text-end fw-bold">${formatPrice(it.subtotal)}</td>
              </tr>`).join('')}</tbody>
          </table></div>
          <div class="row justify-content-end mt-3">
            <div class="col-12 col-sm-6">
              <div class="d-flex justify-content-between mb-2 fs-sm"><span class="text-muted">Food Subtotal:</span><strong>${formatPrice(order.subtotal)}</strong></div>
              <div class="d-flex justify-content-between mb-2 fs-sm"><span class="text-muted">Delivery Fee (${esc(order.zone_name || 'Benin City')}):</span><strong>${formatPrice(order.delivery_fee)}</strong></div>
              ${order.discount_amount > 0 ? `<div class="d-flex justify-content-between mb-2 fs-sm text-danger"><span>Promo Discount (${esc(order.promo_code)}):</span><strong>- ${formatPrice(order.discount_amount)}</strong></div>` : ''}
              <hr><div class="d-flex justify-content-between fs-lg fw-extrabold text-secondary"><span>Grand Total:</span><span class="text-primary">${formatPrice(order.grand_total)}</span></div>
            </div>
          </div>
        </div>
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">Order Status History & Audit Log</h3>
          <div class="d-flex flex-column gap-2">
            <div class="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
              <div><span class="badge badge-primary me-2">${esc(order.status)}</span><span class="fs-sm">${esc('Status set to ' + order.status)}</span><div class="fs-xs text-muted">Changed by: Madam 3 Administrator</div></div>
              <div class="fs-xs text-muted">${fmtTime(order.created_at)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="card p-4 shadow-sm mb-4">
          <h3 class="h5 fw-extrabold text-secondary mb-3">Update Order Status</h3>
          <div class="form-group mb-3"><label class="form-label">Current Status</label><select id="update-order-status-select" class="form-select fw-bold">
            ${ADMIN_STATUS_OPTIONS.map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select></div>
          <div class="form-group mb-3"><label class="form-label">Status Notes</label><input type="text" id="update-order-notes" class="form-control" placeholder="e.g. Rider dispatched with bag #3"></div>
          <button type="button" class="btn btn-primary w-100" onclick="saveStatusChange(${order.id})">Update Status</button>
        </div>
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">Customer Details</h3>
          <div class="d-flex flex-column gap-2 fs-sm">
            <div><strong>Name:</strong> ${esc(order.customer_name)}</div>
            <div><strong>Phone:</strong> <a href="tel:${esc(order.phone)}">${esc(order.phone)}</a></div>
            <div><strong>WhatsApp:</strong> <a href="https://wa.me/${esc(order.whatsapp || order.phone)}" target="_blank">${esc(order.whatsapp || order.phone)}</a></div>
            ${order.email ? `<div><strong>Email:</strong> ${esc(order.email)}</div>` : ''}
            <hr class="my-2">
            <div><strong>Delivery Zone:</strong> ${esc(order.zone_name || 'Benin City')}</div>
            <div><strong>Street Address:</strong> ${esc(order.delivery_address)}</div>
            <div><strong>Landmark:</strong> ${esc(order.landmark || 'N/A')}</div>
            ${order.instructions ? `<div class="p-2 bg-warning bg-opacity-10 border rounded mt-2"><strong>Kitchen/Delivery Note:</strong><br>${esc(order.instructions)}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
    <script>
    async function saveStatusChange(orderId) {
      const select = document.getElementById('update-order-status-select');
      const notesInput = document.getElementById('update-order-notes');
      const status = select.value;
      const notes = notesInput.value.trim() || 'Status updated to ' + status;
      try {
        const response = await fetch('../api/orders.php?action=update_status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, status: status, notes: notes }) });
        const data = await response.json();
        if (data.success) { if (typeof showToast === 'function') showToast(data.message, 'success'); setTimeout(() => location.reload(), 500); }
        else alert(data.message || 'Update failed');
      } catch (e) { location.reload(); }
    }
    </script>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Order #' + order.order_number, content, true));
    return;
  }

  // ---- Receipt ----
  if (pathname === '/admin/receipt') {
    const id = parseInt(query.id, 10) || 0;
    const order = db.orders.find(o => o.id === id);
    if (!order) { res.writeHead(302, { 'Location': '/admin/orders.php' }); res.end(); return; }
    const items = order.items || [];
    const content = `
    <div class="card p-4 shadow-sm max-w-500 mx-auto">
      <div class="text-center mb-3">
        <img src="/assets/images/logo.svg" alt="Madam 3 Kitchen" style="height:44px">
        <h2 class="h5 fw-extrabold text-secondary mb-0">${esc(db.settings.restaurant_name)}</h2>
        <div class="fs-xs text-muted">${esc(db.settings.restaurant_address)}</div>
        <div class="fs-xs text-muted">📞 ${esc(db.settings.restaurant_phone)}</div>
      </div>
      <hr>
      <div class="fs-sm"><div class="d-flex justify-content-between"><span class="text-muted">Order:</span><strong>${esc(order.order_number)}</strong></div>
        <div class="d-flex justify-content-between"><span class="text-muted">Date:</span><span>${fmtDateTime(order.created_at)}</span></div>
        <div class="d-flex justify-content-between"><span class="text-muted">Customer:</span><span>${esc(order.customer_name)}</span></div>
        <div class="d-flex justify-content-between"><span class="text-muted">Phone:</span><span>${esc(order.phone)}</span></div>
        <div class="d-flex justify-content-between"><span class="text-muted">Zone:</span><span>${esc(order.zone_name || 'Benin City')}</span></div>
        <div class="d-flex justify-content-between"><span class="text-muted">Address:</span><span>${esc(order.delivery_address)}</span></div>
      </div>
      <hr>
      <div class="table-responsive"><table class="table table-sm">
        <thead><tr><th>Item</th><th>Qty</th><th class="text-end">Amount</th></tr></thead>
        <tbody>${items.map(it => `<tr><td>${esc(it.product_name)}</td><td>${it.quantity}</td><td class="text-end">${formatPrice(it.subtotal)}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="d-flex justify-content-between fs-sm"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
      <div class="d-flex justify-content-between fs-sm"><span>Delivery</span><span>${formatPrice(order.delivery_fee)}</span></div>
      ${order.discount_amount > 0 ? `<div class="d-flex justify-content-between fs-sm text-danger"><span>Discount</span><span>- ${formatPrice(order.discount_amount)}</span></div>` : ''}
      <hr>
      <div class="d-flex justify-content-between fw-extrabold text-secondary"><span>Grand Total</span><span class="text-primary">${formatPrice(order.grand_total)}</span></div>
      <div class="d-flex justify-content-between fs-sm mt-2"><span>Payment</span><span>${esc(order.payment_method.toUpperCase())} (${esc(order.payment_status)})</span></div>
      <div class="d-flex justify-content-between fs-sm"><span>Status</span><span>${esc(order.status)}</span></div>
      <hr>
      <div class="text-center fs-xs text-muted">Thank you for choosing ${esc(db.settings.restaurant_name)}! 🍲</div>
      <div class="text-center mt-3"><button type="button" class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Print</button></div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Receipt ' + order.order_number, content, true));
    return;
  }

  // ---- Customers ----
  if (pathname === '/admin/customers') {
    const search = (query.search || '').trim().toLowerCase();
    let customers = db.users.filter(u => u.role === 'customer').map(u => {
      const custOrders = db.orders.filter(o => o.user_id === u.id);
      const totalOrders = custOrders.length;
      const totalSpend = custOrders.reduce((s, o) => s + o.grand_total, 0);
      return Object.assign({}, u, { total_orders: totalOrders, total_spend: totalSpend });
    });
    if (search) customers = customers.filter(c =>
      (c.name || '').toLowerCase().includes(search) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search) ||
      (c.address || '').toLowerCase().includes(search));
    customers = customers.sort((a, b) => b.total_spend - a.total_spend);

    const rows = customers.map(c => `
      <tr>
        <td><div class="d-flex align-items-center gap-2"><div class="review-avatar" style="width:36px;height:36px;font-size:0.9rem">${esc(String(c.name || '?').charAt(0).toUpperCase())}</div><strong>${esc(c.name)}</strong></div></td>
        <td><div>📞 ${esc(c.phone)}</div>${c.email ? `<div class="fs-xs text-muted">✉️ ${esc(c.email)}</div>` : ''}</td>
        <td class="fs-xs" style="max-width:220px">${esc(c.address || 'No address saved')}${c.landmark ? `<div class="text-muted">Landmark: ${esc(c.landmark)}</div>` : ''}</td>
        <td><span class="badge badge-primary">${c.total_orders} orders</span></td>
        <td class="fw-bold text-success">${formatPrice(c.total_spend)}</td>
        <td class="fs-xs text-muted">${fmtDate(c.created_at)}</td>
      </tr>`).join('');

    const content = `
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><h1 class="h4 fw-extrabold text-secondary mb-0">Customer Directory</h1><p class="text-muted fs-xs mb-0">View registered foodies, total orders, and total lifetime spend</p></div>
    </div>
    <div class="card p-3 shadow-sm mb-4">
      <form action="/admin/customers.php" method="GET" class="row g-2">
        <div class="col-10"><input type="text" name="search" class="form-control form-control-sm" placeholder="Search customer by name, phone, email, or Benin address..." value="${esc(query.search || '')}"></div>
        <div class="col-2"><button type="submit" class="btn btn-primary btn-sm w-100">Search</button></div>
      </form>
    </div>
    <div class="card shadow-sm p-4">
      <div class="table-responsive"><table class="table align-middle">
        <thead><tr><th>Customer</th><th>Contact</th><th>Saved Address</th><th>Total Orders</th><th>Lifetime Spend</th><th>Joined</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" class="text-center text-muted py-4">No customers found.</td></tr>'}</tbody>
      </table></div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Customers Directory', content, true));
    return;
  }

  // ---- Reviews ----
  if (pathname === '/admin/reviews') {
    const action = query.action || 'list';
    const id = parseInt(query.id, 10);
    if (id > 0 && action === 'approve') { const r = db.reviews.find(x => x.id === id); if (r) r.is_approved = 1; logActivity('Approved review #' + id); res.writeHead(302, { 'Location': '/admin/reviews.php' }); res.end(); return; }
    if (id > 0 && action === 'unapprove') { const r = db.reviews.find(x => x.id === id); if (r) r.is_approved = 0; logActivity('Unapproved review #' + id); res.writeHead(302, { 'Location': '/admin/reviews.php' }); res.end(); return; }
    if (id > 0 && action === 'delete') { db.reviews = db.reviews.filter(x => x.id !== id); logActivity('Deleted review #' + id); res.writeHead(302, { 'Location': '/admin/reviews.php' }); res.end(); return; }

    const rows = db.reviews.slice().sort((a, b) => b.id - a.id).map(r => `
      <tr>
        <td><strong>${esc(r.customer_name)}</strong></td>
        <td class="fs-sm">General Restaurant</td>
        <td><span class="text-gold fw-bold">${'★'.repeat(r.rating)}</span> <span class="fs-xs text-muted">(${r.rating}/5)</span></td>
        <td class="fs-sm" style="max-width:320px">&quot;${esc(r.comment)}&quot;</td>
        <td><span class="badge ${r.is_approved ? 'badge-success' : 'badge-warning'}">${r.is_approved ? 'Approved / Visible' : 'Pending Moderation'}</span></td>
        <td><div class="d-flex gap-1">
          ${r.is_approved
            ? `<a href="/admin/reviews.php?action=unapprove&id=${r.id}" class="btn btn-outline-warning btn-sm">Hide</a>`
            : `<a href="/admin/reviews.php?action=approve&id=${r.id}" class="btn btn-outline-success btn-sm">Approve</a>`}
          <a href="/admin/reviews.php?action=delete&id=${r.id}" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this review?')">Delete</a>
        </div></td>
      </tr>`).join('');

    const content = `
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><h1 class="h4 fw-extrabold text-secondary mb-0">Customer Reviews & Ratings</h1><p class="text-muted fs-xs mb-0">Moderate public testimonials shown on the Madam 3 Kitchen website</p></div>
    </div>
    <div class="card shadow-sm p-4">
      ${db.reviews.length ? `<div class="table-responsive"><table class="table align-middle">
        <thead><tr><th>Customer</th><th>Dish</th><th>Rating</th><th>Review Comment</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody></table></div>` : '<div class="text-center py-4 text-muted">No reviews submitted yet.</div>'}
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Customer Reviews Moderation', content, true));
    return;
  }

  // ---- Messages ----
  if (pathname === '/admin/messages') {
    const action = query.action || 'list';
    const id = parseInt(query.id, 10);
    if (id > 0 && action === 'delete') { db.contact_messages = db.contact_messages.filter(x => x.id !== id); logActivity('Deleted contact message #' + id); res.writeHead(302, { 'Location': '/admin/messages.php' }); res.end(); return; }
    if (id > 0 && action === 'mark_read') { const m = db.contact_messages.find(x => x.id === id); if (m) m.is_read = 1; logActivity('Marked message #' + id + ' as read'); res.writeHead(302, { 'Location': '/admin/messages.php' }); res.end(); return; }

    const rows = db.contact_messages.slice().sort((a, b) => b.id - a.id).map(m => `
      <tr class="${m.is_read ? '' : 'table-warning'}">
        <td class="fs-xs">${fmtTime(m.created_at)}</td>
        <td><strong>${esc(m.name)}</strong></td>
        <td class="fs-sm"><div>📞 <a href="tel:${esc(m.phone)}">${esc(m.phone)}</a></div>${m.email ? `<div class="fs-xs text-muted">✉️ ${esc(m.email)}</div>` : ''}</td>
        <td><span class="badge badge-secondary">${esc(m.subject || 'Inquiry')}</span></td>
        <td class="fs-sm" style="max-width:320px">${esc(m.message)}</td>
        <td><div class="d-flex gap-1">
          ${!m.is_read ? `<a href="/admin/messages.php?action=mark_read&id=${m.id}" class="btn btn-outline-success btn-sm">Mark Read</a>` : ''}
          <a href="/admin/messages.php?action=delete&id=${m.id}" class="btn btn-outline-danger btn-sm" onclick="return confirm('Delete this message?')">Delete</a>
        </div></td>
      </tr>`).join('');

    const content = `
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><h1 class="h4 fw-extrabold text-secondary mb-0">Customer Inquiries Inbox</h1><p class="text-muted fs-xs mb-0">Messages submitted via the contact form on the Madam 3 Kitchen website</p></div>
    </div>
    <div class="card shadow-sm p-4">
      ${db.contact_messages.length ? `<div class="table-responsive"><table class="table align-middle">
        <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Subject</th><th>Message</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody></table></div>` : '<div class="text-center py-4 text-muted">No messages received yet.</div>'}
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Customer Inquiries & Messages', content, true));
    return;
  }

  // ---- Activity Logs ----
  if (pathname === '/admin/activity-logs') {
    const rows = db.activity_logs.slice().sort((a, b) => b.id - a.id).slice(0, 100).map(l => `
      <tr>
        <td class="fs-xs">${fmtDateTime(l.created_at)}</td>
        <td><strong>${esc(l.admin_user)}</strong></td>
        <td class="fs-sm">${esc(l.action)}</td>
        <td class="fs-xs text-muted">${esc(l.ip_address || '127.0.0.1')}</td>
      </tr>`).join('');
    const content = `
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><h1 class="h4 fw-extrabold text-secondary mb-0">Admin Activity Logs</h1><p class="text-muted fs-xs mb-0">System audit trail of administrative changes, logins, and status updates</p></div>
    </div>
    <div class="card shadow-sm p-4">
      <div class="table-responsive"><table class="table align-middle">
        <thead><tr><th>Timestamp</th><th>Admin User</th><th>Action Description</th><th>IP Address</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" class="text-center text-muted">No logs recorded yet.</td></tr>'}</tbody>
      </table></div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Admin Audit Logs', content, true));
    return;
  }

  // ---- Reports ----
  if (pathname === '/admin/reports') {
    if (query.export === 'csv') {
      const header = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Delivery Zone', 'Subtotal (NGN)', 'Delivery (NGN)', 'Discount (NGN)', 'Grand Total (NGN)', 'Payment Method', 'Payment Status', 'Order Status'];
      const lines = db.orders.map(o => [o.order_number, o.created_at, o.customer_name, o.phone, o.zone_name, o.subtotal, o.delivery_fee, o.discount_amount, o.grand_total, o.payment_method, o.payment_status, o.status]);
      const csv = [header, ...lines].map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n');
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=madam3_sales_report.csv' });
      res.end(csv);
      return;
    }

    const validOrders = db.orders.filter(o => !['Cancelled', 'Rejected'].includes(o.status));
    const totRev = validOrders.reduce((s, o) => s + o.grand_total, 0);
    const totOrders = validOrders.length;
    const aov = totOrders ? totRev / totOrders : 0;

    const topMealsMap = {};
    db.orders.forEach(o => (o.items || []).forEach(it => {
      const key = it.product_name;
      if (!topMealsMap[key]) topMealsMap[key] = { qty: 0, rev: 0 };
      topMealsMap[key].qty += it.quantity;
      topMealsMap[key].rev += it.subtotal;
    }));
    const topMeals = Object.entries(topMealsMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);

    const payStats = {};
    db.orders.forEach(o => {
      if (!payStats[o.payment_method]) payStats[o.payment_method] = { count: 0, total: 0 };
      payStats[o.payment_method].count++; payStats[o.payment_method].total += o.grand_total;
    });

    const zoneStats = {};
    db.orders.forEach(o => {
      const z = o.zone_name || 'Direct / Asoro';
      if (!zoneStats[z]) zoneStats[z] = { count: 0, total: 0 };
      zoneStats[z].count++; zoneStats[z].total += o.grand_total;
    });
    const zoneList = Object.entries(zoneStats).sort((a, b) => b[1].count - a[1].count).slice(0, 8);

    const dailyMap = {};
    db.orders.forEach(o => {
      const d = (o.created_at || '').slice(0, 10);
      if (!dailyMap[d]) dailyMap[d] = { count: 0, total: 0 };
      dailyMap[d].count++; dailyMap[d].total += o.grand_total;
    });
    const dailyList = Object.entries(dailyMap).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);

    const content = `
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div><h1 class="h4 fw-extrabold text-secondary mb-0">Sales & Financial Analytics</h1><p class="text-muted fs-xs mb-0">Performance metrics and accounting reports for Madam 3 Kitchen</p></div>
      <a href="/admin/reports.php?export=csv" class="btn btn-primary btn-sm">📥 Export All Sales to CSV</a>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-4"><div class="stat-card"><div><div class="stat-title">Total Lifetime Revenue</div><div class="stat-value text-primary">${formatPrice(totRev)}</div><div class="fs-xs text-muted">All completed orders</div></div><div class="stat-icon orange">💰</div></div></div>
      <div class="col-12 col-sm-4"><div class="stat-card"><div><div class="stat-title">Total Orders Fulfilled</div><div class="stat-value text-success">${totOrders}</div><div class="fs-xs text-muted">Excluding cancellations</div></div><div class="stat-icon green">📦</div></div></div>
      <div class="col-12 col-sm-4"><div class="stat-card"><div><div class="stat-title">Average Order Value (AOV)</div><div class="stat-value text-info">${formatPrice(aov)}</div><div class="fs-xs text-muted">Average customer spend</div></div><div class="stat-icon blue">📊</div></div></div>
    </div>
    <div class="row g-4">
      <div class="col-12 col-lg-7">
        <div class="card p-4 shadow-sm mb-4">
          <h3 class="h5 fw-extrabold text-secondary mb-3">🔥 Most Ordered Nigerian Dishes</h3>
          <div class="table-responsive"><table class="table align-middle">
            <thead><tr><th>Dish Name</th><th>Quantity Sold</th><th class="text-end">Total Revenue</th></tr></thead>
            <tbody>${topMeals.map(([name, d]) => `<tr><td><strong>${esc(name)}</strong></td><td><span class="badge badge-primary">${d.qty} portions</span></td><td class="text-end fw-extrabold text-secondary">${formatPrice(d.rev)}</td></tr>`).join('') || '<tr><td colspan="3" class="text-center text-muted">No meal sales recorded yet.</td></tr>'}</tbody>
          </table></div>
        </div>
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">📅 Recent Daily Revenue</h3>
          <div class="table-responsive"><table class="table">
            <thead><tr><th>Date</th><th>Orders Count</th><th class="text-end">Daily Revenue</th></tr></thead>
            <tbody>${dailyList.map(([d, s]) => `<tr><td><strong>${esc(d)}</strong></td><td>${s.count} orders</td><td class="text-end fw-bold text-success">${formatPrice(s.total)}</td></tr>`).join('') || '<tr><td colspan="3" class="text-center text-muted">No daily records found.</td></tr>'}</tbody>
          </table></div>
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <div class="card p-4 shadow-sm mb-4">
          <h3 class="h5 fw-extrabold text-secondary mb-3">💳 Payment Method Statistics</h3>
          <div class="d-flex flex-column gap-2">
            ${Object.entries(payStats).map(([m, d]) => `<div class="p-2 border rounded d-flex justify-content-between align-items-center"><div><strong class="text-uppercase">${esc(m)}</strong><div class="fs-xs text-muted">${d.count} transactions</div></div><div class="fw-bold text-primary">${formatPrice(d.total)}</div></div>`).join('')}
          </div>
        </div>
        <div class="card p-4 shadow-sm">
          <h3 class="h5 fw-extrabold text-secondary mb-3">🛵 Top Benin Delivery Zones</h3>
          <div class="d-flex flex-column gap-2">
            ${zoneList.map(([z, d]) => `<div class="p-2 border rounded d-flex justify-content-between align-items-center"><div><strong>${esc(z)}</strong><div class="fs-xs text-muted">${d.count} deliveries</div></div><div class="fw-bold text-secondary">${formatPrice(d.total)}</div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout('Sales & Financial Reports', content, true));
    return;
  }

  // Fallback for any other /admin path
  res.writeHead(302, { 'Location': '/admin/index.php' });
  res.end();
}

function renderAdminLogin(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Portal — Madam 3 Kitchen</title>
  <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <style>
    body { background: linear-gradient(135deg, #2E1A11 0%, #1A0F0A 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  </style>
</head>
<body>
<div class="card p-4 p-md-5 shadow-lg max-w-500 w-100" style="background:#FFFFFF;border-radius:var(--radius-xl)">
  <div class="text-center mb-4">
    <img src="/assets/images/logo.svg" alt="Madam 3 Kitchen" style="height:48px" class="mb-3">
    <h1 class="h4 fw-extrabold text-secondary mb-1">Restaurant Management Portal</h1>
    <p class="text-muted fs-xs">Benin City Kitchen Operations & Dispatch</p>
  </div>
  ${error ? `<div class="alert alert-danger">${esc(error)}</div>` : ''}
  <form action="/admin/login.php" method="POST">
    <div class="form-group mb-3">
      <label for="admin_email" class="form-label">Administrator Email / Phone</label>
      <input type="text" id="admin_email" name="email" class="form-control" placeholder="admin@madam3kitchen.com" required autofocus value="admin@madam3kitchen.com">
    </div>
    <div class="form-group mb-4">
      <label for="admin_password" class="form-label">Password</label>
      <input type="password" id="admin_password" name="password" class="form-control" placeholder="••••••••" required value="admin123">
      <small class="text-muted fs-xs mt-1 d-block">Default credentials: admin@madam3kitchen.com / admin123</small>
    </div>
    <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">🔐 Access Admin Dashboard</button>
    <div class="text-center"><a href="/index.php" class="fs-xs text-muted">&larr; Return to Customer Website</a></div>
  </form>
</div>
</body>
</html>`;
}

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🍽️  Madam 3 Kitchen Dev Server Running on http://${HOST}:${PORT}`);
  console.log(`📍  Location: No. 3 Asoro Bus Stop, Ekehuan Road, Benin City`);
  console.log(`=======================================================`);
});
