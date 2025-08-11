// Financial Reporting System with Cost Analysis and Profitability Tracking
// Enhanced for comprehensive business intelligence

class FinancialReports {
  constructor() {
    this.apiBaseUrl = '/api';
    this.reportTypes = {
      profitability: 'Profitability Analysis',
      sales: 'Sales Performance',
      inventory: 'Inventory Analysis',
      cost_trends: 'Cost Trend Analysis',
      margin_analysis: 'Margin Analysis'
    };
    this.initializeInterface();
  }

  initializeInterface() {
    const container = document.getElementById('financialReportsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg">
        <!-- Header -->
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Financial Reports & Analytics</h2>
            <div class="flex space-x-3">
              <button id="refreshReports" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh Data
              </button>
              <button id="exportReports" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select id="dateRange" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="7">Last 7 Days</option>
                <option value="30" selected>Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
              <select id="categoryFilter" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">All Categories</option>
                <option value="Adventure">Adventure</option>
                <option value="Cultural">Cultural</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Nature">Nature</option>
                <option value="Historical">Historical</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select id="cityFilter" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">All Cities</option>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select id="reportType" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="profitability">Profitability Analysis</option>
                <option value="sales">Sales Performance</option>
                <option value="inventory">Inventory Analysis</option>
                <option value="cost_trends">Cost Trend Analysis</option>
                <option value="margin_analysis">Margin Analysis</option>
              </select>
            </div>
          </div>
          
          <!-- Custom Date Range -->
          <div id="customDateRange" class="hidden mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" id="startDate" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" id="endDate" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            </div>
          </div>
        </div>

        <!-- Key Metrics Dashboard -->
        <div class="px-6 py-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm">Total Revenue</p>
                  <p class="text-2xl font-bold" id="totalRevenue">AED 0</p>
                  <p class="text-blue-100 text-xs mt-1" id="revenueChange">+0% from last period</p>
                </div>
                <svg class="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"></path>
                </svg>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-100 text-sm">Total Profit</p>
                  <p class="text-2xl font-bold" id="totalProfit">AED 0</p>
                  <p class="text-green-100 text-xs mt-1" id="profitChange">+0% from last period</p>
                </div>
                <svg class="w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>

            <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-purple-100 text-sm">Avg Profit Margin</p>
                  <p class="text-2xl font-bold" id="avgMargin">0%</p>
                  <p class="text-purple-100 text-xs mt-1" id="marginChange">+0% from last period</p>
                </div>
                <svg class="w-8 h-8 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>

            <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-red-100 text-sm">Total Costs</p>
                  <p class="text-2xl font-bold" id="totalCosts">AED 0</p>
                  <p class="text-red-100 text-xs mt-1" id="costsChange">+0% from last period</p>
                </div>
                <svg class="w-8 h-8 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Revenue vs Cost Chart -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4">Revenue vs Cost Trend</h3>
              <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <canvas id="revenueCostChart" width="400" height="200"></canvas>
              </div>
            </div>

            <!-- Profit Margin by Category -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4">Profit Margin by Category</h3>
              <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <canvas id="marginByCategoryChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>

          <!-- Detailed Reports Table -->
          <div class="bg-white border border-gray-200 rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold">Detailed Analysis</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr id="reportTableHeader">
                    <!-- Dynamic headers based on report type -->
                  </tr>
                </thead>
                <tbody id="reportTableBody" class="bg-white divide-y divide-gray-200">
                  <!-- Dynamic content based on report type -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Low Margin Products Alert -->
          <div id="lowMarginAlert" class="hidden mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Low Margin Products Detected</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>The following products have profit margins below 20%:</p>
                  <ul id="lowMarginList" class="list-disc list-inside mt-1"></ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.loadInitialData();
  }

  attachEventListeners() {
    // Date range change
    document.getElementById('dateRange')?.addEventListener('change', (e) => {
      const customRange = document.getElementById('customDateRange');
      if (e.target.value === 'custom') {
        customRange.classList.remove('hidden');
      } else {
        customRange.classList.add('hidden');
      }
      this.updateReports();
    });

    // Filter changes
    ['categoryFilter', 'cityFilter', 'reportType'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.updateReports();
      });
    });

    // Custom date changes
    ['startDate', 'endDate'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.updateReports();
      });
    });

    // Action buttons
    document.getElementById('refreshReports')?.addEventListener('click', () => {
      this.loadInitialData();
    });

    document.getElementById('exportReports')?.addEventListener('click', () => {
      this.exportCurrentReport();
    });
  }

  async loadInitialData() {
    try {
      // Load key metrics
      await this.updateKeyMetrics();
      
      // Load charts
      await this.updateCharts();
      
      // Load detailed reports
      await this.updateReports();
      
    } catch (error) {
      console.error('Error loading financial data:', error);
      this.showError('Failed to load financial data. Please try again.');
    }
  }

  async updateKeyMetrics() {
    try {
      const filters = this.getFilters();
      const response = await fetch(`${this.apiBaseUrl}/reports/financial-summary?${new URLSearchParams(filters)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial summary');
      }
      
      const data = await response.json();
      
      // Update metrics
      document.getElementById('totalRevenue').textContent = this.formatCurrency(data.totalRevenue || 0);
      document.getElementById('totalProfit').textContent = this.formatCurrency(data.totalProfit || 0);
      document.getElementById('avgMargin').textContent = (data.avgMargin || 0).toFixed(1) + '%';
      document.getElementById('totalCosts').textContent = this.formatCurrency(data.totalCosts || 0);
      
      // Update change indicators
      document.getElementById('revenueChange').textContent = this.formatChange(data.revenueChange || 0);
      document.getElementById('profitChange').textContent = this.formatChange(data.profitChange || 0);
      document.getElementById('marginChange').textContent = this.formatChange(data.marginChange || 0);
      document.getElementById('costsChange').textContent = this.formatChange(data.costsChange || 0);
      
    } catch (error) {
      console.error('Error updating key metrics:', error);
    }
  }

  async updateCharts() {
    try {
      const filters = this.getFilters();
      
      // Revenue vs Cost Chart
      const trendResponse = await fetch(`${this.apiBaseUrl}/reports/revenue-cost-trend?${new URLSearchParams(filters)}`);
      if (trendResponse.ok) {
        const trendData = await trendResponse.json();
        this.renderRevenueCostChart(trendData);
      }
      
      // Margin by Category Chart
      const marginResponse = await fetch(`${this.apiBaseUrl}/reports/margin-by-category?${new URLSearchParams(filters)}`);
      if (marginResponse.ok) {
        const marginData = await marginResponse.json();
        this.renderMarginByCategoryChart(marginData);
      }
      
    } catch (error) {
      console.error('Error updating charts:', error);
    }
  }

  async updateReports() {
    try {
      const filters = this.getFilters();
      const reportType = document.getElementById('reportType').value;
      
      const response = await fetch(`${this.apiBaseUrl}/reports/${reportType}?${new URLSearchParams(filters)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      
      this.renderReportTable(reportType, data);
      this.checkLowMarginProducts(data);
      
    } catch (error) {
      console.error('Error updating reports:', error);
      this.showError('Failed to update reports. Please try again.');
    }
  }

  renderReportTable(reportType, data) {
    const headerElement = document.getElementById('reportTableHeader');
    const bodyElement = document.getElementById('reportTableBody');
    
    let headers = [];
    let rows = [];
    
    switch (reportType) {
      case 'profitability':
        headers = ['Product', 'Category', 'Units Sold', 'Revenue', 'Cost', 'Profit', 'Margin %'];
        rows = data.products?.map(product => [
          product.name,
          product.category,
          product.unitsSold,
          this.formatCurrency(product.revenue),
          this.formatCurrency(product.cost),
          this.formatCurrency(product.profit),
          this.formatMargin(product.margin)
        ]) || [];
        break;
        
      case 'sales':
        headers = ['Product', 'Category', 'Units Sold', 'Revenue', 'Avg Price', 'Growth %'];
        rows = data.products?.map(product => [
          product.name,
          product.category,
          product.unitsSold,
          this.formatCurrency(product.revenue),
          this.formatCurrency(product.avgPrice),
          this.formatChange(product.growth)
        ]) || [];
        break;
        
      case 'inventory':
        headers = ['Product', 'Category', 'Stock Level', 'Cost Value', 'Selling Value', 'Potential Profit'];
        rows = data.products?.map(product => [
          product.name,
          product.category,
          product.stockLevel,
          this.formatCurrency(product.costValue),
          this.formatCurrency(product.sellingValue),
          this.formatCurrency(product.potentialProfit)
        ]) || [];
        break;
        
      case 'cost_trends':
        headers = ['Product', 'Category', 'Current Cost', 'Previous Cost', 'Change %', 'Impact'];
        rows = data.products?.map(product => [
          product.name,
          product.category,
          this.formatCurrency(product.currentCost),
          this.formatCurrency(product.previousCost),
          this.formatChange(product.costChange),
          this.formatCurrency(product.impact)
        ]) || [];
        break;
        
      case 'margin_analysis':
        headers = ['Product', 'Category', 'Selling Price', 'Cost Price', 'Margin %', 'Status'];
        rows = data.products?.map(product => [
          product.name,
          product.category,
          this.formatCurrency(product.sellingPrice),
          this.formatCurrency(product.costPrice),
          this.formatMargin(product.margin),
          this.getMarginStatus(product.margin)
        ]) || [];
        break;
    }
    
    // Render headers
    headerElement.innerHTML = headers.map(header => 
      `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`
    ).join('');
    
    // Render rows
    bodyElement.innerHTML = rows.map(row => 
      `<tr class="hover:bg-gray-50">
        ${row.map(cell => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cell}</td>`).join('')}
      </tr>`
    ).join('');
  }

  checkLowMarginProducts(data) {
    const lowMarginProducts = data.products?.filter(product => product.margin < 20) || [];
    const alertElement = document.getElementById('lowMarginAlert');
    const listElement = document.getElementById('lowMarginList');
    
    if (lowMarginProducts.length > 0) {
      alertElement.classList.remove('hidden');
      listElement.innerHTML = lowMarginProducts.map(product => 
        `<li>${product.name} - ${product.margin.toFixed(1)}% margin</li>`
      ).join('');
    } else {
      alertElement.classList.add('hidden');
    }
  }

  renderRevenueCostChart(data) {
    const canvas = document.getElementById('revenueCostChart');
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation (in production, use Chart.js or similar)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mock chart for demonstration
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(50, 50, 100, 100);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(200, 80, 100, 70);
    
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.fillText('Revenue', 70, 170);
    ctx.fillText('Cost', 230, 170);
  }

  renderMarginByCategoryChart(data) {
    const canvas = document.getElementById('marginByCategoryChart');
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mock pie chart for demonstration
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    let startAngle = 0;
    
    data.categories?.forEach((category, index) => {
      const sliceAngle = (category.percentage / 100) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      startAngle += sliceAngle;
    });
  }

  getFilters() {
    const dateRange = document.getElementById('dateRange').value;
    const category = document.getElementById('categoryFilter').value;
    const city = document.getElementById('cityFilter').value;
    
    const filters = {
      category,
      city
    };
    
    if (dateRange === 'custom') {
      filters.startDate = document.getElementById('startDate').value;
      filters.endDate = document.getElementById('endDate').value;
    } else {
      filters.days = dateRange;
    }
    
    return filters;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatChange(percentage) {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}% from last period`;
  }

  formatMargin(margin) {
    const color = margin > 40 ? 'text-green-600' : margin > 20 ? 'text-yellow-600' : 'text-red-600';
    return `<span class="${color} font-semibold">${margin.toFixed(1)}%</span>`;
  }

  getMarginStatus(margin) {
    if (margin > 40) {
      return '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Excellent</span>';
    } else if (margin > 20) {
      return '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Good</span>';
    } else {
      return '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Low</span>';
    }
  }

  async exportCurrentReport() {
    try {
      const filters = this.getFilters();
      const reportType = document.getElementById('reportType').value;
      
      const response = await fetch(`${this.apiBaseUrl}/reports/${reportType}/export?${new URLSearchParams(filters)}`);
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      this.showError('Failed to export report. Please try again.');
    }
  }

  showError(message) {
    // Create a temporary error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Initialize Financial Reports when the page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('financialReportsContainer')) {
    window.financialReports = new FinancialReports();
  }
});
