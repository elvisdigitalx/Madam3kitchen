<?php
/**
 * Madam 3 Kitchen - Contact & Location Page
 */
$pageTitle = 'Contact Us — Madam 3 Kitchen Benin City';
$pageDescription = 'Get in touch with Madam 3 Kitchen at Asoro Bus Stop, Ekhuan Road, Benin City. Call, WhatsApp, or visit us today.';
require_once __DIR__ . '/includes/header.php';

$successMessage = '';
$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $errorMessage = 'Security token expired. Please try again.';
    } else {
        $name = sanitize($_POST['name'] ?? '');
        $phone = sanitize($_POST['phone'] ?? '');
        $email = sanitize($_POST['email'] ?? '');
        $subject = sanitize($_POST['subject'] ?? 'General Inquiry');
        $message = sanitize($_POST['message'] ?? '');

        if (empty($name) || empty($phone) || empty($message)) {
            $errorMessage = 'Please complete all required fields.';
        } else {
            try {
                $db = Database::getConnection();
                $stmt = $db->prepare("INSERT INTO contact_messages (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$name, $phone, $email, $subject, $message]);
                $successMessage = 'Thank you! Your message has been received. Our team will contact you shortly.';
            } catch (Exception $e) {
                $errorMessage = 'Failed to submit message. Please call or WhatsApp us directly.';
            }
        }
    }
}
?>

<div class="py-5" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFEED9 100%); border-bottom: 1px solid var(--border-color);">
  <div class="container text-center max-w-700 mx-auto">
    <span class="badge badge-warning mb-2">We Love Hearing From You</span>
    <h1 class="h2 mb-2">Contact & Visit Madam 3 Kitchen</h1>
    <p class="text-muted fs-sm mb-0">Have an inquiry, bulk event catering request, or feedback? Reach out to us today.</p>
  </div>
</div>

<div class="container py-5">
  <div class="row g-5">
    <!-- Left: Contact Details & Map -->
    <div class="col-12 col-lg-5">
      <div class="card p-4 shadow-sm mb-4">
        <h3 class="h4 fw-extrabold text-secondary mb-3">Kitchen Headquarters</h3>

        <div class="d-flex align-items-start gap-3 mb-3">
          <div class="hero-location-icon">📍</div>
          <div>
            <div class="fw-bold">Address</div>
            <div class="text-muted fs-sm">Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria</div>
          </div>
        </div>

        <div class="d-flex align-items-start gap-3 mb-3">
          <div class="hero-location-icon">📞</div>
          <div>
            <div class="fw-bold">Phone Number</div>
            <div><a href="tel:<?= RESTAURANT_PHONE ?>" class="text-primary fw-bold"><?= RESTAURANT_PHONE_DISPLAY ?></a></div>
          </div>
        </div>

        <div class="d-flex align-items-start gap-3 mb-3">
          <div class="hero-location-icon">💬</div>
          <div>
            <div class="fw-bold">WhatsApp Direct</div>
            <div><a href="https://wa.me/<?= RESTAURANT_WHATSAPP ?>" target="_blank" class="text-success fw-bold">Chat on WhatsApp</a></div>
          </div>
        </div>

        <div class="d-flex align-items-start gap-3 mb-3">
          <div class="hero-location-icon">🕒</div>
          <div>
            <div class="fw-bold">Kitchen Hours</div>
            <div class="text-muted fs-sm">Monday – Sunday: 8:00 AM – 10:00 PM</div>
          </div>
        </div>

        <div class="d-flex gap-2 mt-3 pt-3 border-top">
          <a href="tel:<?= RESTAURANT_PHONE ?>" class="btn btn-outline-secondary btn-sm flex-grow-1">
            📞 Call Now
          </a>
          <a href="https://wa.me/<?= RESTAURANT_WHATSAPP ?>" target="_blank" class="btn btn-whatsapp btn-sm flex-grow-1">
            💬 WhatsApp
          </a>
        </div>
      </div>

      <!-- Map Embed -->
      <div class="card p-2 shadow-sm" style="border-radius: var(--radius-lg); overflow: hidden;">
        <div class="map-container" style="height: 250px;">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.733568285517!2d5.6037!3d6.3350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1040d346b81c2f9d%3A0x7d87b32274488344!2sAsoro%20Bus%20Stop%2C%20Ekehuan%20Rd%2C%20Benin%20City!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" 
            allowfullscreen="" 
            loading="lazy">
          </iframe>
        </div>
      </div>
    </div>

    <!-- Right: Message Form -->
    <div class="col-12 col-lg-7">
      <div class="card p-4 p-md-5 shadow-sm">
        <h3 class="h4 fw-extrabold text-secondary mb-2">Send Us a Message</h3>
        <p class="text-muted fs-sm mb-4">We reply promptly to inquiries and event catering questions.</p>

        <?php if ($successMessage): ?>
          <div class="alert alert-success"><?= $successMessage ?></div>
        <?php endif; ?>

        <?php if ($errorMessage): ?>
          <div class="alert alert-danger"><?= $errorMessage ?></div>
        <?php endif; ?>

        <form action="contact.php" method="POST">
          <?= csrfInputField() ?>

          <div class="row g-3">
            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="contact_name" class="form-label">Your Name *</label>
                <input type="text" id="contact_name" name="name" class="form-control" placeholder="e.g. Osasogie Igbinosa" required>
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="contact_phone" class="form-label">Phone Number *</label>
                <input type="tel" id="contact_phone" name="phone" class="form-control" placeholder="e.g. 0803 000 1234" required>
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="contact_email" class="form-label">Email Address (Optional)</label>
                <input type="email" id="contact_email" name="email" class="form-control" placeholder="e.g. name@example.com">
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="form-group mb-0">
                <label for="contact_subject" class="form-label">Subject</label>
                <select id="contact_subject" name="subject" class="form-select">
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Event / Bulk Catering">Event / Bulk Catering</option>
                  <option value="Delivery Question">Delivery Question</option>
                  <option value="Feedback / Compliment">Feedback / Compliment</option>
                </select>
              </div>
            </div>

            <div class="col-12">
              <div class="form-group mb-3">
                <label for="contact_message" class="form-label">Message *</label>
                <textarea id="contact_message" name="message" class="form-control" rows="4" placeholder="How can Madam 3 Kitchen assist you today?" required></textarea>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100">
            ✉️ Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
