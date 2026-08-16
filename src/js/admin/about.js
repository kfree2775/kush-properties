const { apiFetch, apiUpload, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('About Page');
  let about = {};
  try { about = await apiFetch('/about'); } catch {}
  
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">About Page Content</h3>
    <div style="display:flex;gap:0.5rem;">
      <button class="btn btn-ghost btn-sm" id="save-draft">Save Draft</button>
      <button class="btn btn-primary btn-sm" id="publish">Publish</button>
    </div>
  </div><form id="about-form" class="admin-form">
    <div class="form-group"><label>Hero Tagline</label><input type="text" id="af-tagline" value="${about.heroTagline || ''}"></div>
    <div class="form-group"><label>Hero Subtext</label><input type="text" id="af-subtext" value="${about.heroSubtext || ''}"></div>
    <div class="form-group"><label>Hero Image</label>
      <div class="admin-image-upload" id="af-hero-upload">
        ${about.heroImage?.url ? `<img src="${about.heroImage.url}" class="admin-image-upload__preview">` : ''}
        <p class="text-muted" style="font-size:var(--text-body-sm);">Click to upload hero image</p>
        <input type="file" id="af-hero-file" accept="image/*">
      </div>
    </div>
    
    <div class="form-group"><label>Story Title</label><input type="text" id="af-stitle" value="${about.storyTitle || ''}"></div>
    <div class="form-group"><label>Story Content (HTML)</label><textarea id="af-scontent" rows="8">${about.storyContent || ''}</textarea></div>
    <div class="form-group"><label>Mission</label><textarea id="af-mission" rows="4">${about.mission || ''}</textarea></div>
    <div class="form-group"><label>Vision</label><textarea id="af-vision" rows="4">${about.vision || ''}</textarea></div>
    
    <h4 style="margin:2rem 0 1rem;color:var(--color-primary);">Team Members</h4>
    <div id="af-team-container">
      ${(about.team || []).map((t, i) => `
        <div class="team-member-row" data-index="${i}" style="border:1px solid var(--color-outline);padding:1rem;border-radius:var(--radius-md);margin-bottom:1rem;position:relative;">
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>Name</label><input type="text" class="tm-name" value="${t.name || ''}"></div>
            <div class="form-group" style="flex:1;"><label>Role</label><input type="text" class="tm-role" value="${t.role || ''}"></div>
          </div>
          <div class="form-group"><label>Image</label>
            <div class="admin-image-upload tm-upload" style="padding:1rem;min-height:auto;">
              ${t.image?.url ? `<img src="${t.image.url}" class="admin-image-upload__preview" style="height:60px;width:auto;margin:0;">` : '<p class="text-muted" style="margin:0;">Click to upload</p>'}
              <input type="file" class="tm-file" accept="image/*">
              <!-- hidden input to store existing image url so we don't lose it if untouched -->
              <input type="hidden" class="tm-existing-url" value="${t.image?.url || ''}">
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm btn-del-team" style="position:absolute;top:1rem;right:1rem;color:var(--color-error);">Remove</button>
        </div>
      `).join('')}
    </div>
    <button type="button" class="btn btn-ghost btn-sm" id="af-add-team">+ Add Member</button>

    <div class="form-group" style="margin-top:2rem;"><label>Published</label>
      <div class="admin-toggle"><div class="admin-toggle__switch ${about.isPublished?'on':''}" id="af-pub"></div><span class="admin-toggle__label">${about.isPublished?'Yes':'No'}</span></div>
    </div>
  </form></div>`;

  el.querySelector('#af-pub')?.addEventListener('click', function() { this.classList.toggle('on'); this.nextElementSibling.textContent = this.classList.contains('on') ? 'Yes' : 'No'; });

  // Hero image upload visual
  const heroUploadDiv = el.querySelector('#af-hero-upload');
  const heroFileInput = el.querySelector('#af-hero-file');
  heroUploadDiv?.addEventListener('click', () => heroFileInput?.click());
  heroFileInput?.addEventListener('change', () => {
    if (heroFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let img = heroUploadDiv.querySelector('img');
        if (!img) { img = document.createElement('img'); img.className = 'admin-image-upload__preview'; heroUploadDiv.prepend(img); }
        img.src = e.target.result;
      };
      reader.readAsDataURL(heroFileInput.files[0]);
    }
  });

  // Team dynamic rows
  const teamContainer = el.querySelector('#af-team-container');
  el.querySelector('#af-add-team')?.addEventListener('click', () => {
    const idx = teamContainer.children.length;
    const div = document.createElement('div');
    div.className = 'team-member-row';
    div.dataset.index = idx;
    div.style.cssText = 'border:1px solid var(--color-outline);padding:1rem;border-radius:var(--radius-md);margin-bottom:1rem;position:relative;';
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group" style="flex:1;"><label>Name</label><input type="text" class="tm-name" value=""></div>
        <div class="form-group" style="flex:1;"><label>Role</label><input type="text" class="tm-role" value=""></div>
      </div>
      <div class="form-group"><label>Image</label>
        <div class="admin-image-upload tm-upload" style="padding:1rem;min-height:auto;">
          <p class="text-muted" style="margin:0;">Click to upload</p>
          <input type="file" class="tm-file" accept="image/*">
          <input type="hidden" class="tm-existing-url" value="">
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm btn-del-team" style="position:absolute;top:1rem;right:1rem;color:var(--color-error);">Remove</button>
    `;
    teamContainer.appendChild(div);
    bindTeamRow(div);
  });

  function bindTeamRow(row) {
    const upload = row.querySelector('.tm-upload');
    const file = row.querySelector('.tm-file');
    upload?.addEventListener('click', () => file?.click());
    file?.addEventListener('change', () => {
      if (file.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          let img = upload.querySelector('img');
          if (!img) { img = document.createElement('img'); img.className = 'admin-image-upload__preview'; img.style.cssText = 'height:60px;width:auto;margin:0;'; upload.prepend(img); }
          img.src = e.target.result;
          const p = upload.querySelector('p');
          if(p) p.style.display = 'none';
        };
        reader.readAsDataURL(file.files[0]);
      }
    });
    row.querySelector('.btn-del-team')?.addEventListener('click', () => row.remove());
  }
  
  el.querySelectorAll('.team-member-row').forEach(bindTeamRow);

  const getFormData = () => {
    const data = {
      heroTagline: el.querySelector('#af-tagline').value, heroSubtext: el.querySelector('#af-subtext').value,
      storyTitle: el.querySelector('#af-stitle').value, storyContent: el.querySelector('#af-scontent').value,
      mission: el.querySelector('#af-mission').value, vision: el.querySelector('#af-vision').value,
      isPublished: el.querySelector('#af-pub').classList.contains('on'),
      team: []
    };
    
    el.querySelectorAll('.team-member-row').forEach(row => {
      data.team.push({
        name: row.querySelector('.tm-name').value,
        role: row.querySelector('.tm-role').value,
        _existingImageUrl: row.querySelector('.tm-existing-url').value
      });
    });
    
    const fd = new FormData();
    fd.append('data', JSON.stringify(data));
    
    if (heroFileInput?.files[0]) fd.append('heroImage', heroFileInput.files[0]);
    
    el.querySelectorAll('.team-member-row').forEach((row, i) => {
      const file = row.querySelector('.tm-file');
      if (file?.files[0]) fd.append(`teamImage_${i}`, file.files[0]);
    });
    
    return fd;
  };

  el.querySelector('#save-draft')?.addEventListener('click', async () => {
    try { 
      const fd = getFormData();
      await apiUpload('/about/draft', fd, 'PUT'); 
      showToast('Draft saved', 'success'); 
    }
    catch (e) { showToast(e.message, 'error'); }
  });

  el.querySelector('#publish')?.addEventListener('click', async () => {
    try {
      const fd = getFormData();
      await apiUpload('/about', fd, 'PUT');
      await apiFetch('/about/publish', { method: 'POST' });
      showToast('Published', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });
}
