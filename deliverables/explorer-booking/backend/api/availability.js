// Availability Management API - Explorer Shack Compatible
// Handles availability queries, pricing, and capacity management

const express = require('express');
const router = express.Router();

class AvailabilityManager {
  constructor() {
    // In-memory cache for availability data
    // In production, this would be backed by a database
    this.availabilityCache = new Map();
    this.pricingCache = new Map();
  }

  /**
   * Get availabilities for a product within a date range
   * Following Explorer Shack API structure
   */
  async getAvailabilities(productId, fromDateTime, toDateTime) {
    try {
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error('INVALID_PRODUCT');
      }

      const availabilities = [];
      const startDate = new Date(fromDateTime);
      const endDate = new Date(toDateTime);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateTimeStr = currentDate.toISOString();
        const availability = await this.getAvailabilityForDate(product, currentDate);
        
        if (availability) {
          availabilities.push({
            dateTime: dateTimeStr,
            productId: productId,
            cutoffSeconds: this.calculateCutoffSeconds(product, currentDate),
            vacancies: availability.vacancies,
            currency: product.currency || 'AED',
            ...this.getPricingData(product, currentDate),
            ...this.getOpeningTimes(product, currentDate)
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        data: {
          availabilities
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get availability for a specific date and product
   */
  async getAvailabilityForDate(product, date) {
    const dateKey = `${product.id}_${date.toISOString().split('T')[0]}`;
    
    // Check cache first
    if (this.availabilityCache.has(dateKey)) {
      return this.availabilityCache.get(dateKey);
    }

    // Calculate availability based on product configuration
    const availability = await this.calculateAvailability(product, date);
    
    // Cache the result
    this.availabilityCache.set(dateKey, availability);
    
    return availability;
  }

  /**
   * Calculate availability based on product settings and existing bookings
   */
  async calculateAvailability(product, date) {
    // Check if date is disabled
    if (this.isDateDisabled(product, date)) {
      return { vacancies: 0 };
    }

    // Get base capacity from product
    const baseCapacity = product.capacity || 50;
    
    // Get existing bookings for this date
    const existingBookings = await this.getBookingsForDate(product.id, date);
    const bookedCapacity = existingBookings.reduce((total, booking) => {
      return total + (booking.participants?.adults || 0) + (booking.participants?.children || 0);
    }, 0);

    // Calculate remaining capacity
    const vacancies = Math.max(0, baseCapacity - bookedCapacity);

    // Apply overbooking rules if configured
    const overbookingLimit = product.overbookingLimit || 0;
    const finalVacancies = Math.min(vacancies + overbookingLimit, 5000); // EXPSK cap

    return {
      vacancies: finalVacancies,
      totalCapacity: baseCapacity,
      bookedCapacity,
      overbookingLimit
    };
  }

  /**
   * Get pricing data for availability response
   */
  getPricingData(product, date) {
    const pricingData = {};

    // Standard pricing by category
    if (product.priceOverApi) {
      pricingData.pricesByCategory = {
        retailPrices: [
          {
            category: 'ADULT',
            price: this.convertToMinorUnits(product.adultPrice, product.currency)
          },
          {
            category: 'CHILD',
            price: this.convertToMinorUnits(product.childPrice, product.currency)
          }
        ]
      };

      // Tiered pricing if configured
      if (product.tieredPricing) {
        pricingData.tieredPricesByCategory = {
          retailPrices: [
            {
              category: 'ADULT',
              tiers: product.tieredPricing.adult.map(tier => ({
                lowerBound: tier.lowerBound,
                upperBound: tier.upperBound,
                price: this.convertToMinorUnits(tier.price, product.currency)
              }))
            },
            {
              category: 'CHILD',
              tiers: product.tieredPricing.child.map(tier => ({
                lowerBound: tier.lowerBound,
                upperBound: tier.upperBound,
                price: this.convertToMinorUnits(tier.price, product.currency)
              }))
            }
          ]
        };
      }

      // Availability by category if configured
      if (product.categoryBasedAvailability) {
        pricingData.vacanciesByCategory = [
          {
            category: 'ADULT',
            vacancies: Math.floor(pricingData.vacancies * 0.7) // Example split
          },
          {
            category: 'CHILD',
            vacancies: Math.floor(pricingData.vacancies * 0.3)
          }
        ];
      }
    }

    return pricingData;
  }

  /**
   * Get opening times for time period products
   */
  getOpeningTimes(product, date) {
    if (product.productType === 'time_period') {
      return {
        openingTimes: product.openingTimes || [
          { fromTime: '09:00', toTime: '18:00' }
        ]
      };
    }
    return {};
  }

  /**
   * Calculate cutoff time in seconds
   */
  calculateCutoffSeconds(product, date) {
    const now = new Date();
    const experienceDate = new Date(date);
    
    // Same day booking
    if (experienceDate.toDateString() === now.toDateString()) {
      return product.sameDayCutoffMinutes ? product.sameDayCutoffMinutes * 60 : 1800; // 30 min default
    }
    
    // Advance booking
    return product.advanceCutoffHours ? product.advanceCutoffHours * 3600 : 3600; // 1 hour default
  }

  /**
   * Convert price to minor units (cents)
   */
  convertToMinorUnits(price, currency) {
    // Special currencies that don't use minor units
    const noMinorUnitCurrencies = ['JPY', 'CLP', 'KRW', 'VND'];
    
    if (noMinorUnitCurrencies.includes(currency)) {
      return Math.round(price);
    }
    
    return Math.round(price * 100);
  }

  /**
   * Check if a date is disabled for a product
   */
  isDateDisabled(product, date) {
    if (!product.disabledDates) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return product.disabledDates.includes(dateStr);
  }

  /**
   * Notify availability update (from supplier)
   */
  async notifyAvailabilityUpdate(updateData) {
    try {
      const { productId, availabilities } = updateData;
      
      // Validate product exists
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error('INVALID_PRODUCT');
      }

      // Process each availability update
      for (const availability of availabilities) {
        await this.updateAvailabilityCache(productId, availability);
      }

      return {
        data: {
          message: 'Availability Update Accepted'
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update availability cache with new data
   */
  async updateAvailabilityCache(productId, availability) {
    const date = new Date(availability.dateTime);
    const dateKey = `${productId}_${date.toISOString().split('T')[0]}`;
    
    // Update cache
    this.availabilityCache.set(dateKey, {
      vacancies: availability.vacancies,
      lastUpdated: new Date(),
      source: 'supplier_update'
    });

    // Update pricing cache if provided
    if (availability.pricesByCategory || availability.tieredPricesByCategory) {
      this.pricingCache.set(dateKey, {
        pricesByCategory: availability.pricesByCategory,
        tieredPricesByCategory: availability.tieredPricesByCategory,
        currency: availability.currency,
        lastUpdated: new Date()
      });
    }

    // Trigger any necessary notifications or updates
    await this.triggerAvailabilityChangeNotifications(productId, availability);
  }

  /**
   * Get product details (mock implementation)
   */
  async getProduct(productId) {
    // In production, this would query the database
    // For now, return mock data or integrate with existing product manager
    const mockProducts = {
      'prod123': {
        id: 'prod123',
        title: 'Dubai City Tour',
        currency: 'AED',
        capacity: 50,
        adultPrice: 150,
        childPrice: 100,
        priceOverApi: true,
        productType: 'time_point',
        disabledDates: [],
        openingTimes: [{ fromTime: '09:00', toTime: '18:00' }]
      }
    };
    
    return mockProducts[productId] || null;
  }

  /**
   * Get bookings for a specific date
   */
  async getBookingsForDate(productId, date) {
    // Mock implementation - in production, query database
    return [];
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    const errorMap = {
      'INVALID_PRODUCT': {
        errorCode: 'INVALID_PRODUCT',
        errorMessage: 'Provided productId did not match an existing product in our system'
      },
      'VALIDATION_FAILURE': {
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Invalid JSON received'
      },
      'AUTHORIZATION_FAILURE': {
        errorCode: 'AUTHORIZATION_FAILURE',
        errorMessage: 'Incorrect credentials provided'
      }
    };

    return errorMap[error.message] || {
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    };
  }

  /**
   * Trigger notifications when availability changes
   */
  async triggerAvailabilityChangeNotifications(productId, availability) {
    // Implement notification logic here
    // Could trigger webhooks, email alerts, etc.
    console.log(`Availability updated for product ${productId}:`, availability);
  }
}

// Initialize availability manager
const availabilityManager = new AvailabilityManager();

// API Routes

/**
 * GET /api/availability
 * Get availabilities for a product within date range
 */
router.get('/', async (req, res) => {
  try {
    const { productId, fromDateTime, toDateTime } = req.query;
    
    if (!productId || !fromDateTime || !toDateTime) {
      return res.status(400).json({
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Missing required parameters: productId, fromDateTime, toDateTime'
      });
    }

    const result = await availabilityManager.getAvailabilities(
      productId,
      fromDateTime,
      toDateTime
    );

    if (result.errorCode) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Availability API error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/availability/notify
 * Notify availability update from supplier
 */
router.post('/notify', async (req, res) => {
  try {
    const result = await availabilityManager.notifyAvailabilityUpdate(req.body.data);
    
    if (result.errorCode) {
      return res.status(400).json(result);
    }

    res.status(202).json(result);
  } catch (error) {
    console.error('Availability notify error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/availability/check
 * Check availability for specific booking request
 */
router.post('/check', async (req, res) => {
  try {
    const { productId, variationId, dateTime, participants } = req.body;
    
    const product = await availabilityManager.getProduct(productId);
    if (!product) {
      return res.status(400).json({
        errorCode: 'INVALID_PRODUCT',
        errorMessage: 'Product not found'
      });
    }

    const date = new Date(dateTime);
    const availability = await availabilityManager.getAvailabilityForDate(product, date);
    
    // Calculate required capacity
    const requiredCapacity = (participants.adults || 0) + (participants.children || 0);
    
    // Check if booking is possible
    const canBook = availability.vacancies >= requiredCapacity;
    
    // Get pricing
    const pricing = availabilityManager.getPricingData(product, date);
    
    res.json({
      availability: {
        ...availability,
        canBook,
        requiredCapacity
      },
      pricing: pricing.pricesByCategory || null
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

module.exports = router;
