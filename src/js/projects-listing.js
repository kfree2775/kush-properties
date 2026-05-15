/**
 * KushProperties — Projects Listing Page
 * Search, category filter, sort, pagination.
 */

import { fetchProjects, getStatusBadgeClass, getStatusText } from './api.js';
import { refreshScrollAnimations } from './scroll-animations.js';

let categories = [];
let currentParams = {
  category: '',
  q: '',
  sort: 'newest',
  page: 1,
  pageSize: 12,
};
let debounceTimer = null;

export function initProjectsListing(categoriesData) {
  categories = categoriesData || [];
  const main = document.getElementById('projects-content');
  if (!main) return;

  // Build page structure
  main.innerHTML = `
    <section class="page-hero" data-animate="fade-up">
      <div class="container">
        <h1 class="page-hero__title">Our Projects</h1>
        <p class="page-hero__subtitle">Explore our portfolio of premium residential and commercial projects across Pune and Maharashtra.</p>
      </div>
    </section>

    <section class="projects-listing section">
      <div class="container">
        <div class="projects-listing__controls" data-animate="fade-up">
          <div class="projects-listing__search">
            <span class="projects-listing__search-icon">🔍</span>
            <input type="text" id="projects-search" placeholder="Search by name or location..." aria-label="Search projects">
          </div>
          <div class="projects-listing__filters">
            <select id="projects-category" aria-label="Filter by category">
              <option value="">All Categories</option>
              ${categories.filter(c => c.slug !== 'all').map(c => `
                <option value="${c.slug}">${c.name}</option>
              `).join('')}
            </select>
            <select id="projects-sort" aria-label="Sort projects">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        <div id="projects-grid" class="projects__grid" data-animate-stagger></div>

        <div id="projects-pagination" class="projects-listing__pagination"></div>
        <div id="projects-info" class="projects-listing__info"></div>
      </div>
    </section>
  `;

  // Check for URL params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) {
    currentParams.category = urlParams.get('category');
    document.getElementById('projects-category').value = currentParams.category;
  }

  // Event listeners
  document.getElementById('projects-search')?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentParams.q = e.target.value.trim();
      currentParams.page = 1;
      loadProjects();
    }, 400);
  });

  document.getElementById('projects-category')?.addEventListener('change', (e) => {
    currentParams.category = e.target.value;
    currentParams.page = 1;
    loadProjects();
  });

  document.getElementById('projects-sort')?.addEventListener('change', (e) => {
    currentParams.sort = e.target.value;
    currentParams.page = 1;
    loadProjects();
  });

  // Initial load
  loadProjects();
  refreshScrollAnimations();
}

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  const pagination = document.getElementById('projects-pagination');
  const info = document.getElementById('projects-info');

  if (!grid) return;

  // Loading state
  grid.innerHTML = `
    <div class="loading-overlay" style="grid-column: 1 / -1;">
      <div class="loading-spinner"></div>
    </div>
  `;

  try {
    const data = await fetchProjects(currentParams);
    renderProjectsGrid(grid, data.projects);
    renderPagination(pagination, data);
    info.textContent = `Showing ${data.projects.length} of ${data.total} projects`;

    // Scroll to top of listing on page change
    if (currentParams.page > 1) {
      document.querySelector('.projects-listing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">⚠️</div>
        <p class="empty-state__title">Failed to load projects</p>
        <p class="text-muted">${err.message}</p>
        <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">Retry</button>
      </div>
    `;
    pagination.innerHTML = '';
    info.textContent = '';
  }
}

function renderProjectsGrid(container, projects) {
  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🏗️</div>
        <p class="empty-state__title">No projects found</p>
        <p class="text-muted">Try adjusting your search or filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(project => {
    const coverUrl = project.coverImage?.url || '';
    const statusClass = getStatusBadgeClass(project.status);
    const statusText = getStatusText(project.status);
    const categoryName = project.category?.name || '';

    return `
      <a href="/property/${project.slug}" class="project-card">
        <div class="project-card__image img-zoom">
          ${coverUrl
            ? `<img src="${coverUrl}" alt="${project.name}" loading="lazy">`
            : `<div class="img-placeholder" style="height:100%;">No Image</div>`
          }
          ${project.status !== 'active' ? `<span class="badge ${statusClass} project-card__badge">${statusText}</span>` : ''}
        </div>
        <div class="project-card__body">
          <h3 class="project-card__name">${project.name}</h3>
          <div class="project-card__location">
            <span class="project-card__location-icon">📍</span>
            ${project.location || 'Pune, Maharashtra'}
          </div>
          <div class="project-card__footer">
            <span class="project-card__price">${project.priceRange || ''}</span>
            <span class="project-card__cta">${categoryName ? categoryName + ' →' : 'View Details →'}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  // Trigger stagger animation
  container.classList.remove('visible');
  requestAnimationFrame(() => container.classList.add('visible'));
}

function renderPagination(container, data) {
  if (!container || data.totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const { page, totalPages } = data;
  let buttons = [];

  // Previous
  buttons.push(`<button class="projects-listing__page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>‹</button>`);

  // Page numbers (show max 5)
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) {
    buttons.push(`<button class="projects-listing__page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`);
  }

  // Next
  buttons.push(`<button class="projects-listing__page-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>›</button>`);

  container.innerHTML = buttons.join('');

  // Click handlers
  container.querySelectorAll('.projects-listing__page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page);
      if (!isNaN(p) && p >= 1 && p <= totalPages && p !== page) {
        currentParams.page = p;
        loadProjects();
      }
    });
  });
}
