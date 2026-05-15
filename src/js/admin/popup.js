const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Popup Config');
  let config = {};
  try { config = await apiFetch('/popup'); } catch {}
  el.innerHTML = `<div class="admin-card"><form id="pp-form" class="admin-form">
    <div class="form-group"><label>Enabled</label>
      <div class="admin-toggle"><div class="admin-toggle__switch ${config.isEnabled!==false?'on':''}" id="pp-enabled"></div><span class="admin-toggle__label">${config.isEnabled!==false?'Yes':'No'}</span></div>
    </div>
    <div class="form-group"><label>Heading</label><input type="text" id="pp-heading" value="${config.heading || ''}"></div>
    <div class="form-group"><label>Subtext</label><textarea id="pp-subtext" rows="3">${config.subtext || ''}</textarea></div>
    <div class="form-group"><label>CTA Text</label><input type="text" id="pp-cta" value="${config.ctaText || ''}"></div>
    <div class="form-group"><label>Delay (seconds)</label><input type="number" id="pp-delay" value="${config.delaySeconds || 15}"></div>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save</button></div>
  </form></div>`;

  el.querySelector('#pp-enabled')?.addEventListener('click', function() { this.classList.toggle('on'); this.nextElementSibling.textContent = this.classList.contains('on') ? 'Yes' : 'No'; });
  el.querySelector('#pp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/popup', { method: 'PUT', body: JSON.stringify({
        isEnabled: el.querySelector('#pp-enabled').classList.contains('on'),
        heading: el.querySelector('#pp-heading').value, subtext: el.querySelector('#pp-subtext').value,
        ctaText: el.querySelector('#pp-cta').value, delaySeconds: parseInt(el.querySelector('#pp-delay').value) || 15,
      })});
      showToast('Saved', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });
}
