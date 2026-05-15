/**
 * KushProperties — Centralized API Client
 * Handles fetch calls, error handling, and preview mode detection.
 */

const API_BASE = '/api';
const ADMIN_API_BASE = '/api/admin';

/**
 * Check if current page is in preview mode (?preview=true)
 */
export function isPreviewMode() {
  return new URLSearchParams(window.location.search).get('preview') === 'true';
}

/**
 * Get the CSRF token from the meta tag (injected server-side for admin pages).
 */
function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

/**
 * Core fetch wrapper with error handling.
 */
async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add CSRF token for mutation requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase())) {
    defaultHeaders['X-CSRF-Token'] = getCsrfToken();
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // If body is an object (not FormData), stringify it
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses (CSV export, etc.)
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err; // Re-throw API errors
    // Network or parsing errors
    console.error('[API Error]', err);
    throw new Error('Network error. Please check your connection.');
  }
}

// ==================== Public API ====================

export async function fetchBootstrap() {
  return request(`${API_BASE}/bootstrap`);
}

export async function fetchProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.q) query.set('q', params.q);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', params.page);
  if (params.pageSize) query.set('pageSize', params.pageSize);
  return request(`${API_BASE}/projects?${query.toString()}`);
}

export async function fetchProjectBySlug(slug) {
  return request(`${API_BASE}/projects/by-slug/${slug}`);
}

export async function fetchAbout() {
  return request(`${API_BASE}/about`);
}

export async function fetchLegal(slug) {
  return request(`${API_BASE}/legal/${slug}`);
}

export async function submitLead(data) {
  return request(`${API_BASE}/leads`, { method: 'POST', body: data });
}

export async function submitContact(data) {
  return request(`${API_BASE}/contact`, { method: 'POST', body: data });
}

// ==================== Preview API (admin) ====================

export async function fetchPreviewHomepage() {
  return request(`${ADMIN_API_BASE}/preview/homepage`);
}

export async function fetchPreviewAbout() {
  return request(`${ADMIN_API_BASE}/preview/about`);
}

export async function fetchPreviewLegal(slug) {
  return request(`${ADMIN_API_BASE}/preview/legal/${slug}`);
}

export async function fetchPreviewProject(slug) {
  return request(`${ADMIN_API_BASE}/preview/project/${slug}`);
}

// ==================== Admin API ====================

export async function adminLogin(email, password) {
  return request(`${ADMIN_API_BASE}/login`, {
    method: 'POST',
    body: { email, password },
  });
}

export async function adminLogout() {
  return request(`${ADMIN_API_BASE}/logout`, { method: 'POST' });
}

export async function adminSession() {
  return request(`${ADMIN_API_BASE}/session`);
}

export async function adminRequest(path, options = {}) {
  return request(`${ADMIN_API_BASE}${path}`, options);
}

// ==================== Utility ====================

/**
 * Show a toast notification.
 */
export function showToast(message, type = 'success', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Get status badge class from project status.
 */
export function getStatusBadgeClass(status) {
  switch (status) {
    case 'active': return 'badge-active';
    case 'sold_out': return 'badge-sold';
    case 'coming_soon': return 'badge-coming-soon';
    default: return '';
  }
}

/**
 * Get status display text.
 */
export function getStatusText(status) {
  switch (status) {
    case 'active': return 'Active';
    case 'sold_out': return 'Sold Out';
    case 'coming_soon': return 'New Launch';
    default: return status;
  }
}
