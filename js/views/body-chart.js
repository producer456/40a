import { state } from '../state.js';
import { BODY_FIGURES } from '../svg/body-male-anterior.js';

export function mountBodyChart(mountEl, disease) {
  const figure = BODY_FIGURES[disease.bodyFigure] ?? BODY_FIGURES['male-anterior'];
  mountEl.innerHTML = figure;

  mountEl.querySelectorAll('.body-region').forEach(el => {
    el.addEventListener('click', () => {
      state.set({ activeRegion: el.dataset.region, activeTerm: null });
    });
  });

  const termIndex = new Map(disease.allTerms.map(t => [t.name, t]));

  state.subscribe(({ activeRegion, activeTerm }) => {
    const highlighted = new Set();
    if (activeRegion) {
      highlighted.add(activeRegion);
    } else if (activeTerm) {
      const term = termIndex.get(activeTerm);
      if (term) term.regions.forEach(r => highlighted.add(r));
    }
    mountEl.querySelectorAll('.body-region').forEach(el => {
      el.classList.toggle('body-region--active', highlighted.has(el.dataset.region));
    });
  });
}
