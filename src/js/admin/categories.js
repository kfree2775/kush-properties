const { apiFetch, setTitle, showToast } = window.__admin;
let cats = [];

export async function render(el) {
  setTitle('Categories');
  try { cats = await apiFetch('/categories'); } catch {}
  renderList(el);
}

function renderList(el) {
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Categories (${cats.length})</h3>
    <button class="btn btn-primary btn-sm" id="add-cat">+ Add</button>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Name</th><th>Slug</th><th>Order</th><th>Actions</th>
  </tr></thead><tbody>${cats.map(c => `<tr>
    <td><strong>${c.name}</strong></td><td>${c.slug}</td><td>${c.sortOrder ?? 0}</td>
    <td class="td-actions">
      <button class="btn btn-ghost btn-sm" data-edit='${JSON.stringify(c)}'>Edit</button>
      ${c.slug !== 'all' ? `<button class="btn btn-ghost btn-sm" data-del="${c._id}" style="color:var(--color-error);">Delete</button>` : ''}
    </td></tr>`).join('')}</tbody></table></div></div>`;

  el.querySelector('#add-cat')?.addEventListener('click', () => showForm(el, null));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => showForm(el, JSON.parse(b.dataset.edit))));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete?')) return;
    try { await apiFetch(`/categories/${b.dataset.del}`, { method: 'DELETE' }); showToast('Deleted', 'success'); cats = await apiFetch('/categories'); renderList(el); }
    catch (e) { showToast(e.message, 'error'); }
  }));
}

function showForm(el, cat) {
  const isEdit = !!cat;
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">${isEdit ? 'Edit' : 'New'} Category</h3>
    <button class="btn btn-ghost btn-sm" id="back">← Back</button>
  </div><form id="cat-form" class="admin-form">
    <div class="form-group"><label>Name</label><input type="text" id="cf-name" value="${cat?.name || ''}" required></div>
    <div class="form-group"><label>Slug</label><input type="text" id="cf-slug" value="${cat?.slug || ''}"></div>
    <div class="form-group"><label>Sort Order</label><input type="number" id="cf-order" value="${cat?.sortOrder ?? 0}"></div>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Create'}</button><button type="button" class="btn btn-ghost" id="back2">Cancel</button></div>
  </form></div>`;
  el.querySelector('#back')?.addEventListener('click', () => renderList(el));
  el.querySelector('#back2')?.addEventListener('click', () => renderList(el));
  el.querySelector('#cat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: el.querySelector('#cf-name').value, slug: el.querySelector('#cf-slug').value, sortOrder: parseInt(el.querySelector('#cf-order').value) || 0 };
    try {
      if (isEdit) await apiFetch(`/categories/${cat._id}`, { method: 'PUT', body: JSON.stringify(data) });
      else await apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
      showToast('Saved', 'success'); cats = await apiFetch('/categories'); renderList(el);
    } catch (e) { showToast(e.message, 'error'); }
  });
}
