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
        <!-- Floating shapes for visual movement -->
        <div class="break-shapes">
          <div class="break-shape"></div>
          <div class="break-shape"></div>
          <div class="break-shape"></div>
          <div class="break-shape"></div>
        </div>
        <div class="break-container" style="max-width: 600px;">
          <div id="break-personal-msg" style="margin-bottom: 0.5rem; text-align: center; opacity: 0; transition: opacity 2s ease;">
            <h2 id="break-greeting" style="font-family: 'Cormorant Garamond', serif; font-size: 2rem; color: var(--accent); margin-bottom: 0.5rem;"></h2>
            <p id="break-dream-reminder" style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;"></p>
            <div id="break-quote-container" class="quote-block visible" style="border-left: none; padding-left: 0; margin-top: 0.5rem;">
              <q id="break-quote-text" style="font-size: 1rem; font-style: italic; color: var(--text-secondary);"></q>
            </div>
          </div>

          <div class="break-header" style="text-align:center;" id="break-default-header">
            <h1 class="break-title" style="margin-bottom:0.5rem;" id="break-main-title">Take a Break.</h1>
            <p class="break-subtitle" id="break-subtitle">Stand up. Look away from the screen. Close your eyes or stretch.</p>
          </div>

          <div class="break-progress-container" id="break-progress-container" style="width: 100%; max-width: 400px; margin: 0 auto; background: var(--bg-tertiary); height: 10px; border-radius: 6px; overflow: hidden; margin-top: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color);">
            <div id="break-progress-bar" style="height: 100%; width: 0%; background: var(--accent); transition: width 1s linear;"></div>
          </div>

          <div id="break-default-actions" style="text-align:center; display:flex; flex-direction:column; align-items:center; gap: 1rem;">
            <button id="btn-start-meditation" class="btn btn-outline" style="min-width: 280px;">
              Guided Box Breathing
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
      document.getElementById('btn-skip-break').textContent = "End Session";
    }
    
    this.remaining = this.breakDurationSec;

    // Personal Message
    const name = this.app.currentUser?.name || 'Traveler';
    const dream = this.app.sessionState.dream || '';
    const quote = window.FlowQuotes?.getQuote(dream);

    document.getElementById('break-greeting').textContent = `Hey ${name},`;
    
    if (dream) {
      document.getElementById('break-dream-reminder').textContent = `Take a breath. You are building towards: ${dream}`;
    } else {
      document.getElementById('break-dream-reminder').style.display = 'none';
    }

    if (quote && !this.app.sessionState.isMidwayBreak) {
      document.getElementById('break-quote-text').textContent = `"${quote.text}"`;
      document.getElementById('break-quote-container').style.display = 'block';
    } else {
      document.getElementById('break-quote-container').style.display = 'none';
    }

    setTimeout(() => {
      document.getElementById('break-personal-msg').style.opacity = '1';
    }, 500);

    // Reset progress
    const bar = document.getElementById('break-progress-bar');
    if (bar) bar.style.width = '0%';

    // Play bell
    window.audioEngine.playBreakBell();

    this.timer = setInterval(() => this.tickCountdown(), 1000);

    // Event listeners
    const skipBtn = document.getElementById('btn-skip-break');
    skipBtn.addEventListener('click', () => this.complete());
    if (!this.app.isDev && this.app.sessionState.isMidwayBreak) {
      skipBtn.style.display = 'none';
    }
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
      circle.className = 'break-breath-circle';
      circle.style.transform = 'scale(1.4)';
      circle.style.opacity = '0.9';
      circle.style.boxShadow = '0 0 60px var(--accent-glow)';
      await this.sleep(4000);
      if (!this.breathingActive) return;

      // Hold (Full)
      text.textContent = 'Hold';
      circle.style.boxShadow = '0 0 40px var(--accent-glow)';
      await this.sleep(4000);
      if (!this.breathingActive) return;

      // Exhale
      window.audioEngine.playExhaleChime();
      text.textContent = 'Exhale';
      circle.style.transform = 'scale(0.6)';
      circle.style.opacity = '0.4';
      circle.style.boxShadow = '0 0 20px var(--accent-dim)';
      await this.sleep(4000);
      if (!this.breathingActive) return;

      // Hold (Empty)
      text.textContent = 'Hold';
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
