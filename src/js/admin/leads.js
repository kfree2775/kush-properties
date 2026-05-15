const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Leads');
  await loadPage(el, 1);
}

async function loadPage(el, page) {
  let data = { leads: [], total: 0, page: 1, totalPages: 0 };
  try { data = await apiFetch(`/leads?page=${page}&pageSize=25`); } catch {}
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Leads (${data.total})</h3>
    <a href="/api/admin/leads/export" target="_blank" class="btn btn-secondary btn-sm">📥 Export CSV</a>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Date</th><th>Actions</th>
  </tr></thead><tbody>${data.leads.length ? data.leads.map(l => `<tr>
    <td><strong>${l.fullName}</strong></td><td>${l.email || '—'}</td><td>${l.phone || '—'}</td>
    <td><span class="badge">${l.source || '—'}</span></td>
    <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
    <td><button class="btn btn-ghost btn-sm" data-del="${l._id}" style="color:var(--color-error);">Delete</button></td>
  </tr>`).join('') : '<tr><td colspan="6" class="text-muted" style="text-align:center;">No leads yet</td></tr>'}</tbody></table></div>
  ${data.totalPages > 1 ? `<div style="display:flex;justify-content:center;gap:0.5rem;margin-top:1rem;">
    ${Array.from({length: data.totalPages}, (_, i) => `<button class="projects-listing__page-btn ${i+1===data.page?'active':''}" data-page="${i+1}">${i+1}</button>`).join('')}
  </div>` : ''}</div>`;

  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete?')) return;
    try { await apiFetch(`/leads/${b.dataset.del}`, { method: 'DELETE' }); showToast('Deleted', 'success'); await loadPage(el, data.page); }
    catch (e) { showToast(e.message, 'error'); }
  }));
  el.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => loadPage(el, parseInt(b.dataset.page))));
}
