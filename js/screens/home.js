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
            
            <div class="name-capture">
              <input type="text" id="field-name" placeholder="What is your name?" />
            </div>

            <button class="btn btn-large" id="btn-enter">Enter Flow</button>
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
          <div class="home-watermark">
            Created by Aditya Pokuri
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
    // Animations
    setTimeout(() => {
      nameCapture.classList.add('visible');
    }, 400);
    setTimeout(() => enterBtn.classList.add('visible'), 500);

    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 700 + (i * 150));
    });

    enterBtn.addEventListener('click', async () => {
      const name = nameField.value.trim();
      if (!name) {
        // Shake animation for mandatory field
        nameField.style.borderBottomColor = 'var(--error, #ff4444)';
        nameCapture.classList.add('shake');
        setTimeout(() => {
          nameCapture.classList.remove('shake');
          nameField.style.borderBottomColor = 'rgba(212, 168, 83, 0.4)';
        }, 500);
        return;
      }

      // Request fullscreen on mobile/tablet to prevent UI skewing
      if (/Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent)) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      }

      this.app.currentUser.name = name;
      window.flowLogger.logName(name); // Log to spreadsheet
      this.app.navigateTo('intention');
    });

    // Mobile Recommendation Check
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent) && !/iPad|Tablet/i.test(navigator.userAgent)) {
      setTimeout(() => {
        const note = document.createElement('div');
        note.className = 'mobile-recommendation-note';
        note.innerHTML = `
          <p>We recommend using a bigger screen like a tablet or a laptop for the best experience.</p>
          <button onclick="this.parentElement.remove()">Dismiss</button>
        `;
        document.body.appendChild(note);
      }, 2000);
    }
  }

  unmount() {}
}

window.HomeScreen = HomeScreen;
