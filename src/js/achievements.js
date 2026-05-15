/**
 * KushProperties — Achievements Module
 * Animated counter cards with IntersectionObserver.
 */

export function initAchievements(achievementsData) {
  const section = document.getElementById('achievements');
  if (!section) return;

  if (!achievementsData || achievementsData.length === 0) {
    // Hide section entirely per fallback policy
    section.style.display = 'none';
    return;
  }

  section.innerHTML = `
    <div class="achievements__grid" data-animate-stagger>
      ${achievementsData.map((ach) => `
        <div class="achievement-card">
          <span class="achievement-card__icon">${ach.icon || '🏆'}</span>
          <div class="achievement-card__number" data-target="${ach.number}">0</div>
          <div class="achievement-card__label">${ach.label}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Animate counters when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters(section);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);
}

function animateCounters(container) {
  const counters = container.querySelectorAll('.achievement-card__number');

  counters.forEach((counter) => {
    const target = counter.dataset.target;
    // Extract numeric value (handle formats like "5,000+", "20 Lakh+", "50+", "18+")
    const numericMatch = target.match(/[\d,]+/);
    if (!numericMatch) {
      counter.textContent = target;
      return;
    }

    const numericStr = numericMatch[0].replace(/,/g, '');
    const targetNum = parseInt(numericStr, 10);

    if (isNaN(targetNum) || targetNum === 0) {
      counter.textContent = target;
      return;
    }

    // Animate from 0 to target
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const increment = targetNum / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNum) {
        current = targetNum;
        clearInterval(timer);
        counter.textContent = target; // Set final formatted value
        counter.classList.add('counting');
        setTimeout(() => counter.classList.remove('counting'), 300);
        return;
      }

      // Format number during animation
      const formatted = Math.floor(current).toLocaleString('en-IN');
      // Preserve suffix (e.g., "+", " Lakh+")
      const suffix = target.replace(numericMatch[0], '');
      counter.textContent = formatted + suffix;
    }, stepTime);
  });
}
