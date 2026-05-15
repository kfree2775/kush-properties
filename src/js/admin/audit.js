const { apiFetch, setTitle } = window.__admin;

export async function render(el) {
  setTitle('Audit Log');
  await loadPage(el, 1);
}

async function loadPage(el, page) {
  let data = { logs: [], total: 0, page: 1, totalPages: 0 };
  try { data = await apiFetch(`/audit-logs?page=${page}&pageSize=50`); } catch {}
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Audit Log (${data.total} entries)</h3>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Date</th><th>Admin</th><th>Action</th><th>Model</th><th>Target ID</th>
  </tr></thead><tbody>${data.logs.length ? data.logs.map(l => `<tr>
    <td>${new Date(l.createdAt).toLocaleString('en-IN')}</td>
    <td>${l.adminUser || '—'}</td>
    <td><span class="badge">${l.action}</span></td>
    <td>${l.model || '—'}</td>
    <td style="font-size:var(--text-caption);color:var(--color-on-surface-muted);">${l.targetId || '—'}</td>
  </tr>`).join('') : '<tr><td colspan="5" class="text-muted" style="text-align:center;">No logs yet</td></tr>'}</tbody></table></div>
  ${data.totalPages > 1 ? `<div style="display:flex;justify-content:center;gap:0.5rem;margin-top:1rem;">
    ${Array.from({length: Math.min(data.totalPages, 10)}, (_, i) => `<button class="projects-listing__page-btn ${i+1===data.page?'active':''}" data-page="${i+1}">${i+1}</button>`).join('')}
  </div>` : ''}</div>`;
  el.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => loadPage(el, parseInt(b.dataset.page))));
}
