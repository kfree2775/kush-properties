/**
 * KushProperties — Contact Page
 * Contact form + info cards + Google Maps.
 */
import { submitContact, showToast } from './api.js';
import { refreshScrollAnimations } from './scroll-animations.js';

export function initContactPage(siteConfig) {
  const main = document.getElementById('contact-content');
  if (!main) return;

  const contact = siteConfig?.contact || {};
  const mapUrl = contact.mapEmbedUrl || '';
  const uiStrings = window.uiStrings || {};

  main.innerHTML = `
    <section class="contact-hero" data-animate="fade-up">
      <div class="container">
        <h1 class="contact-hero__title">${uiStrings.contactHeroTitle || 'Get In Touch'}</h1>
        <p class="contact-hero__subtitle">${uiStrings.contactHeroSubtext || "We'd love to hear from you. Reach out for property inquiries, site visits, or any questions."}</p>
      </div>
    </section>

    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-form-card" data-animate="fade-up">
            <h2 class="contact-form-card__title">${uiStrings.contactFormTitle || 'Send Us a Message'}</h2>
            <form id="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="contact-name">Full Name</label>
                  <input type="text" id="contact-name" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                  <label for="contact-email">Email Address</label>
                  <input type="email" id="contact-email" placeholder="Enter your email" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="contact-phone">Phone Number</label>
                  <input type="tel" id="contact-phone" placeholder="+91 XXXXX XXXXX">
                </div>
                <div class="form-group">
                  <label for="contact-subject">Subject</label>
                  <select id="contact-subject">
                    <option value="Property Inquiry">Property Inquiry</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Investment">Investment</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="contact-message">Message</label>
                <textarea id="contact-message" rows="5" placeholder="How can we assist you?" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" id="contact-submit">Send Message</button>
            </form>
            <div id="contact-success" class="form-success" style="display:none; margin-top:1rem;"></div>
          </div>

          <div class="contact-info-cards" data-animate="fade-up">
            <div class="contact-info-card">
              <div class="contact-info-card__icon">📍</div>
              <div>
                <h3 class="contact-info-card__title">Visit Us</h3>
                <p class="contact-info-card__text">${contact.addressFull || 'KushProperties Office, Pune, Maharashtra'}</p>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-info-card__icon">📞</div>
              <div>
                <h3 class="contact-info-card__title">Call Us</h3>
                <p class="contact-info-card__text">${contact.phonePrimary || ''}\n${contact.phoneSecondary || ''}</p>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-info-card__icon">✉️</div>
              <div>
                <h3 class="contact-info-card__title">Email Us</h3>
                <p class="contact-info-card__text">${contact.emailPrimary || ''}\n${contact.emailSales || ''}</p>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-info-card__icon">🕐</div>
              <div>
                <h3 class="contact-info-card__title">Office Hours</h3>
                <p class="contact-info-card__text">${contact.officeHours || 'Mon-Sat: 10:00 AM - 7:00 PM'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${mapUrl ? `
      <section class="contact-map" data-animate="fade-up">
        <div class="container">
          <div class="contact-map__embed">
            <iframe src="${mapUrl}" allowfullscreen loading="lazy" title="Office Location"></iframe>
          </div>
        </div>
      </section>
    ` : ''}
  `;

  // Form handler
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit');
    const successEl = document.getElementById('contact-success');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const subject = document.getElementById('contact-subject').value;
      await submitContact({
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        message: `[${subject}] ${document.getElementById('contact-message').value}`,
      });

      document.getElementById('contact-form').style.display = 'none';
      successEl.textContent = 'Message sent! We will get back to you soon.';
      successEl.style.display = 'block';
    } catch (err) {
      showToast(err.message || 'Failed to send message.', 'error');
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });

  refreshScrollAnimations();
}
