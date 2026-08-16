/**
 * KushProperties — Lead Capture Popup
 * Configurable delay, localStorage suppression, consent-aware.
 */
import { submitLead, showToast } from './api.js';

const STORAGE_KEY = 'kp_popup_dismissed';
const DISMISSED_EXPIRY_DAYS = 7;

export function initPopup(popupConfig) {
  if (!popupConfig || popupConfig.enabled === false) return;

  // Check if already dismissed recently
  const dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed) {
    const dismissedAt = parseInt(dismissed, 10);
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    if (daysSince < DISMISSED_EXPIRY_DAYS) return;
  }

  const delayMs = (popupConfig.delaySeconds || 15) * 1000;

  setTimeout(() => {
    // Don't show if user is already interacting with a modal
    if (document.querySelector('.lightbox.open')) return;

    showPopup(popupConfig);
  }, delayMs);
}

function showPopup(config) {
  const modal = document.getElementById('popup-modal');
  if (!modal) return;

  const heading = config.heading || 'Get Exclusive Updates';
  const subtext = config.subtext || 'Be the first to know about our latest projects and special offers.';
  const ctaText = config.ctaText || 'Register Interest';
  const showEmail = config.showEmail !== false;
  const showPhone = config.showPhone !== false;

  modal.innerHTML = `
    <div class="popup-backdrop" id="popup-backdrop"></div>
    <div class="popup-card glass" id="popup-card">
      <button class="popup-close" id="popup-close" aria-label="Close popup">✕</button>
      <div class="popup-content">
        <div class="popup-icon">🏠</div>
        <h2 class="popup-heading">${heading}</h2>
        <p class="popup-subtext">${subtext}</p>
        <form id="popup-form" class="popup-form">
          <div class="form-group">
            <input type="text" id="popup-name" placeholder="Full Name *" required>
          </div>
          ${showEmail ? `
            <div class="form-group">
              <input type="email" id="popup-email" placeholder="Email Address">
            </div>
          ` : ''}
          ${showPhone ? `
            <div class="form-group">
              <input type="tel" id="popup-phone" placeholder="+91 Mobile Number">
            </div>
          ` : ''}
          <div class="form-group popup-tc">
            <input type="checkbox" id="popup-tc" required>
            <label for="popup-tc">I agree to the <a href="/terms" target="_blank">Terms & Conditions</a></label>
          </div>
          <button type="submit" class="btn btn-primary btn-lg popup-submit">${ctaText}</button>
        </form>
        <div id="popup-success" class="popup-success" style="display:none;"></div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
  document.body.style.overflow = 'hidden';

  // Bind events
  document.getElementById('popup-close')?.addEventListener('click', () => dismissPopup(modal));
  document.getElementById('popup-backdrop')?.addEventListener('click', () => dismissPopup(modal));

  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') {
      dismissPopup(modal);
      document.removeEventListener('keydown', onEsc);
    }
  });

  document.getElementById('popup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      await submitLead({
        fullName: document.getElementById('popup-name')?.value || '',
        email: document.getElementById('popup-email')?.value || '',
        phone: document.getElementById('popup-phone')?.value || '',
        agreedTc: document.getElementById('popup-tc')?.checked || false,
        source: 'popup',
      });

      e.target.style.display = 'none';
      const success = document.getElementById('popup-success');
      if (success) {
        success.innerHTML = `
          <div class="popup-icon">✅</div>
          <h3>Thank You!</h3>
          <p>We'll keep you updated on our latest projects.</p>
        `;
        success.style.display = 'block';
      }

      // Auto-close after 3s
      setTimeout(() => dismissPopup(modal), 3000);
    } catch (err) {
      showToast(err.message || 'Submission failed. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = ctaText;
    }
  });
}

function dismissPopup(modal) {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    modal.style.display = 'none';
    modal.innerHTML = '';
  }, 300);
}
