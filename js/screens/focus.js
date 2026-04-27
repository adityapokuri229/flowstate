/* ============================================================
   Screen — Focus Mode (The Core)
   Living, breathing mandala. Progress arc. All controls.
   ============================================================ */

class FocusScreen {
  constructor(app) {
    this.app = app;
    this.startTime = null;
    this.durationMs = 0;
    this.elapsed = 0;
    this.paused = false;
    this.pauseStart = 0;
    this.totalPauseMs = 0;
    this.rafId = null;
    this.twentyTimer = null;
    this.scratchpadOpen = false;
    this.sighActive = false;
    this.keyHandler = null;
    this.currentAudioMode = 'silence';
  }

  render() {
    return `
      <div class="screen" id="screen-focus">
        <div class="focus-container">
          <!-- State label -->
          <div class="focus-state-label" id="focus-state-label">Deep Work</div>

          <!-- Progress Arc SVG -->
          <svg class="progress-arc-svg" id="progress-arc-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path id="progress-arc-bg" class="progress-arc-bg" d=""/>
            <path id="progress-arc-path" class="progress-arc-path" d=""/>
          </svg>

          <!-- Central Mandala -->
          <div class="focus-mandala" id="focus-mandala">
            <div class="mandala-ring mandala-ring-1"></div>
            <div class="mandala-ring mandala-ring-2"></div>
            <div class="mandala-ring mandala-ring-3"></div>
            <div class="mandala-core"></div>
          </div>
        </div>

        <!-- 20/20/20 Guided Eye Rest Overlay -->
        <div class="eyerest-overlay" id="eyerest-overlay">
          <div class="eyerest-content">
            <div class="eyerest-phase" id="eyerest-phase-intro">
              <div class="eyerest-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h2 class="eyerest-title" id="eyerest-title">Let's rest your eyes</h2>
              <p class="eyerest-sub">You've been focused. Time for a quick reset.</p>
            </div>

            <div class="eyerest-phase hidden" id="eyerest-phase-look">
              <div class="eyerest-eye-anim" id="eyerest-eye-anim">
                <div class="eye-circle"></div>
                <div class="eye-pupil" id="eye-pupil"></div>
              </div>
              <h2 class="eyerest-title" id="eyerest-look-text">Look away from your screen</h2>
              <p class="eyerest-sub">Focus on something 20 feet away</p>
            </div>

            <div class="eyerest-phase hidden" id="eyerest-phase-breathe">
              <div class="eyerest-breath-circle" id="eyerest-breath-circle"></div>
              <h2 class="eyerest-title" id="eyerest-breathe-text">Breathe</h2>
              <p class="eyerest-countdown" id="eyerest-countdown">20</p>
            </div>

            <span class="citation">20-20-20 Rule — American Academy of Ophthalmology</span>
            <button class="btn btn-ghost eyerest-dismiss" id="eyerest-dismiss">I'm good, dismiss</button>
          </div>
        </div>

        <!-- Physiological Sigh Overlay -->
        <div class="sigh-overlay" id="sigh-overlay">
          <div class="sigh-circle" id="sigh-circle"></div>
          <p class="sigh-text" id="sigh-text"></p>
          <p class="sigh-subtitle">Physiological Sigh — Huberman Lab, Stanford</p>
        </div>

        <!-- Audio Controls — 3 separate tiles -->
        <div class="audio-tiles" id="audio-tiles">
          <button class="audio-tile active" id="audio-silence" data-mode="silence">
            <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            Silence
          </button>
          <button class="audio-tile" id="audio-brown" data-mode="brown">
            <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            Brown
          </button>
          <button class="audio-tile" id="audio-binaural" data-mode="binaural">
            <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            40Hz
          </button>
        </div>

        <!-- Bottom Controls -->
        <div class="focus-controls" id="focus-controls">
          <div class="control-group">
            <button class="control-btn" id="btn-scratchpad" aria-label="Toggle Scratchpad">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              <span class="tooltip">Scratchpad (⌘K)</span>
            </button>
            <span class="control-label">Scratchpad</span>
          </div>

          <div class="control-group">
            <button class="control-btn" id="btn-sigh" aria-label="Physiological sigh">
              <!-- Simplified Physiological Rest Icon -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>
              <span class="tooltip">Physiological Sigh (30s)</span>
            </button>
            <span class="control-label">Breathe</span>
          </div>
        </div>

        <!-- Dev Test Panel -->
        <div class="dev-panel" id="dev-panel">
          <div class="dev-panel-toggle" id="dev-panel-toggle">⚙ Dev</div>
          <div class="dev-panel-content" id="dev-panel-content">
            <button class="dev-btn" id="dev-eyerest">Eye Rest (20/20/20)</button>
            <button class="dev-btn" id="dev-sigh">Phys. Sigh</button>
            <button class="dev-btn" id="dev-short-break">→ Short Break</button>
            <button class="dev-btn" id="dev-long-break">→ Long Break</button>
            <button class="dev-btn" id="dev-dashboard">→ Dashboard</button>
            <button class="dev-btn" id="dev-dream">Dream Whisper</button>
          </div>
        </div>

        <!-- Keyboard shortcut hint -->
        <div class="shortcut-hint">
          <kbd>⌘</kbd> + <kbd>K</kbd> Scratchpad
        </div>

        <!-- Scratchpad & Gemini -->
        <!-- Scratchpad -->
        <div class="scratchpad" id="scratchpad">
          <div class="scratchpad-header" style="justify-content: space-between; border-bottom: 1px solid var(--border);">
            <div class="scratchpad-tabs" style="display:flex; gap:1rem;">
              <span style="color:var(--text-primary); font-family:var(--font-mono);">Scratchpad</span>
            </div>
            <button class="scratchpad-close" id="scratchpad-close" aria-label="Close">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div id="content-scratchpad" style="flex:1; display:flex; flex-direction:column; padding-top:1rem;">
            <p class="scratchpad-hint">Externalize intrusive thoughts to free working memory.</p>
            <textarea id="scratchpad-textarea" placeholder="Dump distracting thoughts here..."></textarea>
          </div>
        </div>
      </div>
    `;
  }

  mount() {
    let focusMins = this.app.sessionState.duration || 90;
    this.durationMs = focusMins * 60 * 1000;
    
    // Determine start elapsed offset for part 2
    this.startElapsedOffset = 0;
    if (this.app.sessionState.totalParts === 2 && this.app.sessionState.currentPart === 2) {
      this.startElapsedOffset = Math.round(this.durationMs / 2);
    }
    this.startTime = Date.now();
    this.elapsed = 0;
    this.paused = false;
    this.totalPauseMs = 0;
    this.pulseCount = 0;
    this.dreamWhisperShown = false;
    this.sighActive = false;
    this.currentAudioMode = 'binaural';

    this.buildArcPath();
    this.tick();

    setTimeout(() => {
      document.body.classList.add('theme-focus');
      window.audioEngine.playFocusBell();
      this.setAudioMode('binaural');
    }, 500);

    // Dream Whisper after 2 min
    if (this.app.sessionState.dream) {
      setTimeout(() => this.triggerDreamWhisper(), 120 * 1000);
    }

    this.schedule2020();

    // Visibility change detection
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && !this.paused) {
        this.triggerDreamWhisper();
        window.audioEngine.playRestBell();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Audio tiles
    document.querySelectorAll('.audio-tile').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.setAudioMode(mode);
      });
    });

    // Sigh
    document.getElementById('btn-sigh').addEventListener('click', () => {
      if (!this.sighActive) this.startSigh();
    });

    // Scratchpad Button
    document.getElementById('btn-scratchpad').addEventListener('click', () => this.toggleScratchpad());

    // Eye rest dismiss
    document.getElementById('eyerest-dismiss').addEventListener('click', () => this.dismissEyeRest());

    // Scratchpad & Gemini
    document.getElementById('scratchpad-close').addEventListener('click', () => this.closeScratchpad());

    // Keyboard
    this.keyHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleScratchpad();
      }
      if (e.key === 'Escape' && this.scratchpadOpen) {
        this.closeScratchpad();
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    // Dev panel
    this.setupDevPanel();

    // Fade out shortcut hint
    const hint = document.querySelector('.shortcut-hint');
    if (hint) {
      setTimeout(() => { hint.style.opacity = '0'; hint.style.transition = 'opacity 3s'; }, 8000);
    }
  }

  /* ---- Audio Mode ---- */

  setAudioMode(mode) {
    this.currentAudioMode = mode;
    window.audioEngine.setMode(mode);

    // Update active tile
    document.querySelectorAll('.audio-tile').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  /* ---- Progress Arc ---- */

  buildArcPath() {
    const svg = document.getElementById('progress-arc-svg');
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const inset = 16;
    const r = 24;

    const fullPath = `
      M ${inset} ${inset + r}
      L ${inset} ${h - inset - r}
      Q ${inset} ${h - inset} ${inset + r} ${h - inset}
      L ${w - inset - r} ${h - inset}
      Q ${w - inset} ${h - inset} ${w - inset} ${h - inset - r}
      L ${w - inset} ${inset + r}
      Q ${w - inset} ${inset} ${w - inset - r} ${inset}
      L ${inset + r} ${inset}
      Q ${inset} ${inset} ${inset} ${inset + r}
    `;

    document.getElementById('progress-arc-bg').setAttribute('d', fullPath);
    const fgPath = document.getElementById('progress-arc-path');
    fgPath.setAttribute('d', fullPath);

    this.pathLength = fgPath.getTotalLength();
    fgPath.style.strokeDasharray = this.pathLength;
    fgPath.style.strokeDashoffset = this.pathLength;
  }

  tick() {
    if (!this.paused) {
      const now = Date.now();
      // Total effectively elapsed across parts
      this.elapsed = this.startElapsedOffset + (now - this.startTime - this.totalPauseMs);
      const progress = Math.min(this.elapsed / this.durationMs, 1);

      const fgPath = document.getElementById('progress-arc-path');
      if (fgPath && this.pathLength) {
        fgPath.style.strokeDashoffset = this.pathLength * (1 - progress);
      }

      // Midway break threshold
      if (this.app.sessionState.totalParts === 2 && this.app.sessionState.currentPart === 1) {
        if (progress >= 0.5) {
          this.complete();
          return;
        }
      }

      // Session complete
      if (progress >= 1) {
        this.complete();
        return;
      }
    }

    this.rafId = requestAnimationFrame(() => this.tick());
  }

  /* ---- Dream Whisper ---- */

  triggerDreamWhisper() {
    const whisperEl = document.getElementById('dream-whisper');
    if (whisperEl && this.app.sessionState.dream) {
      whisperEl.textContent = this.app.sessionState.dream;
      whisperEl.style.opacity = '0.35';
      setTimeout(() => {
        whisperEl.style.opacity = '0';
      }, 6000);
    }
  }

  /* ---- 20/20/20 Guided Eye Rest ---- */

  schedule2020() {
    this.twentyTimer = setTimeout(() => {
      if (this.elapsed < this.durationMs && !this.paused) {
        this.startEyeRest();
      } else {
        this.schedule2020();
      }
    }, 20 * 60 * 1000);
  }

  async startEyeRest() {
    this.pulseCount++;
    this.eyerestActive = true;
    this.paused = true;
    this.pauseStart = Date.now();

    const overlay = document.getElementById('eyerest-overlay');
    const phaseIntro = document.getElementById('eyerest-phase-intro');
    const phaseLook = document.getElementById('eyerest-phase-look');
    const phaseBreathe = document.getElementById('eyerest-phase-breathe');
    const countdown = document.getElementById('eyerest-countdown');

    // Reset phases
    phaseIntro.classList.remove('hidden');
    phaseLook.classList.add('hidden');
    phaseBreathe.classList.add('hidden');

    // Play bell chime
    window.audioEngine.playRestBell();

    // Show overlay
    overlay.classList.add('active');

    // Phase 1: Intro (3 seconds)
    await this.sleep(3000);
    if (!this.eyerestActive) return;

    // Phase 2: Look away with eye animation (5 seconds)
    phaseIntro.classList.add('hidden');
    phaseLook.classList.remove('hidden');

    // Animate pupil looking away
    const pupil = document.getElementById('eye-pupil');
    pupil.classList.add('look-away');
    await this.sleep(5000);
    if (!this.eyerestActive) return;

    // Phase 3: Breathing countdown (20 seconds)
    phaseLook.classList.add('hidden');
    phaseBreathe.classList.remove('hidden');

    const breathCircle = document.getElementById('eyerest-breath-circle');
    breathCircle.classList.add('breathing');

    for (let i = 20; i > 0; i--) {
      if (!this.eyerestActive) return;
      countdown.textContent = i;
      await this.sleep(1000);
    }

    // Play a soft bell to signal end
    window.audioEngine.playRestBell();
    await this.sleep(1000);

    this.dismissEyeRest();
  }

  dismissEyeRest() {
    if (!this.eyerestActive) return;
    this.eyerestActive = false;

    const overlay = document.getElementById('eyerest-overlay');
    overlay.classList.remove('active');

    // Reset phases for next time
    document.getElementById('eyerest-phase-intro').classList.remove('hidden');
    document.getElementById('eyerest-phase-look').classList.add('hidden');
    document.getElementById('eyerest-phase-breathe').classList.add('hidden');
    const pupil = document.getElementById('eye-pupil');
    if (pupil) pupil.classList.remove('look-away');
    const breathCircle = document.getElementById('eyerest-breath-circle');
    if (breathCircle) breathCircle.classList.remove('breathing');

    // Resume session
    this.totalPauseMs += Date.now() - this.pauseStart;
    this.paused = false;

    if (this.pulseCount === 2) {
      setTimeout(() => this.triggerDreamWhisper(), 1000);
    }
    this.schedule2020();
  }

  /* ---- Physiological Sigh ---- */

  async startSigh() {
    this.sighActive = true;
    this.paused = true;
    this.pauseStart = Date.now();

    const overlay = document.getElementById('sigh-overlay');
    const circle = document.getElementById('sigh-circle');
    const text = document.getElementById('sigh-text');

    overlay.classList.add('active');

    for (let cycle = 0; cycle < 3; cycle++) {
      window.audioEngine.playInhaleChime();
      text.textContent = 'Inhale';
      circle.style.transform = 'scale(0.6)';
      await this.sleep(200);
      circle.style.transition = 'transform 2s var(--ease-breathe)';
      circle.style.transform = 'scale(0.9)';
      await this.sleep(2000);

      window.audioEngine.playInhaleChime(); // Second inhale chime
      text.textContent = 'Inhale deeper';
      circle.style.transform = 'scale(1.15)';
      await this.sleep(2000);

      window.audioEngine.playExhaleChime();
      text.textContent = 'Exhale slowly';
      circle.style.transition = 'transform 6s var(--ease-breathe)';
      circle.style.transform = 'scale(0.45)';
      await this.sleep(6000);

      circle.style.transition = 'transform 0.8s var(--ease-breathe)';
      await this.sleep(500);
    }

    overlay.classList.remove('active');
    this.sighActive = false;
    this.totalPauseMs += Date.now() - this.pauseStart;
    this.paused = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ---- Scratchpad ---- */

  toggleScratchpad() {
    this.scratchpadOpen ? this.closeScratchpad() : this.openScratchpad();
  }

  openScratchpad() {
    const pad = document.getElementById('scratchpad');
    const textarea = document.getElementById('scratchpad-textarea');
    pad.classList.add('open');
    this.scratchpadOpen = true;
    textarea.value = this.app.sessionState.scratchpad_notes || '';
    setTimeout(() => textarea.focus(), 400);
  }

  closeScratchpad() {
    const pad = document.getElementById('scratchpad');
    const textarea = document.getElementById('scratchpad-textarea');
    pad.classList.remove('open');
    this.scratchpadOpen = false;
    this.app.sessionState.scratchpad_notes = textarea.value;
  }

  /* ---- Dev Panel ---- */

  setupDevPanel() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === 'true';
    const panel = document.getElementById('dev-panel');

    if (!isDev) {
      panel.style.display = 'none';
      return;
    }

    const toggle = document.getElementById('dev-panel-toggle');
    const content = document.getElementById('dev-panel-content');

    toggle.addEventListener('click', () => {
      content.classList.toggle('open');
    });

    document.getElementById('dev-eyerest').addEventListener('click', () => {
      this.startEyeRest();
    });

    document.getElementById('dev-sigh').addEventListener('click', () => {
      if (!this.sighActive) this.startSigh();
    });

    document.getElementById('dev-short-break').addEventListener('click', () => {
      this.cleanup();
      this.app.sessionState.isMidwayBreak = true;
      this.app.navigateTo('breakmode');
    });

    document.getElementById('dev-long-break').addEventListener('click', () => {
      this.cleanup();
      this.app.sessionState.isMidwayBreak = false;
      this.app.navigateTo('breakmode');
    });

    document.getElementById('dev-dashboard').addEventListener('click', () => {
      this.cleanup();
      this.app.navigateTo('dashboard');
    });

    document.getElementById('dev-dream').addEventListener('click', () => {
      this.triggerDreamWhisper();
    });
  }

  /* ---- Complete ---- */

  complete() {
    const textarea = document.getElementById('scratchpad-textarea');
    if (textarea) this.app.sessionState.scratchpad_notes = textarea.value;

    window.audioEngine.setMode('silence');
    this.cleanup();
    
    // Check if we need to take a midway break or go to the final break
    if (this.app.sessionState.totalParts === 2 && this.app.sessionState.currentPart === 1) {
      this.app.sessionState.currentPart = 2;
      this.app.sessionState.isMidwayBreak = true;
      this.app.navigateTo('breakmode');
    } else {
      this.app.sessionState.isMidwayBreak = false;
      this.app.navigateTo('breakmode');
    }
  }

  cleanup() {
    window.audioEngine.setMode('silence'); // Pause sounds automatically on exit
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.twentyTimer) clearTimeout(this.twentyTimer);
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    if (this.visibilityHandler) document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.eyerestActive = false;
    this.sighActive = false;
  }

  unmount() { this.cleanup(); }
}

window.FocusScreen = FocusScreen;
