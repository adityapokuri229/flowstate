/* ============================================================
   Screen — Home (Landing Page)
   Explains the application, visualizes the theme, entry point.
   ============================================================ */

class HomeScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div class="screen" id="screen-home">
        <div class="home-container">
          <header class="home-hero">
            <h1 class="hero-title">FlowState</h1>
            <p class="hero-subtitle">A scientifically grounded environment for deep work, obsession, and total cognitive absorption.</p>
            
            <div class="name-capture" style="margin-top: 2rem; opacity: 0; transform: translateY(20px); transition: all 1s var(--ease-smooth);">
              <input type="text" id="field-name" placeholder="What is your name?" style="font-family: inherit; text-align: center; font-size: 1.2rem; background: transparent; border: none; border-bottom: 1px solid rgba(212, 168, 83, 0.4); color: var(--text-primary); padding: 0.5rem; outline: none; width: 250px;" />
            </div>

            <button class="btn btn-large" id="btn-enter" style="margin-top: 1.5rem;">Enter Flow</button>
          </header>

          <div class="feature-grid">
            <div class="feature-card">
              <h3>Binaural Audio Engine</h3>
              <p>40Hz and Brown noise layers designed to stabilize focus and filter out cognitive distractions.</p>
            </div>
            <div class="feature-card">
              <h3>Ultradian Rhythms</h3>
              <p>Work sessions tailored to 90-minute biological cycles, optimizing peak performance before fatigue.</p>
            </div>
            <div class="feature-card">
              <h3>Physiological Recovery</h3>
              <p>Mandatory cyclic breaks with box breathing and active recovery protocols to prevent burnout.</p>
            </div>
            <div class="feature-card">
              <h3>Eye Rest Protocol</h3>
              <p>20/20/20 eye rest prompts to reduce ocular fatigue during deep focus.</p>
            </div>
        </div>
      </div>
    `;
  }

  mount() {
    document.body.classList.remove('theme-break');
    document.body.classList.remove('theme-focus'); // Ensure base theme

    // Animate hero and cards
    const heroTitle = document.querySelector('.hero-title');
    const heroSub = document.querySelector('.hero-subtitle');
    const nameCapture = document.querySelector('.name-capture');
    const nameField = document.getElementById('field-name');
    const enterBtn = document.getElementById('btn-enter');
    const cards = document.querySelectorAll('.feature-card');

    if (this.app.currentUser && this.app.currentUser.name) {
      nameField.value = this.app.currentUser.name;
    }

    setTimeout(() => heroTitle.classList.add('visible'), 100);
    setTimeout(() => heroSub.classList.add('visible'), 300);
    setTimeout(() => {
      nameCapture.style.opacity = '1';
      nameCapture.style.transform = 'translateY(0)';
    }, 400);
    setTimeout(() => enterBtn.classList.add('visible'), 500);

    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 700 + (i * 150));
    });

    enterBtn.addEventListener('click', async () => {
      const name = nameField.value.trim();
      if (name) {
        this.app.currentUser.name = name;
        await window.flowDB.updateUserName(this.app.currentUser.id, name);
        window.flowLogger.logName(name); // Log to spreadsheet
      }
      this.app.navigateTo('intention');
    });
  }

  unmount() {}
}

window.HomeScreen = HomeScreen;
