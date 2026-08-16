const { apiFetch, apiUpload, setTitle, showToast, content } = window.__admin;
let projects = [], categories = [];

export async function render(el) {
  setTitle('Projects');
  try { [projects, categories] = await Promise.all([apiFetch('/projects'), apiFetch('/categories')]); } catch {}
  renderList(el);
}

function renderList(el) {
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">All Projects (${projects.length})</h3>
    <button class="btn btn-primary btn-sm" id="add-project">+ Add Project</button>
  </div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>
    <th>Image</th><th>Name</th><th>Category</th><th>Status</th><th>Published</th><th>Actions</th>
  </tr></thead><tbody>${projects.map(p => `<tr>
    <td>${p.coverImage?.url ? `<img src="${p.coverImage.url}" alt="">` : '—'}</td>
    <td><strong>${p.name}</strong><br><span class="text-muted">${p.slug}</span></td>
    <td>${p.category?.name || '—'}</td>
    <td><span class="badge badge-${p.status === 'active' ? 'success' : 'warning'}">${p.status || 'active'}</span></td>
    <td>${p.isPublished ? '✅' : '❌'}</td>
    <td class="td-actions">
      <button class="btn btn-ghost btn-sm" data-edit="${p._id}">Edit</button>
      <button class="btn btn-ghost btn-sm" data-pub="${p._id}" data-is="${p.isPublished}">${p.isPublished ? 'Unpublish' : 'Publish'}</button>
      <button class="btn btn-ghost btn-sm" data-del="${p._id}" style="color:var(--color-error);">Delete</button>
    </td></tr>`).join('')}</tbody></table></div></div>`;

  el.querySelector('#add-project')?.addEventListener('click', () => renderForm(el, null));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
    const p = projects.find(x => x._id === b.dataset.edit);
    if (p) renderForm(el, p);
  }));
  el.querySelectorAll('[data-pub]').forEach(b => b.addEventListener('click', async () => {
    try {
      const action = b.dataset.is === 'true' ? 'unpublish' : 'publish';
      await apiFetch(`/projects/${b.dataset.pub}/${action}`, { method: 'POST' });
      showToast(`Project ${action}ed`, 'success');
      projects = await apiFetch('/projects');
      renderList(el);
    } catch (e) { showToast(e.message, 'error'); }
  }));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete this project permanently?')) return;
    try {
      await apiFetch(`/projects/${b.dataset.del}`, { method: 'DELETE' });
      showToast('Project deleted', 'success');
      projects = await apiFetch('/projects');
      renderList(el);
    } catch (e) { showToast(e.message, 'error'); }
  }));
}

function renderForm(el, project) {
  const isEdit = !!project;
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">${isEdit ? 'Edit' : 'New'} Project</h3>
    <button class="btn btn-ghost btn-sm" id="back-list">← Back</button>
  </div><form id="project-form" class="admin-form">
    <div class="form-group"><label>Name *</label><input type="text" id="pf-name" value="${project?.name || ''}" required></div>
    <div class="form-group"><label>Slug</label><input type="text" id="pf-slug" value="${project?.slug || ''}" placeholder="auto-generated from name"></div>
    <div class="form-row">
      <div class="form-group"><label>Category</label><select id="pf-category">
        <option value="">Select...</option>
        ${categories.filter(c=>c.slug!=='all').map(c => `<option value="${c._id}" ${project?.category?._id===c._id||project?.category===c._id?'selected':''}>${c.name}</option>`).join('')}
      </select></div>
      <div class="form-group"><label>Status</label><select id="pf-status">
        ${['active','upcoming','completed','sold_out'].map(s => `<option value="${s}" ${project?.status===s?'selected':''}>${s}</option>`).join('')}
      </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Price Range</label><input type="text" id="pf-price" value="${project?.priceRange || ''}" placeholder="e.g. ₹45L – ₹1.2Cr"></div>
      <div class="form-group"><label>Price (Numeric, in Lakhs)</label><input type="number" step="any" id="pf-price-num" value="${project?.priceNumeric || ''}"><div class="form-help">Used for sorting. Enter price in lakhs (e.g., 85 for ₹85L, 350 for ₹3.5Cr)</div></div>
    </div>
    <div class="form-group"><label>Location</label><input type="text" id="pf-location" value="${project?.location || ''}" placeholder="e.g. Baner, Pune"></div>
    <div class="form-row">
      <div class="form-group"><label>Latitude</label><input type="number" step="any" id="pf-lat" value="${project?.coordinates?.lat || ''}"></div>
      <div class="form-group"><label>Longitude</label><input type="number" step="any" id="pf-lng" value="${project?.coordinates?.lng || ''}"></div>
    </div>
    <div class="form-group"><label>RERA Number</label><input type="text" id="pf-rera" value="${project?.reraNumber || ''}"></div>
    <div class="form-group"><label>Description (HTML)</label><textarea id="pf-desc" rows="6">${project?.description || ''}</textarea></div>
    <div class="form-group"><label>Amenities (comma-separated)</label><input type="text" id="pf-amenities" value="${(project?.amenities||[]).join(', ')}"></div>
    <div class="form-row">
      <div class="form-group"><label>Bedrooms/Config</label><input type="text" id="pf-beds" value="${project?.specs?.bedrooms || ''}"></div>
      <div class="form-group"><label>Area</label><input type="text" id="pf-area" value="${project?.specs?.area || ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Floors</label><input type="text" id="pf-floors" value="${project?.specs?.floors || ''}"></div>
      <div class="form-group"><label>Possession Date</label><input type="text" id="pf-possession" value="${project?.specs?.possessionDate || ''}"></div>
    </div>
    <div class="form-group"><label>Featured Rank (lower = higher priority)</label><input type="number" id="pf-rank" value="${project?.featuredRank ?? ''}"></div>
    <div class="form-group"><label>Cover Image</label>
      <div class="admin-image-upload" id="pf-cover-upload">
        ${project?.coverImage?.url ? `<img src="${project.coverImage.url}" class="admin-image-upload__preview">` : ''}
        <p class="text-muted" style="font-size:var(--text-body-sm);">Click to upload cover image</p>
        <input type="file" id="pf-cover-file" accept="image/*">
      </div>
    </div>
    ${isEdit ? `
    <div class="form-group"><label>Gallery Images</label>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;" id="pf-gallery-list">
        ${(project?.gallery || []).map(g => `
          <div style="position:relative;width:120px;border:1px solid var(--color-outline);border-radius:var(--radius-md);overflow:hidden;">
            <img src="${g.url}" style="width:100%;height:80px;object-fit:cover;">
            <div style="padding:0.5rem;font-size:0.75rem;text-align:center;">
               ${g.caption || 'No caption'}
            </div>
            <button type="button" class="btn btn-ghost btn-sm btn-del-gallery" data-id="${g._id}" style="position:absolute;top:0.25rem;right:0.25rem;background:rgba(0,0,0,0.5);color:white;padding:0.25rem;border-radius:50%;">&times;</button>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:0.5rem;">
        <input type="file" id="pf-gallery-file" accept="image/*" style="display:none;">
        <button type="button" class="btn btn-ghost btn-sm" id="pf-gallery-add">+ Add Image</button>
      </div>
    </div>
    ` : '<p class="form-help" style="margin-bottom:1.5rem;">Save the project first to upload gallery images.</p>'}
    
    <details style="border:1px solid var(--color-outline);border-radius:var(--radius-md);padding:1rem;">
      <summary style="font-weight:600;cursor:pointer;color:var(--color-primary);">SEO Settings</summary>
      <div style="margin-top:1rem;">
        <div class="form-group"><label>Meta Title</label><input type="text" id="pf-seo-title" value="${project?.seo?.metaTitle || ''}"></div>
        <div class="form-group"><label>Meta Description</label><textarea id="pf-seo-desc" rows="2">${project?.seo?.metaDescription || ''}</textarea></div>
        <div class="form-group"><label>OG Image URL</label><input type="text" id="pf-seo-img" value="${project?.seo?.ogImage || ''}"></div>
      </div>
    </details>
    <div class="admin-form-actions">
      <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Project'}</button>
      <button type="button" class="btn btn-ghost" id="back-list2">Cancel</button>
    </div>
  </form></div>`;

  // File upload click
  const uploadDiv = el.querySelector('#pf-cover-upload');
  const fileInput = el.querySelector('#pf-cover-file');
  uploadDiv?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    if (fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let img = uploadDiv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.className = 'admin-image-upload__preview'; uploadDiv.prepend(img); }
        img.src = e.target.result;
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  });

  const galAddBtn = el.querySelector('#pf-gallery-add');
  const galFileInput = el.querySelector('#pf-gallery-file');
  galAddBtn?.addEventListener('click', () => galFileInput?.click());
  galFileInput?.addEventListener('change', async () => {
    if (galFileInput.files[0] && isEdit) {
      const fd = new FormData(); fd.append('image', galFileInput.files[0]);
      const caption = prompt('Image Caption (optional):') || '';
      fd.append('data', JSON.stringify({ caption }));
      try {
        await apiUpload(`/projects/${project._id}/images`, fd, 'POST');
        showToast('Image uploaded', 'success');
        projects = await apiFetch('/projects');
        renderForm(el, projects.find(p => p._id === project._id));
      } catch (e) { showToast(e.message, 'error'); }
    }
  });
  el.querySelectorAll('.btn-del-gallery').forEach(b => b.addEventListener('click', async () => {
    if(!confirm('Delete this gallery image?')) return;
    try {
      await apiFetch(`/projects/${project._id}/images/${b.dataset.id}`, { method: 'DELETE' });
      showToast('Image deleted', 'success');
      projects = await apiFetch('/projects');
      renderForm(el, projects.find(p => p._id === project._id));
    } catch (e) { showToast(e.message, 'error'); }
  }));

  el.querySelector('#back-list')?.addEventListener('click', () => renderList(el));
  el.querySelector('#back-list2')?.addEventListener('click', () => renderList(el));

  el.querySelector('#project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Saving...';
    try {
      const data = {
        name: el.querySelector('#pf-name').value,
        slug: el.querySelector('#pf-slug').value || undefined,
        category: el.querySelector('#pf-category').value || undefined,
        status: el.querySelector('#pf-status').value,
        priceRange: el.querySelector('#pf-price').value,
        priceNumeric: el.querySelector('#pf-price-num')?.value ? Number(el.querySelector('#pf-price-num').value) : undefined,
        location: el.querySelector('#pf-location').value,
        coordinates: {
          lat: el.querySelector('#pf-lat')?.value ? Number(el.querySelector('#pf-lat').value) : undefined,
          lng: el.querySelector('#pf-lng')?.value ? Number(el.querySelector('#pf-lng').value) : undefined,
        },
        reraNumber: el.querySelector('#pf-rera').value,
        description: el.querySelector('#pf-desc').value,
        amenities: el.querySelector('#pf-amenities').value.split(',').map(a => a.trim()).filter(Boolean),
        specs: {
          bedrooms: el.querySelector('#pf-beds').value,
          area: el.querySelector('#pf-area').value,
          floors: el.querySelector('#pf-floors').value,
          possessionDate: el.querySelector('#pf-possession').value,
        },
        featuredRank: el.querySelector('#pf-rank').value ? parseInt(el.querySelector('#pf-rank').value) : undefined,
        seo: {
          metaTitle: el.querySelector('#pf-seo-title')?.value,
          metaDescription: el.querySelector('#pf-seo-desc')?.value,
          ogImage: el.querySelector('#pf-seo-img')?.value,
        },
      };
      const fd = new FormData();
      fd.append('data', JSON.stringify(data));
      if (fileInput?.files[0]) fd.append('coverImage', fileInput.files[0]);
      const url = isEdit ? `/projects/${project._id}` : '/projects';
      await apiUpload(url, fd, isEdit ? 'PUT' : 'POST');
      showToast(isEdit ? 'Project updated' : 'Project created', 'success');
      projects = await apiFetch('/projects');
      renderList(el);
    } catch (e) { showToast(e.message, 'error'); btn.disabled = false; btn.textContent = isEdit ? 'Save Changes' : 'Create Project'; }
  });
}
