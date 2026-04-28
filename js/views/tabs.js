import { state } from '../state.js';

export function mountTabs(tabsEl) {
  tabsEl.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.set({ activeTab: btn.dataset.tab });
    });
  });

  const update = ({ activeTab }) => {
    tabsEl.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.toggle('tab--active', btn.dataset.tab === activeTab);
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('tab-panel--active', p.id === `panel-${activeTab}`);
    });
  };

  state.subscribe(update);
  update(state.get());
}
