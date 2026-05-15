const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Legal Pages');
  const slugs = [{ slug: 'terms', label: 'Terms of Service' }, { slug: 'privacy', label: 'Privacy Policy' }];
  let pages = {};
  try { const all = await apiFetch('/legal'); all.forEach(p => pages[p.slug] = p); } catch {}

  el.innerHTML = `<div class="admin-tabs" id="legal-tabs">
    ${slugs.map((s, i) => `<button class="admin-tab ${i===0?'active':''}" data-slug="${s.slug}">${s.label}</button>`).join('')}
  </div><div id="legal-editor"></div>`;

  function loadEditor(slug) {
    const page = pages[slug] || {};
    const editor = el.querySelector('#legal-editor');
    editor.innerHTML = `<div class="admin-card"><form id="legal-form" class="admin-form">
      <div class="form-group"><label>Title</label><input type="text" id="lf-title" value="${page.title || ''}" required></div>
      <div class="form-group"><label>Content (HTML)</label><textarea id="lf-content" rows="15">${page.content || ''}</textarea></div>
      <div class="form-group"><label>Meta Title</label><input type="text" id="lf-meta" value="${page.metaTitle || ''}"></div>
      <div class="form-group"><label>Meta Description</label><textarea id="lf-metadesc" rows="2">${page.metaDescription || ''}</textarea></div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Save & Publish</button>
        <button type="button" class="btn btn-ghost" id="lf-draft">Save Draft</button>
      </div>
    </form></div>`;

    const getData = () => ({ title: el.querySelector('#lf-title').value, content: el.querySelector('#lf-content').value, metaTitle: el.querySelector('#lf-meta').value, metaDescription: el.querySelector('#lf-metadesc').value });

    editor.querySelector('#legal-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await apiFetch(`/legal/${slug}`, { method: 'PUT', body: JSON.stringify({ ...getData(), isPublished: true }) }); showToast('Published', 'success'); }
      catch (e) { showToast(e.message, 'error'); }
    });

    editor.querySelector('#lf-draft')?.addEventListener('click', async () => {
      try { await apiFetch(`/legal/${slug}/draft`, { method: 'PUT', body: JSON.stringify(getData()) }); showToast('Draft saved', 'success'); }
      catch (e) { showToast(e.message, 'error'); }
    });
  }

  el.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadEditor(tab.dataset.slug);
    });
  });
  loadEditor('terms');
}
