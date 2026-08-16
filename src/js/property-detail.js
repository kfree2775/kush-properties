/**
 * KushProperties — Property Detail Page
 * Gallery, lightbox, specs, amenities, map, similar projects, enquiry.
 */
import { fetchProjectBySlug, isPreviewMode, fetchPreviewProject, getStatusBadgeClass, getStatusText, submitLead, showToast } from './api.js';
import { refreshScrollAnimations } from './scroll-animations.js';

let currentProject = null;
let galleryImages = [];
let lightboxIndex = 0;

export function initPropertyDetail() {
  const main = document.getElementById('property-content');
  if (!main) return;
  const slug = window.location.pathname.split('/property/')[1];
  if (!slug) { main.innerHTML = errHTML('Property not found'); return; }
  loadProperty(slug, main);
}

async function loadProperty(slug, el) {
  el.innerHTML = '<div class="loading-overlay" style="min-height:60vh;"><div class="loading-spinner"></div></div>';
  try {
    const p = isPreviewMode() ? await fetchPreviewProject(slug) : await fetchProjectBySlug(slug);
    currentProject = p;
    galleryImages = [];
    if (p.coverImage?.url) galleryImages.push({ url: p.coverImage.url, caption: p.name });
    (p.images || []).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)).forEach(img => {
      if (img.url && img.url !== p.coverImage?.url) galleryImages.push({ url: img.url, caption: img.caption||'' });
    });
    render(el, p);
    bindEvents();
    refreshScrollAnimations();
  } catch (e) { el.innerHTML = errHTML(e.message||'Failed to load'); }
}

function errHTML(msg) {
  return `<div class="property-detail" style="padding-top:var(--navbar-height);"><div class="empty-state" style="min-height:60vh;"><div class="empty-state__icon">🏠</div><p class="empty-state__title">${msg}</p><a href="/projects" class="btn btn-primary" style="margin-top:1rem;">Browse Projects</a></div></div>`;
}

function render(el, p) {
  const sc = getStatusBadgeClass(p.status), st = getStatusText(p.status);
  const cover = galleryImages[0]?.url||'';
  const specs = p.specs||{};
  const si = [];
  if(specs.bedrooms) si.push({v:specs.bedrooms,l:'Configuration'});
  if(specs.area) si.push({v:specs.area,l:'Area'});
  if(specs.floors) si.push({v:specs.floors,l:'Floors'});
  if(specs.possessionDate) si.push({v:specs.possessionDate,l:'Possession'});
  if(specs.totalUnits) si.push({v:specs.totalUnits+' Units',l:'Total Units'});
  let mapUrl='';
  if(p.coordinates?.lat&&p.coordinates?.lng) mapUrl=`https://maps.google.com/maps?q=${p.coordinates.lat},${p.coordinates.lng}&output=embed`;
  else if(p.location) mapUrl=`https://maps.google.com/maps?q=${encodeURIComponent(p.location)}&output=embed`;
  const sim = p.similarProjects||[];

  const uiStrings = window.uiStrings || {};
  el.innerHTML = `<div class="property-detail">
    <div class="property-gallery">
      <div class="property-gallery__main" id="gallery-main">${cover?`<img src="${cover}" alt="${p.name}" id="gallery-main-img">`:'<div class="img-placeholder" style="height:100%;">No Images</div>'}</div>
      ${galleryImages.length>1?`<div class="property-gallery__thumbs" id="gallery-thumbs">${galleryImages.map((img,i)=>`<div class="property-gallery__thumb ${i===0?'active':''}" data-index="${i}"><img src="${img.url}" alt="${img.caption||''}" loading="lazy"></div>`).join('')}</div><div class="property-gallery__count" id="gallery-count">📷 View All ${galleryImages.length} Photos</div>`:''}
    </div>
    <section class="property-header"><div class="container">
      <div class="property-header__top">
        <div class="property-header__info">
          ${p.status!=='active'?`<span class="badge ${sc} property-header__badge">${st}</span>`:''}
          <h1 class="property-header__name">${p.name}</h1>
          <div class="property-header__location"><span class="property-header__location-icon">📍</span>${p.location||'Pune, Maharashtra'}</div>
          <div class="property-header__price">${p.priceRange||''}</div>
          ${p.reraNumber?`<div class="property-header__rera">RERA: ${p.reraNumber}</div>`:''}
        </div>
        <div class="property-header__actions">
          <button class="btn btn-primary btn-lg" id="enquire-btn">Enquire Now</button>
          <a href="/contact" class="btn btn-secondary">Schedule Site Visit</a>
        </div>
      </div>
      ${si.length?`<div class="property-specs" data-animate="fade-up">${si.map(s=>`<div class="property-spec"><div class="property-spec__value">${s.v}</div><div class="property-spec__label">${s.l}</div></div>`).join('')}</div>`:''}
      <div class="property-content">
        <div class="property-description" data-animate="fade-up"><h2>About This Project</h2><div class="property-description__text">${p.description||'<p>Details coming soon.</p>'}</div></div>
        ${p.amenities?.length?`<div class="property-amenities" data-animate="fade-up"><h2>Amenities</h2><div class="property-amenities__grid">${p.amenities.map(a=>`<div class="property-amenity"><span class="property-amenity__icon">✓</span>${a}</div>`).join('')}</div></div>`:''}
      </div>
      ${mapUrl?`<div class="property-map" data-animate="fade-up"><h2>Location</h2><div class="property-map__embed"><iframe src="${mapUrl}" allowfullscreen loading="lazy" title="Location"></iframe></div></div>`:''}
    </div></section>
    ${sim.length?`<section class="property-similar"><div class="container"><h2>Similar Projects</h2><div class="projects__grid" data-animate-stagger>${sim.map(s=>cardHTML(s)).join('')}</div></div></section>`:''}
  </div>
  <div class="lightbox" id="lightbox"><button class="lightbox__close" id="lightbox-close">✕</button><div class="lightbox__counter" id="lightbox-counter"></div><button class="lightbox__nav lightbox__nav--prev" id="lightbox-prev">‹</button><img class="lightbox__image" id="lightbox-img" src="" alt=""><button class="lightbox__nav lightbox__nav--next" id="lightbox-next">›</button><div class="lightbox__caption" id="lightbox-caption"></div></div>
  <div class="lightbox" id="enquiry-modal" style="display:none;"><div class="glass" style="max-width:450px;width:90%;padding:2.5rem;border-radius:var(--radius-xl);position:relative;"><button class="lightbox__close" id="enquiry-close" style="top:1rem;right:1rem;">✕</button><h2 style="font-size:var(--text-h3);margin-bottom:0.5rem;">${uiStrings.propertyEnquirePrefix || 'Enquire About'}</h2><p class="text-gold" style="margin-bottom:1.5rem;">${p.name}</p><form id="enquiry-form"><div class="form-group"><input type="text" id="enquiry-name" placeholder="Full Name *" required></div><div class="form-group"><input type="email" id="enquiry-email" placeholder="Email Address"></div><div class="form-group"><input type="tel" id="enquiry-phone" placeholder="+91 Mobile Number *" required></div><div class="form-group" style="display:flex;gap:0.5rem;align-items:flex-start;"><input type="checkbox" id="enquiry-tc" required style="width:auto;margin-top:4px;"><label for="enquiry-tc" style="font-size:var(--text-body-sm);color:var(--color-on-surface-variant);cursor:pointer;">I agree to the <a href="/terms" target="_blank" style="color:var(--color-primary);">Terms & Conditions</a></label></div><button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Submit Enquiry</button></form><div id="enquiry-success" class="form-success" style="display:none;margin-top:1rem;"></div></div></div>`;
}

function cardHTML(p) {
  const c=p.coverImage?.url||'', sc=getStatusBadgeClass(p.status), st=getStatusText(p.status);
  return `<a href="/property/${p.slug}" class="project-card"><div class="project-card__image img-zoom">${c?`<img src="${c}" alt="${p.name}" loading="lazy">`:'<div class="img-placeholder" style="height:100%;">No Image</div>'}${p.status!=='active'?`<span class="badge ${sc} project-card__badge">${st}</span>`:''}</div><div class="project-card__body"><h3 class="project-card__name">${p.name}</h3><div class="project-card__location"><span class="project-card__location-icon">📍</span>${p.location||'Pune'}</div><div class="project-card__footer"><span class="project-card__price">${p.priceRange||''}</span><span class="project-card__cta">View Details →</span></div></div></a>`;
}

function bindEvents() {
  document.querySelectorAll('.property-gallery__thumb').forEach(t => t.addEventListener('click',()=>{
    const i=parseInt(t.dataset.index); setMain(i);
  }));
  document.getElementById('gallery-main')?.addEventListener('click',()=>openLB(0));
  document.getElementById('gallery-count')?.addEventListener('click',()=>openLB(0));
  document.getElementById('lightbox-close')?.addEventListener('click',closeLB);
  document.getElementById('lightbox-prev')?.addEventListener('click',()=>navLB(-1));
  document.getElementById('lightbox-next')?.addEventListener('click',()=>navLB(1));
  document.getElementById('lightbox')?.addEventListener('click',e=>{if(e.target.id==='lightbox')closeLB();});
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('lightbox')?.classList.contains('open'))return;
    if(e.key==='Escape')closeLB();if(e.key==='ArrowLeft')navLB(-1);if(e.key==='ArrowRight')navLB(1);
  });
  document.getElementById('enquire-btn')?.addEventListener('click',()=>{
    const m=document.getElementById('enquiry-modal');if(m){m.style.display='flex';requestAnimationFrame(()=>m.classList.add('open'));document.body.style.overflow='hidden';}
  });
  document.getElementById('enquiry-close')?.addEventListener('click',closeEnq);
  document.getElementById('enquiry-modal')?.addEventListener('click',e=>{if(e.target.id==='enquiry-modal')closeEnq();});
  document.getElementById('enquiry-form')?.addEventListener('submit',handleEnq);
}

function setMain(i){const img=document.getElementById('gallery-main-img');if(img&&galleryImages[i])img.src=galleryImages[i].url;document.querySelectorAll('.property-gallery__thumb').forEach((t,j)=>t.classList.toggle('active',j===i));}
function openLB(i){if(!galleryImages.length)return;lightboxIndex=i;updLB();document.getElementById('lightbox')?.classList.add('open');document.body.style.overflow='hidden';}
function closeLB(){document.getElementById('lightbox')?.classList.remove('open');document.body.style.overflow='';}
function navLB(d){lightboxIndex+=d;if(lightboxIndex<0)lightboxIndex=galleryImages.length-1;if(lightboxIndex>=galleryImages.length)lightboxIndex=0;updLB();}
function updLB(){const img=document.getElementById('lightbox-img'),cap=document.getElementById('lightbox-caption'),cnt=document.getElementById('lightbox-counter');if(img&&galleryImages[lightboxIndex])img.src=galleryImages[lightboxIndex].url;if(cap)cap.textContent=galleryImages[lightboxIndex]?.caption||'';if(cnt)cnt.textContent=`${lightboxIndex+1} / ${galleryImages.length}`;}
function closeEnq(){const m=document.getElementById('enquiry-modal');if(m){m.classList.remove('open');setTimeout(()=>{m.style.display='none';},300);document.body.style.overflow='';}}
async function handleEnq(e){
  e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent='Submitting...';
  try{
    await submitLead({fullName:document.getElementById('enquiry-name').value,email:document.getElementById('enquiry-email').value,phone:document.getElementById('enquiry-phone').value,agreedTc:document.getElementById('enquiry-tc').checked,propertyInterest:currentProject?._id,source:'property_enquiry'});
    e.target.style.display='none';const s=document.getElementById('enquiry-success');s.textContent='Thank you! Our team will contact you shortly.';s.style.display='block';setTimeout(closeEnq,3000);
  }catch(err){showToast(err.message||'Failed to submit.','error');btn.disabled=false;btn.textContent='Submit Enquiry';}
}
