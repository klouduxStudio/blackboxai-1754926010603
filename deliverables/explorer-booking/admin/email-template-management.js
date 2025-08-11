// Email Template Management System
// Comprehensive email template editor with WYSIWYG and variable support

class EmailTemplateManager {
  constructor() {
    this.templates = {
      booking_confirmation: {
        id: 'booking_confirmation',
        name: 'Booking Confirmation',
        subject: 'Your booking is confirmed - {{booking_reference}}',
        description: 'Sent when a booking is successfully confirmed and paid',
        variables: [
          'customer_name', 'booking_reference', 'product_name', 'date_time', 
          'total_price', 'participants', 'meeting_point', 'contact_info'
        ],
        triggers: ['booking.confirmed'],
        htmlContent: '',
        textContent: '',
        isActive: true,
        lastModified: new Date()
      },
      ticket_delivery: {
        id: 'ticket_delivery',
        name: 'Ticket Delivery',
        subject: 'Your tickets are ready - {{product_name}}',
        description: 'Sent when tickets are generated and ready for the customer',
        variables: [
          'customer_name', 'product_name', 'date_time', 'ticket_codes', 
          'qr_codes', 'meeting_instructions', 'contact_info'
        ],
        triggers: ['tickets.generated'],
        htmlContent: '',
        textContent: '',
        isActive: true,
        lastModified: new Date()
      },
      booking_cancellation: {
        id: 'booking_cancellation',
        name: 'Booking Cancellation',
        subject: 'Booking cancelled - {{booking_reference}}',
        description: 'Sent when a booking is cancelled',
        variables: [
          'customer_name', 'booking_reference', 'product_name', 'cancellation_reason', 
          'refund_amount', 'refund_timeline', 'contact_info'
        ],
        triggers: ['booking.cancelled'],
        htmlContent: '',
        textContent: '',
        isActive: true,
        lastModified: new Date()
      },
      review_request: {
        id: 'review_request',
        name: 'Review Request',
        subject: 'How was your experience? - {{product_name}}',
        description: 'Sent after experience completion to request customer review',
        variables: [
          'customer_name', 'product_name', 'experience_date', 'review_link', 
          'rating_stars', 'incentive_offer'
        ],
        triggers: ['booking.completed'],
        htmlContent: '',
        textContent: '',
        isActive: true,
        lastModified: new Date()
      },
      payment_reminder: {
        id: 'payment_reminder',
        name: 'Payment Reminder',
        subject: 'Payment reminder - {{booking_reference}}',
        description: 'Sent for pending payments that need completion',
        variables: [
          'customer_name', 'booking_reference', 'product_name', 'amount_due', 
          'payment_link', 'expiry_date', 'contact_info'
        ],
        triggers: ['payment.reminder'],
        htmlContent: '',
        textContent: '',
        isActive: true,
        lastModified: new Date()
      },
      experience_reminder: {
        id: 'experience_reminder',
        name: 'Experience Reminder',
        subject: 'Your experience is tomorrow - {{product_name}}',
        description: 'Sent 24 hours before the scheduled experience',
        variables: [
          'customer_name', 'product_name', 'date_time', 'meeting_point', 
          'what_to_bring', 'weather_info', 'contact_info'
        ],
        triggers: ['booking.upcoming'],
        htmlContent: '',
        textContent: '',
        isActive: true,
        lastModified: new Date()
      }
    };

    this.currentTemplate = null;
    this.editor = null;
    this.previewMode = 'desktop';
    
    this.initializeInterface();
    this.loadTemplates();
  }

  initializeInterface() {
    const container = document.getElementById('emailTemplateContainer') || document.body;
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-tertiary text-white p-6">
          <h2 class="text-2xl font-bold flex items-center">
            <i class="fas fa-envelope mr-3"></i>
            Email Template Management
          </h2>
          <p class="text-white text-opacity-90 mt-2">Create and manage email templates for automated communications</p>
        </div>

        <div class="flex h-screen">
          <!-- Sidebar - Template List -->
          <div class="w-1/3 border-r border-gray-200 bg-gray-50">
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">Templates</h3>
                <button onclick="createNewTemplate()" class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                  <i class="fas fa-plus mr-1"></i> New
                </button>
              </div>
              <input 
                type="text" 
                id="templateSearch" 
                placeholder="Search templates..."
                class="w-full p-2 border border-gray-300 rounded-lg text-sm"
                oninput="filterTemplates(this.value)"
              >
            </div>
            
            <div id="templateList" class="overflow-y-auto" style="height: calc(100vh - 200px);">
              <!-- Template list will be populated here -->
            </div>
          </div>

          <!-- Main Editor Area -->
          <div class="flex-1 flex flex-col">
            <!-- Editor Toolbar -->
            <div class="border-b border-gray-200 p-4 bg-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <h3 id="currentTemplateName" class="text-lg font-semibold text-gray-900">Select a template</h3>
                  <div class="flex items-center space-x-2">
                    <button 
                      id="htmlEditorBtn" 
                      onclick="switchEditorMode('html')" 
                      class="px-3 py-1 text-sm rounded bg-primary text-white"
                    >
                      Visual
                    </button>
                    <button 
                      id="textEditorBtn" 
                      onclick="switchEditorMode('text')" 
                      class="px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                    >
                      Text
                    </button>
                    <button 
                      id="codeEditorBtn" 
                      onclick="switchEditorMode('code')" 
                      class="px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                    >
                      HTML
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button onclick="previewTemplate()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <i class="fas fa-eye mr-1"></i> Preview
                  </button>
                  <button onclick="testTemplate()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-paper-plane mr-1"></i> Test Send
                  </button>
                  <button onclick="saveTemplate()" class="bg-primary text-white px-4 py-2 rounded hover:bg-red-600">
                    <i class="fas fa-save mr-1"></i> Save
                  </button>
                </div>
              </div>
            </div>

            <!-- Template Settings -->
            <div id="templateSettings" class="border-b border-gray-200 p-4 bg-gray-50 hidden">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input type="text" id="templateName" class="w-full p-2 border border-gray-300 rounded">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                  <input type="text" id="templateSubject" class="w-full p-2 border border-gray-300 rounded">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea id="templateDescription" rows="2" class="w-full p-2 border border-gray-300 rounded"></textarea>
                </div>
              </div>
            </div>

            <!-- Editor Content -->
            <div class="flex-1 flex">
              <!-- Main Editor -->
              <div class="flex-1 relative">
                <!-- Visual Editor -->
                <div id="visualEditor" class="h-full">
                  <div id="wysiwygToolbar" class="border-b border-gray-200 p-2 bg-white">
                    <div class="flex items-center space-x-2">
                      <select id="fontFamily" class="text-sm border rounded px-2 py-1">
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                      </select>
                      <select id="fontSize" class="text-sm border rounded px-2 py-1">
                        <option value="12px">12px</option>
                        <option value="14px" selected>14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="24px">24px</option>
                      </select>
                      <div class="border-l pl-2 ml-2">
                        <button onclick="formatText('bold')" class="p-1 hover:bg-gray-200 rounded">
                          <i class="fas fa-bold"></i>
                        </button>
                        <button onclick="formatText('italic')" class="p-1 hover:bg-gray-200 rounded">
                          <i class="fas fa-italic"></i>
                        </button>
                        <button onclick="formatText('underline')" class="p-1 hover:bg-gray-200 rounded">
                          <i class="fas fa-underline"></i>
                        </button>
                      </div>
                      <div class="border-l pl-2 ml-2">
                        <button onclick="insertVariable()" class="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700">
                          <i class="fas fa-code mr-1"></i> Variable
                        </button>
                        <button onclick="insertImage()" class="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">
                          <i class="fas fa-image mr-1"></i> Image
                        </button>
                      </div>
                    </div>
                  </div>
                  <div 
                    id="wysiwygEditor" 
                    contenteditable="true" 
                    class="h-full p-4 overflow-y-auto focus:outline-none"
                    style="min-height: 400px;"
                  >
                    <p>Select a template to start editing...</p>
                  </div>
                </div>

                <!-- Text Editor -->
                <div id="textEditor" class="h-full hidden">
                  <textarea 
                    id="textContent" 
                    class="w-full h-full p-4 border-none resize-none focus:outline-none"
                    placeholder="Enter plain text version of your email..."
                  ></textarea>
                </div>

                <!-- HTML Code Editor -->
                <div id="codeEditor" class="h-full hidden">
                  <textarea 
                    id="htmlContent" 
                    class="w-full h-full p-4 border-none resize-none focus:outline-none font-mono text-sm"
                    placeholder="Enter HTML code..."
                  ></textarea>
                </div>
              </div>

              <!-- Variables Panel -->
              <div class="w-80 border-l border-gray-200 bg-gray-50">
                <div class="p-4 border-b border-gray-200">
                  <h4 class="font-semibold text-gray-900">Available Variables</h4>
                  <p class="text-sm text-gray-600 mt-1">Click to insert into template</p>
                </div>
                
                <div id="variablesList" class="p-4 space-y-2 overflow-y-auto" style="height: calc(100vh - 300px);">
                  <!-- Variables will be populated here -->
                </div>

                <div class="border-t border-gray-200 p-4">
                  <h5 class="font-medium text-gray-900 mb-2">Template Settings</h5>
                  <div class="space-y-2">
                    <label class="flex items-center text-sm">
                      <input type="checkbox" id="templateActive" class="mr-2">
                      Active
                    </label>
                    <label class="flex items-center text-sm">
                      <input type="checkbox" id="trackOpens" class="mr-2">
                      Track Opens
                    </label>
                    <label class="flex items-center text-sm">
                      <input type="checkbox" id="trackClicks" class="mr-2">
                      Track Clicks
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div id="previewModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-lg font-semibold">Email Preview</h3>
              <div class="flex items-center space-x-2">
                <button onclick="setPreviewMode('desktop')" class="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400" id="desktopPreview">
                  <i class="fas fa-desktop mr-1"></i> Desktop
                </button>
                <button onclick="setPreviewMode('mobile')" class="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400" id="mobilePreview">
                  <i class="fas fa-mobile-alt mr-1"></i> Mobile
                </button>
                <button onclick="closePreview()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="p-4 overflow-y-auto" style="max-height: 80vh;">
              <div id="previewContent" class="border rounded-lg overflow-hidden">
                <!-- Preview content will be inserted here -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Send Modal -->
      <div id="testSendModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg max-w-md w-full">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-lg font-semibold">Send Test Email</h3>
              <button onclick="closeTestSend()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="p-4">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Test Email Address</label>
                  <input type="email" id="testEmail" class="w-full p-2 border border-gray-300 rounded" placeholder="test@example.com">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Test Data (JSON)</label>
                  <textarea id="testData" rows="6" class="w-full p-2 border border-gray-300 rounded font-mono text-sm" placeholder='{"customer_name": "John Doe", "booking_reference": "BK123"}'></textarea>
                </div>
              </div>
              <div class="flex justify-end space-x-2 mt-6">
                <button onclick="closeTestSend()" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                <button onclick="sendTestEmail()" class="px-4 py-2 bg-primary text-white rounded hover:bg-red-600">Send Test</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadTemplates() {
    const templateList = document.getElementById('templateList');
    templateList.innerHTML = '';

    Object.values(this.templates).forEach(template => {
      const templateItem = document.createElement('div');
      templateItem.className = `p-4 border-b border-gray-200 cursor-pointer hover:bg-white transition-colors ${
        this.currentTemplate?.id === template.id ? 'bg-white border-l-4 border-l-primary' : ''
      }`;
      templateItem.onclick = () => this.selectTemplate(template.id);

      templateItem.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">${template.name}</h4>
            <p class="text-sm text-gray-600 mt-1">${template.description}</p>
            <div class="flex items-center mt-2 space-x-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${
                template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }">
                ${template.isActive ? 'Active' : 'Inactive'}
              </span>
              <span class="text-xs text-gray-500">
                ${template.triggers.length} trigger${template.triggers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-1 ml-2">
            <button onclick="duplicateTemplate('${template.id}'); event.stopPropagation();" class="text-gray-400 hover:text-gray-600" title="Duplicate">
              <i class="fas fa-copy text-sm"></i>
            </button>
            <button onclick="deleteTemplate('${template.id}'); event.stopPropagation();" class="text-gray-400 hover:text-red-600" title="Delete">
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      `;

      templateList.appendChild(templateItem);
    });
  }

  selectTemplate(templateId) {
    this.currentTemplate = this.templates[templateId];
    
    // Update UI
    document.getElementById('currentTemplateName').textContent = this.currentTemplate.name;
    document.getElementById('templateSettings').classList.remove('hidden');
    
    // Populate form fields
    document.getElementById('templateName').value = this.currentTemplate.name;
    document.getElementById('templateSubject').value = this.currentTemplate.subject;
    document.getElementById('templateDescription').value = this.currentTemplate.description;
    document.getElementById('templateActive').checked = this.currentTemplate.isActive;
    
    // Load content
    document.getElementById('wysiwygEditor').innerHTML = this.currentTemplate.htmlContent || this.getDefaultTemplate();
    document.getElementById('textContent').value = this.currentTemplate.textContent || '';
    document.getElementById('htmlContent').value = this.currentTemplate.htmlContent || '';
    
    // Update variables list
    this.updateVariablesList();
    
    // Refresh template list to show selection
    this.loadTemplates();
  }

  updateVariablesList() {
    const variablesList = document.getElementById('variablesList');
    variablesList.innerHTML = '';

    if (!this.currentTemplate) return;

    this.currentTemplate.variables.forEach(variable => {
      const variableItem = document.createElement('div');
      variableItem.className = 'flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer';
      variableItem.onclick = () => this.insertVariableAtCursor(variable);

      variableItem.innerHTML = `
        <div>
          <code class="text-sm text-blue-600">{{${variable}}}</code>
          <p class="text-xs text-gray-500 mt-1">${this.getVariableDescription(variable)}</p>
        </div>
        <i class="fas fa-plus text-gray-400"></i>
      `;

      variablesList.appendChild(variableItem);
    });
  }

  getVariableDescription(variable) {
    const descriptions = {
      customer_name: 'Customer\'s full name',
      booking_reference: 'Unique booking reference',
      product_name: 'Name of the booked product',
      date_time: 'Experience date and time',
      total_price: 'Total booking amount',
      participants: 'Number of participants',
      meeting_point: 'Meeting location details',
      contact_info: 'Customer support contact',
      ticket_codes: 'Generated ticket codes',
      qr_codes: 'QR code images',
      cancellation_reason: 'Reason for cancellation',
      refund_amount: 'Refund amount',
      review_link: 'Link to review page',
      payment_link: 'Secure payment link',
      expiry_date: 'Payment link expiry',
      what_to_bring: 'Items to bring list',
      weather_info: 'Weather conditions'
    };
    return descriptions[variable] || 'Template variable';
  }

  getDefaultTemplate() {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #FD4C5C 0%, #008bff 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Explorer Shack</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello {{customer_name}},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for choosing Explorer Shack for your adventure!
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p style="margin: 5px 0;"><strong>Booking Reference:</strong> {{booking_reference}}</p>
            <p style="margin: 5px 0;"><strong>Experience:</strong> {{product_name}}</p>
            <p style="margin: 5px 0;"><strong>Date & Time:</strong> {{date_time}}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> {{total_price}}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #FD4C5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Booking Details
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            {{contact_info}}
          </p>
        </div>
      </div>
    `;
  }

  insertVariableAtCursor(variable) {
    const activeEditor = this.getActiveEditor();
    const variableText = `{{${variable}}}`;

    if (activeEditor === 'visual') {
      const editor = document.getElementById('wysiwygEditor');
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = '#e3f2fd';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '3px';
        span.textContent = variableText;
        
        range.deleteContents();
        range.insertNode(span);
        
        // Move cursor after the inserted variable
        range.setStartAfter(span);
        range.setEndAfter(span);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.innerHTML += `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 3px;">${variableText}</span>`;
      }
    } else if (activeEditor === 'text') {
      const textarea = document.getElementById('textContent');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      textarea.value = text.substring(0, start) + variableText + text.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + variableText.length;
      textarea.focus();
    } else if (activeEditor === 'code') {
      const textarea = document.getElementById('htmlContent');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      textarea.value = text.substring(0, start) + variableText + text.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + variableText.length;
      textarea.focus();
    }
  }

  getActiveEditor() {
    if (!document.getElementById('visualEditor').classList.contains('hidden')) return 'visual';
    if (!document.getElementById('textEditor').classList.contains('hidden')) return 'text';
    if (!document.getElementById('codeEditor').classList.contains('hidden')) return 'code';
    return 'visual';
  }

  switchEditorMode(mode) {
    // Hide all editors
    document.getElementById('visualEditor').classList.add('hidden');
    document.getElementById('textEditor').classList.add('hidden');
    document.getElementById('codeEditor').classList.add('hidden');

    // Reset button styles
    document.getElementById('htmlEditorBtn').className = 'px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400';
    document.getElementById('textEditorBtn').className = 'px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400';
    document.getElementById('codeEditorBtn').className = 'px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400';

    // Show selected editor and update button
    if (mode === 'html') {
      document.getElementById('visualEditor').classList.remove('hidden');
      document.getElementById('htmlEditorBtn').className = 'px-3 py-1 text-sm rounded bg-primary text-white';
    } else if (mode === 'text') {
      document.getElementById('textEditor').classList.remove('hidden');
      document.getElementById('textEditorBtn').className = 'px-3 py-1 text-sm rounded bg-primary text-white';
    } else if (mode === 'code') {
      document.getElementById('codeEditor').classList.remove('hidden');
      document.getElementById('codeEditorBtn').className = 'px-3 py-1 text-sm rounded bg-primary text-white';
    }
  }

  async saveTemplate() {
    if (!this.currentTemplate) {
      alert('Please select a template to save');
      return;
    }

    // Collect form data
    this.currentTemplate.name = document.getElementById('templateName').value;
    this.currentTemplate.subject = document.getElementById('templateSubject').value;
    this.currentTemplate.description = document.getElementById('templateDescription').value;
    this.currentTemplate.isActive = document.getElementById('templateActive').checked;
    
    // Collect content from active editor
    this.currentTemplate.htmlContent = document.getElementById('wysiwygEditor').innerHTML;
    this.currentTemplate.textContent = document.getElementById('textContent').value;
    
    // Update last modified
    this.currentTemplate.lastModified = new Date();

    try {
      // In production, save to backend
      const response = await fetch('/api/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentTemplate)
      });

      if (response.ok) {
        this.showNotification('Template saved successfully', 'success');
        this.loadTemplates();
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Save error:', error);
      this.showNotification('Failed to save template', 'error');
    }
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  previewTemplate() {
    if (!this.currentTemplate) {
      alert('Please select a template to preview');
      return;
    }

    const htmlContent = document.getElementById('wysiwygEditor').innerHTML;
    const subject = document.getElementById('templateSubject').value;
    
    // Replace variables with sample data for preview
    const sampleData = this.getSampleData();
    let previewContent = this.replaceVariables(htmlContent, sampleData);
    let previewSubject = this.replaceVariables(subject, sampleData);

    document.getElementById('previewContent').innerHTML = `
      <div class="border-b p-4 bg-gray-50">
        <div class="text-sm text-gray-600 mb-1">Subject:</div>
        <div class="font-medium">${previewSubject}</div>
      </div>
      <div class="p-4">
        ${previewContent}
      </div>
    `;

    document.getElementById('previewModal').classList.remove('hidden');
  }

  getSampleData() {
    return {
      customer_name: 'John Doe',
      booking_reference: 'BK123456',
      product_name: 'Dubai City Tour',
      date_time: 'December 25, 2024 at 10:00 AM',
      total_price: 'AED 299',
      participants: '2 Adults, 1 Child',
      meeting_point: 'Dubai Mall Main Entrance',
      contact_info: 'support@explorershack.com | +971 4 123 4567',
      ticket_codes: 'TKT001, TKT002, TKT003',
      cancellation_reason: 'Customer request',
      refund_amount: 'AED 299',
      review_link: 'https://explorershack.com/review/BK123456',
      payment_link: 'https://pay.explorershack.com/BK123456',
      expiry_date: 'December 24, 2024',
      what_to_bring: 'Comfortable shoes, sunscreen, water bottle',
      weather_info: 'Sunny, 28°C'
    };
  }

  replaceVariables(content, data) {
    let result = content;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  }

  async testTemplate() {
    if (!this.currentTemplate) {
      alert('Please select a template to test');
      return;
    }

    // Populate test data with sample values
    document.getElementById('testData').value = JSON.stringify(this.getSampleData(), null, 2);
    document.getElementById('testSendModal').classList.remove('hidden');
  }

  async sendTestEmail() {
    const email = document.getElementById('testEmail').value;
    const testDataStr = document.getElementById('testData').value;

    if (!email) {
      alert('Please enter a test email address');
      return;
    }

    try {
      const testData = JSON.parse(testDataStr);
      
      const response = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: this.currentTemplate.id,
          email: email,
          data: testData
        })
      });

      if (response.ok) {
        this.showNotification('Test email sent successfully', 'success');
        this.closeTestSend();
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      console.error('Test send error:', error);
      this.showNotification('Failed to send test email', 'error');
    }
  }

  closePreview() {
    document.getElementById('previewModal').classList.add('hidden');
  }

  closeTestSend() {
    document.getElementById('testSendModal').classList.add('hidden');
  }

  setPreviewMode(mode) {
    this.previewMode = mode;
    const previewContent = document.getElementById('previewContent');
    
    if (mode === 'mobile') {
      previewContent.style.maxWidth = '375px';
      previewContent.style.margin = '0 auto';
      document.getElementById('mobilePreview').className = 'px-3 py-1 text-sm rounded bg-primary text-white';
      document.getElementById('desktopPreview').className = 'px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400';
    } else {
      previewContent.style.maxWidth = '100%';
      previewContent.style.margin = '0';
      document.getElementById('desktopPreview').className = 'px-3 py-1 text-sm rounded bg-primary text-white';
      document.getElementById('mobilePreview').className = 'px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400';
    }
  }
}

// Global functions for template management
function createNewTemplate() {
  const name = prompt('Enter template name:');
  if (!name) return;

  const id = name.toLowerCase().replace(/\s+/g, '_');
  const newTemplate = {
    id: id,
    name: name,
    subject: `New Template - ${name}`,
    description: 'New email template',
    variables: ['customer_name', 'booking_reference'],
    triggers: [],
    htmlContent: '',
    textContent: '',
    isActive: false,
    lastModified: new Date()
  };

  window.emailTemplateManager.templates[id] = newTemplate;
  window.emailTemplateManager.loadTemplates();
  window.emailTemplateManager.selectTemplate(id);
}

function duplicateTemplate(templateId) {
  const original = window.emailTemplateManager.templates[templateId];
  if (!original) return;

  const newId = `${templateId}_copy`;
  const duplicate = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    isActive: false,
    lastModified: new Date()
  };

  window.emailTemplateManager.templates[newId] = duplicate;
  window.emailTemplateManager.loadTemplates();
}

function deleteTemplate(templateId) {
  if (!confirm('Are you sure you want to delete this template?')) return;

  delete window.emailTemplateManager.templates[templateId];
  window.emailTemplateManager.loadTemplates();
  
  // Clear editor if this template was selected
  if (window.emailTemplateManager.currentTemplate?.id === templateId) {
    window.emailTemplateManager.currentTemplate = null;
    document.getElementById('currentTemplateName').textContent = 'Select a template';
    document.getElementById('templateSettings').classList.add('hidden');
  }
}

function filterTemplates(query) {
  const templateItems = document.querySelectorAll('#templateList > div');
  templateItems.forEach(item => {
    const name = item.querySelector('h4').textContent.toLowerCase();
    const description = item.querySelector('p').textContent.toLowerCase();
    const matches = name.includes(query.toLowerCase()) || description.includes(query.toLowerCase());
    item.style.display = matches ? 'block' : 'none';
  });
}

function switchEditorMode(mode) {
  window.emailTemplateManager.switchEditorMode(mode);
}

function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById('wysiwygEditor').focus();
}

function insertVariable() {
  const variable = prompt('Enter variable name (without {{}}):');
  if (variable) {
    window.emailTemplateManager.insertVariableAtCursor(variable);
  }
}

function insertImage() {
  const url = prompt('Enter image URL:');
  if (url) {
    const img = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto;">`;
    document.execCommand('insertHTML', false, img);
  }
}

function previewTemplate() {
  window.emailTemplateManager.previewTemplate();
}

function testTemplate() {
  window.emailTemplateManager.testTemplate();
}

function saveTemplate() {
  window.emailTemplateManager.saveTemplate();
}

function closePreview() {
  window.emailTemplateManager.closePreview();
}

function closeTestSend() {
  window.emailTemplateManager.closeTestSend();
}

function setPreviewMode(mode) {
  window.emailTemplateManager.setPreviewMode(mode);
}

function sendTestEmail() {
  window.emailTemplateManager.sendTestEmail();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.emailTemplateManager = new EmailTemplateManager();
});
