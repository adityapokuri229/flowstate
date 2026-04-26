/* ============================================================
   Screen C — Session Setup
   Duration selector with scientific context and smooth entry
   ============================================================ */

class SetupScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div class="screen" id="screen-setup">
        <div class="setup-container">
          <h2 style="color:var(--text-secondary);font-weight:300;">Session Duration</h2>

          <div class="setup-duration-display" id="setup-duration-display">
            90<span>minutes</span>
          </div>

          <input type="range" class="range-slider" id="setup-slider"
            min="45" max="120" step="5" value="90"
            aria-label="Session duration in minutes" />

          <div class="range-labels">
            <span>45 min</span>
            <span>120 min</span>
          </div>

          <div class="setup-science-note">
            <p id="setup-science-text">Aligned with one ultradian cycle — the brain's natural 90-minute focus rhythm.</p>
            <p class="citation">Kleitman, 1963 — Basic Rest-Activity Cycle</p>
          </div>

          <button class="btn btn-large" id="btn-enter-deep-work" style="margin-top:0.5rem;min-width:280px;">
            Enter Deep Work
          </button>
        </div>
      </div>
    `;
  }

  mount() {
    if (this._listenersAttached) return;
    const slider = document.getElementById('setup-slider');
    const display = document.getElementById('setup-duration-display');
    const scienceText = document.getElementById('setup-science-text');
    const button = document.getElementById('btn-enter-deep-work');

    this._listenersAttached = true;

    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      display.innerHTML = `${val}<span>minutes</span>`;

      // Dynamic science note
      if (val <= 50) {
        scienceText.textContent = 'A focused burst. Ideal for single-task sprints with high cognitive load.';
      } else if (val <= 75) {
        scienceText.textContent = 'A solid deep work block. Allows time for "ramping in" before peak performance.';
      } else if (val <= 95) {
        scienceText.textContent = 'Aligned with one ultradian cycle — the brain\'s natural 90-minute focus rhythm.';
      } else {
        scienceText.textContent = 'Extended session. Ensure hydration and leverage the 20/20/20 eye-rest prompts.';
      }
    });

    button.addEventListener('click', (e) => {
      // Ripple
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = button.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);

      const duration = parseInt(slider.value, 10);
      this.app.sessionState.duration = duration;

      // Init audio context on user gesture
      window.audioEngine.init();

      // Request fullscreen
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }

      setTimeout(() => this.app.navigateTo('focus'), 500);
    });
  }
}

window.SetupScreen = SetupScreen;
