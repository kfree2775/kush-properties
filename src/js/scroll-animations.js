/**
 * KushProperties — Scroll Animations
 * IntersectionObserver for [data-animate] and [data-animate-stagger] elements.
 * Respects prefers-reduced-motion.
 */

export function initScrollAnimations() {
  // Respect user preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Make everything visible immediately
    document.querySelectorAll('[data-animate], [data-animate-stagger]').forEach((el) => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observe all animated elements
  document.querySelectorAll('[data-animate], [data-animate-stagger]').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Re-scan for new animated elements (call after dynamic content is added).
 */
export function refreshScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-animate]:not(.visible), [data-animate-stagger]:not(.visible)').forEach((el) => {
    if (prefersReducedMotion) {
      el.classList.add('visible');
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(el);
    }
  });
}
