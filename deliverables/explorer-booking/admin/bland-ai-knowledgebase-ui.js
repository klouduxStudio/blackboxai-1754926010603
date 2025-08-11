// Bland AI Knowledge Base Management UI Component

class BlandAIKnowledgeBaseUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/knowledgebase';
    this.knowledgeBases = [];
    this.init();
  }

  async init() {
    await this.loadKnowledgeBases();
    this.render();
  }

  async loadKnowledgeBases() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.knowledgeBases = data.knowledgeBases || [];
    } catch (error) {
      console.error('Failed to load knowledge bases:', error);
      this.knowledgeBases = [];
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Bland AI Knowledge Bases</h2>
        <button id="createKBBtn" class="mb-4 bg-primary text-white px-4 py-2 rounded hover:bg-red-600">
          Create New Knowledge Base
        </button>
        <ul class="space-y-2 max-h-[400px] overflow-y-auto">
          ${this.knowledgeBases.map(kb => `
            <li class="border rounded p-3 flex justify-between items-center">
              <span>${kb.name || kb.id}</span>
              <button data-id="${kb.id}" class="editKBBtn bg-secondary text-white px-3 py-1 rounded hover:bg-green-700">
                Edit
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    this.container.querySelector('#createKBBtn').addEventListener('click', () => this.createKnowledgeBase());
    this.container.querySelectorAll('.editKBBtn').forEach(btn => {
      btn.addEventListener('click', e => this.editKnowledgeBase(e.target.dataset.id));
    });
  }

  async createKnowledgeBase() {
    const name = prompt('Enter knowledge base name:');
    if (!name) return;

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      this.knowledgeBases.push(data.knowledgeBase);
      this.render();
    } catch (error) {
      alert('Failed to create knowledge base');
    }
  }

  editKnowledgeBase(id) {
    alert(`Edit knowledge base ${id} - UI to be implemented`);
    // Implement knowledge base editing UI and logic here
  }
}

// Initialize Bland AI Knowledge Base UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new BlandAIKnowledgeBaseUI('blandAIKnowledgeBaseContainer');
});
