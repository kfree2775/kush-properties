/**
 * KushProperties — Slideshow Module
 * Hero slideshow with auto-slide, crossfade, arrows, and dots.
 */

let currentSlide = 0;
let slides = [];
let autoSlideTimer = null;
const AUTO_SLIDE_INTERVAL = 10000; // 10 seconds

export function initSlideshow(slidesData) {
  slides = slidesData || [];
  const hero = document.getElementById('hero');

  if (!hero || slides.length === 0) {
    // Fallback: single placeholder slide
    if (hero) {
      hero.innerHTML = `
        <div class="hero__slides">
          <div class="hero__slide active">
            <div class="hero__slide-overlay"></div>
            <div class="hero__content container">
              <h1 class="hero__headline">Welcome to KushProperties</h1>
              <p class="hero__subtext">Premium residential & commercial properties across Maharashtra.</p>
              <div class="hero__actions">
                <a href="/projects" class="btn btn-primary btn-lg">Explore Projects</a>
                <a href="/contact" class="btn btn-secondary btn-lg">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      `;
      hero.style.background = `linear-gradient(135deg, var(--color-surface-lowest), var(--color-bg))`;
    }
    return;
  }

  // Build slideshow HTML
  const slidesHTML = slides.map((slide, i) => `
    <div class="hero__slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <img class="hero__slide-image" src="${slide.imageUrl}" alt="${slide.headline || 'KushProperties'}" loading="${i === 0 ? 'eager' : 'lazy'}">
      <div class="hero__slide-overlay"></div>
    </div>
  `).join('');

  // Use first slide's content for the content area
  const firstSlide = slides[0];

  const arrowsHTML = slides.length > 1 ? `
    <div class="hero__arrows">
      <button class="hero__arrow" id="hero-prev" aria-label="Previous slide">‹</button>
      <button class="hero__arrow" id="hero-next" aria-label="Next slide">›</button>
    </div>
  ` : '';

  const dotsHTML = slides.length > 1 ? `
    <div class="hero__dots">
      ${slides.map((_, i) => `
        <button class="hero__dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
      `).join('')}
    </div>
  ` : '';

  hero.innerHTML = `
    <div class="hero__slides">${slidesHTML}</div>
    <div class="hero__content container" id="hero-content">
      <h1 class="hero__headline">${firstSlide.headline || 'Welcome to KushProperties'}</h1>
      <p class="hero__subtext">Premium residential & commercial properties across Maharashtra. Curating exclusive lifestyles for the discerning few.</p>
      <div class="hero__actions">
        ${firstSlide.ctaText ? `<a href="${firstSlide.ctaLink || '/projects'}" class="btn btn-primary btn-lg">${firstSlide.ctaText}</a>` : ''}
        <a href="/contact" class="btn btn-secondary btn-lg">Schedule Visit</a>
      </div>
    </div>
    ${arrowsHTML}
    ${dotsHTML}
  `;

  // Event listeners
  if (slides.length > 1) {
    document.getElementById('hero-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('hero-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));

    hero.querySelectorAll('.hero__dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.index));
      });
    });

    // Start auto-slide
    startAutoSlide();

    // Pause on hover
    hero.addEventListener('mouseenter', stopAutoSlide);
    hero.addEventListener('mouseleave', startAutoSlide);
  }
}

function goToSlide(index) {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Wrap around
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  // Update slide visibility
  const allSlides = hero.querySelectorAll('.hero__slide');
  allSlides.forEach((s) => s.classList.remove('active'));
  allSlides[index]?.classList.add('active');

  // Update dots
  const allDots = hero.querySelectorAll('.hero__dot');
  allDots.forEach((d) => d.classList.remove('active'));
  allDots[index]?.classList.add('active');

  // Update content
  const slide = slides[index];
  const content = document.getElementById('hero-content');
  if (content && slide) {
    const headline = content.querySelector('.hero__headline');
    const actions = content.querySelector('.hero__actions');
    if (headline) headline.textContent = slide.headline || 'Welcome to KushProperties';
    if (actions) {
      const primaryBtn = actions.querySelector('.btn-primary');
      if (primaryBtn && slide.ctaText) {
        primaryBtn.textContent = slide.ctaText;
        primaryBtn.href = slide.ctaLink || '/projects';
      }
    }
  }

  currentSlide = index;

  // Reset auto-slide timer
  stopAutoSlide();
  startAutoSlide();
}

function startAutoSlide() {
  if (autoSlideTimer) return;
  autoSlideTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, AUTO_SLIDE_INTERVAL);
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}
