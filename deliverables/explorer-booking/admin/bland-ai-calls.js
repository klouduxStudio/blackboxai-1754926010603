// Bland AI Calls Management UI Component

class BlandAICalls {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/calls';
    this.calls = [];
    this.init();
  }

  async init() {
    await this.loadCalls();
    this.render();
  }

  async loadCalls() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.calls = data.calls || [];
    } catch (error) {
      console.error('Failed to load calls:', error);
      this.calls = [];
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Calls</h2>
        <button id="initiateCallBtn" class="mb-4 bg-primary text-white px-4 py-2 rounded hover:bg-red-600">
          Initiate New Call
        </button>
        <ul class="space-y-2 max-h-[400px] overflow-y-auto">
          ${this.calls.map(c => `
            <li class="border rounded p-3 flex justify-between items-center">
              <span>Call ID: ${c.id}</span>
              <button data-id="${c.id}" class="viewCallBtn bg-secondary text-white px-3 py-1 rounded hover:bg-green-700">
                View Details
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    this.container.querySelector('#initiateCallBtn').addEventListener('click', () => this.initiateCall());
    this.container.querySelectorAll('.viewCallBtn').forEach(btn => {
      btn.addEventListener('click', e => this.viewCall(e.target.dataset.id));
    });
  }

  async initiateCall() {
    const phoneNumber = prompt('Enter phone number to call:');
    if (!phoneNumber) return;

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await response.json();
      this.calls.push(data.call);
      this.render();
    } catch (error) {
      alert('Failed to initiate call');
    }
  }

  viewCall(id) {
    alert(`View call details for ${id} - UI to be implemented`);
    // Implement call detail UI and logic here
  }
}

// Initialize Bland AI Calls UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAICalls('blandAICallsContainer');
});
