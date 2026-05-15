const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Footer Config');
  let config = {};
  try { config = await apiFetch('/footer'); } catch {}
  el.innerHTML = `<div class="admin-card"><form id="ft-form" class="admin-form">
    <div class="form-group"><label>About Text</label><textarea id="ft-about" rows="3">${config.aboutText || ''}</textarea></div>
    <h4 style="margin:1rem 0;color:var(--color-primary);">Footer Columns (JSON)</h4>
    <div class="form-group"><label>Columns Data</label><textarea id="ft-cols" rows="12">${JSON.stringify(config.columns || [], null, 2)}</textarea></div>
    <p class="text-muted" style="font-size:var(--text-caption);margin-bottom:1rem;">Each column: { "title": "...", "sortOrder": 0, "links": [{ "label": "...", "href": "...", "sortOrder": 0 }] }</p>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save</button></div>
  </form></div>`;

  el.querySelector('#ft-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const columns = JSON.parse(el.querySelector('#ft-cols').value);
      await apiFetch('/footer', { method: 'PUT', body: JSON.stringify({ aboutText: el.querySelector('#ft-about').value, columns }) });
      showToast('Saved', 'success');
    } catch (e) { showToast(e.message || 'Invalid JSON', 'error'); }
  });
}
