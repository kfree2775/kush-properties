const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Navbar Config');
  let config = {};
  try { config = await apiFetch('/navbar'); } catch {}
  const links = config.links || [];
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Navbar Configuration</h3>
  </div><form id="nav-form" class="admin-form">
    <div class="form-row">
      <div class="form-group"><label>CTA Text</label><input type="text" id="nf-cta" value="${config.ctaText || ''}"></div>
      <div class="form-group"><label>CTA Phone</label><input type="text" id="nf-phone" value="${config.ctaPhone || ''}"></div>
    </div>
    <h4 style="margin:1rem 0;color:var(--color-primary);">Navigation Links</h4>
    <div id="nf-links">${links.map((l, i) => linkRow(l, i)).join('')}</div>
    <button type="button" class="btn btn-ghost btn-sm" id="nf-add" style="margin:0.5rem 0 1rem;">+ Add Link</button>
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save</button></div>
  </form></div>`;

  let idx = links.length;
  el.querySelector('#nf-add')?.addEventListener('click', () => {
    el.querySelector('#nf-links').insertAdjacentHTML('beforeend', linkRow({}, idx++));
  });

  el.querySelector('#nav-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rows = el.querySelectorAll('.nf-link-row');
    const newLinks = Array.from(rows).map(r => ({
      label: r.querySelector('.nf-l-label')?.value || '',
      href: r.querySelector('.nf-l-href')?.value || '',
      sortOrder: parseInt(r.querySelector('.nf-l-order')?.value) || 0,
      isExternal: r.querySelector('.nf-l-ext')?.checked || false,
    })).filter(l => l.label && l.href);
    try {
      await apiFetch('/navbar', { method: 'PUT', body: JSON.stringify({
        ctaText: el.querySelector('#nf-cta').value, ctaPhone: el.querySelector('#nf-phone').value, links: newLinks,
      })});
      showToast('Saved', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  });
}

function linkRow(l, i) {
  return `<div class="nf-link-row form-row" style="margin-bottom:0.5rem;align-items:end;">
    <div class="form-group" style="margin-bottom:0;"><label>Label</label><input type="text" class="nf-l-label" value="${l.label || ''}"></div>
    <div class="form-group" style="margin-bottom:0;"><label>Href</label><input type="text" class="nf-l-href" value="${l.href || ''}"></div>
    <div class="form-group" style="margin-bottom:0;width:80px;"><label>Order</label><input type="number" class="nf-l-order" value="${l.sortOrder ?? i}"></div>
    <div class="form-group" style="margin-bottom:0;width:60px;"><label>Ext</label><input type="checkbox" class="nf-l-ext" ${l.isExternal?'checked':''} style="width:auto;"></div>
  </div>`;
}
