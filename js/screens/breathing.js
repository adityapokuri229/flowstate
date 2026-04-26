/* ============================================================
   Screen B — Box Breathing
   4s inhale → 4s hold → 4s exhale → 4s hold × 3 cycles
   With concentric rings and meditative text
   ============================================================ */

class BreathingScreen {
  constructor(app) {
    this.app = app;
    this.totalCycles = 3;
    this.phaseDuration = 4000;
    this.currentCycle = 0;
    this.currentPhase = 0;
    this.phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    this.timer = null;
  }

  render() {
    const dots = Array.from({ length: this.totalCycles }, (_, i) =>
      `<div class="dot" data-cycle="${i}"></div>`
    ).join('');

    return `
      <div class="screen" id="screen-breathing">
        <div class="breathing-container">
          <p class="citation" style="margin-bottom:1rem;opacity:0.4;font-size:0.72rem;">
            Box breathing activates the parasympathetic nervous system — Ma et al., 2017
          </p>

          <div class="breathing-circle-wrapper">
            <div class="breathing-ring"></div>
            <div class="breathing-ring"></div>
            <div class="breathing-ring"></div>
            <div class="breathing-circle" id="breathing-circle"></div>
          </div>

          <p class="breathing-phase-text" id="breathing-phase-text"></p>

          <div class="breathing-dots" id="breathing-dots">
            ${dots}
          </div>

          <button id="btn-skip-breathing" class="btn btn-ghost" style="margin-top: 1rem; font-size: 0.7rem; padding: 0.5rem 1rem; opacity: 0.4;">
            Skip Ritual (Testing)
          </button>
        </div>
      </div>
    `;
  }

  mount() {
    this.currentCycle = 0;
    this.currentPhase = 0;

    document.getElementById('btn-skip-breathing').addEventListener('click', () => this.complete());

    setTimeout(() => this.startCycle(), 1000);
  }

  startCycle() {
    if (this.currentCycle >= this.totalCycles) {
      this.complete();
      return;
    }

    const dots = document.querySelectorAll('#breathing-dots .dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i <= this.currentCycle));

    this.currentPhase = 0;
    this.runPhase();
  }

  runPhase() {
    if (this.currentPhase >= this.phases.length) {
      this.currentCycle++;
      this.startCycle();
      return;
    }

    const phaseText = document.getElementById('breathing-phase-text');
    const circle = document.getElementById('breathing-circle');
    const phaseName = this.phases[this.currentPhase];

    phaseText.textContent = phaseName;

    circle.classList.remove('inhale', 'hold-in', 'exhale', 'hold-out');

    switch (this.currentPhase) {
      case 0:
        circle.classList.add('inhale');
        break;
      case 1:
        circle.style.transform = 'scale(1.1)';
        circle.style.opacity = '1';
        break;
      case 2:
        circle.classList.add('exhale');
        break;
      case 3:
        circle.style.transform = 'scale(0.5)';
        circle.style.opacity = '0.5';
        break;
    }

    this.timer = setTimeout(() => {
      this.currentPhase++;
      this.runPhase();
    }, this.phaseDuration);
  }

  complete() {
    const phaseText = document.getElementById('breathing-phase-text');
    phaseText.textContent = '';
    setTimeout(() => this.app.navigateTo('setup'), 800);
  }

  unmount() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }
}

window.BreathingScreen = BreathingScreen;
