// Bulk Upload System for Attractions/Experiences
// Includes CSV template generation and processing with cost price integration

class AttractionsBulkUpload {
  constructor() {
    this.csvTemplate = {
      headers: [
        'product_name', 'description', 'category', 'city', 'country', 'country_code',
        'selling_price_adult', 'selling_price_child', 'selling_price_infant',
        'cost_price_adult', 'cost_price_child', 'cost_price_infant',
        'currency', 'duration', 'max_participants', 'min_participants',
        'cancellation_policy', 'highlights', 'inclusions', 'exclusions',
        'meeting_point', 'languages', 'age_restriction', 'accessibility',
        'what_to_bring', 'additional_info', 'supplier_id', 'status'
      ],
      sampleData: [
        [
          'Dubai Desert Safari Adventure',
          'Experience the thrill of dune bashing, camel riding, and traditional Bedouin culture in the Dubai desert',
          'Adventure',
          'Dubai',
          'United Arab Emirates',
          'AE',
          '450.00',
          '350.00',
          '0.00',
          '280.00',
          '220.00',
          '0.00',
          'AED',
          '6 hours',
          '50',
          '1',
          'Free cancellation up to 24 hours before',
          'Dune bashing|Camel riding|BBQ dinner|Traditional shows',
          'Transportation|Professional guide|Refreshments|Cultural activities',
          'Personal expenses|Alcoholic beverages|Gratuities',
          'Hotel lobby pickup available',
          'English|Arabic|Hindi',
          'Minimum age 3 years',
          'Not suitable for pregnant women or back problems',
          'Comfortable clothing|Sunglasses|Camera',
          'Vegetarian options available',
          'SUP001',
          'active'
        ]
      ]
    };
    
    this.validationRules = {
      required: ['product_name', 'category', 'city', 'selling_price_adult', 'cost_price_adult'],
      numeric: ['selling_price_adult', 'selling_price_child', 'selling_price_infant', 
                'cost_price_adult', 'cost_price_child', 'cost_price_infant',
                'max_participants', 'min_participants'],
      categories: ['Adventure', 'Cultural', 'Food & Drink', 'Nature', 'Historical', 'Entertainment', 'Sports'],
      currencies: ['AED', 'USD', 'EUR', 'GBP'],
      statuses: ['active', 'inactive', 'draft']
    };
    
    this.initializeInterface();
  }

  initializeInterface() {
    const container = document.getElementById('bulkUploadContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Bulk Upload Attractions</h2>
          <div class="flex space-x-3">
            <button id="downloadTemplate" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download Template
            </button>
            <button id="viewSample" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Sample
            </button>
          </div>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6" id="uploadArea">
          <div class="space-y-4">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="text-lg font-medium text-gray-900">Upload CSV File</div>
            <div class="text-sm text-gray-500">
              Drag and drop your CSV file here, or 
              <label for="csvFile" class="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">browse</label>
            </div>
            <input type="file" id="csvFile" accept=".csv" class="hidden">
            <div class="text-xs text-gray-400">Maximum file size: 10MB</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div id="progressContainer" class="hidden mb-6">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Processing...</span>
            <span id="progressText">0%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>

        <!-- Validation Results -->
        <div id="validationResults" class="hidden">
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold mb-4">Validation Results</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="bg-green-100 p-3 rounded-lg">
                <div class="text-green-800 font-semibold">Valid Rows</div>
                <div class="text-2xl font-bold text-green-600" id="validCount">0</div>
              </div>
              <div class="bg-red-100 p-3 rounded-lg">
                <div class="text-red-800 font-semibold">Invalid Rows</div>
                <div class="text-2xl font-bold text-red-600" id="invalidCount">0</div>
              </div>
              <div class="bg-blue-100 p-3 rounded-lg">
                <div class="text-blue-800 font-semibold">Total Rows</div>
                <div class="text-2xl font-bold text-blue-600" id="totalCount">0</div>
              </div>
            </div>
            
            <!-- Error Details -->
            <div id="errorDetails" class="hidden">
              <h4 class="font-semibold text-red-800 mb-2">Validation Errors:</h4>
              <div class="max-h-40 overflow-y-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-red-50">
                    <tr>
                      <th class="px-3 py-2 text-left">Row</th>
                      <th class="px-3 py-2 text-left">Field</th>
                      <th class="px-3 py-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody id="errorTableBody" class="divide-y divide-red-200">
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Preview Valid Data -->
            <div id="previewData" class="hidden mt-4">
              <h4 class="font-semibold text-green-800 mb-2">Preview (First 5 valid rows):</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm border border-gray-200">
                  <thead class="bg-gray-50">
                    <tr id="previewHeaders"></tr>
                  </thead>
                  <tbody id="previewBody" class="divide-y divide-gray-200"></tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between">
            <button id="cancelUpload" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
              Cancel
            </button>
            <div class="space-x-3">
              <button id="downloadErrors" class="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 hidden">
                Download Errors
              </button>
              <button id="proceedUpload" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Upload Valid Products
              </button>
            </div>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div id="uploadResults" class="hidden">
          <div class="rounded-lg p-4 mb-4" id="resultMessage">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg id="resultIcon" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium" id="resultTitle">Upload Complete</h3>
                <div class="mt-2 text-sm" id="resultDetails"></div>
              </div>
            </div>
          </div>
          
          <button id="uploadAnother" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Upload Another File
          </button>
        </div>
      </div>

      <!-- Sample Data Modal -->
      <div id="sampleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div class="flex justify-between items-center p-6 border-b">
              <h3 class="text-lg font-semibold">CSV Template Structure</h3>
              <button id="closeSampleModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-6 overflow-auto max-h-[70vh]">
              <div class="mb-4">
                <h4 class="font-semibold mb-2">Required Fields (marked with *):</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-red-600">*product_name:</span> Name of the attraction
                  </div>
                  <div>
                    <span class="font-medium text-red-600">*category:</span> Adventure, Cultural, Food & Drink, etc.
                  </div>
                  <div>
                    <span class="font-medium text-red-600">*city:</span> City where attraction is located
                  </div>
                  <div>
                    <span class="font-medium text-red-600">*selling_price_adult:</span> Adult selling price
                  </div>
                  <div>
                    <span class="font-medium text-red-600">*cost_price_adult:</span> Adult cost price
                  </div>
                </div>
              </div>
              
              <div class="mb-4">
                <h4 class="font-semibold mb-2">Pricing Fields:</h4>
                <div class="bg-yellow-50 p-3 rounded-lg text-sm">
                  <p><strong>Important:</strong> All price fields should be in decimal format (e.g., 450.00)</p>
                  <p>Cost prices are used for profitability analysis and reporting.</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full text-xs border border-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      ${this.csvTemplate.headers.map(header => 
                        `<th class="px-2 py-1 text-left border-r border-gray-200 font-medium">
                          ${header}${this.validationRules.required.includes(header) ? '*' : ''}
                        </th>`
                      ).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${this.csvTemplate.sampleData.map(row => 
                      `<tr class="border-t border-gray-200">
                        ${row.map(cell => 
                          `<td class="px-2 py-1 border-r border-gray-200">${cell}</td>`
                        ).join('')}
                      </tr>`
                    ).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Download template
    document.getElementById('downloadTemplate')?.addEventListener('click', () => {
      this.downloadTemplate();
    });

    // View sample
    document.getElementById('viewSample')?.addEventListener('click', () => {
      document.getElementById('sampleModal').classList.remove('hidden');
    });

    // Close sample modal
    document.getElementById('closeSampleModal')?.addEventListener('click', () => {
      document.getElementById('sampleModal').classList.add('hidden');
    });

    // File upload
    const fileInput = document.getElementById('csvFile');
    const uploadArea = document.getElementById('uploadArea');

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // Drag and drop
    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('border-blue-500', 'bg-blue-50');
    });

    uploadArea?.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
    });

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === 'text/csv') {
        this.handleFileUpload(files[0]);
      } else {
        this.showError('Please upload a valid CSV file.');
      }
    });

    // Action buttons
    document.getElementById('cancelUpload')?.addEventListener('click', () => {
      this.resetUpload();
    });

    document.getElementById('proceedUpload')?.addEventListener('click', () => {
      this.processValidData();
    });

    document.getElementById('downloadErrors')?.addEventListener('click', () => {
      this.downloadErrors();
    });

    document.getElementById('uploadAnother')?.addEventListener('click', () => {
      this.resetUpload();
    });
  }

  downloadTemplate() {
    const csvContent = [
      this.csvTemplate.headers.join(','),
      ...this.csvTemplate.sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attractions_bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async handleFileUpload(file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.showError('File size exceeds 10MB limit.');
      return;
    }

    this.showProgress(0);
    
    try {
      const text = await this.readFileAsText(file);
      const data = this.parseCSV(text);
      
      this.showProgress(50);
      
      const validationResult = this.validateData(data);
      
      this.showProgress(100);
      
      setTimeout(() => {
        this.hideProgress();
        this.showValidationResults(validationResult);
      }, 500);
      
    } catch (error) {
      this.hideProgress();
      this.showError('Error processing file: ' + error.message);
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/"/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/"/g, ''));
      
      return values;
    });

    return { headers, rows };
  }

  validateData(data) {
    const { headers, rows } = data;
    const validRows = [];
    const errors = [];

    // Check if required headers are present
    const missingHeaders = this.validationRules.required.filter(
      required => !headers.includes(required)
    );

    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        field: 'headers',
        error: `Missing required headers: ${missingHeaders.join(', ')}`
      });
    }

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      const rowData = {};
      const rowErrors = [];

      headers.forEach((header, headerIndex) => {
        rowData[header] = row[headerIndex] || '';
      });

      // Validate required fields
      this.validationRules.required.forEach(field => {
        if (!rowData[field] || rowData[field].trim() === '') {
          rowErrors.push({
            row: rowNumber,
            field,
            error: 'Required field is empty'
          });
        }
      });

      // Validate numeric fields
      this.validationRules.numeric.forEach(field => {
        if (rowData[field] && rowData[field].trim() !== '') {
          const value = parseFloat(rowData[field]);
          if (isNaN(value) || value < 0) {
            rowErrors.push({
              row: rowNumber,
              field,
              error: 'Must be a valid positive number'
            });
          }
        }
      });

      // Validate category
      if (rowData.category && !this.validationRules.categories.includes(rowData.category)) {
        rowErrors.push({
          row: rowNumber,
          field: 'category',
          error: `Invalid category. Must be one of: ${this.validationRules.categories.join(', ')}`
        });
      }

      // Validate currency
      if (rowData.currency && !this.validationRules.currencies.includes(rowData.currency)) {
        rowErrors.push({
          row: rowNumber,
          field: 'currency',
          error: `Invalid currency. Must be one of: ${this.validationRules.currencies.join(', ')}`
        });
      }

      // Validate status
      if (rowData.status && !this.validationRules.statuses.includes(rowData.status)) {
        rowErrors.push({
          row: rowNumber,
          field: 'status',
          error: `Invalid status. Must be one of: ${this.validationRules.statuses.join(', ')}`
        });
      }

      // Validate profit margins (cost should be less than selling price)
      if (rowData.selling_price_adult && rowData.cost_price_adult) {
        const sellingPrice = parseFloat(rowData.selling_price_adult);
        const costPrice = parseFloat(rowData.cost_price_adult);
        
        if (!isNaN(sellingPrice) && !isNaN(costPrice) && costPrice >= sellingPrice) {
          rowErrors.push({
            row: rowNumber,
            field: 'cost_price_adult',
            error: 'Cost price should be less than selling price'
          });
        }
      }

      if (rowErrors.length === 0) {
        validRows.push({ ...rowData, _rowNumber: rowNumber });
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      headers,
      validRows,
      errors,
      totalRows: rows.length
    };
  }

  showValidationResults(result) {
    const { validRows, errors, totalRows } = result;
    
    document.getElementById('validationResults').classList.remove('hidden');
    document.getElementById('validCount').textContent = validRows.length;
    document.getElementById('invalidCount').textContent = errors.length;
    document.getElementById('totalCount').textContent = totalRows;

    // Show errors if any
    if (errors.length > 0) {
      document.getElementById('errorDetails').classList.remove('hidden');
      document.getElementById('downloadErrors').classList.remove('hidden');
      
      const errorTableBody = document.getElementById('errorTableBody');
      errorTableBody.innerHTML = errors.map(error => `
        <tr>
          <td class="px-3 py-2">${error.row}</td>
          <td class="px-3 py-2">${error.field}</td>
          <td class="px-3 py-2">${error.error}</td>
        </tr>
      `).join('');
    }

    // Show preview of valid data
    if (validRows.length > 0) {
      document.getElementById('previewData').classList.remove('hidden');
      
      const previewHeaders = document.getElementById('previewHeaders');
      const previewBody = document.getElementById('previewBody');
      
      previewHeaders.innerHTML = result.headers.slice(0, 6).map(header => 
        `<th class="px-3 py-2 text-left">${header}</th>`
      ).join('') + '<th class="px-3 py-2 text-left">Profit Margin</th>';
      
      previewBody.innerHTML = validRows.slice(0, 5).map(row => {
        const sellingPrice = parseFloat(row.selling_price_adult || 0);
        const costPrice = parseFloat(row.cost_price_adult || 0);
        const margin = sellingPrice > 0 ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2) : 0;
        
        return `
          <tr>
            ${result.headers.slice(0, 6).map(header => 
              `<td class="px-3 py-2">${row[header] || ''}</td>`
            ).join('')}
            <td class="px-3 py-2">
              <span class="px-2 py-1 text-xs rounded-full ${
                margin > 40 ? 'bg-green-100 text-green-800' :
                margin > 20 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }">
                ${margin}%
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Enable/disable upload button
    const proceedButton = document.getElementById('proceedUpload');
    if (validRows.length > 0) {
      proceedButton.disabled = false;
      proceedButton.textContent = `Upload ${validRows.length} Valid Products`;
    } else {
      proceedButton.disabled = true;
      proceedButton.textContent = 'No Valid Products to Upload';
    }

    this.validationResult = result;
  }

  async processValidData() {
    if (!this.validationResult || this.validationResult.validRows.length === 0) {
      return;
    }

    const { validRows } = this.validationResult;
    
    this.showProgress(0);
    
    try {
      const results = {
        successful: [],
        failed: [],
        totalProcessed: 0
      };

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        
        try {
          const productData = this.convertRowToProduct(row);
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
          });

          if (response.ok) {
            const result = await response.json();
            results.successful.push({
              row: row._rowNumber,
              name: row.product_name,
              id: result.product.id
            });
          } else {
            const error = await response.json();
            results.failed.push({
              row: row._rowNumber,
              name: row.product_name,
              error: error.error || 'Unknown error'
            });
          }
        } catch (error) {
          results.failed.push({
            row: row._rowNumber,
            name: row.product_name,
            error: error.message
          });
        }

        results.totalProcessed++;
        this.showProgress((results.totalProcessed / validRows.length) * 100);
      }

      this.hideProgress();
      this.showUploadResults(results);

    } catch (error) {
      this.hideProgress();
      this.showError('Error during upload: ' + error.message);
    }
  }

  convertRowToProduct(row) {
    return {
      name: row.product_name,
      description: row.description,
      category: row.category,
      city: row.city,
      country: row.country,
      countryCode: row.country_code || 'AE',
      sellingPrice: {
        adult: parseFloat(row.selling_price_adult || 0),
        child: parseFloat(row.selling_price_child || 0),
        infant: parseFloat(row.selling_price_infant || 0)
      },
      costPrice: {
        adult: parseFloat(row.cost_price_adult || 0),
        child: parseFloat(row.cost_price_child || 0),
        infant: parseFloat(row.cost_price_infant || 0)
      },
      currency: row.currency || 'AED',
      duration: row.duration,
      maxParticipants: parseInt(row.max_participants || 999),
      minParticipants: parseInt(row.min_participants || 1),
      supplierId: row.supplier_id,
      status: row.status || 'active',
      highlights: row.highlights ? row.highlights.split('|') : [],
      inclusions: row.inclusions ? row.inclusions.split('|') : [],
      exclusions: row.exclusions ? row.exclusions.split('|') : [],
      meetingPoint: row.meeting_point,
      languages: row.languages ? row.languages.split('|') : ['English'],
      ageRestriction: row.age_restriction,
      accessibility: row.accessibility,
      whatToBring: row.what_to_bring ? row.what_to_bring.split('|') : [],
      additionalInfo: row.additional_info
    };
  }

  showUploadResults(results) {
    document.getElementById('validationResults').classList.add('hidden');
    document.getElementById('uploadResults').classList.remove('hidden');

    const resultMessage = document.getElementById('resultMessage');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultDetails = document.getElementById('resultDetails');

    if (results.failed.length === 0) {
      // All successful
      resultMessage.className = 'rounded-lg p-4 mb-4 bg-green-50 text-green-800';
      resultIcon.className = 'h-5 w-5 text-green-400';
      resultTitle.textContent = 'Upload Completed Successfully!';
      resultDetails.innerHTML = `
        <p>Successfully uploaded ${results.successful.length} products.</p>
        <div class="mt-2">
          <strong>Profit Analysis:</strong>
          <ul class="list-disc list-inside mt-1">
            ${results.successful.slice(0, 3).map(item => 
              `<li>${item.name} - Added successfully</li>`
            ).join('')}
            ${results.successful.length > 3 ? `<li>...and ${results.successful.length - 3} more</li>` : ''}
          </ul>
        </div>
      `;
    } else if (results.successful.length === 0) {
      // All failed
      resultMessage.className = 'rounded-lg p-4 mb-4 bg-red-50 text-red-800';
      resultIcon.className = 'h-5 w-5 text-red-400';
      resultTitle.textContent = 'Upload Failed';
      resultDetails.innerHTML = `
        <p>Failed to upload any products. Please check the errors and try again.</p>
        <div class="mt-2">
          <strong>Common Errors:</strong>
          <ul class="list-disc list-inside mt-1">
            ${results.failed.slice(0, 3).map(item => 
              `<li>Row ${item.row}: ${item.error}</li>`
            ).join('')}
          </ul>
        </div>
      `;
    } else {
      // Partial success
      resultMessage.className = 'rounded-lg p-4 mb-4 bg-yellow-50 text-yellow-800';
      resultIcon.className = 'h-5 w-5 text-yellow-400';
      resultTitle.textContent = 'Upload Partially Completed';
      resultDetails.innerHTML = `
        <p>Successfully uploaded ${results.successful.length} products, ${results.failed.length} failed.</p>
        <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Successful:</strong>
            <ul class="list-disc list-inside mt-1">
              ${results.successful.slice(0, 2).map(item => 
                `<li>${item.name}</li>`
              ).join('')}
            </ul>
          </div>
          <div>
            <strong>Failed:</strong>
            <ul class="list-disc list-inside mt-1">
              ${results.failed.slice(0, 2).map(item => 
                `<li>Row ${item.row}: ${item.error}</li>`
              ).join('')}
            </ul>
          </div>
        </div>
      `;
    }
  }

  downloadErrors() {
    if (!this.validationResult || this.validationResult.errors.length === 0) {
      return;
    }

    const csvContent = [
      ['Row', 'Field', 'Error'].join(','),
      ...this.validationResult.errors.map(error => 
        [error.row, error.field, `"${error.error}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_errors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  showProgress(percentage) {
    document.getElementById('progressContainer').classList.remove('hidden');
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = Math.round(percentage) + '%';
  }

  hideProgress() {
    document.getElementById('progressContainer').classList.add('hidden');
  }

  showError(message) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <div class="mt-4 text-lg font-medium text-red-900">Upload Error</div>
        <div class="mt-2 text-sm text-red-600">${message}</div>
        <button onclick="location.reload()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Try Again
        </button>
      </div>
    `;
  }

  resetUpload() {
    document.getElementById('validationResults').classList.add('hidden');
    document.getElementById('uploadResults').classList.add('hidden');
    document.getElementById('csvFile').value = '';
    this.validationResult = null;
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
      <div class="space-y-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="text-lg font-medium text-gray-900">Upload CSV File</div>
        <div class="text-sm text-gray-500">
          Drag and drop your CSV file here, or 
          <label for="csvFile" class="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">browse</label>
        </div>
        <input type="file" id="csvFile" accept=".csv" class="hidden">
        <div class="text-xs text-gray-400">Maximum file size: 10MB</div>
      </div>
    `;
    
    // Re-attach file input listener
    document.getElementById('csvFile').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });
  }
}

// Initialize the bulk upload system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('bulkUploadContainer')) {
    window.attractionsBulkUpload = new AttractionsBulkUpload();
  }
});
