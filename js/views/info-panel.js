import { state } from '../state.js';
import { renderRelevantPlates } from './modal.js';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function mountInfoPanel(mountEl, disease) {
  const termIndex = new Map(disease.allTerms.map(t => [t.name, t]));

  const render = (s) => {
    const { activeRegion, activeTerm, mode, revealedTerms, expandedGroups } = s;
    const isQuiz = mode === 'quiz';
    const isVisible = (name) => !isQuiz || revealedTerms.has(name);

    let html = '';

    if (activeRegion) {
      const groups = disease.symptomGroups.filter(g => g.regions.includes(activeRegion));
      html += `<div class="info-panel__header">${escapeHtml(disease.regionLabels[activeRegion] ?? activeRegion)}</div>`;
      html += `<div class="info-panel__meta">${groups.length} symptom${groups.length === 1 ? '' : 's'} — tap a card for the underlying anatomy</div>`;
      if (isQuiz) html += `<div class="quiz-prompt">Quiz mode · Click any term to reveal description</div>`;
      groups.forEach(g => {
        // All terms in a group share the same patient experience —
        // pull it from the first term that has one.
        const groupSymptom = g.terms.find(t => t.symptom)?.symptom;
        const isExpanded = expandedGroups.has(g.id);

        let body;
        if (!isExpanded) {
          // Collapsed: just the patient-facing symptom.  No anatomy
          // detail until the user asks for it.
          body = groupSymptom
            ? `<div class="symptom-group__symptom">${escapeHtml(groupSymptom)}</div>`
            : `<div class="symptom-group__symptom">${escapeHtml(g.desc)}</div>`;
        } else {
          // Expanded: clinical desc + the histology term list.
          let termsHtml = '';
          g.terms.forEach(t => {
            termsHtml += `<div class="term-item" data-term="${escapeHtml(t.name)}">
              <div class="term-item__name">${escapeHtml(t.name)}</div>
              <div class="term-item__desc${isVisible(t.name) ? '' : ' term-item__desc--hidden'}">${escapeHtml(t.desc)}</div>
            </div>`;
          });
          body = (groupSymptom ? `<div class="symptom-group__symptom">${escapeHtml(groupSymptom)}</div>` : '')
               + `<div class="symptom-group__desc">${escapeHtml(g.desc)}</div>`
               + `<div class="term-list">${termsHtml}</div>`;
        }

        html += `<div class="symptom-group${isExpanded ? ' symptom-group--expanded' : ''}">
          <div class="symptom-group__header" data-group="${escapeHtml(g.id)}">
            <div class="symptom-group__title">${escapeHtml(g.title)}</div>
            <span class="symptom-group__chevron">${isExpanded ? '▾' : '▸'}</span>
          </div>
          ${body}
        </div>`;
      });
    } else if (activeTerm) {
      const term = termIndex.get(activeTerm);
      if (term) {
        const regionList = term.regions.map(r => disease.regionLabels[r] ?? r).join(' · ');
        const prev = s.previousRegion;
        if (prev) {
          const prevLabel = disease.regionLabels[prev] ?? prev;
          html += `<button class="info-panel__back" data-back-to-region="${escapeHtml(prev)}">← Back to ${escapeHtml(prevLabel)}</button>`;
        }
        html += `<div class="info-panel__header">${escapeHtml(term.name)}</div>`;
        html += `<div class="info-panel__meta">${escapeHtml(term.groupTitle)}</div>`;
        if (isQuiz) html += `<div class="quiz-prompt">Quiz mode · Click the term to reveal description</div>`;
        if (term.definition) {
          html += `<div class="info-panel__meta">Definition</div>
            <div class="modal__definition">${escapeHtml(term.definition)}</div>`;
        }
        html += `<div class="info-panel__meta">In this disease</div>
          <div class="term-item term-item--active" data-term="${escapeHtml(term.name)}">
            <div class="term-item__desc${isVisible(term.name) ? '' : ' term-item__desc--hidden'}">${escapeHtml(term.desc)}</div>
          </div>`;
        if (term.symptom) {
          html += `<div class="info-panel__meta">Patient Experience</div>
            <div class="modal__symptom">${escapeHtml(term.symptom)}</div>`;
        }
        html += `<div class="info-panel__section">
          <div class="info-panel__meta">Affected Regions</div>
          <div class="info-panel__regions">${escapeHtml(regionList)}</div>
        </div>`;
        html += renderRelevantPlates(disease, term.name);
      }
    } else {
      html += `<div class="empty-state">
        Click any anatomical region on the figure<br>
        or select a term below to see connections.
      </div>`;
    }

    mountEl.innerHTML = html;

    mountEl.querySelectorAll('.term-item').forEach(el => {
      el.addEventListener('click', (e) => {
        // Don't bubble — would also collapse the parent symptom group.
        e.stopPropagation();
        const termName = el.dataset.term;
        if (state.get().mode === 'quiz') {
          const next = new Set(state.get().revealedTerms);
          if (next.has(termName)) next.delete(termName);
          else next.add(termName);
          state.set({ revealedTerms: next });
        } else {
          // Stash the region we're leaving so the term view can
          // offer a back button.
          const cur = state.get();
          state.set({
            activeTerm: termName,
            activeRegion: null,
            previousRegion: cur.activeRegion ?? cur.previousRegion ?? null
          });
        }
      });
    });

    // Symptom-group header → toggle expanded state.
    mountEl.querySelectorAll('.symptom-group__header').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.group;
        const next = new Set(state.get().expandedGroups);
        if (next.has(id)) next.delete(id); else next.add(id);
        state.set({ expandedGroups: next });
      });
    });

    // Back button on the single-term view → return to the region
    // we were exploring before drilling in.
    mountEl.querySelectorAll('.info-panel__back').forEach(el => {
      el.addEventListener('click', () => {
        state.set({
          activeRegion: el.dataset.backToRegion,
          activeTerm: null,
          previousRegion: null
        });
      });
    });

    // Inline plate thumbnails — swap in the fallback if the image
    // fails to load (matches the histology-tab error handling).
    mountEl.querySelectorAll('.term-plate__image').forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const fb = img.nextElementSibling;
        if (fb) fb.style.display = 'block';
      });
    });
  };

  state.subscribe(render);
  render(state.get());
}
