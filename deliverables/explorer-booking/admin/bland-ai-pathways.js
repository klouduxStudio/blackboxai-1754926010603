// Bland AI Pathways Management UI Component

class BlandAIPathways {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/pathways';
    this.pathways = [];
    this.init();
  }

  async init() {
    await this.loadPathways();
    this.render();
  }

  async loadPathways() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.pathways = data.pathways || [];
    } catch (error) {
      console.error('Failed to load pathways:', error);
      this.pathways = [];
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Pathways</h2>
        <button id="createPathwayBtn" class="mb-4 bg-primary text-white px-4 py-2 rounded hover:bg-red-600">
          Create New Pathway
        </button>
        <ul class="space-y-2">
          ${this.pathways.map(p => `
            <li class="border rounded p-3 flex justify-between items-center">
              <span>${p.name || p.id}</span>
              <button data-id="${p.id}" class="editPathwayBtn bg-secondary text-white px-3 py-1 rounded hover:bg-green-700">
                Edit
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    this.container.querySelector('#createPathwayBtn').addEventListener('click', () => this.createPathway());
    this.container.querySelectorAll('.editPathwayBtn').forEach(btn => {
      btn.addEventListener('click', e => this.editPathway(e.target.dataset.id));
    });
  }

  async createPathway() {
    const name = prompt('Enter pathway name:');
    if (!name) return;

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      this.pathways.push(data.pathway);
      this.render();
    } catch (error) {
      alert('Failed to create pathway');
    }
  }

  editPathway(id) {
    alert(`Edit pathway ${id} - UI to be implemented`);
    // Implement pathway editing UI and logic here
  }
}

// Initialize Bland AI Pathways UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAIPathways('blandAIPathwaysContainer');
});
