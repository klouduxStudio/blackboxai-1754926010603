// Enhanced Manual Booking Form - Admin Panel
// Comprehensive booking creation with payment processing

class ManualBookingForm {
  constructor() {
    this.form = null;
    this.selectedProduct = null;
    this.selectedVariation = null;
    this.pricing = null;
    this.availability = null;
    this.paymentMethods = ['cash', 'card', 'payment_link', 'pending', 'bank_transfer'];
    
    this.initializeForm();
    this.attachEventListeners();
  }

  initializeForm() {
    const container = document.getElementById('manualBookingContainer') || document.body;
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-tertiary text-white p-6">
          <h2 class="text-2xl font-bold flex items-center">
            <i class="fas fa-plus-circle mr-3"></i>
            Create Manual Booking
          </h2>
          <p class="text-white text-opacity-90 mt-2">Create bookings directly for walk-in customers or phone reservations</p>
        </div>

        <!-- Form Content -->
        <form id="manualBookingForm" class="p-6">
          <!-- Progress Indicator -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span class="ml-2 text-sm font-medium">Product Selection</span>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span class="ml-2 text-sm text-gray-600">Customer Details</span>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span class="ml-2 text-sm text-gray-600">Payment & Confirmation</span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 33%"></div>
            </div>
          </div>

          <!-- Step 1: Product Selection -->
          <div id="step1" class="step-content">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left Column: Product Selection -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Product Selection</h3>
                
                <!-- Product Search -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Search Product</label>
                  <div class="relative">
                    <input 
                      type="text" 
                      id="productSearch" 
                      placeholder="Search by product name or SKU..."
                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                    <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <div id="productSearchResults" class="mt-2 max-h-60 overflow-y-auto hidden"></div>
                </div>

                <!-- Selected Product Display -->
                <div id="selectedProductDisplay" class="hidden bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">Selected Product</h4>
                  <div id="productDetails"></div>
                </div>

                <!-- Variation Selection -->
                <div id="variationSelection" class="hidden">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Select Option</label>
                  <select id="variationSelect" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">Choose variation...</option>
                  </select>
                </div>

                <!-- Date & Time Selection -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input 
                      type="date" 
                      id="bookingDate" 
                      required 
                      min="${new Date().toISOString().split('T')[0]}"
                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <select id="timeSelect" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                      <option value="">Select time...</option>
                    </select>
                  </div>
                </div>

                <!-- Participants -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Participants</label>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-medium">Adults</span>
                        <span class="text-sm text-gray-500 block">Age 18+</span>
                      </div>
                      <div class="flex items-center space-x-3">
                        <button type="button" onclick="updateParticipant('adults', -1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span id="adultsCount" class="w-8 text-center font-medium">1</span>
                        <button type="button" onclick="updateParticipant('adults', 1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <i class="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-medium">Children</span>
                        <span class="text-sm text-gray-500 block">Age 3-17</span>
                      </div>
                      <div class="flex items-center space-x-3">
                        <button type="button" onclick="updateParticipant('children', -1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span id="childrenCount" class="w-8 text-center font-medium">0</span>
                        <button type="button" onclick="updateParticipant('children', 1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <i class="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-medium">Infants</span>
                        <span class="text-sm text-gray-500 block">Age 0-2</span>
                      </div>
                      <div class="flex items-center space-x-3">
                        <button type="button" onclick="updateParticipant('infants', -1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span id="infantsCount" class="w-8 text-center font-medium">0</span>
                        <button type="button" onclick="updateParticipant('infants', 1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <i class="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Availability & Pricing -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Availability & Pricing</h3>
                
                <!-- Availability Status -->
                <div id="availabilityStatus" class="hidden">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 mb-2">Availability</h4>
                    <div id="availabilityInfo"></div>
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div id="priceBreakdown" class="hidden">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 mb-3">Price Breakdown</h4>
                    <div id="priceDetails" class="space-y-2 text-sm"></div>
                    <div class="border-t pt-3 mt-3">
                      <div class="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span id="totalPrice" class="text-primary">AED 0.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Special Offers -->
                <div id="specialOffers" class="hidden">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-medium text-blue-900 mb-2">
                      <i class="fas fa-tag mr-2"></i>Available Offers
                    </h4>
                    <div id="offersList"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end mt-8">
              <button type="button" onclick="nextStep(2)" id="step1Next" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Continue to Customer Details
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>

          <!-- Step 2: Customer Details -->
          <div id="step2" class="step-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left Column: Lead Customer -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Lead Customer Details</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" id="firstName" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" id="lastName" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" id="email" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input type="tel" id="phone" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select id="nationality" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">Select nationality...</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="IN">India</option>
                    <option value="PK">Pakistan</option>
                    <option value="BD">Bangladesh</option>
                    <option value="PH">Philippines</option>
                    <!-- Add more countries as needed -->
                  </select>
                </div>

                <!-- Hotel/Pickup Information -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hotel / Pickup Location</label>
                  <textarea id="hotelPickup" rows="3" placeholder="Enter hotel name and address for pickup..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
                </div>
              </div>

              <!-- Right Column: Additional Information -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>

                <!-- Special Requirements -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                  <textarea id="specialRequirements" rows="4" placeholder="Dietary restrictions, accessibility needs, special occasions, etc..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
                </div>

                <!-- Emergency Contact -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Emergency Contact (Optional)</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input type="text" id="emergencyName" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" id="emergencyPhone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    </div>
                  </div>
                </div>

                <!-- Marketing Preferences -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Communication Preferences</h4>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="checkbox" id="emailMarketing" class="rounded border-gray-300 text-primary focus:ring-primary">
                      <span class="ml-2 text-sm">Send promotional emails</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" id="smsMarketing" class="rounded border-gray-300 text-primary focus:ring-primary">
                      <span class="ml-2 text-sm">Send SMS notifications</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" id="whatsappMarketing" class="rounded border-gray-300 text-primary focus:ring-primary">
                      <span class="ml-2 text-sm">Send WhatsApp updates</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button type="button" onclick="previousStep(1)" class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
                <i class="fas fa-arrow-left mr-2"></i>Back to Product Selection
              </button>
              <button type="button" onclick="nextStep(3)" id="step2Next" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600">
                Continue to Payment
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>

          <!-- Step 3: Payment & Confirmation -->
          <div id="step3" class="step-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left Column: Payment Method -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Payment Method</h3>
                
                <div class="space-y-3">
                  ${this.paymentMethods.map(method => `
                    <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 payment-method">
                      <input type="radio" name="paymentMethod" value="${method}" class="text-primary focus:ring-primary">
                      <div class="ml-3 flex-1">
                        <div class="flex items-center">
                          <i class="fas ${this.getPaymentIcon(method)} mr-2 text-gray-600"></i>
                          <span class="font-medium">${this.getPaymentLabel(method)}</span>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">${this.getPaymentDescription(method)}</p>
                      </div>
                    </label>
                  `).join('')}
                </div>

                <!-- Payment Link Options -->
                <div id="paymentLinkOptions" class="hidden bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-medium text-blue-900 mb-3">Payment Link Options</h4>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" name="paymentLinkType" value="email" class="text-primary focus:ring-primary">
                      <span class="ml-2 text-sm">Send via Email</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="paymentLinkType" value="sms" class="text-primary focus:ring-primary">
                      <span class="ml-2 text-sm">Send via SMS</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="paymentLinkType" value="whatsapp" class="text-primary focus:ring-primary">
                      <span class="ml-2 text-sm">Send via WhatsApp</span>
                    </label>
                  </div>
                  <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Time</label>
                    <select id="paymentLinkExpiry" class="w-full p-2 border border-gray-300 rounded-lg">
                      <option value="1">1 hour</option>
                      <option value="24" selected>24 hours</option>
                      <option value="72">3 days</option>
                      <option value="168">1 week</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Right Column: Booking Summary -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Booking Summary</h3>
                
                <div id="bookingSummary" class="bg-gray-50 rounded-lg p-4">
                  <!-- Summary will be populated by JavaScript -->
                </div>

                <!-- Terms and Conditions -->
                <div>
                  <label class="flex items-start">
                    <input type="checkbox" id="termsAccepted" required class="mt-1 rounded border-gray-300 text-primary focus:ring-primary">
                    <span class="ml-2 text-sm text-gray-700">
                      I confirm that the customer has agreed to the 
                      <a href="#" class="text-primary hover:underline">Terms and Conditions</a> 
                      and 
                      <a href="#" class="text-primary hover:underline">Cancellation Policy</a>
                    </span>
                  </label>
                </div>

                <!-- Admin Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Internal)</label>
                  <textarea id="adminNotes" rows="3" placeholder="Internal notes about this booking..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"></textarea>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button type="button" onclick="previousStep(2)" class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
                <i class="fas fa-arrow-left mr-2"></i>Back to Customer Details
              </button>
              <div class="space-x-4">
                <button type="button" id="sendPaymentLinkBtn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 hidden">
                  <i class="fas fa-link mr-2"></i>Send Payment Link
                </button>
                <button type="submit" id="createBookingBtn" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600">
                  <i class="fas fa-check mr-2"></i>Create Booking
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Loading Overlay -->
      <div id="loadingOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Processing Booking</h3>
            <p class="text-gray-600">Please wait while we create your booking...</p>
          </div>
        </div>
      </div>
    `;

    this.form = document.getElementById('manualBookingForm');
  }

  attachEventListeners() {
    // Product search
    const productSearch = document.getElementById('productSearch');
    productSearch.addEventListener('input', this.debounce(this.searchProducts.bind(this), 300));

    // Date change
    document.getElementById('bookingDate').addEventListener('change', this.onDateChange.bind(this));

    // Variation change
    document.getElementById('variationSelect').addEventListener('change', this.onVariationChange.bind(this));

    // Payment method change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', this.onPaymentMethodChange.bind(this));
    });

    // Form submission
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // Payment link button
    document.getElementById('sendPaymentLinkBtn').addEventListener('click', this.sendPaymentLink.bind(this));
  }

  getPaymentIcon(method) {
    const icons = {
      cash: 'fa-money-bill-wave',
      card: 'fa-credit-card',
      payment_link: 'fa-link',
      pending: 'fa-clock',
      bank_transfer: 'fa-university'
    };
    return icons[method] || 'fa-money-bill-wave';
  }

  getPaymentLabel(method) {
    const labels = {
      cash: 'Cash Payment',
      card: 'Card Payment',
      payment_link: 'Payment Link',
      pending: 'Pending Payment',
      bank_transfer: 'Bank Transfer'
    };
    return labels[method] || method;
  }

  getPaymentDescription(method) {
    const descriptions = {
      cash: 'Customer pays in cash at the location',
      card: 'Process card payment now',
      payment_link: 'Send secure payment link to customer',
      pending: 'Mark as pending, collect payment later',
      bank_transfer: 'Customer will pay via bank transfer'
    };
    return descriptions[method] || '';
  }

  async searchProducts(query) {
    if (query.length < 2) {
      document.getElementById('productSearchResults').classList.add('hidden');
      return;
    }

    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      const products = await response.json();
      
      this.displaySearchResults(products);
    } catch (error) {
      console.error('Product search error:', error);
    }
  }

  displaySearchResults(products) {
    const resultsContainer = document.getElementById('productSearchResults');
    
    if (products.length === 0) {
      resultsContainer.innerHTML = '<div class="p-3 text-gray-500 text-sm">No products found</div>';
      resultsContainer.classList.remove('hidden');
      return;
    }

    resultsContainer.innerHTML = products.map(product => `
      <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 product-result" data-product-id="${product.id}">
        <div class="flex items-center">
          <img src="${product.images[0]?.url || '/placeholder-image.jpg'}" alt="${product.title}" class="w-12 h-12 object-cover rounded-lg mr-3">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">${product.title}</h4>
            <p class="text-sm text-gray-600">${product.city}, ${product.country}</p>
            <p class="text-sm text-primary font-medium">From AED ${product.ticketOptions[0]?.pricing?.adult?.b2bPrice || 0}</p>
          </div>
        </div>
      </div>
    `).join('');

    // Add click listeners
    resultsContainer.querySelectorAll('.product-result').forEach(element => {
      element.addEventListener('click', () => {
        const productId = element.dataset.productId;
        this.selectProduct(products.find(p => p.id == productId));
      });
    });

    resultsContainer.classList.remove('hidden');
  }

  selectProduct(product) {
    this.selectedProduct = product;
    
    // Hide search results
    document.getElementById('productSearchResults').classList.add('hidden');
    
    // Show selected product
    this.displaySelectedProduct(product);
    
    // Populate variations
    this.populateVariations(product);
    
    // Show variation selection
    document.getElementById('variationSelection').classList.remove('hidden');
    
    // Update step validation
    this.validateStep1();
  }

  displaySelectedProduct(product) {
    const container = document.getElementById('selectedProductDisplay');
    const detailsContainer = document.getElementById('productDetails');
    
    detailsContainer.innerHTML = `
      <div class="flex items-center">
        <img src="${product.images[0]?.url || '/placeholder-image.jpg'}" alt="${product.title}" class="w-16 h-16 object-cover rounded-lg mr-4">
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">${product.title}</h4>
          <p class="text-sm text-gray-600">${product.city}, ${product.country}</p>
          <p class="text-sm text-gray-500">SKU: ${product.sku}</p>
        </div>
        <button type="button" onclick="clearProductSelection()" class="text-red-600 hover:text-red-800">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    container.classList.remove('hidden');
  }

  populateVariations(product) {
    const select = document.getElementById('variationSelect');
    select.innerHTML = '<option value="">Choose variation...</option>';
    
    product.ticketOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.id;
      optionElement.textContent = `${option.title} - AED ${option.pricing.adult.b2bPrice}`;
      select.appendChild(optionElement);
    });
  }

  async onDateChange() {
    if (this.selectedProduct && this.selectedVariation) {
      await this.checkAvailability();
      await this.updateTimeSlots();
    }
  }

  async onVariationChange() {
    const variationId = document.getElementById('variationSelect').value;
    if (!variationId) return;
    
    this.selectedVariation = this.selectedProduct.ticketOptions.find(opt => opt.id == variationId);
    
    await this.updateTimeSlots();
    this.calculatePricing();
    this.validateStep1();
  }

  async updateTimeSlots() {
    const timeSelect = document.getElementById('timeSelect');
    timeSelect.innerHTML = '<option value="">Select time...</option>';
    
    if (!this.selectedVariation || !this.selectedVariation.timeslots) return;
    
    this.selectedVariation.timeslots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = slot.time;
      option.disabled = !slot.available;
      timeSelect.appendChild(option);
    });
  }

  async checkAvailability() {
    const date = document.getElementById('bookingDate').value;
    if (!date || !this.selectedProduct) return;

    try {
      const response = await fetch('/api/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: this.selectedProduct.id,
          variationId: this.selectedVariation?.id,
          dateTime: date,
          participants: this.getParticipants()
        })
      });

      const data = await response.json();
      this.availability = data.availability;
      this.displayAvailability(data.availability);
    } catch (error) {
      console.error('Availability check error:', error);
    }
  }

  displayAvailability(availability) {
    const container = document.getElementById('availabilityStatus');
    const infoContainer = document.getElementById('availabilityInfo');
    
    if (!availability) {
      container.classList.add('hidden');
      return;
    }

    const statusClass = availability.vacancies > 0 ? 'text-green-600' : 'text-red-600';
    const statusIcon = availability.vacancies > 0 ? 'fa-check-circle' : 'fa-times-circle';
    const statusText = availability.vacancies > 0 
      ? `${availability.vacancies} spots available`
      : 'No availability for selected date';

    infoContainer.innerHTML = `
      <div class="flex items-center ${statusClass}">
        <i class="fas ${statusIcon} mr-2"></i>
        <span class="font-medium">${statusText}</span>
      </div>
    `;

    container.classList.remove('hidden');
  }

  calculatePricing() {
    if (!this.selectedVariation) return;

    const participants = this.getParticipants();
    const adultPrice = this.selectedVariation.pricing?.adult?.b2bPrice || 0;
    const childPrice = this.selectedVariation.pricing?.child?.b2bPrice || 0;
    const infantPrice = this.selectedVariation.pricing?.infant?.b2bPrice || 0;

    const subtotal = {
      adults: adultPrice * participants.adults,
      children: childPrice * participants.children,
      infants: infantPrice * participants.infants
    };

    const total = subtotal.adults + subtotal.children + subtotal.infants;

    this.pricing = {
      subtotal,
      total,
      currency: 'AED'
    };

    this.displayPricing();
  }

  displayPricing() {
    if (!this.pricing) return;

    const container = document.getElementById('priceBreakdown');
    const detailsContainer = document.getElementById('priceDetails');
    const totalContainer = document.getElementById('totalPrice');

    const participants = this.getParticipants();
    let priceHTML = '';

    if (participants.adults > 0) {
      priceHTML += `
        <div class="flex justify-between">
          <span>${participants.adults} × Adult</span>
          <span>AED ${this.pricing.subtotal.adults}</span>
        </div>
      `;
    }

    if (participants.children > 0) {
      priceHTML += `
        <div class="flex justify-between">
          <span>${participants.children} × Child</span>
          <span>AED ${this.pricing.subtotal.children}</span>
        </div>
      `;
    }

    if (participants.infants > 0) {
      priceHTML += `
        <div class="flex justify-between">
          <span>${participants.infants} × Infant</span>
          <span>AED ${this.pricing.subtotal.infants}</span>
        </div>
      `;
    }

    detailsContainer.innerHTML = priceHTML;
    totalContainer.textContent = `AED ${this.pricing.total}`;
    container.classList.remove('hidden');
  }

  getParticipants() {
    return {
      adults: parseInt(document.getElementById('adultsCount').textContent) || 1,
      children: parseInt(document.getElementById('childrenCount').textContent) || 0,
      infants: parseInt(document.getElementById('infantsCount').textContent) || 0
    };
  }

  validateStep1() {
    const isValid = this.selectedProduct && 
                   this.selectedVariation && 
                   document.getElementById('bookingDate').value &&
                   document.getElementById('timeSelect').value &&
                   this.availability?.vacancies > 0;

    document.getElementById('step1Next').disabled = !isValid;
    return isValid;
  }

  onPaymentMethodChange(event) {
    const method = event.target.value;
    const paymentLinkOptions = document.getElementById('paymentLinkOptions');
    const sendPaymentLinkBtn = document.getElementById('sendPaymentLinkBtn');

    if (method === 'payment_link') {
      paymentLinkOptions.classList.remove('hidden');
      sendPaymentLinkBtn.classList.remove('hidden');
    } else {
      paymentLinkOptions.classList.add('hidden');
      sendPaymentLinkBtn.classList.add('hidden');
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.showLoading(true);

    try {
      const bookingData = this.collectFormData();
      const response = await fetch('/api/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok) {
        this.showSuccess(result);
      } else {
        throw new Error(result.message || 'Booking creation failed');
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  async sendPaymentLink() {
    if (!this.validateForm()) {
      return;
    }

    this.showLoading(true);

    try {
      const bookingData = this.collectFormData();
      const paymentLinkData = {
        ...bookingData,
        paymentLinkType: document.querySelector('input[name="paymentLinkType"]:checked')?.value || 'email',
        expiryHours: document.getElementById('paymentLinkExpiry').value
      };

      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentLinkData)
      });

      const result = await response.json();

      if (response.ok) {
        this.showPaymentLinkSuccess(result);
      } else {
        throw new Error(result.message || 'Payment link creation failed');
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  collectFormData() {
    const participants = this.getParticipants();
    
    return {
      // Product Information
      productId: this.selectedProduct.id,
      variationId: this.selectedVariation.id,
      dateTime: `${document.getElementById('bookingDate').value}T${document.getElementById('timeSelect').value}:00`,
      
      // Participants
      participants,
      
      // Customer Information
      customer: {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        nationality: document.getElementById('nationality').value
      },
      
      // Additional Information
      hotelPickup: document.getElementById('hotelPickup').value,
      specialRequirements: document.getElementById('specialRequirements').value,
      
      // Emergency Contact
      emergencyContact: {
        name: document.getElementById('emergencyName').value,
        phone: document.getElementById('emergencyPhone').value
      },
      
      // Marketing Preferences
      marketingPreferences: {
        email: document.getElementById('emailMarketing').checked,
        sms: document.getElementById('smsMarketing').checked,
        whatsapp: document.getElementById('whatsappMarketing').checked
      },
      
      // Payment Information
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
      
      // Admin Information
      adminNotes: document.getElementById('adminNotes').value,
      createdBy: 'admin', // In production, get from current user
      
      // Pricing
      pricing: this.pricing
    };
  }

  validateForm() {
    // Step 1 validation
    if (!this.selectedProduct || !this.selectedVariation) {
      this.showError('Please select a product and variation');
      return false;
    }

    if (!document.getElementById('bookingDate').value) {
      this.showError('Please select a date');
      return false;
    }

    if (!document.getElementById('timeSelect').value) {
      this.showError('Please select a time');
      return false;
    }

    // Step 2 validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!document.getElementById(field).value.trim()) {
        this.showError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Email validation
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    // Step 3 validation
    if (!document.querySelector('input[name="paymentMethod"]:checked')) {
      this.showError('Please select a payment method');
      return false;
    }

    if (!document.getElementById('termsAccepted').checked) {
      this.showError('Please confirm that the customer has accepted the terms and conditions');
      return false;
    }

    return true;
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  showSuccess(result) {
    const message = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-600 mr-3"></i>
          <div>
            <h4 class="font-medium text-green-900">Booking Created Successfully!</h4>
            <p class="text-green-700 mt-1">Booking Reference: ${result.bookingReference}</p>
            <div class="mt-3 space-x-2">
              <button onclick="printBooking('${result.bookingReference}')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <i class="fas fa-print mr-1"></i> Print Confirmation
              </button>
              <button onclick="resetForm()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                <i class="fas fa-plus mr-1"></i> Create Another Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('step3').innerHTML = message;
  }

  showPaymentLinkSuccess(result) {
    const message = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <i class="fas fa-link text-blue-600 mr-3"></i>
          <div>
            <h4 class="font-medium text-blue-900">Payment Link Sent Successfully!</h4>
            <p class="text-blue-700 mt-1">Link sent to: ${result.sentTo}</p>
            <p class="text-blue-700">Booking Reference: ${result.bookingReference}</p>
            <div class="mt-3 space-x-2">
              <button onclick="copyPaymentLink('${result.paymentLink}')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <i class="fas fa-copy mr-1"></i> Copy Link
              </button>
              <button onclick="resetForm()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                <i class="fas fa-plus mr-1"></i> Create Another Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('step3').innerHTML = message;
  }

  showError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'errorMessage';
      errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-4';
      this.form.insertBefore(errorDiv, this.form.firstChild);
    }

    errorDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
        <div>
          <h4 class="font-medium text-red-900">Error</h4>
          <p class="text-red-700 mt-1">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-red-600 hover:text-red-800">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Global functions for step navigation and participant updates
function nextStep(step) {
  // Hide all steps
  document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
  
  // Show target step
  document.getElementById(`step${step}`).classList.remove('hidden');
  
  // Update progress bar
  const progress = (step / 3) * 100;
  document.querySelector('.bg-primary.h-2').style.width = `${progress}%`;
  
  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const indicator = document.querySelector(`.step-content:nth-child(${i}) .w-8.h-8`);
    if (indicator) {
      if (i <= step) {
        indicator.classList.remove('bg-gray-300', 'text-gray-600');
        indicator.classList.add('bg-primary', 'text-white');
      } else {
        indicator.classList.remove('bg-primary', 'text-white');
        indicator.classList.add('bg-gray-300', 'text-gray-600');
      }
    }
  }

  // Update booking summary when reaching step 3
  if (step === 3) {
    updateBookingSummary();
  }
}

function previousStep(step) {
  nextStep(step);
}

function updateParticipant(type, delta) {
  const countElement = document.getElementById(`${type}Count`);
  const currentCount = parseInt(countElement.textContent);
  const newCount = Math.max(type === 'adults' ? 1 : 0, currentCount + delta);
  
  countElement.textContent = newCount;
  
  // Recalculate pricing if product is selected
  if (window.manualBookingForm && window.manualBookingForm.selectedVariation) {
    window.manualBookingForm.calculatePricing();
  }
}

function clearProductSelection() {
  if (window.manualBookingForm) {
    window.manualBookingForm.selectedProduct = null;
    window.manualBookingForm.selectedVariation = null;
    
    document.getElementById('selectedProductDisplay').classList.add('hidden');
    document.getElementById('variationSelection').classList.add('hidden');
    document.getElementById('priceBreakdown').classList.add('hidden');
    document.getElementById('availabilityStatus').classList.add('hidden');
    document.getElementById('productSearch').value = '';
    
    window.manualBookingForm.validateStep1();
  }
}

function updateBookingSummary() {
  if (!window.manualBookingForm || !window.manualBookingForm.selectedProduct) return;

  const form = window.manualBookingForm;
  const participants = form.getParticipants();
  const customer = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value
  };

  const summaryHTML = `
    <div class="space-y-4">
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Product</h4>
        <p class="text-sm">${form.selectedProduct.title}</p>
        <p class="text-sm text-gray-600">${form.selectedVariation.title}</p>
      </div>
      
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Date & Time</h4>
        <p class="text-sm">${document.getElementById('bookingDate').value} at ${document.getElementById('timeSelect').value}</p>
      </div>
      
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Participants</h4>
        <p class="text-sm">
          ${participants.adults} Adult${participants.adults > 1 ? 's' : ''}
          ${participants.children > 0 ? `, ${participants.children} Child${participants.children > 1 ? 'ren' : ''}` : ''}
          ${participants.infants > 0 ? `, ${participants.infants} Infant${participants.infants > 1 ? 's' : ''}` : ''}
        </p>
      </div>
      
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Customer</h4>
        <p class="text-sm">${customer.firstName} ${customer.lastName}</p>
        <p class="text-sm text-gray-600">${customer.email}</p>
        <p class="text-sm text-gray-600">${customer.phone}</p>
      </div>
      
      <div class="border-t pt-4">
        <div class="flex justify-between items-center font-bold">
          <span>Total Amount</span>
          <span class="text-primary">AED ${form.pricing?.total || 0}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('bookingSummary').innerHTML = summaryHTML;
}

function resetForm() {
  if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
    location.reload();
  }
}

function printBooking(bookingReference) {
  window.open(`/admin/bookings/${bookingReference}/print`, '_blank');
}

function copyPaymentLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    alert('Payment link copied to clipboard!');
  });
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.manualBookingForm = new ManualBookingForm();
});
