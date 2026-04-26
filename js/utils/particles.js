/* ============================================================
   FlowState — Particle System (Milestone Visual Evolution)
   Canvas-based star-field with warm amber palette
   Unlockable at 10h, 50h, 100h of deep work
   ============================================================ */

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.tier = 0;
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setTier(totalHours) {
    if (totalHours >= 100) this.tier = 3;
    else if (totalHours >= 50) this.tier = 2;
    else if (totalHours >= 10) this.tier = 1;
    else this.tier = 0;

    this.createParticles();

    if (this.tier > 0) {
      this.canvas.classList.add('visible');
      if (!this.animationId) this.animate();
    } else {
      this.canvas.classList.remove('visible');
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  createParticles() {
    this.particles = [];
    const counts = [0, 30, 60, 100];
    const count = counts[this.tier];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        radius: Math.random() * 1.5 + 0.5,
        baseOpacity: this.tier === 1 ? 0.12 : this.tier === 2 ? 0.18 : 0.22,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const time = Date.now() * 0.001;

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      let opacity = p.baseOpacity;
      if (this.tier >= 2) {
        opacity += Math.sin(time * p.twinkleSpeed * 10 + p.twinkleOffset) * 0.08;
      }

      // Warm amber particles
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(212, 168, 83, ${Math.max(0, opacity)})`;
      this.ctx.fill();
    });

    // Tier 3: constellation lines
    if (this.tier === 3) {
      this.drawConstellations();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawConstellations() {
    const maxDist = 110;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.04;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(212, 168, 83, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

window.ParticleSystem = ParticleSystem;
