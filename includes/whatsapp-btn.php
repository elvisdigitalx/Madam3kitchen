<?php
/**
 * Madam 3 Kitchen - Floating WhatsApp Button
 */
$supportMsg = urlencode("Hello Madam 3 Kitchen! I would like to make an inquiry or place an order from Asoro, Benin City.");
?>
<a href="https://wa.me/<?= RESTAURANT_WHATSAPP ?>?text=<?= $supportMsg ?>" 
   class="floating-whatsapp" 
   target="_blank" 
   rel="noopener noreferrer" 
   title="Chat with Madam 3 Kitchen on WhatsApp">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
  <span class="d-none d-sm-inline">Chat on WhatsApp</span>
</a>
