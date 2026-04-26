/* ============================================================
   Screen — Break Protocol
   Dynamic break with floating shapes, prompt rotation,
   NSDR option, strict lockout, and theme interpolation
   ============================================================ */

class BreakScreen {
  constructor(app) {
    this.app = app;
    this.breakDurationSec = 0;
    this.remaining = 0;
    this.timer = null;
    this.promptTimer = null;
    this.promptIndex = 0;
  }


  render() {
    return `
      <div class="screen" id="screen-break">
        <!-- Floating shapes for visual movement -->
        <div class="break-shapes">
          <div class="break-shape"></div>
          <div class="break-shape"></div>
          <div class="break-shape"></div>
          <div class="break-shape"></div>
        </div>
        <div class="break-container">
          <div class="break-timer">
            <span id="break-timer">00:00</span>
          </div>

          <div class="break-task-card" id="break-task-card">
            <h3 id="task-category"></h3>
            <h2 id="task-instruction"></h2>
            <p id="task-rationale"></p>
            <button class="btn btn-ghost break-task-done-btn" id="btn-task-done">Mark Complete</button>
          </div>

          <button class="btn btn-ghost break-nsdr-btn" id="btn-nsdr" style="display:none;">
            Begin NSDR — 10 min
          </button>
          <button id="btn-skip-break" class="btn btn-ghost" style="margin-top: 2rem; font-size: 0.7rem; padding: 0.5rem 1rem; opacity: 0.4;">
            Skip Break (Testing)
          </button>
        </div>
      </div>
    `;
  }

  mount() {
    const focusMinutes = this.app.sessionState.duration || 90;
    const breakMinutes = Math.round(focusMinutes * 0.2);
    this.breakDurationSec = breakMinutes * 60;
    this.remaining = this.breakDurationSec;

    // Skip Break (Testing)
    document.getElementById('btn-skip-break').addEventListener('click', () => this.complete());

    // Switch to break theme
    window.audioEngine.playBreakBell(); // audio bell
    document.body.classList.add('theme-break');

    this.setupTaskCard();

    this.timer = setInterval(() => this.tickCountdown(), 1000);

    // NSDR option
    const nsdrBtn = document.getElementById('btn-nsdr');
    if (this.breakDurationSec >= 600) {
      nsdrBtn.style.display = 'block';
      nsdrBtn.addEventListener('click', () => {
        window.audioEngine.setMode('pad');
        nsdrBtn.textContent = 'NSDR Audio Playing';
        nsdrBtn.style.pointerEvents = 'none';
        nsdrBtn.style.opacity = '0.5';
      });
    }

    this.updateTimerDisplay();
  }

  setupTaskCard() {
    const tasks = [
      { cat: '🤸 Body Reset', text: '10 slow bodyweight squats', rationale: 'Physical movement restores cortical blood flow.' },
      { cat: '🤸 Body Reset', text: '20 shoulder circles', rationale: 'Physical movement restores cortical blood flow.' },
      { cat: '🤸 Body Reset', text: 'Walk to get water and drink it standing', rationale: 'Physical movement restores cortical blood flow.' },
      { cat: '🤸 Body Reset', text: '30-second wall sit', rationale: 'Physical movement restores cortical blood flow.' },
      { cat: '🤸 Body Reset', text: 'Stretch arms overhead & hold for 20 breaths', rationale: 'Physical movement restores cortical blood flow.' },
      { cat: '🧠 Mind Detach', text: 'Write down one thing you are grateful for', rationale: 'A domain-switch provides fastest cognitive recovery.' },
      { cat: '🧠 Mind Detach', text: 'Sketch anything from memory', rationale: 'A domain-switch provides fastest cognitive recovery.' },
      { cat: '🧠 Mind Detach', text: 'Recall your last meal in vivid sensory detail', rationale: 'A domain-switch provides fastest cognitive recovery.' },
      { cat: '🧠 Mind Detach', text: 'Hum or sing quietly for 60 seconds', rationale: 'A domain-switch provides fastest cognitive recovery.' },
      { cat: '🧠 Mind Detach', text: 'Look out a window and name 5 things you see', rationale: 'A domain-switch provides fastest cognitive recovery.' },
      { cat: '🫁 Breath Ritual', text: '4 rounds of Box Breathing (4s in, hold, out, hold)', rationale: 'Nervous system reset via parasympathetic activation.' },
      { cat: '🫁 Breath Ritual', text: 'Physiological sigh — 3 cycles', rationale: 'Nervous system reset via parasympathetic activation.' },
      { cat: '🫁 Breath Ritual', text: 'Alternate nostril breathing for 60 seconds', rationale: 'Nervous system reset via parasympathetic activation.' }
    ];

    const task = tasks[Math.floor(Math.random() * tasks.length)];

    document.getElementById('task-category').textContent = task.cat;
    document.getElementById('task-instruction').textContent = task.text;
    document.getElementById('task-rationale').textContent = task.rationale;

    const doneBtn = document.getElementById('btn-task-done');
    doneBtn.addEventListener('click', () => {
      doneBtn.textContent = '✓ Done';
      doneBtn.style.pointerEvents = 'none';
      doneBtn.style.opacity = '0.5';
    });
  }

  tickCountdown() {
    this.remaining--;

    if (this.remaining <= 0) {
      this.remaining = 0;
      this.updateTimerDisplay();
      this.complete();
      return;
    }

    // At 2:00 remaining, interpolate back to focus theme
    if (this.remaining === 120) {
      document.body.classList.remove('theme-break');
    }

    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const min = Math.floor(this.remaining / 60);
    const sec = this.remaining % 60;
    const display = document.getElementById('break-timer');
    if (display) {
      display.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }
  }



  complete() {
    this.cleanup();
    window.audioEngine.stopNSDR();

    // 5-second breath transition back to focus
    this.app.showBreathTransition(() => {
      document.body.classList.remove('theme-break');
      this.app.navigateTo('dashboard');
    });
  }

  cleanup() {
    if (this.timer) clearInterval(this.timer);
    if (this.promptTimer) clearInterval(this.promptTimer);
    this.timer = null;
    this.promptTimer = null;
  }

  unmount() { this.cleanup(); }
}

window.BreakScreen = BreakScreen;
