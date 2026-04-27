/* ============================================================
   Screen C — Session Setup
   Duration selector with scientific context, session preview,
   and smooth entry
   ============================================================ */

class SetupScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div class="screen" id="screen-setup">
        <div class="setup-container" style="transform: translateY(-8vh);">
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

          <!-- Session Preview -->
          <div class="session-preview" id="session-preview">
            <p class="session-preview-title">Session Plan</p>
            <div class="session-timeline" id="session-timeline"></div>
            <div class="session-legend">
              <span class="legend-item"><span class="legend-dot eye"></span> Eye Rest</span>
              <span class="legend-item"><span class="legend-dot brk"></span> Break</span>
            </div>
          </div>

          <button class="btn btn-large" id="btn-enter-deep-work" style="margin-top:0.5rem;min-width:280px;">
            Confirm & Begin
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

    // Initial preview
    this.updatePreview(parseInt(slider.value, 10));

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

      this.updatePreview(val);
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
      this.app.sessionState.isMidwayBreak = false;
      this.app.sessionState.totalParts = duration >= 60 ? 2 : 1;
      this.app.sessionState.currentPart = 1;

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

  updatePreview(minutes) {
    const timeline = document.getElementById('session-timeline');

    // Calculate events
    const events = [];

    // Eye rests every 20 minutes
    for (let t = 20; t < minutes; t += 20) {
      events.push({ time: t, type: 'eye', label: 'Eye Rest' });
    }

    // Mid-session Short Break if 60 mins or longer
    if (minutes >= 60) {
      const mid = Math.round(minutes / 2);
      events.push({ time: mid, type: 'brk', label: 'Short Break' });
    }

    // Break at the end
    const breakMin = Math.max(5, Math.round(minutes * 0.2));
    events.push({ time: minutes, type: 'brk', label: `Long Break` });

    // Sort
    events.sort((a, b) => a.time - b.time);

    // Render timeline markers
    let markersHtml = '';
    for (const e of events) {
      const pct = (e.time / minutes) * 100;
      markersHtml += `<div class="timeline-marker ${e.type}" style="left:${pct}%" title="${e.label}"></div>`;
    }
    timeline.innerHTML = markersHtml;
  }
}

window.SetupScreen = SetupScreen;
