/* ============================================================
   Screen — Break Protocol (Simple Break + Optional Meditation)
   ============================================================ */

class BreakScreen {
  constructor(app) {
    this.app = app;
    this.breakDurationSec = 0;
    this.remaining = 0;
    this.timer = null;
    this.breathingActive = false;
  }

  render() {
    return `
      <div class="screen" id="screen-breakmode">
        <div class="break-container" style="justify-content: center; height: 100vh; gap: 2rem;">
          
          <div class="break-header" style="text-align:center;" id="break-default-header">
            <h1 class="break-title" style="margin-bottom:0.5rem;" id="break-main-title">Take a Break.</h1>
            <p class="break-subtitle" id="break-subtitle">Stand up. Look away from the screen. Close your eyes or stretch.</p>
          </div>

          <div class="break-progress-container" style="width: 100%; max-width: 400px; margin: 0 auto; background: var(--surface-light); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 1rem; margin-bottom: 1rem;">
            <div id="break-progress-bar" style="height: 100%; width: 0%; background: var(--accent); transition: width 1s linear;"></div>
          </div>

          <div id="break-default-actions" style="text-align:center; display:flex; flex-direction:column; align-items:center; gap: 1rem;">
            <button id="btn-start-meditation" class="btn btn-outline" style="min-width: 280px;">
              🫁 Guided Box Breathing
            </button>
            <button id="btn-skip-break" class="btn btn-ghost" style="font-size: 0.8rem; padding: 0.5rem 1rem; opacity: 0.35;">
              Skip Break
            </button>
          </div>

          <!-- Active Meditation UI (Hidden by default) -->
          <div class="break-breath-active hidden" id="break-breath-active" style="display:flex; flex-direction:column; align-items:center;">
            <div class="break-breath-circle" id="break-breath-circle"></div>
            <p class="break-breath-text" id="break-breath-text" style="font-size: 2rem; margin-top:2rem;">Starting...</p>
            <button id="btn-stop-meditation" class="btn btn-ghost" style="margin-top: 2rem; font-size: 0.8rem; opacity: 0.4;">
              Stop Breathing
            </button>
          </div>
          
        </div>
      </div>
    `;
  }

  mount() {
    const focusMinutes = this.app.sessionState.duration || 90;
    
    if (this.app.sessionState.isMidwayBreak) {
      this.breakDurationSec = 7 * 60;
      document.getElementById('break-main-title').textContent = "Short Break.";
    } else {
      const breakMinutes = Math.max(5, Math.round(focusMinutes * 0.2));
      this.breakDurationSec = breakMinutes * 60;
      document.getElementById('break-main-title').textContent = "Deep Restoration.";
    }
    
    this.remaining = this.breakDurationSec;

    // Reset progress
    const bar = document.getElementById('break-progress-bar');
    if (bar) bar.style.width = '0%';

    // Play bell
    window.audioEngine.playBreakBell();

    this.timer = setInterval(() => this.tickCountdown(), 1000);

    // Event listeners
    document.getElementById('btn-skip-break').addEventListener('click', () => this.complete());
    document.getElementById('btn-start-meditation').addEventListener('click', () => this.startMeditationUI());
    document.getElementById('btn-stop-meditation').addEventListener('click', () => this.stopMeditationUI());
  }

  startMeditationUI() {
    document.getElementById('break-default-header').classList.add('hidden');
    document.getElementById('break-default-actions').classList.add('hidden');
    
    const activeDiv = document.getElementById('break-breath-active');
    activeDiv.classList.remove('hidden');
    // Ensure display flex is active when not hidden (since hidden overrides display)
    activeDiv.style.display = 'flex';

    this.startAutoMeditation();
  }

  stopMeditationUI() {
    this.breathingActive = false;
    document.getElementById('break-default-header').classList.remove('hidden');
    document.getElementById('break-default-actions').classList.remove('hidden');
    
    const activeDiv = document.getElementById('break-breath-active');
    activeDiv.classList.add('hidden');
    activeDiv.style.display = 'none';
  }

  async startAutoMeditation() {
    if (this.breathingActive) return;
    this.breathingActive = true;
    
    const circle = document.getElementById('break-breath-circle');
    const text = document.getElementById('break-breath-text');

    // Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
    while (this.breathingActive) {
      // Inhale
      window.audioEngine.playInhaleChime();
      text.textContent = 'Inhale';
      circle.className = 'break-breath-circle inhale';
      await this.sleep(4000);
      if (!this.breathingActive) return;

      // Hold
      text.textContent = 'Hold';
      circle.className = 'break-breath-circle hold';
      await this.sleep(4000);
      if (!this.breathingActive) return;

      // Exhale
      window.audioEngine.playExhaleChime();
      text.textContent = 'Exhale';
      circle.className = 'break-breath-circle exhale';
      await this.sleep(4000);
      if (!this.breathingActive) return;

      // Hold
      text.textContent = 'Hold';
      circle.className = 'break-breath-circle hold';
      await this.sleep(4000);
      if (!this.breathingActive) return;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ---- Progress ---- */

  tickCountdown() {
    this.remaining--;
    
    const progressPct = ((this.breakDurationSec - this.remaining) / this.breakDurationSec) * 100;
    const bar = document.getElementById('break-progress-bar');
    if (bar) {
      bar.style.width = Math.min(progressPct, 100) + '%';
    }

    if (this.remaining <= 0) {
      this.remaining = 0;
      this.complete();
    }
  }

  complete() {
    this.cleanup();
    window.audioEngine.stopNSDR();
    this.app.showBreathTransition(() => {
      if (this.app.sessionState.isMidwayBreak) {
        this.app.navigateTo('focus');
      } else {
        this.app.navigateTo('dashboard');
      }
    });
  }

  cleanup() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.breathingActive = false;
  }

  unmount() { 
    this.cleanup(); 
  }
}

window.BreakScreen = BreakScreen;
