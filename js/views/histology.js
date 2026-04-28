import { showTermModal } from './modal.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function mountHistology(mountEl, disease) {
  let html = '<div class="plates-grid">';
  disease.histologyPlates.forEach(p => {
    const fallback = p.fallbackText || p.sourceUrl;
    html += `<article class="plate">
      <div class="plate__content">
        <div class="plate__number">Plate ${escapeHtml(p.number)} · Public Domain · Gray's Anatomy 1918</div>
        <h2 class="plate__title">${escapeHtml(p.title)}</h2>
        <div class="plate__image-frame">
          <img class="plate__image" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.imageAlt)}" loading="lazy">
          <div class="plate__image-fallback">Image failed to load.<br>Visit: ${escapeHtml(fallback)}</div>
        </div>
        <p class="plate__caption">${escapeHtml(p.caption)}</p>
        <div class="plate__terms">
          <div class="plate__terms-label">Terms visible in this plate</div>
          ${p.terms.map(t => `<button class="plate-term" data-term="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}
        </div>
        <div class="plate__attribution">
          ${escapeHtml(p.attribution)}<br>
          Source: <a href="${escapeHtml(p.sourceUrl)}" target="_blank" rel="noreferrer">Wikimedia Commons</a>
        </div>
      </div>
    </article>`;
  });
  html += '</div>';
  mountEl.innerHTML = html;

  mountEl.querySelectorAll('.plate__image').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = img.nextElementSibling;
      if (fallback) fallback.style.display = 'block';
    });
  });

  mountEl.querySelectorAll('.plate-term').forEach(el => {
    el.addEventListener('click', () => showTermModal(el.dataset.term));
  });
}
