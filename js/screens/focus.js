/* ============================================================
   Screen — Focus Mode (The Core)
   Living, breathing mandala. Progress arc. All controls.
   Scientifically-grounded interruptions and recovery tools.
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

          <!-- Central Mandala — living breathing anchor -->
          <div class="focus-mandala" id="focus-mandala">
            <div class="mandala-ring mandala-ring-1"></div>
            <div class="mandala-ring mandala-ring-2"></div>
            <div class="mandala-ring mandala-ring-3"></div>
            <div class="mandala-core"></div>
          </div>
        </div>

        <!-- 20/20/20 Pulse Overlay -->
        <div class="pulse-overlay" id="pulse-overlay">
          <div class="pulse-breath-circle"></div>
          <p>Look 20 feet away.<br/>Breathe.</p>
          <span class="citation">20-20-20 Rule — American Academy of Ophthalmology</span>
        </div>

        <!-- Physiological Sigh Overlay -->
        <div class="sigh-overlay" id="sigh-overlay">
          <div class="sigh-circle" id="sigh-circle"></div>
          <p class="sigh-text" id="sigh-text"></p>
          <p class="sigh-subtitle">Physiological Sigh — Huberman Lab, Stanford</p>
        </div>

        <!-- Controls -->
        <div class="focus-controls" id="focus-controls">
          <div class="control-group">
            <button class="control-btn" id="btn-audio" aria-label="Toggle audio">
              <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              <span class="tooltip" id="audio-tooltip">Silence</span>
            </button>
            <span class="control-label">Sound</span>
          </div>

          <div class="control-group">
            <button class="control-btn" id="btn-sigh" aria-label="Physiological sigh">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
              <span class="tooltip">Physiological Sigh (30s)</span>
            </button>
            <span class="control-label">Breathe</span>
          </div>

          <div class="control-group">
            <button class="control-btn" id="btn-debug-skip" aria-label="Skip to Feynman">
              <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              <span class="tooltip">Test: Skip to Break</span>
            </button>
            <span class="control-label">Skip</span>
          </div>
        </div>

        <!-- Keyboard shortcut hint -->
        <div class="shortcut-hint">
          <kbd>⌘</kbd> + <kbd>K</kbd> Scratchpad
        </div>

        <!-- Scratchpad -->
        <div class="scratchpad" id="scratchpad">
          <div class="scratchpad-header">
            <h3>Scratchpad</h3>
            <button class="scratchpad-close" id="scratchpad-close" aria-label="Close scratchpad">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <p class="scratchpad-hint">Externalize intrusive thoughts to free working memory. This is saved with your session.</p>
          <textarea id="scratchpad-textarea" placeholder="Dump distracting thoughts here..."></textarea>
        </div>
      </div>
    `;
  }

  mount() {
    this.durationMs = this.app.sessionState.duration * 60 * 1000;
    this.startTime = Date.now();
    this.elapsed = 0;
    this.paused = false;
    this.totalPauseMs = 0;
    this.pulseCount = 0;
    this.dreamWhisperShown = false;

    this.buildArcPath();
    this.tick();

    setTimeout(() => {
      document.body.classList.add('theme-focus');
      window.audioEngine.playFocusBell();
    }, 500);

    // Initial Dream Whisper
    if (this.app.sessionState.dream) {
      setTimeout(() => this.triggerDreamWhisper(), 120 * 1000); // 2 minutes
    }

    this.schedule2020();

    // Audio
    document.getElementById('btn-audio').addEventListener('click', () => {
      const mode = window.audioEngine.cycleMode();
      const labels = { binaural: '40Hz Binaural', brown: 'Brown Noise', silence: 'Silence' };
      document.getElementById('audio-tooltip').textContent = labels[mode] || 'Silence';
    });

    // Sigh
    document.getElementById('btn-sigh').addEventListener('click', () => {
      if (!this.sighActive) this.startSigh();
    });

    // Debug Skip
    document.getElementById('btn-debug-skip').addEventListener('click', () => this.complete());

    // Scratchpad
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

    // Particles
    this.setupParticles();

    // Fade in shortcut hint then fade out
    const hint = document.querySelector('.shortcut-hint');
    if (hint) {
      setTimeout(() => { hint.style.opacity = '0'; hint.style.transition = 'opacity 3s'; }, 8000);
    }
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
      this.elapsed = now - this.startTime - this.totalPauseMs;
      const progress = Math.min(this.elapsed / this.durationMs, 1);

      const fgPath = document.getElementById('progress-arc-path');
      if (fgPath && this.pathLength) {
        fgPath.style.strokeDashoffset = this.pathLength * (1 - progress);
      }

      if (progress >= 1) {
        this.complete();
        return;
      }
    }

    this.rafId = requestAnimationFrame(() => this.tick());
  }

  /* ---- Dream Whisper ---- */

  triggerDreamWhisper() {
    // Only show the pulse-triggered one once. Initial timer is separate.
    const whisperEl = document.getElementById('dream-whisper');
    if (whisperEl && this.app.sessionState.dream) {
      whisperEl.textContent = this.app.sessionState.dream;
      whisperEl.style.opacity = '0.35';
      setTimeout(() => {
        whisperEl.style.opacity = '0';
      }, 6000); // fade transition handles the 4s out
    }
  }

  /* ---- 20/20/20 Rule ---- */

  schedule2020() {
    this.twentyTimer = setTimeout(() => {
      if (this.elapsed < this.durationMs && !this.paused) {
        this.show2020Pulse();
      } else {
        this.schedule2020(); // check again
      }
    }, 20 * 60 * 1000); // 20 mins
  }

  show2020Pulse() {
    this.pulseCount++;
    const overlay = document.getElementById('pulse-overlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
      overlay.classList.remove('active');
      if (this.pulseCount === 2) {
        // Trigger whisper immediately after the second 20-min pulse dismisses
        setTimeout(() => this.triggerDreamWhisper(), 1000);
      }
      this.schedule2020(); // Schedule next 20 mins
    }, 20000); // 20 seconds
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
      // Double inhale
      text.textContent = 'Inhale';
      circle.style.transform = 'scale(0.6)';
      await this.sleep(200);
      circle.style.transition = 'transform 2s var(--ease-breathe)';
      circle.style.transform = 'scale(0.9)';
      await this.sleep(2000);

      text.textContent = 'Inhale deeper';
      circle.style.transform = 'scale(1.15)';
      await this.sleep(2000);

      // Extended exhale
      text.textContent = 'Exhale slowly';
      circle.style.transition = 'transform 6s var(--ease-breathe)';
      circle.style.transform = 'scale(0.45)';
      await this.sleep(6000);

      // Reset
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

  /* ---- Particles ---- */

  setupParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    if (!window.particleSystem) {
      window.particleSystem = new ParticleSystem(canvas);
    }
    const user = this.app.currentUser;
    if (user) window.particleSystem.setTier(user.total_hours || 0);
  }

  /* ---- Complete ---- */

  complete() {
    const textarea = document.getElementById('scratchpad-textarea');
    if (textarea) this.app.sessionState.scratchpad_notes = textarea.value;

    window.audioEngine.setMode('silence');
    this.cleanup();
    this.app.navigateTo('feynman');
  }

  cleanup() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.twentyTimer) clearInterval(this.twentyTimer);
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
  }

  unmount() { this.cleanup(); }
}

window.FocusScreen = FocusScreen;
