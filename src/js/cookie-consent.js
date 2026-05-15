/**
 * KushProperties — Cookie Consent Banner
 * Consent-first: only loads GA4/analytics scripts after user accepts.
 * Stores preference in localStorage.
 */

const CONSENT_KEY = 'kp_cookie_consent';

export function initCookieConsent(cookieConfig, analyticsConfig) {
  // Check if already consented
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === 'accepted') {
    // Already consented — load analytics immediately
    loadAnalytics(analyticsConfig);
    return;
  }
  if (consent === 'declined') {
    // User declined — respect that
    return;
  }

  // No decision yet — show banner
  if (cookieConfig?.isEnabled === false) {
    // Cookies disabled by admin — load analytics without banner
    loadAnalytics(analyticsConfig);
    return;
  }

  showBanner(cookieConfig, analyticsConfig);
}

function showBanner(config, analyticsConfig) {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const message = config?.message || 'We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.';
  const acceptText = config?.acceptText || 'Accept All';
  const declineText = config?.declineText || 'Decline';

  banner.innerHTML = `
    <div class="cookie-inner">
      <div class="cookie-text">
        <span class="cookie-icon">🍪</span>
        <p>${message} <a href="/privacy" class="cookie-link">Learn more</a></p>
      </div>
      <div class="cookie-actions">
        <button class="btn btn-ghost btn-sm" id="cookie-decline">${declineText}</button>
        <button class="btn btn-primary btn-sm" id="cookie-accept">${acceptText}</button>
      </div>
    </div>
  `;

  banner.style.display = 'block';
  requestAnimationFrame(() => banner.classList.add('show'));

  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    hideBanner(banner);
    loadAnalytics(analyticsConfig);
  });

  document.getElementById('cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    hideBanner(banner);
  });
}

function hideBanner(banner) {
  banner.classList.remove('show');
  setTimeout(() => {
    banner.style.display = 'none';
    banner.innerHTML = '';
  }, 300);
}

function loadAnalytics(config) {
  if (!config?.ga4Id) return;

  // Don't load in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[KushProperties] GA4 skipped in development');
    return;
  }

  // Avoid double-loading
  if (document.getElementById('ga4-script')) return;

  // Load Google Analytics 4
  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`;
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', config.ga4Id, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });
    console.log(`[KushProperties] GA4 loaded: ${config.ga4Id}`);
  };
}
