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
  contentEl.innerHTML = `
    <div class="info-panel__meta">${escapeHtml(term.groupTitle)}</div>
    <div class="info-panel__header">${escapeHtml(term.name)}</div>
    ${definitionBlock}
    <div class="info-panel__meta">In this disease</div>
    <div class="modal__desc">${escapeHtml(term.desc)}</div>
    ${symptomBlock}
    <div class="info-panel__meta">Affected Regions</div>
    <div class="modal__regions">${escapeHtml(regionList)}</div>
  `;
  overlayEl.classList.add('modal-overlay--active');
}

export function closeTermModal() {
  overlayEl?.classList.remove('modal-overlay--active');
}
