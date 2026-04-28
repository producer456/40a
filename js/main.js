import { state } from './state.js';
import { storage } from './storage.js';
import { loadDisease } from './data/loader.js';
import { mountTabs } from './views/tabs.js';
import { mountControls } from './views/controls.js';
import { mountBodyChart } from './views/body-chart.js';
import { mountInfoPanel } from './views/info-panel.js';
import { mountHistology } from './views/histology.js';
import { mountGlossary } from './views/glossary.js';
import { mountQuiz } from './views/quiz.js';
import { mountModal } from './views/modal.js';

const params = new URLSearchParams(location.search);
const id = params.get('disease') ?? 'at-totalis';

loadDisease(id).then(disease => {
  const saved = storage.loadProgress(id);
  state.set({
    disease,
    revealedTerms: new Set(saved?.revealedTerms ?? [])
  });

  document.title = `${disease.title} — Bio 40A`;
  document.getElementById('disease-title').textContent = disease.title;
  document.getElementById('disease-subtitle').textContent = disease.subtitle;

  mountTabs(document.querySelector('.tabs'));
  mountControls(document.querySelector('.controls'));
  mountBodyChart(document.getElementById('body-chart'), disease);
  mountInfoPanel(document.getElementById('info-panel'), disease);
  mountHistology(document.getElementById('histology'), disease);
  mountGlossary(document.getElementById('glossary'), disease);
  mountQuiz(document.getElementById('quiz'), disease);
  mountModal(document.getElementById('modal-root'));

  state.subscribe(({ revealedTerms }) => {
    storage.saveProgress(id, { revealedTerms: [...revealedTerms] });
  });
}).catch(err => {
  console.error(err);
  document.getElementById('disease-title').textContent = 'Error';
  const root = document.getElementById('study-root');
  if (root) {
    root.innerHTML = `
      <div class="panel" style="max-width: 700px; margin: 0 auto;">
        <div class="panel__content">
          <div class="panel__label">Failed to load disease "${id}"</div>
          <pre style="font-family: var(--font-mono); font-size: 11px; white-space: pre-wrap; margin-top: 8px;">${err.message}</pre>
        </div>
      </div>`;
  }
});
