import { showTermModal } from './modal.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function mountGlossary(mountEl, disease) {
  // One row per unique term name; allTerms already carries groupTitle
  // and regions, plus desc/symptom/definition flowed through from JSON.
  const sorted = [...disease.allTerms].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
  );

  mountEl.innerHTML = `
    <div class="glossary">
      <div class="glossary__header">
        <div class="glossary__title">Glossary — All Terms</div>
        <input type="search" class="glossary__search" placeholder="Filter terms…" autocomplete="off">
      </div>
      <div class="glossary__count" data-count></div>
      <div class="glossary__list" data-list></div>
    </div>
  `;

  const listEl   = mountEl.querySelector('[data-list]');
  const countEl  = mountEl.querySelector('[data-count]');
  const searchEl = mountEl.querySelector('.glossary__search');

  const renderList = (filter = '') => {
    const needle = filter.trim().toLowerCase();
    const visible = needle
      ? sorted.filter(t =>
          t.name.toLowerCase().includes(needle)
          || (t.definition ?? '').toLowerCase().includes(needle)
          || (t.desc ?? '').toLowerCase().includes(needle))
      : sorted;

    countEl.textContent = needle
      ? `${visible.length} of ${sorted.length} terms`
      : `${sorted.length} terms`;

    listEl.innerHTML = visible.map(t => {
      // Show both the textbook definition (what the term IS in
      // general) AND the disease-context description (what it does
      // here).  Each is labeled so the student can tell them apart.
      const defBlock = t.definition
        ? `<div class="glossary__field">
             <span class="glossary__field-label">Definition</span>
             ${escapeHtml(t.definition)}
           </div>`
        : '';
      const descBlock = t.desc
        ? `<div class="glossary__field">
             <span class="glossary__field-label">In this disease</span>
             ${escapeHtml(t.desc)}
           </div>`
        : '';
      return `
        <button class="glossary__item" data-term="${escapeHtml(t.name)}">
          <div class="glossary__name">${escapeHtml(t.name)}</div>
          ${defBlock}
          ${descBlock}
          <div class="glossary__group">${escapeHtml(t.groupTitle)}</div>
        </button>
      `;
    }).join('');

    listEl.querySelectorAll('.glossary__item').forEach(el => {
      el.addEventListener('click', () => showTermModal(el.dataset.term));
    });
  };

  searchEl.addEventListener('input', (e) => renderList(e.target.value));
  renderList('');
}
