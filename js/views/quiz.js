// Multiple-choice quiz built from the disease's terms.  Two question
// types randomly mixed: definition → name, and patient symptom → name.
// Distractors are pulled at random from the other terms in the disease.

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

function buildQuestion(allTerms) {
  // Standard MCQ shape: ask "What is X?" with 4 definitions as
  // choices.  Need terms that have a definition (for the right
  // answer) AND at least 3 other terms with definitions (for the
  // distractors).
  const pool = allTerms.filter(t => t.definition);
  if (pool.length < 4) return null;

  const correct = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(pool.filter(t => t.name !== correct.name)).slice(0, 3);
  const choices = shuffle([correct, ...distractors]);

  return {
    prompt: correct.name,
    correctName: correct.name,
    correct,
    choices
  };
}

export function mountQuiz(mountEl, disease) {
  let q = null;
  let answered = false;
  let score = { right: 0, asked: 0 };

  mountEl.innerHTML = `
    <div class="quiz">
      <div class="quiz__header">
        <div class="quiz__title">Multiple Choice Quiz</div>
        <div class="quiz__score" data-score>0 / 0</div>
      </div>
      <div class="quiz__card" data-card></div>
      <button class="quiz__next" data-next style="display:none">Next Question →</button>
    </div>
  `;

  const cardEl  = mountEl.querySelector('[data-card]');
  const nextEl  = mountEl.querySelector('[data-next]');
  const scoreEl = mountEl.querySelector('[data-score]');

  const renderQuestion = () => {
    answered = false;
    q = buildQuestion(disease.allTerms);
    if (!q) {
      cardEl.innerHTML = `<div class="quiz__empty">No quizzable terms in this disease yet — need definitions or patient experiences populated.</div>`;
      nextEl.style.display = 'none';
      return;
    }

    cardEl.innerHTML = `
      <div class="quiz__prompt-label">Question</div>
      <div class="quiz__prompt">Which of the following best describes <strong>${escapeHtml(q.prompt)}</strong>?</div>
      <div class="quiz__choices">
        ${q.choices.map(c => `
          <button class="quiz__choice" data-choice="${escapeHtml(c.name)}">
            ${escapeHtml(c.definition)}
          </button>
        `).join('')}
      </div>
      <div class="quiz__feedback" data-feedback></div>
    `;
    nextEl.style.display = 'none';

    cardEl.querySelectorAll('.quiz__choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.choice));
    });
  };

  const handleAnswer = (chosenName) => {
    if (answered) return;
    answered = true;
    score.asked++;
    const isRight = chosenName === q.correctName;
    if (isRight) score.right++;
    scoreEl.textContent = `${score.right} / ${score.asked}`;

    cardEl.querySelectorAll('.quiz__choice').forEach(btn => {
      btn.disabled = true;
      const name = btn.dataset.choice;
      if (name === q.correctName) btn.classList.add('quiz__choice--correct');
      else if (name === chosenName) btn.classList.add('quiz__choice--wrong');
    });

    const fb = cardEl.querySelector('[data-feedback]');
    const t = q.correct;
    fb.innerHTML = `
      <div class="quiz__verdict ${isRight ? 'quiz__verdict--right' : 'quiz__verdict--wrong'}">
        ${isRight ? '✓ Correct' : `✗ The answer is ${escapeHtml(q.correctName)}`}
      </div>
      ${t.definition ? `<div class="quiz__field"><span class="quiz__field-label">Definition</span>${escapeHtml(t.definition)}</div>` : ''}
      <div class="quiz__field"><span class="quiz__field-label">In this disease</span>${escapeHtml(t.desc)}</div>
      ${t.symptom ? `<div class="quiz__field"><span class="quiz__field-label">Patient Experience</span>${escapeHtml(t.symptom)}</div>` : ''}
    `;
    nextEl.style.display = '';
  };

  nextEl.addEventListener('click', renderQuestion);
  renderQuestion();
}
