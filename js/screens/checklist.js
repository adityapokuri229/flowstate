/* ============================================================
   Screen — Pre-Session Checklist
   Final physical environment checks before entering focus
   ============================================================ */

class ChecklistScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div class="screen" id="screen-checklist">
        <div class="checklist-container">
          <header class="checklist-header">
            <h1>Final Preparation</h1>
            <p class="checklist-subtitle">Optimizing your physical environment for cognitive absorption.</p>
          </header>

          <div class="checklist-items">
            <div class="checklist-item" style="--i:0">
              <div class="checklist-bullet"></div>
              <p>Keep some water next to you.</p>
            </div>
            <div class="checklist-item" style="--i:1">
              <div class="checklist-bullet"></div>
              <p>Set all devices to Do Not Disturb.</p>
            </div>
            <div class="checklist-item" style="--i:2">
              <div class="checklist-bullet"></div>
              <p>Ensure your lighting is comfortable and warm.</p>
            </div>
          </div>

          <button class="btn btn-large" id="btn-checklist-ready" style="margin-top: 4rem; width: 100%; max-width: 320px; opacity: 0; transform: translateY(10px); transition: all 0.8s ease;">
            I am Ready
          </button>
        </div>
      </div>
    `;
  }

  mount() {
    const items = document.querySelectorAll('.checklist-item');
    const readyBtn = document.getElementById('btn-checklist-ready');

    // Staggered animation
    items.forEach((item, i) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 300 + i * 250);
    });

    setTimeout(() => {
      readyBtn.style.opacity = '1';
      readyBtn.style.transform = 'translateY(0)';
      readyBtn.classList.add('pulse-gold'); // Auto-highlight as it's a non-interactive list now
    }, 1200);

    readyBtn.onclick = () => {
      this.app.navigateTo('focus');
    };
  }

  checkAllReady() {
    const items = document.querySelectorAll('.checklist-item');
    const readyBtn = document.getElementById('btn-checklist-ready');
    const checked = document.querySelectorAll('.checklist-item.checked');
    
    if (checked.length === items.length) {
      readyBtn.classList.add('pulse-gold');
    } else {
      readyBtn.classList.remove('pulse-gold');
    }
  }

  unmount() {}
}

window.ChecklistScreen = ChecklistScreen;
