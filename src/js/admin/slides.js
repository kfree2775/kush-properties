const { apiFetch, apiUpload, setTitle, showToast } = window.__admin;
let slides = [];

export async function render(el) {
  setTitle('Hero Slides');
  try { slides = await apiFetch('/slides'); } catch {}
  renderList(el);
}

function renderList(el) {
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Slides (${slides.length})</h3>
    <button class="btn btn-primary btn-sm" id="add-slide">+ Add Slide</button>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Order</th><th>Image</th><th>Headline</th><th>CTA</th><th>Actions</th>
  </tr></thead><tbody>${slides.map(s => `<tr>
    <td>${s.sortOrder ?? 0}</td>
    <td>${s.imageUrl ? `<img src="${s.imageUrl}" alt="">` : '—'}</td>
    <td><strong>${s.headline || ''}</strong><br><span class="text-muted">${(s.subtext||'').substring(0,60)}</span></td>
    <td>${s.ctaText || '—'}</td>
    <td class="td-actions">
      <button class="btn btn-ghost btn-sm" data-edit="${s._id}">Edit</button>
      <button class="btn btn-ghost btn-sm" data-del="${s._id}" style="color:var(--color-error);">Delete</button>
    </td></tr>`).join('')}</tbody></table></div></div>`;

  el.querySelector('#add-slide')?.addEventListener('click', () => renderForm(el, null));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
    const s = slides.find(x => x._id === b.dataset.edit); if (s) renderForm(el, s);
  }));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete this slide?')) return;
    try { await apiFetch(`/slides/${b.dataset.del}`, { method: 'DELETE' }); showToast('Deleted', 'success'); slides = await apiFetch('/slides'); renderList(el); }
    catch (e) { showToast(e.message, 'error'); }
  }));
}

function renderForm(el, slide) {
  const isEdit = !!slide;
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">${isEdit ? 'Edit' : 'New'} Slide</h3>
    <button class="btn btn-ghost btn-sm" id="back">← Back</button>
  </div><form id="slide-form" class="admin-form">
    <div class="form-group"><label>Headline</label><input type="text" id="sf-headline" value="${slide?.headline || ''}"></div>
    <div class="form-group"><label>Subtext</label><textarea id="sf-subtext" rows="3">${slide?.subtext || ''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>CTA Text</label><input type="text" id="sf-cta" value="${slide?.ctaText || ''}"></div>
      <div class="form-group"><label>CTA Link</label><input type="text" id="sf-link" value="${slide?.ctaLink || ''}"></div>
    </div>
    <div class="form-group"><label>Sort Order</label><input type="number" id="sf-order" value="${slide?.sortOrder ?? 0}"></div>
    <div class="form-group"><label>Image</label>
      <div class="admin-image-upload" id="sf-upload">
        ${slide?.imageUrl ? `<img src="${slide.imageUrl}" class="admin-image-upload__preview">` : ''}
        <p class="text-muted" style="font-size:var(--text-body-sm);">Click to upload</p>
        <input type="file" id="sf-file" accept="image/*">
      </div>
    </div>
    <div class="admin-form-actions">
      <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Create'}</button>
      <button type="button" class="btn btn-ghost" id="back2">Cancel</button>
    </div>
  </form></div>`;

  const uploadDiv = el.querySelector('#sf-upload'), fileInput = el.querySelector('#sf-file');
  uploadDiv?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => { if (fileInput.files[0]) { const r = new FileReader(); r.onload = e => { let img = uploadDiv.querySelector('img'); if (!img) { img = document.createElement('img'); img.className = 'admin-image-upload__preview'; uploadDiv.prepend(img); } img.src = e.target.result; }; r.readAsDataURL(fileInput.files[0]); }});
  el.querySelector('#back')?.addEventListener('click', () => renderList(el));
  el.querySelector('#back2')?.addEventListener('click', () => renderList(el));

  el.querySelector('#slide-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = e.target.querySelector('button[type="submit"]'); btn.disabled = true;
    try {
      const data = { headline: el.querySelector('#sf-headline').value, subtext: el.querySelector('#sf-subtext').value, ctaText: el.querySelector('#sf-cta').value, ctaLink: el.querySelector('#sf-link').value, sortOrder: parseInt(el.querySelector('#sf-order').value) || 0 };
      const fd = new FormData(); fd.append('data', JSON.stringify(data));
      if (fileInput?.files[0]) fd.append('image', fileInput.files[0]);
      await apiUpload(isEdit ? `/slides/${slide._id}` : '/slides', fd, isEdit ? 'PUT' : 'POST');
      showToast('Saved', 'success'); slides = await apiFetch('/slides'); renderList(el);
    } catch (e) { showToast(e.message, 'error'); btn.disabled = false; }
  });
}
