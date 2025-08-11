// Bland AI Real-Time Updates and Notifications Integration

class BlandAIRealTime {
  constructor() {
    this.socket = null;
    this.apiBaseUrl = '/api/bland-ai';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.messageQueue = [];
    this.notificationContainer = null;
    this.init();
  }

  init() {
    this.createNotificationContainer();
    this.createConnectionStatusIndicator();
    this.connectWebSocket();
    this.setupHeartbeat();
  }

  createNotificationContainer() {
    // Create modern notification container
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'bland-ai-notifications';
    this.notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(this.notificationContainer);
  }

  createConnectionStatusIndicator() {
    // Create connection status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'bland-ai-connection-status';
    statusIndicator.className = 'fixed bottom-4 left-4 px-3 py-2 rounded-lg text-sm font-medium z-40';
    statusIndicator.innerHTML = `
      <div class="flex items-center space-x-2">
        <div id="status-dot" class="w-2 h-2 rounded-full bg-red-500"></div>
        <span id="status-text">Connecting to Bland AI...</span>
      </div>
    `;
    document.body.appendChild(statusIndicator);
    this.statusIndicator = statusIndicator;
  }

  updateConnectionStatus(status, message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (statusDot && statusText) {
      switch (status) {
        case 'connected':
          statusDot.className = 'w-2 h-2 rounded-full bg-green-500';
          statusText.textContent = 'Bland AI Connected';
          this.statusIndicator.className = 'fixed bottom-4 left-4 px-3 py-2 rounded-lg text-sm font-medium z-40 bg-green-100 text-green-800';
          break;
        case 'connecting':
          statusDot.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-pulse';
          statusText.textContent = 'Connecting to Bland AI...';
          this.statusIndicator.className = 'fixed bottom-4 left-4 px-3 py-2 rounded-lg text-sm font-medium z-40 bg-yellow-100 text-yellow-800';
          break;
        case 'disconnected':
          statusDot.className = 'w-2 h-2 rounded-full bg-red-500';
          statusText.textContent = message || 'Bland AI Disconnected';
          this.statusIndicator.className = 'fixed bottom-4 left-4 px-3 py-2 rounded-lg text-sm font-medium z-40 bg-red-100 text-red-800';
          break;
        case 'error':
          statusDot.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
          statusText.textContent = message || 'Connection Error';
          this.statusIndicator.className = 'fixed bottom-4 left-4 px-3 py-2 rounded-lg text-sm font-medium z-40 bg-red-100 text-red-800';
          break;
      }
    }
  }

  connectWebSocket() {
    try {
      this.updateConnectionStatus('connecting');
      
      // Use secure WebSocket if HTTPS, otherwise use WS
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/bland-ai`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Bland AI WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus('connected');
        
        // Process queued messages
        this.processMessageQueue();
        
        // Send authentication if needed
        this.authenticate();
        
        this.showNotification({
          type: 'success',
          title: 'Connected',
          message: 'Real-time updates are now active',
          duration: 3000
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('Bland AI WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.updateConnectionStatus('disconnected', 'Connection lost');
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connectWebSocket();
          }, delay);
        } else {
          this.updateConnectionStatus('error', 'Max reconnection attempts reached');
          this.showNotification({
            type: 'error',
            title: 'Connection Failed',
            message: 'Unable to establish real-time connection. Please refresh the page.',
            duration: 0 // Persistent notification
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error('Bland AI WebSocket error:', error);
        this.updateConnectionStatus('error', 'Connection error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.updateConnectionStatus('error', 'Failed to create connection');
    }
  }

  authenticate() {
    // Send authentication message if required
    const authMessage = {
      type: 'auth',
      token: localStorage.getItem('adminToken') || 'demo_token',
      timestamp: Date.now()
    };
    
    this.sendMessage(authMessage);
  }

  sendMessage(message) {
    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  setupHeartbeat() {
    // Send heartbeat every 30 seconds to keep connection alive
    setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, 30000);
  }

  handleMessage(data) {
    console.log('Received real-time message:', data);
    
    // Handle different types of real-time messages
    switch (data.type) {
      case 'call_update':
        this.updateCallStatus(data.payload);
        break;
      case 'pathway_update':
        this.updatePathwayStatus(data.payload);
        break;
      case 'notification':
        this.showNotification(data.payload);
        break;
      case 'analytics_update':
        this.updateAnalytics(data.payload);
        break;
      case 'session_update':
        this.updateSessionInfo(data.payload);
        break;
      case 'error':
        this.handleError(data.payload);
        break;
      case 'heartbeat_response':
        // Heartbeat acknowledged
        break;
      default:
        console.warn('Unknown Bland AI message type:', data.type);
    }
  }

  updateCallStatus(callData) {
    console.log('Call update received:', callData);
    
    // Update call status in the calls table if visible
    const callRow = document.querySelector(`[data-call-id="${callData.callId}"]`);
    if (callRow) {
      const statusCell = callRow.querySelector('.call-status');
      if (statusCell) {
        statusCell.textContent = callData.status;
        statusCell.className = `call-status px-2 py-1 rounded text-xs font-medium ${this.getStatusColor(callData.status)}`;
      }
      
      // Update duration if call ended
      if (callData.status === 'completed' && callData.duration) {
        const durationCell = callRow.querySelector('.call-duration');
        if (durationCell) {
          durationCell.textContent = this.formatDuration(callData.duration);
        }
      }
    }
    
    // Show notification for important status changes
    if (['completed', 'failed', 'cancelled'].includes(callData.status)) {
      this.showNotification({
        type: callData.status === 'completed' ? 'success' : 'warning',
        title: 'Call Update',
        message: `Call ${callData.callId} ${callData.status}`,
        duration: 5000
      });
    }
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('blandAICallUpdate', { detail: callData }));
  }

  updatePathwayStatus(pathwayData) {
    console.log('Pathway update received:', pathwayData);
    
    // Update pathway status in the pathways table if visible
    const pathwayRow = document.querySelector(`[data-pathway-id="${pathwayData.pathwayId}"]`);
    if (pathwayRow) {
      const statusCell = pathwayRow.querySelector('.pathway-status');
      if (statusCell) {
        statusCell.textContent = pathwayData.status;
        statusCell.className = `pathway-status px-2 py-1 rounded text-xs font-medium ${this.getStatusColor(pathwayData.status)}`;
      }
    }
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('blandAIPathwayUpdate', { detail: pathwayData }));
  }

  updateAnalytics(analyticsData) {
    console.log('Analytics update received:', analyticsData);
    
    // Update analytics counters if visible
    Object.keys(analyticsData).forEach(key => {
      const element = document.getElementById(`analytics-${key}`);
      if (element) {
        element.textContent = analyticsData[key];
        
        // Add animation effect
        element.classList.add('animate-pulse');
        setTimeout(() => element.classList.remove('animate-pulse'), 1000);
      }
    });
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('blandAIAnalyticsUpdate', { detail: analyticsData }));
  }

  updateSessionInfo(sessionData) {
    console.log('Session update received:', sessionData);
    
    // Update active sessions counter
    const sessionsCounter = document.getElementById('active-sessions-count');
    if (sessionsCounter) {
      sessionsCounter.textContent = sessionData.activeSessions || 0;
    }
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('blandAISessionUpdate', { detail: sessionData }));
  }

  handleError(errorData) {
    console.error('Bland AI error received:', errorData);
    
    this.showNotification({
      type: 'error',
      title: 'System Error',
      message: errorData.message || 'An error occurred in the Bland AI system',
      duration: 10000
    });
  }

  showNotification(notification) {
    const notificationElement = document.createElement('div');
    const notificationId = 'notification_' + Date.now();
    
    const typeColors = {
      success: 'bg-green-100 border-green-500 text-green-800',
      error: 'bg-red-100 border-red-500 text-red-800',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      info: 'bg-blue-100 border-blue-500 text-blue-800'
    };
    
    const typeIcons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notificationElement.id = notificationId;
    notificationElement.className = `
      ${typeColors[notification.type] || typeColors.info}
      border-l-4 p-4 rounded-r-lg shadow-lg transform transition-all duration-300 ease-in-out
      translate-x-full opacity-0 max-w-sm
    `;
    
    notificationElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-lg font-bold">${typeIcons[notification.type] || typeIcons.info}</span>
        </div>
        <div class="ml-3 flex-1">
          <h4 class="font-semibold">${notification.title || 'Notification'}</h4>
          <p class="text-sm mt-1">${notification.message}</p>
        </div>
        <button onclick="document.getElementById('${notificationId}').remove()" 
                class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none">
          <span class="sr-only">Close</span>
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    this.notificationContainer.appendChild(notificationElement);
    
    // Animate in
    setTimeout(() => {
      notificationElement.classList.remove('translate-x-full', 'opacity-0');
      notificationElement.classList.add('translate-x-0', 'opacity-100');
    }, 100);
    
    // Auto-remove after duration (if specified)
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        if (document.getElementById(notificationId)) {
          this.removeNotification(notificationId);
        }
      }, notification.duration);
    }
  }

  removeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
      notification.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  getStatusColor(status) {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Public methods for manual connection management
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }

  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connectWebSocket(), 1000);
  }

  // Method to send custom messages
  sendCustomMessage(type, payload) {
    this.sendMessage({
      type,
      payload,
      timestamp: Date.now()
    });
  }
}

// Initialize Bland AI Real-Time Integration on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  window.blandAIRealTime = new BlandAIRealTime();
  
  // Add global event listeners for debugging
  window.addEventListener('blandAICallUpdate', (event) => {
    console.log('Call update event:', event.detail);
  });
  
  window.addEventListener('blandAIPathwayUpdate', (event) => {
    console.log('Pathway update event:', event.detail);
  });
  
  window.addEventListener('blandAIAnalyticsUpdate', (event) => {
    console.log('Analytics update event:', event.detail);
  });
});
