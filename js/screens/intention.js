/* ============================================================
   Screen A — Intention Form
   Pre-session ritual with session count and meditative entry
   ============================================================ */

class IntentionScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    const sessionCount = this.app.sessionCount || 0;
    const sessionLabel = sessionCount === 0 ? 'Your first session' :
      sessionCount === 1 ? '1 session completed' :
      `${sessionCount} sessions completed`;

    return `
      <div class="screen" id="screen-intention">
        <form class="intention-form" id="intention-form">
          <div class="intention-header">
            <div class="session-count">◈ ${sessionLabel}</div>
            <h1>Set Your Intention</h1>
            <div class="divider"></div>
            <p>Clarity of purpose is the first gate to flow. Name what matters for this session.</p>
          </div>

          <div class="form-field" data-delay="0">
            <label for="field-focus">What is the focus?</label>
            <textarea id="field-focus" rows="2" placeholder="The specific subject or project you will dedicate this session to..." required></textarea>
          </div>

          <div class="form-field" data-delay="1">
            <label for="field-milestone">What is the specific milestone?</label>
            <textarea id="field-milestone" rows="2" placeholder="A concrete, verifiable outcome — something you can point to when finished..." required></textarea>
          </div>

          <div class="form-field" data-delay="2">
            <label for="field-distraction">Identify one potential distraction and your plan to ignore it</label>
            <textarea id="field-distraction" rows="2" placeholder="Name the threat. Having a plan reduces the prefrontal load of resisting it..."></textarea>
            <p class="citation">Implementation intentions reduce distraction susceptibility — Gollwitzer, 1999</p>
          </div>

          <div class="form-field" data-delay="3">
            <label for="field-dream">What is your dream? Be specific.</label>
            <textarea id="field-dream" rows="2" placeholder="IIT JEE AIR under 500. NEET rank 1. Startup acquired. Be precise — vague dreams don't anchor."></textarea>
            <p class="citation">Vivid goal imagery increases task persistence by 60% — Oettingen, WOOP Research, 2015</p>
          </div>

          <div class="form-field" data-delay="4">
            <button type="submit" class="btn btn-large" id="btn-intention-continue" style="width:100%;">
              Begin Breathing Ritual
            </button>
          </div>
          
          <div class="quote-block" id="intention-quote-block">
            <q id="intention-quote-text"></q>
            <cite id="intention-quote-author"></cite>
          </div>
        </form>
      </div>
    `;
  }

  mount() {
    const form = document.getElementById('intention-form');

    // Staggered reveal
    const fields = form.querySelectorAll('.form-field');
    fields.forEach((field, i) => {
      setTimeout(() => field.classList.add('visible'), 300 + i * 220);
    });

    const quoteBlock = document.getElementById('intention-quote-block');
    const quoteText = document.getElementById('intention-quote-text');
    const quoteAuthor = document.getElementById('intention-quote-author');
    const dreamField = document.getElementById('field-dream');

    const updateQuote = (dreamValue) => {
      const quote = window.FlowQuotes.getQuote(dreamValue);
      quoteText.textContent = quote.text;
      quoteAuthor.textContent = quote.author;
      quoteBlock.classList.add('visible');
    };

    // Show initial universal quote
    updateQuote('');

    let quoteTimer = null;
    dreamField.addEventListener('input', (e) => {
      if (quoteTimer) clearTimeout(quoteTimer);
      quoteTimer = setTimeout(() => {
        quoteBlock.classList.remove('visible');
        setTimeout(() => updateQuote(e.target.value), 300); // Wait for fade out
      }, 600);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const focus = document.getElementById('field-focus').value.trim();
      const milestone = document.getElementById('field-milestone').value.trim();
      const distraction = document.getElementById('field-distraction').value.trim();
      const dream = document.getElementById('field-dream').value.trim();

      if (!focus || !milestone) return;

      this.app.sessionState.subject = focus;
      this.app.sessionState.milestone = milestone;
      this.app.sessionState.distraction = distraction;
      this.app.sessionState.dream = dream;

      this.app.navigateTo('breathing');
    });
  }
}

window.IntentionScreen = IntentionScreen;
