const { apiFetch, setTitle } = window.__admin;

export async function render(el) {
  setTitle('Dashboard');
  let stats = { projects: 0, leads: 0, contacts: 0, slides: 0 };
  try {
    const [projects, leads, contacts, slides] = await Promise.all([
      apiFetch('/projects'), apiFetch('/leads?pageSize=1'), apiFetch('/contacts?pageSize=1'), apiFetch('/slides'),
    ]);
    stats = { projects: projects.length, leads: leads.total, contacts: contacts.total, slides: slides.length };
  } catch {}

  el.innerHTML = `
    <div class="admin-stats">
      <div class="admin-stat"><div class="admin-stat__value">${stats.projects}</div><div class="admin-stat__label">Projects</div></div>
      <div class="admin-stat"><div class="admin-stat__value">${stats.leads}</div><div class="admin-stat__label">Leads</div></div>
      <div class="admin-stat"><div class="admin-stat__value">${stats.contacts}</div><div class="admin-stat__label">Messages</div></div>
      <div class="admin-stat"><div class="admin-stat__value">${stats.slides}</div><div class="admin-stat__label">Hero Slides</div></div>
    </div>
    <div class="admin-card">
      <div class="admin-card__header"><h3 class="admin-card__title">Quick Actions</h3></div>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="window.location.hash='projects'">Manage Projects</button>
        <button class="btn btn-secondary btn-sm" onclick="window.location.hash='leads'">View Leads</button>
        <button class="btn btn-secondary btn-sm" onclick="window.location.hash='slides'">Edit Slides</button>
        <button class="btn btn-ghost btn-sm" onclick="window.open('/','_blank')">View Website</button>
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-card__header"><h3 class="admin-card__title">System Info</h3></div>
      <p class="text-muted" style="font-size:var(--text-body-sm);">KushProperties Admin Panel v1.0 · Environment: ${window.location.hostname === 'localhost' ? 'Development' : 'Production'}</p>
    </div>`;
}
