import { state } from '../state.js';

export function mountControls(controlsEl) {
  controlsEl.innerHTML = `
    <button class="btn" data-mode="explore">Explore</button>
    <button class="btn" data-mode="quiz">Quiz</button>
    <button class="btn--link" data-action="reset">Reset</button>
  `;

  controlsEl.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => state.set({ mode: btn.dataset.mode }));
  });

  controlsEl.querySelector('[data-action="reset"]').addEventListener('click', () => state.reset());

  const update = ({ mode }) => {
    controlsEl.querySelectorAll('[data-mode]').forEach(btn => {
      btn.classList.toggle('btn--active', btn.dataset.mode === mode);
    });
  };

  state.subscribe(update);
  update(state.get());
}
