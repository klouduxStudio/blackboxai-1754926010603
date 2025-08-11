// Bland AI Settings UI Component

class BlandAISettings {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/settings';
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
      console.error('Failed to load Bland AI settings:', error);
      this.settings = {};
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Settings</h2>
        <form id="blandAISettingsForm" class="space-y-4">
          <div>
            <label class="block font-medium mb-1">API Key</label>
            <input type="text" id="apiKey" class="w-full p-2 border rounded" value="${this.settings.apiKey || ''}" />
          </div>
          <div>
            <label class="block font-medium mb-1">Webhook URL</label>
            <input type="url" id="webhookUrl" class="w-full p-2 border rounded" value="${this.settings.webhookUrl || ''}" />
          </div>
          <div>
            <label class="block font-medium mb-1">Enable Call Logging</label>
            <input type="checkbox" id="enableCallLogging" ${this.settings.enableCallLogging ? 'checked' : ''} />
          </div>
          <button type="submit" class="bg-primary text-white px-4 py-2 rounded hover:bg-red-600">
            Save Settings
          </button>
        </form>
      </div>
    `;

    document.getElementById('blandAISettingsForm').addEventListener('submit', e => this.saveSettings(e));
  }

  async saveSettings(event) {
    event.preventDefault();

    const newSettings = {
      apiKey: document.getElementById('apiKey').value.trim(),
      webhookUrl: document.getElementById('webhookUrl').value.trim(),
      enableCallLogging: document.getElementById('enableCallLogging').checked
    };

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  }
}

// Initialize Bland AI Settings UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAISettings('blandAISettingsContainer');
});
