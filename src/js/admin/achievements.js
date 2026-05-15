const { apiFetch, setTitle, showToast } = window.__admin;

export async function render(el) {
  setTitle('Achievements');
  let items = [];
  try { items = await apiFetch('/achievements'); } catch {}
  el.innerHTML = `<div class="admin-card"><div class="admin-card__header">
    <h3 class="admin-card__title">Achievement Counters</h3>
  </div><form id="ach-form" class="admin-form">
    ${items.map((a, i) => `<div class="admin-card" style="margin-bottom:1rem;padding:1rem;">
      <div class="form-row">
        <div class="form-group"><label>Icon</label><input type="text" class="ach-icon" value="${a.icon || ''}" data-id="${a._id}"></div>
        <div class="form-group"><label>Label</label><input type="text" class="ach-label" value="${a.label || ''}" data-id="${a._id}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Value</label><input type="number" class="ach-value" value="${a.value || 0}" data-id="${a._id}"></div>
        <div class="form-group"><label>Suffix</label><input type="text" class="ach-suffix" value="${a.suffix || ''}" data-id="${a._id}"></div>
      </div>
      <div class="form-group"><label>Sort Order</label><input type="number" class="ach-order" value="${a.sortOrder ?? i}" data-id="${a._id}"></div>
    </div>`).join('')}
    <div class="admin-form-actions"><button type="submit" class="btn btn-primary">Save All</button></div>
  </form></div>`;

  el.querySelector('#ach-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const achievements = items.map(a => ({
      _id: a._id,
      icon: el.querySelector(`.ach-icon[data-id="${a._id}"]`)?.value,
      label: el.querySelector(`.ach-label[data-id="${a._id}"]`)?.value,
      value: parseInt(el.querySelector(`.ach-value[data-id="${a._id}"]`)?.value) || 0,
      suffix: el.querySelector(`.ach-suffix[data-id="${a._id}"]`)?.value,
      sortOrder: parseInt(el.querySelector(`.ach-order[data-id="${a._id}"]`)?.value) || 0,
    }));
    try { await apiFetch('/achievements', { method: 'PUT', body: JSON.stringify({ achievements }) }); showToast('Saved', 'success'); }
    catch (e) { showToast(e.message, 'error'); }
  });
}
