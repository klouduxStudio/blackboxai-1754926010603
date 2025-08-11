// Bland AI Web Widget Integration for Customer Support

class BlandAIWebWidget {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/bland-ai/chat';
    this.sessionId = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="bland-ai-web-widget fixed bottom-4 right-4 w-80 max-h-[400px] bg-white shadow-lg rounded-lg flex flex-col">
        <div class="header bg-primary text-white p-3 font-semibold flex justify-between items-center">
          Bland AI Support
          <button id="closeWidgetBtn" class="text-white hover:text-gray-300">&times;</button>
        </div>
        <div id="messagesContainer" class="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"></div>
        <div class="input-area p-3 border-t border-gray-200 flex items-center space-x-2">
          <input id="messageInput" type="text" placeholder="Type your message..." class="flex-1 p-2 border rounded" />
          <button id="sendMessageBtn" class="bg-primary text-white px-3 py-1 rounded hover:bg-red-600">Send</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const sendBtn = this.container.querySelector('#sendMessageBtn');
    const inputField = this.container.querySelector('#messageInput');
    const closeBtn = this.container.querySelector('#closeWidgetBtn');

    sendBtn.addEventListener('click', () => this.sendMessage());
    inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });
    closeBtn.addEventListener('click', () => this.closeWidget());
  }

  async sendMessage() {
    const inputField = this.container.querySelector('#messageInput');
    const message = inputField.value.trim();
    if (!message) return;

    this.appendMessage('user', message);
    inputField.value = '';
    inputField.disabled = true;

    try {
      if (!this.sessionId) {
        this.sessionId = await this.startSession();
      }

      const response = await fetch(`${this.apiBaseUrl}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, message })
      });

      const data = await response.json();
      if (data.reply) {
        this.appendMessage('bot', data.reply);
      } else {
        this.appendMessage('bot', 'Sorry, I did not understand that.');
      }
    } catch (error) {
      this.appendMessage('bot', 'Error communicating with server.');
    } finally {
      inputField.disabled = false;
      inputField.focus();
    }
  }

  appendMessage(sender, text) {
    const messagesContainer = this.container.querySelector('#messagesContainer');
    const messageElem = document.createElement('div');
    messageElem.className = `message ${sender === 'user' ? 'text-right' : 'text-left'}`;
    messageElem.innerHTML = `<span class="inline-block rounded px-3 py-1 ${
      sender === 'user' ? 'bg-primary text-white' : 'bg-gray-300 text-gray-800'
    }">${text}</span>`;
    messagesContainer.appendChild(messageElem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async startSession() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/start-session`, {
        method: 'POST'
      });
      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error('Failed to start chat session:', error);
      return null;
    }
  }

  closeWidget() {
    this.container.innerHTML = '';
  }
}

// Initialize Bland AI Web Widget on page load
document.addEventListener('DOMContentLoaded', () => {
  const widgetContainer = document.getElementById('blandAIWebWidgetContainer');
  if (widgetContainer) {
    window.blandAIWebWidget = new BlandAIWebWidget('blandAIWebWidgetContainer');
  }
});
