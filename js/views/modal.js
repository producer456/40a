import { state } from '../state.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

let overlayEl, contentEl;

export function mountModal(rootEl) {
  rootEl.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__inner">
          <button class="modal__close" aria-label="Close">×</button>
          <div class="modal__content"></div>
        </div>
      </div>
    </div>
  `;

  overlayEl = rootEl.querySelector('.modal-overlay');
  contentEl = rootEl.querySelector('.modal__content');

  rootEl.querySelector('.modal__close').addEventListener('click', closeTermModal);
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeTermModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayEl.classList.contains('modal-overlay--active')) {
      closeTermModal();
    }
  });
}

export function showTermModal(termName) {
  const disease = state.get().disease;
  if (!disease) return;
  const term = disease.allTerms.find(t => t.name === termName);
  if (!term) return;

  const regionList = term.regions.map(r => disease.regionLabels[r] ?? r).join(' · ');
  const definitionBlock = term.definition
    ? `<div class="info-panel__meta">Definition</div>
       <div class="modal__definition">${escapeHtml(term.definition)}</div>`
    : '';
  const symptomBlock = term.symptom
    ? `<div class="info-panel__meta">Patient Experience</div>
       <div class="modal__symptom">${escapeHtml(term.symptom)}</div>`
    : '';
  const platesBlock = renderRelevantPlates(disease, termName);
  contentEl.innerHTML = `
    <div class="info-panel__meta">${escapeHtml(term.groupTitle)}</div>
    <div class="info-panel__header">${escapeHtml(term.name)}</div>
    ${definitionBlock}
    <div class="info-panel__meta">In this disease</div>
    <div class="modal__desc">${escapeHtml(term.desc)}</div>
    ${symptomBlock}
    <div class="info-panel__meta">Affected Regions</div>
    <div class="modal__regions">${escapeHtml(regionList)}</div>
    ${platesBlock}
  `;
  contentEl.querySelectorAll('.term-plate__image').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fb = img.nextElementSibling;
      if (fb) fb.style.display = 'block';
    });
  });
  overlayEl.classList.add('modal-overlay--active');
}

// Shared helper — also used by the info-panel's single-term view.
// Returns HTML for any histology plate(s) that contain this term, so
// the user sees the underlying anatomy without leaving the term view.
export function renderRelevantPlates(disease, termName) {
  const plates = (disease.histologyPlates ?? [])
    .filter(p => Array.isArray(p.terms) && p.terms.includes(termName));
  if (plates.length === 0) return '';
  return `
    <div class="info-panel__meta">Visible in</div>
    <div class="term-plates">
      ${plates.map(p => {
        const fallback = p.fallbackText || p.sourceUrl;
        return `
          <figure class="term-plate">
            <div class="term-plate__frame">
              <img class="term-plate__image" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.imageAlt)}" loading="lazy">
              <div class="term-plate__fallback">Image failed to load.<br>Visit: ${escapeHtml(fallback)}</div>
            </div>
            <figcaption class="term-plate__caption">
              <span class="term-plate__number">Plate ${escapeHtml(p.number)}</span>
              <span class="term-plate__title">${escapeHtml(p.title)}</span>
            </figcaption>
          </figure>
        `;
      }).join('')}
    </div>
  `;
}

export function closeTermModal() {
  overlayEl?.classList.remove('modal-overlay--active');
}
