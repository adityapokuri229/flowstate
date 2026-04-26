/* ============================================================
   Screen — Post-Session Dashboard
   Debrief, analytics, mastery tracking, milestones
   ============================================================ */

class DashboardScreen {
  constructor(app) {
    this.app = app;
    this.flowRating = 3;
    this.achieved = null;
  }

  render() {
    const scratchNotes = this.app.sessionState.scratchpad_notes || 'No notes captured.';
    const feynmanDump = this.app.sessionState.feynman_dump || 'No concepts recorded.';
    const duration = this.app.sessionState.duration || 0;

    return `
      <div class="screen" id="screen-dashboard">
        <div class="dash-container">
          <header class="dash-header">
            <h2>Session Complete</h2>
            <div class="quote-block visible" id="dash-quote-block" style="margin-left:auto; margin-right:auto; max-width: 600px; text-align: center; border-left:none; border-bottom: 2px solid rgba(212, 168, 83, 0.3); padding-bottom: 1rem;">
              <q id="dash-quote-text"></q>
              <cite id="dash-quote-author"></cite>
            </div>
          </header>

          <div class="dash-grid">
            <p>${duration} minutes of deep work. Well done.</p>
          </div>

          <!-- Feynman Concepts -->
          <div class="dashboard-section">
            <h2>Feynman Concepts</h2>
            <div class="dashboard-notes">${this.escapeHtml(feynmanDump).replace(/\n---\n/g, '\n\n')}</div>
          </div>

          <!-- Scratchpad Notes -->
          <div class="dashboard-section">
            <h2>Scratchpad Notes</h2>
            <div class="dashboard-notes">${this.escapeHtml(scratchNotes) || '<em style="color:var(--text-tertiary)">Empty — a focused session.</em>'}</div>
          </div>

          <!-- Flow Rating -->
          <div class="dashboard-section">
            <h2>Flow Rating</h2>
            <div class="flow-rating">
              <div class="flow-rating-track">
                <span>Scattered</span>
                <input type="range" class="range-slider" id="flow-slider" min="1" max="5" step="1" value="3" />
                <span>Deep Flow</span>
              </div>
              <div style="text-align:center;">
                <span class="flow-rating-value" id="flow-value">3</span>
              </div>
            </div>
            <p class="citation">Self-reported flow correlates with theta-to-alpha EEG ratios — Katahira et al., 2018</p>
          </div>

          <!-- Milestone Achievement -->
          <div class="dashboard-section">
            <h2>Did you achieve the milestone?</h2>
            <p style="font-size:0.82rem;color:var(--text-tertiary);margin-bottom:0.5rem;font-style:italic;">"${this.escapeHtml(this.app.sessionState.milestone || '')}"</p>
            <div class="achievement-pills" id="achievement-pills">
              <button class="achievement-pill" data-value="yes">Yes</button>
              <button class="achievement-pill" data-value="partial">Partial</button>
              <button class="achievement-pill" data-value="no">No</button>
            </div>
          </div>

          <!-- Save -->
          <button class="btn btn-large" id="btn-save-session" style="width:100%;">Save Session</button>

          <!-- Analytics -->
          <div class="dashboard-section" id="analytics-section" style="display:none;">
            <h2>Deep Work Analytics</h2>
            <div class="chart-container" id="chart-cumulative"></div>
          </div>

          <div class="dashboard-section" id="subject-section" style="display:none;">
            <h2>Mastery Tracking — Last 7 Days</h2>
            <div class="subject-bars" id="subject-bars"></div>
          </div>

          <div class="dashboard-section" id="milestone-section" style="display:none;">
            <h2>Visual Evolution Milestones</h2>
            <div class="milestones" id="milestones-container">
              <div class="milestone" data-threshold="10">
                <div class="milestone-icon">✦</div>
                <span class="milestone-label">10 hours</span>
              </div>
              <div class="milestone" data-threshold="50">
                <div class="milestone-icon">✦✦</div>
                <span class="milestone-label">50 hours</span>
              </div>
              <div class="milestone" data-threshold="100">
                <div class="milestone-icon">✦✦✦</div>
                <span class="milestone-label">100 hours</span>
              </div>
            </div>
            <p class="citation" style="text-align:center;margin-top:0.5rem;">
              "10,000 hours" is a simplification — deliberate practice quality matters more than quantity. — Ericsson et al., 1993
            </p>
          </div>

          <!-- New Session -->
          <button class="btn btn-ghost" id="btn-new-session" style="width:100%;margin-bottom:2rem;">
            Start Another Session
          </button>
        </div>
      </div>
    `;
  }

  mount() {
    const flowSlider = document.getElementById('flow-slider');
    const flowValue = document.getElementById('flow-value');
    flowSlider.addEventListener('input', () => {
      this.flowRating = parseInt(flowSlider.value, 10);
      flowValue.textContent = this.flowRating;
    });

    const pills = document.querySelectorAll('#achievement-pills .achievement-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        this.achieved = pill.dataset.value;
      });
    });

    ChartRenderer.renderFlowChart(document.getElementById('flow-chart'));
    ChartRenderer.renderActivityGrid(document.getElementById('activity-grid'));

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
      flow_rating: this.flowRating,
      achieved_status: this.achieved || 'partial',
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
    const userId = this.app.currentUser?.id;
    if (!userId) return;

    const sessions = await window.flowDB.getAllSessions(userId);
    if (sessions.length === 0) return;

    document.getElementById('analytics-section').style.display = '';
    document.getElementById('subject-section').style.display = '';
    document.getElementById('milestone-section').style.display = '';

    const cumulativeData = await window.flowDB.getCumulativeHours(userId);
    ChartRenderer.renderLineChart(document.getElementById('chart-cumulative'), cumulativeData);

    const subjectData = await window.flowDB.getSubjectBreakdown(userId);
    ChartRenderer.renderSubjectBars(document.getElementById('subject-bars'), subjectData);

    const totalHours = this.app.currentUser.total_hours || 0;
    document.querySelectorAll('#milestones-container .milestone').forEach(m => {
      const threshold = parseInt(m.dataset.threshold, 10);
      if (totalHours >= threshold) m.classList.add('achieved');
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.DashboardScreen = DashboardScreen;
