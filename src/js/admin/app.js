/**
 * KushProperties — Admin SPA App
 * Auth guard, sidebar, module routing.
 */
const API = '/api/admin';
let currentUser = null;
let currentModule = null;

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'same-origin',
  });
  if (res.status === 401) { window.location.href = '/admin/login'; throw new Error('Unauthorized'); }
  const data = opts.raw ? res : await res.json();
  if (!res.ok && !opts.raw) throw new Error(data.error || 'Request failed');
  return data;
}

async function apiUpload(path, formData, method = 'POST') {
  const res = await fetch(`${API}${path}`, { method, body: formData, credentials: 'same-origin' });
  if (res.status === 401) { window.location.href = '/admin/login'; throw new Error('Unauthorized'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// Export for modules
window.__admin = { apiFetch, apiUpload, setTitle, showToast, content: () => document.getElementById('admin-content') };

function setTitle(title) {
  const el = document.getElementById('admin-topbar');
  if (el) el.innerHTML = `<h2 class="admin-topbar__title">${title}</h2>
    <div class="admin-topbar__actions">
      <a href="/" target="_blank" class="btn btn-ghost btn-sm">View Site</a>
      <button class="btn btn-ghost btn-sm" onclick="window.__admin.logout()">Logout</button>
    </div>`;
}

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  t.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;padding:0.75rem 1.5rem;border-radius:var(--radius-md);font-size:var(--text-body-sm);animation:fadeIn 0.3s ease;';
  t.style.background = type === 'error' ? 'rgba(239,68,68,0.9)' : type === 'success' ? 'rgba(34,197,94,0.9)' : 'rgba(59,130,246,0.9)';
  t.style.color = 'white';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

const NAV = [
  { section: 'Overview', items: [{ id: 'dashboard', icon: '📊', label: 'Dashboard' }] },
  { section: 'Content', items: [
    { id: 'projects', icon: '🏗️', label: 'Projects' },
    { id: 'slides', icon: '🖼️', label: 'Hero Slides' },
    { id: 'achievements', icon: '🏆', label: 'Achievements' },
    { id: 'categories', icon: '📁', label: 'Categories' },
    { id: 'about', icon: '📄', label: 'About Page' },
    { id: 'legal', icon: '⚖️', label: 'Legal Pages' },
  ]},
  { section: 'Settings', items: [
    { id: 'site-config', icon: '⚙️', label: 'Site Config' },
    { id: 'navbar', icon: '🧭', label: 'Navbar' },
    { id: 'footer', icon: '🦶', label: 'Footer' },
    { id: 'popup', icon: '💬', label: 'Popup' },
    { id: 'cookie', icon: '🍪', label: 'Cookie' },
  ]},
  { section: 'Data', items: [
    { id: 'leads', icon: '📋', label: 'Leads' },
    { id: 'contacts', icon: '✉️', label: 'Messages' },
  ]},
  { section: 'System', items: [
    { id: 'users', icon: '👤', label: 'Admin Users' },
    { id: 'audit', icon: '📜', label: 'Audit Log' },
  ]},
];

function renderSidebar() {
  const sb = document.getElementById('admin-sidebar');
  sb.innerHTML = `
    <div class="admin-sidebar__header">
      <span style="font-size:1.5rem;">🏠</span>
      <div class="admin-sidebar__logo">Kush<span>Properties</span></div>
    </div>
    <nav class="admin-sidebar__nav">
      ${NAV.map(s => `<div class="admin-sidebar__section">
        <div class="admin-sidebar__section-title">${s.section}</div>
        ${s.items.map(i => `<button class="admin-nav-item" data-module="${i.id}">
          <span class="admin-nav-item__icon">${i.icon}</span>${i.label}
        </button>`).join('')}
      </div>`).join('')}
    </nav>
    <div class="admin-sidebar__footer">
      <div>
        <div class="admin-sidebar__user-name">${currentUser?.name || 'Admin'}</div>
        <div class="admin-sidebar__user-role">${currentUser?.role || ''}</div>
      </div>
    </div>`;
  sb.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => loadModule(btn.dataset.module));
  });
}

// Explicit module map — Vite needs static-analyzable imports
const MODULES = {
  'dashboard': () => import('./dashboard.js'),
  'projects': () => import('./projects.js'),
  'slides': () => import('./slides.js'),
  'achievements': () => import('./achievements.js'),
  'categories': () => import('./categories.js'),
  'about': () => import('./about.js'),
  'legal': () => import('./legal.js'),
  'site-config': () => import('./site-config.js'),
  'navbar': () => import('./navbar.js'),
  'footer': () => import('./footer.js'),
  'popup': () => import('./popup.js'),
  'cookie': () => import('./cookie.js'),
  'leads': () => import('./leads.js'),
  'contacts': () => import('./contacts.js'),
  'users': () => import('./users.js'),
  'audit': () => import('./audit.js'),
};

async function loadModule(id) {
  currentModule = id;
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.toggle('active', b.dataset.module === id));
  window.location.hash = id;
  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';
  try {
    const loader = MODULES[id];
    if (!loader) throw new Error(`Unknown module: ${id}`);
    const mod = await loader();
    if (mod.render) await mod.render(content);
  } catch (e) {
    console.error(`Module ${id} error:`, e);
    content.innerHTML = `<div class="admin-card"><h3>Module Error</h3><p class="text-muted">${e.message}</p></div>`;
  }
}

window.__admin.logout = async () => {
  try { await apiFetch('/logout', { method: 'POST' }); } catch {}
  window.location.href = '/admin/login';
};

async function init() {
  try {
    const data = await apiFetch('/session');
    currentUser = data.user;
  } catch {
    window.location.href = '/admin/login';
    return;
  }
  renderSidebar();
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  loadModule(hash);
}

init();
