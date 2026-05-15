const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Site Config');
  let config = {};
  try { config = await apiFetch('/site-config'); } catch {}
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Site Configuration</h3>
  </div><form id="sc-form" class="admin-form">
    <h4 style="margin-bottom:1rem;color:var(--color-primary);">Branding</h4>
    <div class="form-group"><label>Company Name</label><input type="text" id="sc-name" value="${config.branding?.companyName || ''}"></div>
    <div class="form-group"><label>Logo URL</label><input type="text" id="sc-logo" value="${config.branding?.logoUrl || ''}"></div>
    <div class="form-group"><label>Tagline</label><input type="text" id="sc-tagline" value="${config.branding?.tagline || ''}"></div>
    <h4 style="margin:1.5rem 0 1rem;color:var(--color-primary);">Contact</h4>
    <div class="form-row">
      <div class="form-group"><label>Phone Primary</label><input type="text" id="sc-phone1" value="${config.contact?.phonePrimary || ''}"></div>
      <div class="form-group"><label>Phone Secondary</label><input type="text" id="sc-phone2" value="${config.contact?.phoneSecondary || ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Email Primary</label><input type="text" id="sc-email1" value="${config.contact?.emailPrimary || ''}"></div>
      <div class="form-group"><label>Email Sales</label><input type="text" id="sc-email2" value="${config.contact?.emailSales || ''}"></div>
    </div>
    <div class="form-group"><label>Office Address</label><textarea id="sc-address" rows="2">${config.contact?.addressFull || ''}</textarea></div>
    <div class="form-group"><label>Map Embed URL</label><input type="text" id="sc-map" value="${config.contact?.mapEmbedUrl || ''}"></div>
    <div class="form-group"><label>Office Hours</label><input type="text" id="sc-hours" value="${config.contact?.officeHours || ''}"></div>
    <h4 style="margin:1.5rem 0 1rem;color:var(--color-primary);">WhatsApp</h4>
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input type="text" id="sc-wa-phone" value="${config.whatsapp?.phone || ''}"></div>
      <div class="form-group"><label>Message</label><input type="text" id="sc-wa-msg" value="${config.whatsapp?.message || ''}"></div>
    </div>
    <h4 style="margin:1.5rem 0 1rem;color:var(--color-primary);">RERA</h4>
    <div class="form-group"><label>Registration Number</label><input type="text" id="sc-rera" value="${config.rera?.companyRegNumber || ''}"></div>
    <div class="form-group"><label>Disclaimer Text</label><textarea id="sc-rera-text" rows="2">${config.rera?.disclaimerText || ''}</textarea></div>
    <h4 style="margin:1.5rem 0 1rem;color:var(--color-primary);">Analytics</h4>
    <div class="form-group"><label>GA4 Measurement ID</label><input type="text" id="sc-ga4" value="${config.analytics?.ga4Id || ''}" placeholder="G-XXXXXXXXXX"></div>
    <div class="form-group"><label>Copyright</label><input type="text" id="sc-copyright" value="${config.copyright || ''}"></div>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save Configuration</button></div>
  </form></div>`;

  el.querySelector('#sc-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/site-config', { method: 'PUT', body: JSON.stringify({
        branding: { companyName: el.querySelector('#sc-name').value, logoUrl: el.querySelector('#sc-logo').value, tagline: el.querySelector('#sc-tagline').value },
        contact: { phonePrimary: el.querySelector('#sc-phone1').value, phoneSecondary: el.querySelector('#sc-phone2').value, emailPrimary: el.querySelector('#sc-email1').value, emailSales: el.querySelector('#sc-email2').value, addressFull: el.querySelector('#sc-address').value, mapEmbedUrl: el.querySelector('#sc-map').value, officeHours: el.querySelector('#sc-hours').value },
        whatsapp: { phone: el.querySelector('#sc-wa-phone').value, message: el.querySelector('#sc-wa-msg').value },
        rera: { companyRegNumber: el.querySelector('#sc-rera').value, disclaimerText: el.querySelector('#sc-rera-text').value },
        analytics: { ga4Id: el.querySelector('#sc-ga4').value },
        copyright: el.querySelector('#sc-copyright').value,
      })});
      showToast('Configuration saved', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });
}
