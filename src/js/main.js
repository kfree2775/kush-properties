/**
 * KushProperties — Main Entry Point
 * Fetches bootstrap data and initializes all page modules.
 */

import { fetchBootstrap, fetchAbout, fetchLegal, isPreviewMode, fetchPreviewHomepage, fetchPreviewAbout, fetchPreviewLegal } from './api.js';
import { initSlideshow } from './slideshow.js';
import { initAchievements } from './achievements.js';
import { initFeaturedProjects } from './projects.js';
import { initScrollAnimations, refreshScrollAnimations } from './scroll-animations.js';

// Determine current page from script tag data attribute or URL
function getCurrentPage() {
  const script = document.querySelector('script[data-page]');
  if (script) return script.dataset.page;

  const path = window.location.pathname;
  if (path === '/' || path === '/index.html') return 'home';
  if (path.startsWith('/property/')) return 'property';
  if (path === '/about') return 'about';
  if (path === '/contact') return 'contact';
  if (path === '/projects') return 'projects';
  if (path === '/terms' || path === '/privacy') return 'legal';
  return 'home';
}

// ==================== Navbar ====================

function renderNavbar(navbar, siteConfig) {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const links = navbar?.links || [
    { label: 'Home', href: '/', sortOrder: 0 },
    { label: 'About', href: '/about', sortOrder: 1 },
    { label: 'Projects', href: '/projects', sortOrder: 2 },
    { label: 'Contact', href: '/contact', sortOrder: 3 },
  ];

  const sortedLinks = [...links].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentPath = window.location.pathname;
  const logoUrl = siteConfig?.branding?.logoUrl || '/assets/logo.svg';
  const companyName = siteConfig?.branding?.companyName || 'KushProperties';
  const ctaText = navbar?.ctaText || 'Book a Visit';
  const ctaPhone = navbar?.ctaPhone || siteConfig?.contact?.phonePrimary || '';

  nav.innerHTML = `
    <div class="navbar__inner">
      <a href="/" class="navbar__logo">
        <img src="${logoUrl}" alt="${companyName}" onerror="this.style.display='none'">
        <span class="navbar__logo-text">Kush<span>Properties</span></span>
      </a>
      <div class="navbar__links">
        ${sortedLinks.map(link => `
          <a href="${link.href}" class="navbar__link ${currentPath === link.href ? 'active' : ''}" ${link.isExternal ? 'target="_blank" rel="noopener"' : ''}>${link.label}</a>
        `).join('')}
      </div>
      <div class="navbar__cta">
        ${ctaPhone ? `
          <a href="tel:${ctaPhone.replace(/\s/g, '')}" class="navbar__phone">
            <span class="navbar__phone-icon">📞</span>
            <span>${ctaPhone}</span>
          </a>
        ` : ''}
        <a href="/contact" class="btn btn-primary btn-sm">${ctaText}</a>
      </div>
      <button class="navbar__hamburger" id="navbar-hamburger" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="navbar__mobile" id="navbar-mobile">
      ${sortedLinks.map(link => `
        <a href="${link.href}">${link.label}</a>
      `).join('')}
      <a href="/contact" class="btn btn-primary btn-lg" style="margin-top:1rem;">${ctaText}</a>
    </div>
  `;

  // Scroll detection for glassmorphism
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
  // Set initial state
  nav.classList.toggle('scrolled', window.scrollY > 50);

  // Mobile hamburger
  const hamburger = document.getElementById('navbar-hamburger');
  const mobileNav = document.getElementById('navbar-mobile');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ==================== Footer ====================

function renderFooter(footerConfig, siteConfig) {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const companyName = siteConfig?.branding?.companyName || 'KushProperties';
  const logoUrl = siteConfig?.branding?.logoUrl || '/assets/logo.svg';
  const aboutText = footerConfig?.aboutText || '';
  const columns = footerConfig?.columns || [];
  const sortedColumns = [...columns].sort((a, b) => a.sortOrder - b.sortOrder);
  const social = siteConfig?.social || [];
  const rera = siteConfig?.rera || {};
  const copyright = siteConfig?.copyright || `© ${new Date().getFullYear()} ${companyName}. All Rights Reserved.`;

  const socialIcons = {
    facebook: '𝑓',
    instagram: '📷',
    linkedin: 'in',
    youtube: '▶',
    twitter: '𝕏',
  };

  footer.innerHTML = `
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <a href="/" class="footer__brand-logo">
            <img src="${logoUrl}" alt="${companyName}" onerror="this.style.display='none'">
            <span>${companyName}</span>
          </a>
          ${aboutText ? `<p class="footer__brand-text">${aboutText}</p>` : ''}
          ${social.length > 0 ? `
            <div class="footer__social">
              ${social.sort((a, b) => a.sortOrder - b.sortOrder).map(s => `
                <a href="${s.url}" class="footer__social-link" target="_blank" rel="noopener" aria-label="${s.platform}" title="${s.platform}">
                  ${socialIcons[s.icon] || s.icon || '🔗'}
                </a>
              `).join('')}
            </div>
          ` : ''}
        </div>
        ${sortedColumns.map(col => `
          <div class="footer__column">
            <h3 class="footer__column-title">${col.title}</h3>
            <div class="footer__column-links">
              ${col.links.sort((a, b) => a.sortOrder - b.sortOrder).map(link => `
                <a href="${link.href}" class="footer__column-link">${link.label}</a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      ${rera.companyRegNumber || rera.disclaimerText ? `
        <div class="footer__rera">
          <p class="footer__rera-text">
            ${rera.companyRegNumber ? `<strong>${rera.companyRegNumber}</strong> — ` : ''}
            ${rera.disclaimerText || ''}
          </p>
        </div>
      ` : ''}
      <div class="footer__bottom">
        <p class="footer__copyright">${copyright}</p>
        <div class="footer__bottom-links">
          <a href="/privacy" class="footer__bottom-link">Privacy Policy</a>
          <a href="/terms" class="footer__bottom-link">Terms of Service</a>
        </div>
      </div>
    </div>
  `;
}

// ==================== Page-Specific Init ====================

async function initAboutPage(data, uiStrings = window.uiStrings || {}) {
  const main = document.getElementById('about-content');
  if (!main) return;

  const about = data || {};

  // Team members
  const teamHTML = about.teamMembers?.length ? `
    <section class="about-team section">
      <div class="container">
        <div class="section-header" data-animate="fade-up">
          <p class="text-overline">Our People</p>
          <h2>Meet The Team</h2>
        </div>
        <div class="about-team__grid" data-animate-stagger>
          ${about.teamMembers.map(m => `
            <div class="team-card">
              <div class="team-card__image">
                ${m.imageUrl ? `<img src="${m.imageUrl}" alt="${m.name}">` : '👤'}
              </div>
              <h3 class="team-card__name">${m.name}</h3>
              <p class="team-card__role">${m.role || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  main.innerHTML = `
    <section class="about-hero">
      <div class="about-hero__bg">
        ${about.heroImage ? `<img src="${about.heroImage}" alt="">` : ''}
        <div></div>
      </div>
      <div class="about-hero__content" data-animate="fade-up">
        <p class="text-overline">About Us</p>
        <h1 class="about-hero__tagline">${about.heroTagline || 'Building Trust, One Home at a Time'}</h1>
        <p class="about-hero__sub">${about.heroSubtext || 'Premium real estate development across Maharashtra since 2005.'}</p>
      </div>
    </section>

    ${about.storyTitle || about.storyContent ? `
      <section class="about-story section">
        <div class="container">
          <div class="about-story__grid">
            <div data-animate="fade-right">
              <h2 class="about-story__title">${about.storyTitle || 'Our Story'}</h2>
              <div class="about-story__content">${about.storyContent || ''}</div>
            </div>
            <div class="about-story__image" data-animate="fade-left">
              ${about.storyImage ? `<img src="${about.storyImage}" alt="Our Story">` : '<div class="img-placeholder" style="height:100%;">Image</div>'}
            </div>
          </div>
        </div>
      </section>
    ` : ''}

    ${about.mission || about.vision ? `
      <section class="about-mv section">
        <div class="container">
          <div class="about-mv__grid" data-animate-stagger>
            ${about.mission ? `
              <div class="about-mv__card">
                <span class="about-mv__card-icon">🎯</span>
                <h3 class="about-mv__card-title">Our Mission</h3>
                <p class="about-mv__card-text">${about.mission}</p>
              </div>
            ` : ''}
            ${about.vision ? `
              <div class="about-mv__card">
                <span class="about-mv__card-icon">🔭</span>
                <h3 class="about-mv__card-title">Our Vision</h3>
                <p class="about-mv__card-text">${about.vision}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </section>
    ` : ''}

    ${teamHTML}

    <section class="about-cta section">
      <div class="container">
        <div class="about-cta__inner" data-animate="fade-up">
          <h2 class="about-cta__title">${uiStrings.aboutCtaTitle || 'Ready to Find Your Dream Home?'}</h2>
          <p class="about-cta__text">${uiStrings.aboutCtaSubtext || 'Let our experts guide you through our premium portfolio.'}</p>
          <div class="flex justify-center gap-md">
            <a href="${uiStrings.aboutCtaPrimaryLink || '/projects'}" class="btn btn-primary btn-lg">${uiStrings.aboutCtaPrimaryText || 'Explore Projects'}</a>
            <a href="${uiStrings.aboutCtaSecondaryLink || '/contact'}" class="btn btn-secondary btn-lg">${uiStrings.aboutCtaSecondaryText || 'Get In Touch'}</a>
          </div>
        </div>
      </div>
    </section>
  `;
  refreshScrollAnimations();
}

async function initLegalPage(uiStrings = window.uiStrings || {}) {
  const main = document.getElementById('legal-content');
  if (!main) return;

  const slug = window.location.pathname.replace(/^\//, '');
  try {
    const preview = isPreviewMode();
    const data = preview ? await fetchPreviewLegal(slug) : await fetchLegal(slug);
    main.innerHTML = `
      <section class="section" style="padding-top: calc(var(--navbar-height) + var(--space-3xl));">
        <div class="container content-narrow">
          <h1 class="text-h1" style="margin-bottom: var(--space-xl);">${data.title || slug}</h1>
          <div class="text-variant" style="line-height: var(--leading-relaxed);">${data.content || `<p>${uiStrings.legalFallbackText || 'This page is being updated.'}</p>`}</div>
        </div>
      </section>
    `;
  } catch {
    main.innerHTML = `
      <section class="section" style="padding-top: calc(var(--navbar-height) + var(--space-3xl));">
        <div class="container content-narrow">
          <h1 class="text-h1">${uiStrings.legalFallbackText || 'This page is being updated'}</h1>
          <p class="text-variant">Please check back later.</p>
        </div>
      </section>
    `;
  }
}

// ==================== Bootstrap & Init ====================

async function init() {
  const page = getCurrentPage();
  const preview = isPreviewMode();

  try {
    // For homepage, fetch bootstrap (aggregated payload)
    if (page === 'home') {
      const data = preview
        ? await fetchPreviewHomepage()
        : await fetchBootstrap();

      const uiStrings = data.config?.uiStrings || {};
      window.uiStrings = uiStrings;

      renderNavbar(data.navbar, data.siteConfig);
      renderFooter(data.footer, data.siteConfig);
      initSlideshow(data.slides);
      initAchievements(data.achievements);
      initFeaturedProjects(data.featuredProjects, data.categories);

      // Init popup, cookie, whatsapp (Phase 4)
      initOptionalModules(data);
    } else {
      // For non-homepage pages, fetch minimal bootstrap for navbar/footer
      let data;
      try {
        data = preview
          ? await fetchPreviewHomepage()
          : await fetchBootstrap();
      } catch {
        data = {}; // Use fallback navbar/footer
      }

      const uiStrings = data.config?.uiStrings || {};
      window.uiStrings = uiStrings;

      renderNavbar(data.navbar, data.siteConfig);
      renderFooter(data.footer, data.siteConfig);

      // Page-specific init
      switch (page) {
        case 'about': {
          try {
            const aboutData = preview ? await fetchPreviewAbout() : await fetchAbout();
            await initAboutPage(aboutData);
          } catch {
            await initAboutPage(null);
          }
          break;
        }
        case 'contact': {
          // Phase 3
          try {
            const { initContactPage } = await import('./contact-form.js');
            initContactPage(data.siteConfig);
          } catch { /* Phase 3 not built yet */ }
          break;
        }
        case 'projects': {
          // Phase 3
          try {
            const { initProjectsListing } = await import('./projects-listing.js');
            initProjectsListing(data.categories);
          } catch { /* Phase 3 not built yet */ }
          break;
        }
        case 'property': {
          // Phase 3
          try {
            const { initPropertyDetail } = await import('./property-detail.js');
            initPropertyDetail();
          } catch { /* Phase 3 not built yet */ }
          break;
        }
        case 'legal':
          await initLegalPage();
          break;
      }

      // Init optional modules for non-home pages too
      initOptionalModules(data);
    }
  } catch (err) {
    console.error('[KushProperties] Bootstrap failed:', err);
    // Render fallback navbar/footer
    renderNavbar(null, null);
    renderFooter(null, null);
  }

  // Init scroll animations after content is rendered
  requestAnimationFrame(() => {
    initScrollAnimations();
  });
}

async function initOptionalModules(data) {
  // WhatsApp button (Phase 4)
  try {
    const { initWhatsApp } = await import('./whatsapp.js');
    initWhatsApp(data?.siteConfig?.whatsapp);
  } catch { /* Phase 4 */ }

  // Cookie consent (Phase 4)
  try {
    const { initCookieConsent } = await import('./cookie-consent.js');
    initCookieConsent(data?.cookie, data?.siteConfig?.analytics);
  } catch { /* Phase 4 */ }

  // Popup (Phase 4)
  try {
    const { initPopup } = await import('./popup.js');
    initPopup(data?.popup);
  } catch { /* Phase 4 */ }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
