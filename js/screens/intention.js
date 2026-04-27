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
            <textarea id="field-dream" rows="2" placeholder="Dream college, specific startup goal, a creative masterpiece... Be precise — vague dreams don't anchor."></textarea>
            <p class="citation">Vivid goal imagery increases task persistence by 60% — Oettingen, WOOP Research, 2015</p>
          </div>

          <div class="form-field" data-delay="4" style="display: flex; flex-direction: row; align-items: center; gap: 0.75rem; justify-content: flex-start; margin-top: 0.5rem;">
            <input type="checkbox" id="check-log-consent" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent);" checked>
            <label for="check-log-consent" style="font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; margin-bottom: 0; white-space: nowrap;">
              Allow logging intentions
            </label>
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

      // Logging logic
      const consent = document.getElementById('check-log-consent').checked;
      if (consent) {
        window.flowLogger.logIntention(
          this.app.currentUser?.name || 'Anonymous',
          milestone,
          dream
        );
      }

      this.app.navigateTo('breathing');
    });
  }
}

window.IntentionScreen = IntentionScreen;
