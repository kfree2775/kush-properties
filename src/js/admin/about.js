const { apiFetch, setTitle, showToast } = window.__admin;

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
    <div class="form-group"><label>Story Title</label><input type="text" id="af-stitle" value="${about.storyTitle || ''}"></div>
    <div class="form-group"><label>Story Content (HTML)</label><textarea id="af-scontent" rows="8">${about.storyContent || ''}</textarea></div>
    <div class="form-group"><label>Mission</label><textarea id="af-mission" rows="4">${about.mission || ''}</textarea></div>
    <div class="form-group"><label>Vision</label><textarea id="af-vision" rows="4">${about.vision || ''}</textarea></div>
    <div class="form-group"><label>Published</label>
      <div class="admin-toggle"><div class="admin-toggle__switch ${about.isPublished?'on':''}" id="af-pub"></div><span class="admin-toggle__label">${about.isPublished?'Yes':'No'}</span></div>
    </div>
  </form></div>`;

  el.querySelector('#af-pub')?.addEventListener('click', function() { this.classList.toggle('on'); this.nextElementSibling.textContent = this.classList.contains('on') ? 'Yes' : 'No'; });

  const getData = () => ({
    heroTagline: el.querySelector('#af-tagline').value, heroSubtext: el.querySelector('#af-subtext').value,
    storyTitle: el.querySelector('#af-stitle').value, storyContent: el.querySelector('#af-scontent').value,
    mission: el.querySelector('#af-mission').value, vision: el.querySelector('#af-vision').value,
    isPublished: el.querySelector('#af-pub').classList.contains('on'),
  });

  el.querySelector('#save-draft')?.addEventListener('click', async () => {
    try { await apiFetch('/about/draft', { method: 'PUT', body: JSON.stringify(getData()) }); showToast('Draft saved', 'success'); }
    catch (e) { showToast(e.message, 'error'); }
  });

  el.querySelector('#publish')?.addEventListener('click', async () => {
    try {
      const fd = new FormData(); fd.append('data', JSON.stringify(getData()));
      await fetch('/api/admin/about', { method: 'PUT', body: fd, credentials: 'same-origin' });
      await apiFetch('/about/publish', { method: 'POST' });
      showToast('Published', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });
}
