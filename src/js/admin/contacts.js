const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Messages');
  await loadPage(el, 1);
}

async function loadPage(el, page) {
  let data = { contacts: [], total: 0, page: 1, totalPages: 0 };
  try { data = await apiFetch(`/contacts?page=${page}&pageSize=25`); } catch {}
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Contact Messages (${data.total})</h3>
    <a href="/api/admin/contacts/export" target="_blank" class="btn btn-secondary btn-sm">📥 Export CSV</a>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Name</th><th>Email</th><th>Message</th><th>Read</th><th>Date</th><th>Actions</th>
  </tr></thead><tbody>${data.contacts.length ? data.contacts.map(c => `<tr style="${!c.isRead ? 'background:rgba(var(--color-primary-rgb),0.03);' : ''}">
    <td><strong>${c.name}</strong></td><td>${c.email}</td>
    <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.message}</td>
    <td>${c.isRead ? '✅' : '🔵'}</td>
    <td>${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
    <td class="td-actions">
      ${!c.isRead ? `<button class="btn btn-ghost btn-sm" data-read="${c._id}">Mark Read</button>` : ''}
      <button class="btn btn-ghost btn-sm" data-del="${c._id}" style="color:var(--color-error);">Delete</button>
    </td></tr>`).join('') : '<tr><td colspan="6" class="text-muted" style="text-align:center;">No messages yet</td></tr>'}</tbody></table></div>
  ${data.totalPages > 1 ? `<div style="display:flex;justify-content:center;gap:0.5rem;margin-top:1rem;">
    ${Array.from({length: data.totalPages}, (_, i) => `<button class="projects-listing__page-btn ${i+1===data.page?'active':''}" data-page="${i+1}">${i+1}</button>`).join('')}
  </div>` : ''}</div>`;

  el.querySelectorAll('[data-read]').forEach(b => b.addEventListener('click', async () => {
    try { await apiFetch(`/contacts/${b.dataset.read}/read`, { method: 'PUT' }); showToast('Marked as read', 'success'); await loadPage(el, data.page); }
    catch (e) { showToast(e.message, 'error'); }
  }));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete?')) return;
    try { await apiFetch(`/contacts/${b.dataset.del}`, { method: 'DELETE' }); showToast('Deleted', 'success'); await loadPage(el, data.page); }
    catch (e) { showToast(e.message, 'error'); }
  }));
  el.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => loadPage(el, parseInt(b.dataset.page))));
}
