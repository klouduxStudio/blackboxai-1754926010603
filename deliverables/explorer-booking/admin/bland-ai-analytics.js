// Bland AI Analytics UI Component

class BlandAIAnalytics {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/analytics';
    this.analyticsData = null;
    this.init();
  }

  async init() {
    await this.loadAnalytics();
    this.render();
  }

  async loadAnalytics() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.analyticsData = data || {};
    } catch (error) {
      console.error('Failed to load Bland AI analytics:', error);
      this.analyticsData = {};
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Analytics</h2>
        <div>
          <p>Total Calls: ${this.analyticsData.totalCalls || 0}</p>
          <p>Active Calls: ${this.analyticsData.activeCalls || 0}</p>
          <p>Average Call Duration: ${this.analyticsData.avgCallDuration || 'N/A'}</p>
          <p>Pathways Executed: ${this.analyticsData.pathwaysExecuted || 0}</p>
          <p>Errors: ${this.analyticsData.errors || 0}</p>
        </div>
      </div>
    `;
  }
}

// Initialize Bland AI Analytics UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAIAnalytics('blandAIAnalyticsContainer');
});
