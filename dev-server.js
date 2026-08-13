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
  ]
};

// Helper: Format Price
function formatPrice(amount) {
  const num = parseFloat(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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

  // Build HTML document
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

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
        <a href="/admin/settings.php" class="badge badge-success fs-xs">● RESTAURANT OPEN</a>
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
        <span>📍 No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State</span>
        <span class="d-none d-md-inline ms-3">🕒 Daily: 8:00 AM – 10:00 PM</span>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="badge badge-success"><span style="display:inline-block; width:6px; height:6px; background:#4CAF50; border-radius:50%; margin-right:4px;"></span> WE ARE OPEN</span>
        <a href="tel:+2348030001234" class="d-none d-sm-inline text-gold">📞 0803 000 1234</a>
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
          <a href="/login.php" class="btn btn-outline-secondary btn-sm d-none d-md-inline-flex">Sign In</a>
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
      <a href="/login.php" class="btn btn-primary w-100 mb-2">Sign In</a>
      <a href="/register.php" class="btn btn-outline-secondary w-100">Create Account</a>
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
            Welcome to <strong>Madam 3 Kitchen</strong>, your home for authentic Nigerian delicacies in Benin City. From party Jollof rice to traditional soups and tender peppered proteins, we bring the best taste to your doorstep.
          </p>
          <div class="d-flex align-items-center gap-2 mt-3">
            <span class="badge badge-warning">📍 No. 3 Asoro Bus Stop, Ekehuan Road</span>
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
            <span>📍</span><div>No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State</div>
          </div>
          <div class="footer-contact-item">
            <span>📞</span><div><a href="tel:+2348030001234" style="color: inherit;">0803 000 1234</a></div>
          </div>
          <div class="footer-contact-item">
            <span>💬</span><div><a href="https://wa.me/2348030001234" target="_blank" style="color: inherit;">WhatsApp Orders</a></div>
          </div>
          <div class="footer-contact-item">
            <span>🕒</span><div>Mon – Sun: 8:00 AM – 10:00 PM</div>
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
  <a href="https://wa.me/2348030001234?text=Hello%20Madam%203%20Kitchen!%20I%20would%20like%20to%20order%20from%20Asoro,%20Benin%20City." class="floating-whatsapp" target="_blank" rel="noopener noreferrer">
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
    <a href="/login.php" class="mobile-nav-item ${isLogin || isRegister || isAccount ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Account</span>
    </a>
  </div>

  <script src="/assets/js/app.js"></script>
</body>
</html>`;
  };

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
            <h1 class="hero-title">Delicious Nigerian Meals, <span class="highlight">Made With Love.</span></h1>
            <p class="hero-subtitle">Freshly prepared meals from <strong>Madam 3 Kitchen</strong>, delivered hot and fresh across Benin City.</p>
            <div class="d-flex align-items-center flex-wrap gap-3 mb-4">
              <a href="/menu.php" class="btn btn-primary btn-lg">🍛 Order Food Now</a>
              <a href="/menu.php" class="btn btn-outline-secondary btn-lg">📜 View Menu</a>
            </div>
            <div class="hero-location-card">
              <div class="hero-location-icon">📍</div>
              <div>
                <div class="fw-bold fs-sm text-secondary">Our Kitchen Location</div>
                <div class="fs-xs text-muted">No. 3 Asoro Bus Stop, Ekehuan Road, Benin City, Edo State</div>
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
              <h2 class="text-white mb-3">Madam 3 Kitchen in Benin City</h2>
              <p style="color: #D7CCC8;">Conveniently located at <strong>No. 3 Asoro Bus Stop, Ekehuan Road</strong>. Dine in or order fast delivery to your residence, office, or event venue anywhere in Benin City.</p>
              <div class="d-flex flex-column gap-2 mb-4" style="color: #FFF8F0; font-size: 0.95rem;">
                <div>🏢 <strong>Address:</strong> No. 3 Asoro Bus Stop, Ekehuan Road, Benin City</div>
                <div>📞 <strong>Phone:</strong> <a href="tel:+2348030001234" style="color: var(--accent);">0803 000 1234</a></div>
                <div>🕒 <strong>Opening Hours:</strong> Monday – Sunday: 8:00 AM – 10:00 PM</div>
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

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🍽️  Madam 3 Kitchen Dev Server Running on http://${HOST}:${PORT}`);
  console.log(`📍  Location: No. 3 Asoro Bus Stop, Ekehuan Road, Benin City`);
  console.log(`=======================================================`);
});
