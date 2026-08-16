const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  const hash = window.location.hash.replace('#', ''); // site-config, seo, ui-text, or social
  const currentTab = ['site-config', 'seo', 'ui-text', 'social'].includes(hash) ? hash : 'site-config';
  const titles = {
    'site-config': 'Site Config',
    'seo': 'SEO & Sharing',
    'ui-text': 'UI Text & Labels',
    'social': 'Social Media'
  };
  setTitle(titles[currentTab] || 'Site Config');
  
  let config = {};
  try { config = await apiFetch('/site-config'); } catch {}
  
  const ps = config.pageSeo || {};
  const ui = config.uiStrings || {};

  let tabContent = '';
  if (currentTab === 'site-config') {
    tabContent = `
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
    <div class="form-group"><label>Copyright</label><input type="text" id="sc-copyright" value="${config.copyright || ''}"></div>`;
  } else if (currentTab === 'seo') {
    tabContent = `
    <p class="form-help" style="margin-bottom:1.5rem;">These appear when your site is shared on social media (WhatsApp, Facebook, Twitter).</p>
    ${['home', 'about', 'contact', 'projects'].map(p => `
      <h4 style="margin:1.5rem 0 1rem;color:var(--color-primary);text-transform:capitalize;">${p} Page</h4>
      <div class="form-group"><label>Meta Title</label><input type="text" id="seo-${p}-title" value="${ps[p]?.title || ''}"></div>
      <div class="form-group"><label>Meta Description</label><textarea id="seo-${p}-desc" rows="2">${ps[p]?.metaDescription || ''}</textarea></div>
      <div class="form-group"><label>OG Image URL</label><input type="text" id="seo-${p}-img" value="${ps[p]?.ogImage || ''}"></div>
    `).join('')}`;
  } else if (currentTab === 'ui-text') {
    tabContent = `
    <p class="form-help" style="margin-bottom:1.5rem;">Customize the text labels shown across your website. Leave blank to use defaults.</p>
    ${[
      ['aboutHeroOverline', 'About Page — Hero Overline'],
      ['aboutTeamOverline', 'About Page — Team Overline'],
      ['aboutCtaTitle', 'About Page — CTA Title'],
      ['aboutCtaSubtext', 'About Page — CTA Subtitle'],
      ['aboutCtaPrimaryText', 'About Page — Primary Button Text'],
      ['aboutCtaPrimaryLink', 'About Page — Primary Button Link'],
      ['aboutCtaSecondaryText', 'About Page — Secondary Button Text'],
      ['aboutCtaSecondaryLink', 'About Page — Secondary Button Link'],
      ['contactHeroTitle', 'Contact Page — Hero Title'],
      ['contactHeroSubtext', 'Contact Page — Hero Subtitle'],
      ['contactFormTitle', 'Contact Page — Form Title'],
      ['projectsSectionTitle', 'Projects — Section Title'],
      ['projectsSectionSubtitle', 'Projects — Section Subtitle'],
      ['projectsEmptyText', 'Projects — Empty State Text'],
      ['projectsViewAllText', 'Projects — View All Button Text'],
      ['propertyEnquirePrefix', 'Property — Enquire Button Prefix'],
      ['legalFallbackText', 'Legal — Fallback Text']
    ].map(([key, label]) => `
      <div class="form-group"><label>${label}</label><input type="text" id="ui-${key}" value="${ui[key] || ''}"></div>
    `).join('')}`;
  } else if (currentTab === 'social') {
    const social = config.social || [];
    tabContent = `
    <p class="form-help" style="margin-bottom:1.5rem;">Manage your social media links displayed in the footer.</p>
    <div id="social-links-container">
      ${social.map((s, i) => socialRow(s, i)).join('')}
    </div>
    <button type="button" class="btn btn-ghost btn-sm" id="sc-add-social" style="margin-bottom:1rem;">+ Add Social Link</button>
    `;
  }

  el.innerHTML = `<div class="admin-card"><div class="admin-card__header" style="margin-bottom: 0;">
    <h3 class="admin-card__title">Site Configuration</h3>
  </div>
  <div class="admin-tabs" style="margin-top:1rem;margin-bottom:1.5rem;">
    <button type="button" class="admin-tab ${currentTab==='site-config'?'active':''}" onclick="window.location.hash='site-config'">General Settings</button>
    <button type="button" class="admin-tab ${currentTab==='seo'?'active':''}" onclick="window.location.hash='seo'">SEO & Sharing</button>
    <button type="button" class="admin-tab ${currentTab==='ui-text'?'active':''}" onclick="window.location.hash='ui-text'">UI Text & Labels</button>
    <button type="button" class="admin-tab ${currentTab==='social'?'active':''}" onclick="window.location.hash='social'">Social Media</button>
  </div>
  <form id="sc-form" class="admin-form">
    ${tabContent}
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save Configuration</button></div>
  </form></div>`;

  el.querySelector('#sc-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = { ...config };
      if (currentTab === 'site-config') {
        payload.branding = { companyName: el.querySelector('#sc-name').value, logoUrl: el.querySelector('#sc-logo').value, tagline: el.querySelector('#sc-tagline').value };
        payload.contact = { phonePrimary: el.querySelector('#sc-phone1').value, phoneSecondary: el.querySelector('#sc-phone2').value, emailPrimary: el.querySelector('#sc-email1').value, emailSales: el.querySelector('#sc-email2').value, addressFull: el.querySelector('#sc-address').value, mapEmbedUrl: el.querySelector('#sc-map').value, officeHours: el.querySelector('#sc-hours').value };
        payload.whatsapp = { phone: el.querySelector('#sc-wa-phone').value, message: el.querySelector('#sc-wa-msg').value };
        payload.rera = { companyRegNumber: el.querySelector('#sc-rera').value, disclaimerText: el.querySelector('#sc-rera-text').value };
        payload.analytics = { ga4Id: el.querySelector('#sc-ga4').value };
        payload.copyright = el.querySelector('#sc-copyright').value;
      } else if (currentTab === 'seo') {
        payload.pageSeo = payload.pageSeo || {};
        ['home', 'about', 'contact', 'projects'].forEach(p => {
          payload.pageSeo[p] = {
            title: el.querySelector(`#seo-${p}-title`).value,
            metaDescription: el.querySelector(`#seo-${p}-desc`).value,
            ogImage: el.querySelector(`#seo-${p}-img`).value
          };
        });
      } else if (currentTab === 'ui-text') {
        payload.uiStrings = payload.uiStrings || {};
        ['aboutHeroOverline', 'aboutTeamOverline', 'aboutCtaTitle', 'aboutCtaSubtext', 'aboutCtaPrimaryText', 'aboutCtaPrimaryLink', 'aboutCtaSecondaryText', 'aboutCtaSecondaryLink', 'contactHeroTitle', 'contactHeroSubtext', 'contactFormTitle', 'projectsSectionTitle', 'projectsSectionSubtitle', 'projectsEmptyText', 'projectsViewAllText', 'propertyEnquirePrefix', 'legalFallbackText'].forEach(key => {
          payload.uiStrings[key] = el.querySelector(`#ui-${key}`).value;
        });
      } else if (currentTab === 'social') {
        const rows = el.querySelectorAll('.social-link-row');
        payload.social = Array.from(rows).map(r => ({
          platform: r.querySelector('.sl-platform')?.value || '',
          url: r.querySelector('.sl-url')?.value || '',
          icon: r.querySelector('.sl-icon')?.value || '',
          sortOrder: parseInt(r.querySelector('.sl-order')?.value) || 0,
        })).filter(s => s.platform && s.url);
      }
      
      await apiFetch('/site-config', { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Configuration saved', 'success');
      config = await apiFetch('/site-config');
    } catch (e) { showToast(e.message, 'error'); }
  });

  if (currentTab === 'social') {
    let nextIdx = config.social?.length || 0;
    el.querySelector('#sc-add-social')?.addEventListener('click', () => {
      el.querySelector('#social-links-container').insertAdjacentHTML('beforeend', socialRow({}, nextIdx++));
    });
    el.addEventListener('click', e => {
      if (e.target.classList.contains('btn-del-social')) {
        e.target.closest('.social-link-row').remove();
      }
    });
  }
}

function socialRow(s, i) {
  return `<div class="social-link-row form-row" style="margin-bottom:0.5rem;align-items:end;position:relative;padding-right:4rem;">
    <div class="form-group" style="margin-bottom:0;"><label>Platform (e.g. Facebook)</label><input type="text" class="sl-platform" value="${s.platform || ''}"></div>
    <div class="form-group" style="margin-bottom:0;"><label>URL</label><input type="text" class="sl-url" value="${s.url || ''}"></div>
    <div class="form-group" style="margin-bottom:0;width:120px;"><label>Icon Key</label><input type="text" class="sl-icon" value="${s.icon || ''}" placeholder="facebook, etc"></div>
    <div class="form-group" style="margin-bottom:0;width:80px;"><label>Order</label><input type="number" class="sl-order" value="${s.sortOrder ?? i}"></div>
    <button type="button" class="btn btn-ghost btn-sm btn-del-social" style="position:absolute;right:0;bottom:0;color:var(--color-error);">Del</button>
  </div>`;
}
