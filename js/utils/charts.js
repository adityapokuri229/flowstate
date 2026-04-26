/* ============================================================
   FlowState — SVG Chart Renderer
   Warm amber palette, smooth Bezier curves
   ============================================================ */

class ChartRenderer {
  /**
   * Render a cumulative hours line chart into a container
   */
  static renderLineChart(container, data) {
    if (!data.length) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-tertiary);font-style:italic;">Complete your first session to see data</p>';
      return;
    }

    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxHours = Math.max(...data.map(d => d.hours), 1);
    const minDate = new Date(data[0].date);
    const maxDate = new Date(data[data.length - 1].date);
    const dateRange = Math.max(maxDate - minDate, 1);

    const points = data.map(d => {
      const x = padding.left + ((new Date(d.date) - minDate) / dateRange) * chartW;
      const y = padding.top + chartH - (d.hours / maxHours) * chartH;
      return { x, y, hours: d.hours };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
      pathD += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const lastP = points[points.length - 1];
    const firstP = points[0];
    const fillD = pathD +
      ` L ${lastP.x} ${padding.top + chartH}` +
      ` L ${firstP.x} ${padding.top + chartH} Z`;

    const yLabels = [];
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxHours / yTicks * i).toFixed(1);
      const y = padding.top + chartH - (i / yTicks) * chartH;
      yLabels.push(`<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-tertiary)" font-size="10" font-family="Outfit">${val}h</text>`);
      yLabels.push(`<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--border-color)" stroke-width="1"/>`);
    }

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGradientFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.01"/>
          </linearGradient>
        </defs>
        ${yLabels.join('')}
        <path d="${fillD}" fill="url(#lineGradientFill)"/>
        <path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="3" fill="var(--bg-primary)" stroke="var(--accent)" stroke-width="1.5"/>
        `).join('')}
        <circle cx="${lastP.x}" cy="${lastP.y}" r="5" fill="var(--accent)" opacity="0.3"/>
        <circle cx="${lastP.x}" cy="${lastP.y}" r="3" fill="var(--accent)"/>
      </svg>
    `;

    container.innerHTML = svg;
  }

  /**
   * Render subject breakdown bars
   */
  static renderSubjectBars(container, data) {
    if (!data.length) {
      container.innerHTML = '<p style="color:var(--text-tertiary);font-size:0.82rem;font-style:italic;">No sessions in the last 7 days</p>';
      return;
    }

    const maxHours = Math.max(...data.map(d => d.hours));

    container.innerHTML = data.map(d => {
      const pct = (d.hours / maxHours) * 100;
      return `
        <div class="subject-bar">
          <span class="subject-bar-label">${this.escapeHtml(d.subject)}</span>
          <div class="subject-bar-track">
            <div class="subject-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="subject-bar-value">${d.hours}h</span>
        </div>
      `;
    }).join('');
  }

  static escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.ChartRenderer = ChartRenderer;
