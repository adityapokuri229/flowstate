/* ============================================================
   FlowState — External Logging Utility
   Handles logging user data to external endpoints (e.g., Google Sheets via Apps Script)
   ============================================================ */

class FlowLogger {
  constructor() {
    // Replace this with your actual Google Apps Script Web App URL
    this.endpoint = localStorage.getItem('flow_log_endpoint') || '';
  }

  setEndpoint(url) {
    this.endpoint = url;
    localStorage.setItem('flow_log_endpoint', url);
  }

  async log(data) {
    if (!this.endpoint) {
      console.warn('FlowLogger: No endpoint configured. Skipping log.');
      return false;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        mode: 'no-cors', // Common for Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });
      return true;
    } catch (err) {
      console.error('FlowLogger: Failed to log data', err);
      return false;
    }
  }

  async logName(name) {
    return this.log({ type: 'name_capture', name });
  }

  async logIntention(name, milestone, dream) {
    return this.log({ type: 'intention_capture', name, milestone, dream });
  }
}

window.flowLogger = new FlowLogger();
