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
            <button class="btn btn-large" id="btn-enter" style="margin-top: 2rem;">Enter Flow</button>
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
              <h3>The Testing Effect</h3>
              <p>Post-session Feynman memory dumps enforce active recall and deepen learning consolidation.</p>
            </div>
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
    const enterBtn = document.getElementById('btn-enter');
    const cards = document.querySelectorAll('.feature-card');

    setTimeout(() => heroTitle.classList.add('visible'), 100);
    setTimeout(() => heroSub.classList.add('visible'), 300);
    setTimeout(() => enterBtn.classList.add('visible'), 500);

    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 700 + (i * 150));
    });

    enterBtn.addEventListener('click', () => {
      this.app.navigateTo('intention');
    });
  }

  unmount() {}
}

window.HomeScreen = HomeScreen;
