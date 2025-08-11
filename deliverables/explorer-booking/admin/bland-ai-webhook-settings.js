// Bland AI Webhook Settings UI Component

class BlandAIWebhookSettings {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/webhook-settings';
    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.render();
  }

  async loadSettings() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.settings = data.settings || {};
    } catch (error) {
      console.error('Failed to load webhook settings:', error);
      this.settings = {};
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Webhook Settings</h2>
        <form id="webhookSettingsForm" class="space-y-4">
          <div>
            <label class="block font-medium mb-1">Webhook URL</label>
            <input type="url" id="webhookUrl" class="w-full p-2 border rounded" value="${this.settings.webhookUrl || ''}" />
          </div>
          <div>
            <label class="block font-medium mb-1">Secret Token</label>
            <input type="text" id="secretToken" class="w-full p-2 border rounded" value="${this.settings.secretToken || ''}" />
          </div>
          <button type="submit" class="bg-primary text-white px-4 py-2 rounded hover:bg-red-600">
            Save Settings
          </button>
        </form>
      </div>
    `;

    document.getElementById('webhookSettingsForm').addEventListener('submit', e => this.saveSettings(e));
  }

  async saveSettings(event) {
    event.preventDefault();

    const newSettings = {
      webhookUrl: document.getElementById('webhookUrl').value.trim(),
      secretToken: document.getElementById('secretToken').value.trim()
    };

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        alert('Webhook settings saved successfully');
      } else {
        alert('Failed to save webhook settings');
      }
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      alert('Error saving webhook settings');
    }
  }
}

// Initialize Bland AI Webhook Settings UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAIWebhookSettings('blandAIWebhookSettingsContainer');
});
