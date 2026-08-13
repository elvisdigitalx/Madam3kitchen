# MADAM 3 KITCHEN — Complete Food Ordering & Restaurant Management Web Application

> **Location:** Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria  
> **Brand Tagline:** *Delicious Nigerian Meals, Made With Love.*  
> **Tech Stack:** PHP 8+, MySQL/MariaDB (InnoDB UTF8MB4), PDO Prepared Statements, Modern Mobile-First CSS3, JavaScript, AJAX/Fetch API.

---

## 🌟 Overview & Highlights

**Madam 3 Kitchen** is a high-performance, mobile-first food ordering and restaurant management platform designed for Nigerian food lovers and restaurant operators in Benin City, Edo State.

- **Mobile-First Experience:** Tailored for Android phones with bottom navigation bar, floating WhatsApp support button, touch-friendly meal customizers (+/- quantity, protein options, extra sides), and lightning-fast loading.
- **Dynamic Nigerian Culinary Menu:** Real-time search, category filters (Rice Dishes, Soups, Swallow, Proteins & Grills, Snacks, Drinks, Combos, Family Packs), sorting by popularity, price, and date.
- **Benin City Delivery Zone Matrix:** Fully database-driven delivery zones with custom fees and delivery times (Asoro, Ekhuan Road, GRA, Ugbowo/UNIBEN, Ring Road, Sapele Road, Airport Road, Ikpoba Hill, New Benin, Aduwawa, Upper Sakponba).
- **Payment & Verification Architecture:** Paystack online payment gateway, direct Moniepoint bank transfer with remarks, and Cash on Delivery (COD).
- **Live 7-Step Visual Order Tracking:** Real-time visual progress timeline from *Order Received* to *Delivered*, with pre-filled WhatsApp notifications.
- **Comprehensive Admin Control Dashboard:** Today's orders, today's revenue (₦), pending orders badge, real-time incoming order sound chimes (Web Audio API), status change history audit logs, menu & extras editor, promo code engine, financial reports with CSV export, and printable thermal kitchen receipts.

---

## 📁 System Architecture & File Structure

```text
Madam3kitchen/
├── admin/                     # Secure Restaurant Management Portal
│   ├── includes/
│   │   ├── admin-header.php   # Top navigation, sound chime switch, live bell badge
│   │   ├── admin-sidebar.php  # Collapsible responsive navigation sidebar
│   │   └── admin-footer.php   # Live notification poller & script bundle
│   ├── index.php              # Admin Dashboard: Stats, today's revenue, live queue
│   ├── login.php              # Admin Login with rate protection
│   ├── logout.php             # Admin Logout handler
│   ├── orders.php             # Order Management: filters, search, quick status
│   ├── order-details.php      # Order Details: customer info, status history audit
│   ├── receipt.php            # Printable thermal receipt & kitchen ticket
│   ├── products.php           # Food menu CRUD, prices, availability, extras builder
│   ├── categories.php         # Category manager (add, edit, reorder, icons)
│   ├── delivery-zones.php     # Benin City delivery zones & pricing manager
│   ├── promo-codes.php        # Promo codes engine (% or ₦ fixed discounts)
│   ├── customers.php          # Customer directory & lifetime spend analytics
│   ├── reviews.php            # Review moderation (approve, reject, delete)
│   ├── reports.php            # Sales reports, daily revenue, CSV export
│   ├── settings.php           # Restaurant operating hours, Open/Closed status, Bank
│   ├── messages.php           # Inquiries inbox from contact form
│   └── activity-logs.php      # Administrative action audit logs
├── api/                       # Modular RESTful AJAX Endpoints
│   ├── cart.php               # Cart item calculations & synchronization
│   ├── checkout.php           # Promo validation, zone lookup, order placement
│   ├── orders.php             # Order tracking & admin status updates
│   ├── payment.php            # Server-side payment verification
│   ├── products.php           # Dynamic menu retrieval & product details
│   ├── reviews.php            # Customer review submissions
│   └── live-notifications.php # Admin live order notifications & bell trigger
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css  # Responsive grid and utility system
│   │   ├── styles.css         # Warm Nigerian brand design system
│   │   └── admin.css          # Sleek modern admin dashboard styles
│   ├── js/
│   │   ├── app.js             # Cart manager, search filters, toast notifications
│   │   ├── checkout.js        # Checkout calculations, promo code, geolocation
│   │   ├── admin.js           # Live order polling, quick status switcher
│   │   └── notification-sound.js # Web Audio API pleasant restaurant chime
│   └── images/
│       ├── logo.svg           # Madam 3 Kitchen modern brand identity logo
│       ├── hero-banner.jpg    # Authentic Nigerian gourmet photography feast
│       └── products/          # High-resolution Nigerian dish photography
├── config/
│   ├── config.php             # Application settings, constants, session config
│   └── database.php           # PDO database connection class (MySQL + SQLite)
├── includes/
│   ├── auth.php               # Authentication & role authorization helpers
│   ├── csrf.php               # CSRF token security module
│   ├── functions.php          # Currency formatter, order number generator, WhatsApp
│   ├── header.php             # HTML head, OpenGraph, JSON-LD Schema.org
│   ├── navbar.php             # Sticky top navbar, search, cart counter
│   ├── footer.php             # Footer with Benin location, hours, links
│   ├── mobile-nav.php         # Mobile bottom navigation bar
│   └── whatsapp-btn.php       # Floating WhatsApp button with pulse animation
├── index.php                  # Homepage: Hero, Popular Meals, Specials, Reviews, Map
├── menu.php                   # Full dynamic menu with search and filters
├── food.php                   # Food detail page with extras customizer & price preview
├── cart.php                   # Shopping cart page with quantity controls & zone fee
├── checkout.php               # Fast Nigerian checkout with ASAP/schedule & Paystack
├── order-success.php          # Order confirmation, receipt print, WhatsApp link
├── track-order.php            # Live 7-step visual order tracking timeline
├── about.php                  # Brand story & Benin City culinary heritage
├── contact.php                # Contact form, phone, WhatsApp & Google Map
├── offers.php                 # Discounted meals & active coupon codes
├── faq.php                    # Benin City delivery & order FAQs
├── privacy.php                # Privacy policy
├── terms.php                  # Terms and conditions
├── login.php                  # Customer login
├── register.php               # Customer registration
├── account.php                # Customer profile & saved addresses
├── orders.php                 # Customer order history & re-order button
├── 404.php                    # Custom 404 page
├── database.sql               # Complete MySQL schema and seed data
├── manifest.json              # PWA Web App manifest
├── robots.txt                 # SEO crawler rules
└── sitemap.xml                # SEO sitemap
```

---

## 🚀 cPanel / Web Hosting Deployment Guide

### Step 1: Upload Files
1. Compress all files in this repository into a `.zip` archive.
2. Log in to your **cPanel** dashboard.
3. Open **File Manager** and navigate to `public_html` (or your subdomain directory).
4. Upload and extract the `.zip` archive.

### Step 2: Create MySQL Database
1. In cPanel, go to **MySQL Databases** (or MySQL Database Wizard).
2. Create a new database: e.g. `yourcpanel_madam3`.
3. Create a new MySQL user with a strong password.
4. Assign the user to the database with **ALL PRIVILEGES**.

### Step 3: Import `database.sql`
1. Open **phpMyAdmin** in cPanel.
2. Select your newly created database.
3. Click the **Import** tab, choose `database.sql`, and click **Go**.

### Step 4: Configure Database Credentials
Edit `config/config.php` (or set environment variables):
```php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'yourcpanel_madam3');
define('DB_USER', 'yourcpanel_user');
define('DB_PASS', 'your_secure_password');
```

### Step 5: Default Admin Credentials
- **Admin Portal URL:** `https://yourdomain.com/admin/login.php`
- **Default Email:** `admin@madam3kitchen.com`
- **Default Password:** `admin123`
*(Change your password immediately after your first login via Admin Settings)*

---

## 🔒 Security Features Implemented
- **PDO Prepared Statements:** Complete protection against SQL Injection on all customer and admin queries.
- **CSRF Token Validation:** Every form submission includes randomized cryptographic tokens.
- **Session Security:** `HttpOnly`, `SameSite=Lax`, and strict cookie flags enabled.
- **Password Hashing:** Passwords encrypted using standard `password_hash()` and `password_verify()`.
- **Input Sanitization & Output Escaping:** Strict sanitization to prevent XSS.
- **Admin Activity Audit Logs:** Logs admin logins, food updates, and status changes with IP address and timestamp.
- **Server-Side Payment Verification:** Never relies on client-side status; orders require server verification.

---

## 🍲 Tested Nigerian Meals in Seed Data
1. **Party Jollof Rice with Chicken & Dodo** (₦3,500 / ₦3,200)
2. **Egusi Soup with Pounded Yam & Assorted Meat** (₦4,500)
3. **Madam 3 Special Fried Rice with Crispy Chicken** (₦3,800 / ₦3,500)
4. **Traditional Ogbono Draw Soup with Yellow Eba** (₦4,200)
5. **Hot & Spicy Peppered Chicken Platter** (₦3,000 / ₦2,700)
6. **Authentic Delta/Edo Banga Palm Nut Soup** (₦5,000)
7. **Amala Abula with Ewedu, Gbegiri & Goat Meat** (₦4,000 / ₦3,600)
8. **Spicy Asun Peppered Goat Meat Board** (₦3,800)
9. **Madam 3 Signature Chapman Cocktail** (₦1,500 / ₦1,200)
10. **Freshly Baked Nigerian Beef Meat Pie (2 Pcs)** (₦1,600)
11. **Benin Executive Lunch Combo** (₦6,500 / ₦5,900)
12. **Madam 3 Grand Family Feast (Feeds 4-6)** (₦24,000 / ₦21,500)

---

## 📞 Restaurant Contact & Location
- **Address:** Madam 3 Kitchen, Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria
- **Phone:** +234 803 000 1234
- **WhatsApp:** +234 803 000 1234
- **Email:** orders@madam3kitchen.com
- **Operating Hours:** Monday – Sunday, 8:00 AM – 10:00 PM
