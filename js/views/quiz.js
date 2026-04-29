// Multiple-choice quiz built from the disease's terms.  Standard
// "What is X?" shape: the term name is the question, four definitions
// are the choices.  Each session deals a fresh shuffled deck so every
// term shows up exactly once and the quiz has a clear end state.

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildChoices(correct, pool) {
  const distractors = shuffle(pool.filter(t => t.name !== correct.name)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

export function mountQuiz(mountEl, disease) {
  // Pool of quizzable terms (need a definition for both the right
  // answer text AND for distractors).  Defines the deck size.
  const pool = disease.allTerms.filter(t => t.definition);

  let deck = [];
  let idx = 0;
  let answered = false;
  let score = 0;

  mountEl.innerHTML = `
    <div class="quiz">
      <div class="quiz__header">
        <div class="quiz__title">Multiple Choice Quiz</div>
        <div class="quiz__score" data-score></div>
      </div>
      <div class="quiz__card" data-card></div>
    </div>
  `;

  const cardEl  = mountEl.querySelector('[data-card]');
  const scoreEl = mountEl.querySelector('[data-score]');

  const updateScoreDisplay = () => {
    if (idx >= deck.length) {
      scoreEl.textContent = `Final: ${score} / ${deck.length}`;
    } else {
      // Show "X of N" rather than "X/N" to read more naturally.
      scoreEl.textContent = `Question ${idx + 1} of ${deck.length} — Score ${score}`;
    }
  };

  const startNewQuiz = () => {
    deck = shuffle(pool);
    idx = 0;
    score = 0;
    renderQuestion();
  };

  const renderQuestion = () => {
    if (pool.length < 4) {
      cardEl.innerHTML = `<div class="quiz__empty">No quizzable terms in this disease yet — need at least 4 terms with definitions populated.</div>`;
      scoreEl.textContent = '';
      return;
    }

    if (idx >= deck.length) {
      const pct = Math.round((score / deck.length) * 100);
      cardEl.innerHTML = `
        <div class="quiz__verdict quiz__verdict--right" style="text-align:center">Quiz complete</div>
        <div class="quiz__prompt" style="text-align:center">You scored <strong>${score}</strong> out of <strong>${deck.length}</strong> (${pct}%).</div>
        <button class="quiz__next" data-restart>Start a new quiz →</button>
      `;
      cardEl.querySelector('[data-restart]').addEventListener('click', startNewQuiz);
      updateScoreDisplay();
      return;
    }

    answered = false;
    const correct = deck[idx];
    const choices = buildChoices(correct, pool);

    cardEl.innerHTML = `
      <div class="quiz__prompt-label">Question ${idx + 1} of ${deck.length}</div>
      <div class="quiz__prompt">Which of the following best describes <strong>${escapeHtml(correct.name)}</strong>?</div>
      <div class="quiz__choices">
        ${choices.map(c => `
          <button class="quiz__choice" data-choice="${escapeHtml(c.name)}">
            ${escapeHtml(c.definition)}
          </button>
        `).join('')}
      </div>
      <div class="quiz__feedback" data-feedback></div>
    `;
    updateScoreDisplay();

    cardEl.querySelectorAll('.quiz__choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.choice, correct));
    });
  };

  const handleAnswer = (chosenName, correct) => {
    if (answered) return;
    answered = true;
    const isRight = chosenName === correct.name;
    if (isRight) score++;
    updateScoreDisplay();

    cardEl.querySelectorAll('.quiz__choice').forEach(btn => {
      btn.disabled = true;
      const name = btn.dataset.choice;
      if (name === correct.name) btn.classList.add('quiz__choice--correct');
      else if (name === chosenName) btn.classList.add('quiz__choice--wrong');
    });

    const fb = cardEl.querySelector('[data-feedback]');
    fb.innerHTML = `
      <div class="quiz__verdict ${isRight ? 'quiz__verdict--right' : 'quiz__verdict--wrong'}">
        ${isRight ? '✓ Correct' : `✗ The answer is ${escapeHtml(correct.name)}`}
      </div>
      ${correct.definition ? `<div class="quiz__field"><span class="quiz__field-label">Definition</span>${escapeHtml(correct.definition)}</div>` : ''}
      <div class="quiz__field"><span class="quiz__field-label">In this disease</span>${escapeHtml(correct.desc)}</div>
      ${correct.symptom ? `<div class="quiz__field"><span class="quiz__field-label">Patient Experience</span>${escapeHtml(correct.symptom)}</div>` : ''}
      <button class="quiz__next" data-next>${idx + 1 >= deck.length ? 'See results →' : 'Next question →'}</button>
    `;
    fb.querySelector('[data-next]').addEventListener('click', () => {
      idx++;
      renderQuestion();
    });
  };

  startNewQuiz();
}
