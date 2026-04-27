/* ============================================================
   Screen A — Intention Form
   Pre-session ritual with session count and meditative entry
   ============================================================ */

class IntentionScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div class="screen" id="screen-intention">
        <form class="intention-form" id="intention-form">
          <div class="intention-header">
            <h1>Set Your Intention</h1>
            <div class="divider"></div>
            <p>Clarity of purpose is the first gate to flow. Name what matters for this session.</p>
          </div>

          <div class="form-field" data-delay="1">
            <label for="field-milestone">What is the specific milestone?</label>
            <textarea id="field-milestone" rows="2" placeholder="A concrete, verifiable outcome — something you can point to when finished..." required></textarea>
          </div>

          <div class="form-field" data-delay="3">
            <label for="field-dream">What is your dream? Be specific.</label>
            <textarea id="field-dream" rows="2" placeholder="IIT JEE AIR under 500. NEET rank 1. Startup acquired. Be precise — vague dreams don't anchor."></textarea>
            <p class="citation">Vivid goal imagery increases task persistence by 60% — Oettingen, WOOP Research, 2015</p>
          </div>

          <div class="form-field" data-delay="2">
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
    if (this._listenersAttached) return;
    this._listenersAttached = true;

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

      const milestone = document.getElementById('field-milestone').value.trim();
      const dream = document.getElementById('field-dream').value.trim();

      if (!milestone) return;

      this.app.sessionState.subject = 'Flow Session'; // Default value since focus was removed
      this.app.sessionState.milestone = milestone;
      this.app.sessionState.distraction = '';
      this.app.sessionState.dream = dream;

      this.app.navigateTo('breathing');
    });
  }
}

window.IntentionScreen = IntentionScreen;
