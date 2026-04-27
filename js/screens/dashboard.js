/* ============================================================
   Screen — Post-Session Dashboard
   Debrief, analytics, mastery tracking, milestones
   ============================================================ */

class DashboardScreen {
  constructor(app) {
    this.app = app;
  }

  render() {
    const duration = this.app.sessionState.duration || 0;

    return `
      <div class="screen" id="screen-dashboard" style="display: flex; align-items: center; justify-content: center; height: 100vh;">
        <div class="dash-container" style="text-align: center; max-width: 600px;">
          <header class="dash-header" style="margin-bottom: 3rem;">
            <h1 style="font-size: 4rem; margin-bottom: 1rem; color: var(--accent);">Session Complete</h1>
            <p style="font-size: 1.5rem; color: var(--text-secondary);">${duration} minutes of deep work. Well done.</p>
          </header>

          <div class="quote-block visible" id="dash-quote-block" style="margin-left:auto; margin-right:auto; max-width: 600px; text-align: center; border-left:none; border-bottom: 2px solid rgba(212, 168, 83, 0.3); padding-bottom: 1rem; margin-bottom: 3rem;">
            <q id="dash-quote-text" style="font-size: 1.25rem;"></q>
            <cite id="dash-quote-author"></cite>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-large" id="btn-save-session" style="min-width: 200px;">Save Session</button>
            <button class="btn btn-ghost" id="btn-new-session" style="min-width: 200px;">Start Another</button>
          </div>
        </div>
      </div>
    `;
  }

  mount() {

    // Quote
    const quote = window.FlowQuotes.getQuote(this.app.sessionState.dream || '');
    document.getElementById('dash-quote-text').textContent = quote.text;
    document.getElementById('dash-quote-author').textContent = quote.author;

    // Reset session
    document.getElementById('btn-save-session').addEventListener('click', async () => {
      await this.saveSession();
    });

    document.getElementById('btn-new-session').addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      this.app.resetSession();
      this.app.navigateTo('intention');
    });

    this.loadAnalytics();
  }

  async saveSession() {
    const state = this.app.sessionState;
    const session = {
      user_id: this.app.currentUser.id,
      duration_minutes: state.duration,
      subject: state.subject || 'Unspecified',
      milestone: state.milestone || '',
      flow_rating: 5,
      achieved_status: 'yes',
      scratchpad_notes: state.scratchpad_notes || '',
      feynman_dump: state.feynman_dump || '',
    };

    await window.flowDB.saveSession(session);

    const hoursToAdd = (state.duration || 0) / 60;
    await window.flowDB.updateUserHours(this.app.currentUser.id, hoursToAdd);
    this.app.currentUser = await window.flowDB.getUser(this.app.currentUser.id);

    const btn = document.getElementById('btn-save-session');
    btn.textContent = 'Saved ✓';
    btn.disabled = true;
    btn.style.opacity = '0.5';

    this.loadAnalytics();
  }

  async loadAnalytics() {
    // simplified analytics call
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.DashboardScreen = DashboardScreen;
