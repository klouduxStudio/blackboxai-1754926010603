// Bland AI Fine-Tuning UI Component

class BlandAIFineTuning {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/fine-tuning';
    this.fineTuningData = [];
    this.init();
  }

  async init() {
    await this.loadFineTuningData();
    this.render();
  }

  async loadFineTuningData() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.fineTuningData = data || [];
    } catch (error) {
      console.error('Failed to load fine-tuning data:', error);
      this.fineTuningData = [];
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Fine-Tuning</h2>
        <ul class="space-y-2 max-h-[400px] overflow-y-auto">
          ${this.fineTuningData.map(item => `
            <li class="border rounded p-3">
              <div><strong>Node ID:</strong> ${item.nodeId}</div>
              <div><strong>Condition:</strong> ${item.condition}</div>
              <div><strong>Dialogue:</strong> ${item.dialogue}</div>
              <button data-id="${item.nodeId}" class="editFineTuneBtn bg-primary text-white px-3 py-1 rounded mt-2 hover:bg-red-600">
                Edit
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    this.container.querySelectorAll('.editFineTuneBtn').forEach(btn => {
      btn.addEventListener('click', e => this.editFineTune(e.target.dataset.id));
    });
  }

  editFineTune(nodeId) {
    alert(`Edit fine-tuning for node ${nodeId} - UI to be implemented`);
    // Implement fine-tuning editing UI and logic here
  }
}

// Initialize Bland AI Fine-Tuning UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAIFineTuning('blandAIFineTuningContainer');
});
