const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Cookie Config');
  let config = {};
  try { config = await apiFetch('/cookie'); } catch {}
  el.innerHTML = `<div class="admin-card"><form id="ck-form" class="admin-form">
    <div class="form-group"><label>Enabled</label>
      <div class="admin-toggle"><div class="admin-toggle__switch ${config.isEnabled!==false?'on':''}" id="ck-enabled"></div><span class="admin-toggle__label">${config.isEnabled!==false?'Yes':'No'}</span></div>
    </div>
    <div class="form-group"><label>Banner Message</label><textarea id="ck-msg" rows="3">${config.message || ''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Accept Button Text</label><input type="text" id="ck-accept" value="${config.acceptText || 'Accept All'}"></div>
      <div class="form-group"><label>Decline Button Text</label><input type="text" id="ck-decline" value="${config.declineText || 'Decline'}"></div>
    </div>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save</button></div>
  </form></div>`;

  el.querySelector('#ck-enabled')?.addEventListener('click', function() { this.classList.toggle('on'); this.nextElementSibling.textContent = this.classList.contains('on') ? 'Yes' : 'No'; });
  el.querySelector('#ck-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/cookie', { method: 'PUT', body: JSON.stringify({
        isEnabled: el.querySelector('#ck-enabled').classList.contains('on'),
        message: el.querySelector('#ck-msg').value, acceptText: el.querySelector('#ck-accept').value, declineText: el.querySelector('#ck-decline').value,
      })});
      showToast('Saved', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });
}
