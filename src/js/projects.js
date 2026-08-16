/**
 * KushProperties — Featured Projects Module
 * Category tabs + project card grid on homepage.
 */

import { getStatusBadgeClass, getStatusText } from './api.js';

let allProjects = [];
let categories = [];

export function initFeaturedProjects(projectsData, categoriesData) {
  const section = document.getElementById('featured-projects');
  if (!section) return;

  allProjects = projectsData || [];
  categories = categoriesData || [];
  const uiStrings = window.uiStrings || {};

  if (allProjects.length === 0) {
    section.innerHTML = `
      <div class="container">
        <div class="section-header" data-animate="fade-up">
          <p class="text-overline">${uiStrings.projectsSectionTitle || 'Our Portfolio'}</p>
          <h2>${uiStrings.projectsSectionSubtitle || 'Our Ongoing Projects'}</h2>
          <p>${uiStrings.projectsEmptyText || 'Coming Soon — exciting projects are in the pipeline.'}</p>
        </div>
      </div>
    `;
    return;
  }

  // Build category tabs (only categories that have projects)
  const projectCategoryIds = new Set(allProjects.map(p => p.category?._id || p.category).filter(Boolean));
  const visibleCategories = categories.filter(
    (c) => c.slug === 'all' || projectCategoryIds.has(String(c._id))
  );

  const tabsHTML = visibleCategories.length > 1
    ? `<div class="category-tabs" data-animate="fade-up">
        ${visibleCategories.map((cat, i) => `
          <button class="category-tab ${i === 0 ? 'active' : ''}" data-category="${cat.slug}">${cat.name}</button>
        `).join('')}
      </div>`
    : '';

  section.innerHTML = `
    <div class="container">
      <div class="section-header" data-animate="fade-up">
        <p class="text-overline">${uiStrings.projectsSectionTitle || 'Our Portfolio'}</p>
        <h2>${uiStrings.projectsSectionSubtitle || 'Our Ongoing Projects'}</h2>
      </div>
      ${tabsHTML}
      <div class="projects__grid" id="projects-grid" data-animate-stagger></div>
      <div class="projects__view-all" data-animate="fade-up">
        <a href="/projects" class="btn btn-secondary btn-lg">${uiStrings.projectsViewAllText || 'View All Projects →'}</a>
      </div>
    </div>
  `;

  // Render initial cards (all)
  renderProjectCards(allProjects);

  // Tab click handlers
  section.querySelectorAll('.category-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      section.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const categorySlug = tab.dataset.category;
      if (categorySlug === 'all') {
        renderProjectCards(allProjects);
      } else {
        const cat = categories.find(c => c.slug === categorySlug);
        const filtered = allProjects.filter(p => {
          const catId = p.category?._id || p.category;
          return String(catId) === String(cat?._id);
        });
        renderProjectCards(filtered);
      }
    });
  });
}

function renderProjectCards(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🏗️</div>
        <p class="empty-state__title">No projects in this category</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = projects.map((project) => {
    const coverUrl = project.coverImage?.url || '';
    const statusClass = getStatusBadgeClass(project.status);
    const statusText = getStatusText(project.status);

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
            <span class="project-card__cta">View Details →</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  // Re-trigger stagger animation
  grid.classList.remove('visible');
  requestAnimationFrame(() => {
    grid.classList.add('visible');
  });
}
