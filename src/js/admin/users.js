const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Admin Users');
  let users = [];
  try { users = await apiFetch('/users'); } catch {}
  renderList(el, users);
}

function renderList(el, users) {
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Admin Users (${users.length})</h3>
    <button class="btn btn-primary btn-sm" id="add-user">+ Add User</button>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Actions</th>
  </tr></thead><tbody>${users.map(u => `<tr>
    <td><strong>${u.name}</strong></td><td>${u.email}</td>
    <td><span class="badge">${u.role}</span></td>
    <td>${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : '—'}</td>
    <td class="td-actions">
      <button class="btn btn-ghost btn-sm" data-edit='${JSON.stringify({_id:u._id,name:u.name,email:u.email,role:u.role})}'>Edit</button>
      <button class="btn btn-ghost btn-sm" data-del="${u._id}" style="color:var(--color-error);">Delete</button>
    </td></tr>`).join('')}</tbody></table></div></div>
  <div class="admin-card"><div class="admin-card__header"><h3 class="admin-card__title">Change My Password</h3></div>
    <form id="pw-form" class="admin-form">
      <div class="form-group"><label>Current Password</label><input type="password" id="pw-current" required></div>
      <div class="form-group"><label>New Password</label><input type="password" id="pw-new" required minlength="8"></div>
      <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Update Password</button></div>
    </form>
  </div>`;

  el.querySelector('#add-user')?.addEventListener('click', () => showForm(el, null));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => showForm(el, JSON.parse(b.dataset.edit))));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete this admin user?')) return;
    try { await apiFetch(`/users/${b.dataset.del}`, { method: 'DELETE' }); showToast('Deleted', 'success'); const u = await apiFetch('/users'); renderList(el, u); }
    catch (e) { showToast(e.message, 'error'); }
  }));
  el.querySelector('#pw-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/users/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword: el.querySelector('#pw-current').value, newPassword: el.querySelector('#pw-new').value }) });
      showToast('Password updated', 'success'); el.querySelector('#pw-current').value = ''; el.querySelector('#pw-new').value = '';
    } catch (e) { showToast(e.message, 'error'); }
  });
}

function showForm(el, user) {
  const isEdit = !!user;
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">${isEdit ? 'Edit' : 'New'} Admin User</h3>
    <button class="btn btn-ghost btn-sm" id="back">← Back</button>
  </div><form id="user-form" class="admin-form">
    <div class="form-group"><label>Name</label><input type="text" id="uf-name" value="${user?.name || ''}" required></div>
    <div class="form-group"><label>Email</label><input type="email" id="uf-email" value="${user?.email || ''}" required></div>
    <div class="form-group"><label>${isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label><input type="password" id="uf-password" ${isEdit ? '' : 'required'} minlength="8"></div>
    <div class="form-group"><label>Role</label><select id="uf-role"><option value="editor" ${user?.role==='editor'?'selected':''}>Editor</option><option value="admin" ${user?.role==='admin'?'selected':''}>Admin</option></select></div>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Create'}</button><button type="button" class="btn btn-ghost" id="back2">Cancel</button></div>
  </form></div>`;

  el.querySelector('#back')?.addEventListener('click', async () => { const u = await apiFetch('/users'); renderList(el, u); });
  el.querySelector('#back2')?.addEventListener('click', async () => { const u = await apiFetch('/users'); renderList(el, u); });
  el.querySelector('#user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: el.querySelector('#uf-name').value, email: el.querySelector('#uf-email').value, role: el.querySelector('#uf-role').value };
    const pw = el.querySelector('#uf-password').value;
    if (pw) data.password = pw;
    try {
      if (isEdit) await apiFetch(`/users/${user._id}`, { method: 'PUT', body: JSON.stringify(data) });
      else await apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
      showToast('Saved', 'success'); const u = await apiFetch('/users'); renderList(el, u);
    } catch (e) { showToast(e.message, 'error'); }
  });
}
