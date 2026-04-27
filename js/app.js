/* ============================================================
   FlowState — Main App Orchestrator
   State machine, screen routing, ambient effects, dust particles
   ============================================================ */

class FlowStateApp {
  constructor() {
    this.currentScreen = null;
    this.screens = {};
    this.screenInstances = {};
    this.currentUser = null;
    this.sessionCount = 0;

    this.sessionState = {
      subject: '',
      milestone: '',
      distraction: '',
      duration: 90,
      scratchpad_notes: '',
    };
  }

  async init() {
    // Initialize database
    await window.flowDB.init();
    this.currentUser = await window.flowDB.getOrCreateUser();

    // Get session count
    const sessions = await window.flowDB.getAllSessions(this.currentUser.id);
    this.sessionCount = sessions.length;

    // Spawn ambient dust particles
    this.spawnDust();

    // Create screen instances
    this.screenInstances = {
      home: new HomeScreen(this),
      intention: new IntentionScreen(this),
      breathing: new BreathingScreen(this),
      setup: new SetupScreen(this),
      focus: new FocusScreen(this),
      breakmode: new BreakScreen(this),
      dashboard: new DashboardScreen(this),
    };

    // Render
    const app = document.getElementById('app');
    const breathTransition = `
      <div class="breath-transition" id="breath-transition">
        <div class="breath-transition-circle"></div>
        <p class="breath-transition-text">Returning to stillness…</p>
      </div>
    `;

    let html = '';
    for (const [name, screen] of Object.entries(this.screenInstances)) {
      html += screen.render();
    }
    html += breathTransition;
    app.innerHTML = html;

    this.navigateTo('home');
  }

  navigateTo(screenName) {
    // Unmount current
    if (this.currentScreen && this.screenInstances[this.currentScreen]?.unmount) {
      this.screenInstances[this.currentScreen].unmount();
    }

    // Hide all
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // For dashboard, re-render fresh
    if (screenName === 'dashboard') {
      const instance = new DashboardScreen(this);
      this.screenInstances.dashboard = instance;
      const dashEl = document.getElementById('screen-dashboard');
      if (dashEl) {
        dashEl.outerHTML = instance.render();
      }
      document.getElementById('screen-dashboard').classList.add('active');
    } else {
      const targetEl = document.getElementById(`screen-${screenName}`);
      if (targetEl) targetEl.classList.add('active');
    }

    this.currentScreen = screenName;

    // Mount
    if (this.screenInstances[screenName]?.mount) {
      this.screenInstances[screenName].mount();
    }
  }

  showBreathTransition(callback) {
    const el = document.getElementById('breath-transition');
    el.classList.add('active');
    setTimeout(() => {
      el.classList.remove('active');
      if (callback) callback();
    }, 5000);
  }

  resetSession() {
    this.sessionState = {
      subject: '',
      milestone: '',
      distraction: '',
      duration: 90,
      scratchpad_notes: '',
    };
  }

  /* ---- Ambient Dust Particles ---- */

  spawnDust() {
    const container = document.getElementById('dust-container');
    if (!container) return;

    const count = 25;
    for (let i = 0; i < count; i++) {
      const dust = document.createElement('div');
      dust.classList.add('dust');
      dust.style.left = `${Math.random() * 100}%`;
      dust.style.animationDuration = `${15 + Math.random() * 25}s`;
      dust.style.animationDelay = `${Math.random() * 20}s`;
      dust.style.width = `${1 + Math.random() * 2}px`;
      dust.style.height = dust.style.width;
      container.appendChild(dust);
    }
  }
}

// Boot
document.addEventListener('DOMContentLoaded', async () => {
  const app = new FlowStateApp();
  await app.init();
});
