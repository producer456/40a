import { state } from '../state.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function mountInfoPanel(mountEl, disease) {
  const termIndex = new Map(disease.allTerms.map(t => [t.name, t]));

  const render = (s) => {
    const { activeRegion, activeTerm, mode, revealedTerms } = s;
    const isQuiz = mode === 'quiz';
    const isVisible = (name) => !isQuiz || revealedTerms.has(name);

    let html = '';

    if (activeRegion) {
      const groups = disease.symptomGroups.filter(g => g.regions.includes(activeRegion));
      const totalTerms = groups.reduce((acc, g) => acc + g.terms.length, 0);
      html += `<div class="info-panel__header">${escapeHtml(disease.regionLabels[activeRegion] ?? activeRegion)}</div>`;
      html += `<div class="info-panel__meta">${groups.length} symptom group${groups.length === 1 ? '' : 's'} · ${totalTerms} terms</div>`;
      if (isQuiz) html += `<div class="quiz-prompt">Quiz mode · Click any term to reveal description</div>`;
      groups.forEach(g => {
        html += `<div class="symptom-group">
          <div class="symptom-group__title">${escapeHtml(g.title)}</div>
          <div class="symptom-group__desc">${escapeHtml(g.desc)}</div>
          <div class="term-list">`;
        g.terms.forEach(t => {
          html += `<div class="term-item" data-term="${escapeHtml(t.name)}">
            <div class="term-item__name">${escapeHtml(t.name)}</div>
            <div class="term-item__desc${isVisible(t.name) ? '' : ' term-item__desc--hidden'}">${escapeHtml(t.desc)}</div>
          </div>`;
        });
        html += `</div></div>`;
      });
    } else if (activeTerm) {
      const term = termIndex.get(activeTerm);
      if (term) {
        const regionList = term.regions.map(r => disease.regionLabels[r] ?? r).join(' · ');
        html += `<div class="info-panel__header">${escapeHtml(term.name)}</div>`;
        html += `<div class="info-panel__meta">${escapeHtml(term.groupTitle)}</div>`;
        if (isQuiz) html += `<div class="quiz-prompt">Quiz mode · Click the term to reveal description</div>`;
        html += `<div class="term-item term-item--active" data-term="${escapeHtml(term.name)}">
          <div class="term-item__name">${escapeHtml(term.name)}</div>
          <div class="term-item__desc${isVisible(term.name) ? '' : ' term-item__desc--hidden'}">${escapeHtml(term.desc)}</div>
        </div>`;
        html += `<div class="info-panel__section">
          <div class="info-panel__meta">Affected Regions</div>
          <div class="info-panel__regions">${escapeHtml(regionList)}</div>
        </div>`;
      }
    } else {
      html += `<div class="empty-state">
        Click any anatomical region on the figure<br>
        or select a term below to see connections.
      </div>`;
    }

    html += `<div class="info-panel__section">
      <div class="info-panel__meta">All ${disease.allTerms.length} Terms${(activeRegion || activeTerm) ? '' : ' · Click to highlight regions'}</div>
      <div class="all-terms">`;
    disease.allTerms.forEach(t => {
      const cls = 'term-chip' + (t.name === activeTerm ? ' term-chip--active' : '');
      html += `<button class="${cls}" data-term="${escapeHtml(t.name)}">${escapeHtml(t.name)}</button>`;
    });
    html += `</div></div>`;

    mountEl.innerHTML = html;

    mountEl.querySelectorAll('.term-chip').forEach(el => {
      el.addEventListener('click', () => {
        state.set({ activeTerm: el.dataset.term, activeRegion: null });
      });
    });

    mountEl.querySelectorAll('.term-item').forEach(el => {
      el.addEventListener('click', () => {
        const termName = el.dataset.term;
        if (state.get().mode === 'quiz') {
          const next = new Set(state.get().revealedTerms);
          if (next.has(termName)) next.delete(termName);
          else next.add(termName);
          state.set({ revealedTerms: next });
        } else {
          state.set({ activeTerm: termName, activeRegion: null });
        }
      });
    });
  };

  state.subscribe(render);
  render(state.get());
}
