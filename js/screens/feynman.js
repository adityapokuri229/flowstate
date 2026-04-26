/* ============================================================
   Screen — Feynman Dump (Memory Consolidation)
   60-second screen with urgency and scientific framing
   ============================================================ */

class FeynmanScreen {
  constructor(app) {
    this.app = app;
    this.duration = 60;
    this.timer = null;
    this.remaining = 60;
  }

  render() {
    return `
      <div class="screen" id="screen-feynman">
        <div class="feynman-container">
          <h1>Anchor What You Learned</h1>
          <p class="feynman-subtitle">
            Active recall within minutes of learning increases long-term retention by up to 80%.
          </p>
          <p class="citation" style="text-align:center;">Roediger & Butler, 2011 — The Testing Effect</p>

          <div class="feynman-progress">
            <div class="feynman-progress-bar" id="feynman-progress-bar"></div>
          </div>

          <div class="feynman-fields">
            <div class="feynman-field">
              <div class="number">1</div>
              <textarea id="feynman-1" placeholder="First key concept — explain it simply..." rows="2"></textarea>
            </div>
            <div class="feynman-field">
              <div class="number">2</div>
              <textarea id="feynman-2" placeholder="Second key concept..." rows="2"></textarea>
            </div>
            <div class="feynman-field">
              <div class="number">3</div>
              <textarea id="feynman-3" placeholder="Third key concept..." rows="2"></textarea>
            </div>
          </div>

          <button class="btn" id="btn-feynman-done" style="align-self:center;margin-top:0.5rem;">
            Done — Begin Break
          </button>
        </div>
      </div>
    `;
  }

  mount() {
    this.remaining = this.duration;
    const bar = document.getElementById('feynman-progress-bar');
    const btn = document.getElementById('btn-feynman-done');

    this.timer = setInterval(() => {
      this.remaining--;
      const pct = this.remaining / this.duration;
      bar.style.transform = `scaleX(${pct})`;

      if (this.remaining <= 15) bar.classList.add('urgent');
      if (this.remaining <= 0) this.saveAndContinue();
    }, 1000);

    btn.addEventListener('click', () => this.saveAndContinue());

    setTimeout(() => document.getElementById('feynman-1')?.focus(), 800);
  }

  saveAndContinue() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }

    const concepts = [
      document.getElementById('feynman-1')?.value?.trim() || '',
      document.getElementById('feynman-2')?.value?.trim() || '',
      document.getElementById('feynman-3')?.value?.trim() || '',
    ].filter(c => c.length > 0);

    this.app.sessionState.feynman_dump = concepts.join('\n---\n');
    this.app.navigateTo('breakmode');
  }

  unmount() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}

window.FeynmanScreen = FeynmanScreen;
