// Reservation Management API - Explorer Shack Compatible
// Handles reservation creation, cancellation, and management

const express = require('express');
const router = express.Router();

class ReservationManager {
  constructor() {
    // In-memory storage for reservations
    // In production, this would be backed by a database
    this.reservations = new Map();
    this.reservationExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Start cleanup interval for expired reservations
    this.startCleanupInterval();
  }

  /**
   * Create a new reservation
   * Following Explorer Shack reservation flow
   */
  async createReservation(reservationData) {
    try {
      const {
        productId,
        dateTime,
        bookingItems,
        expskBookingReference,
        expskActivityReference
      } = reservationData;

      // Validate product exists and is available
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error('INVALID_PRODUCT');
      }

      // Check availability
      const availability = await this.checkAvailability(productId, dateTime, bookingItems);
      if (!availability.available) {
        throw new Error('NO_AVAILABILITY');
      }

      // Validate participant configuration
      const participantValidation = this.validateParticipants(product, bookingItems);
      if (!participantValidation.valid) {
        throw participantValidation.error;
      }

      // Generate reservation reference
      const reservationReference = this.generateReservationReference();
      const reservationExpiration = new Date(Date.now() + this.reservationExpiry);

      // Create reservation object
      const reservation = {
        reservationReference,
        reservationExpiration,
        productId,
        dateTime,
        bookingItems,
        expskBookingReference,
        expskActivityReference,
        status: 'ACTIVE',
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      // Store reservation
      this.reservations.set(reservationReference, reservation);

      // Reserve capacity temporarily
      await this.reserveCapacity(productId, dateTime, bookingItems);

      return {
        data: {
          reservationReference,
          reservationExpiration: reservationExpiration.toISOString()
        }
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(cancellationData) {
    try {
      const { reservationReference, expskBookingReference, expskActivityReference } = cancellationData;

      // Find reservation
      const reservation = this.reservations.get(reservationReference);
      if (!reservation) {
        throw new Error('INVALID_RESERVATION');
      }

      // Verify booking reference matches
      if (reservation.expskBookingReference !== expskBookingReference) {
        throw new Error('INVALID_RESERVATION');
      }

      // Release reserved capacity
      await this.releaseCapacity(
        reservation.productId,
        reservation.dateTime,
        reservation.bookingItems
      );

      // Remove reservation
      this.reservations.delete(reservationReference);

      return {
        data: {}
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get reservation details
   */
  async getReservation(reservationReference) {
    const reservation = this.reservations.get(reservationReference);
    
    if (!reservation) {
      return null;
    }

    // Check if expired
    if (new Date() > reservation.reservationExpiration) {
      await this.expireReservation(reservationReference);
      return null;
    }

    return reservation;
  }

  /**
   * Check availability for booking items
   */
  async checkAvailability(productId, dateTime, bookingItems) {
    try {
      // Get current availability
      const date = new Date(dateTime);
      const availability = await this.getAvailabilityForDate(productId, date);

      if (!availability) {
        return { available: false, reason: 'NO_AVAILABILITY' };
      }

      // Calculate required capacity
      const requiredCapacity = this.calculateRequiredCapacity(bookingItems);

      // Check if enough capacity available
      if (availability.vacancies < requiredCapacity) {
        return { 
          available: false, 
          reason: 'INSUFFICIENT_CAPACITY',
          available: availability.vacancies,
          required: requiredCapacity
        };
      }

      return { 
        available: true,
        availableCapacity: availability.vacancies,
        requiredCapacity
      };

    } catch (error) {
      return { available: false, reason: 'SYSTEM_ERROR' };
    }
  }

  /**
   * Validate participant configuration against product rules
   */
  validateParticipants(product, bookingItems) {
    const totalParticipants = this.calculateRequiredCapacity(bookingItems);
    
    // Check minimum participants
    if (product.minParticipants && totalParticipants < product.minParticipants) {
      return {
        valid: false,
        error: {
          name: 'INVALID_PARTICIPANTS_CONFIGURATION',
          message: `The activity requires a minimum of ${product.minParticipants} participants`,
          participantsConfiguration: {
            min: product.minParticipants,
            max: product.maxParticipants || null
          }
        }
      };
    }

    // Check maximum participants
    if (product.maxParticipants && totalParticipants > product.maxParticipants) {
      return {
        valid: false,
        error: {
          name: 'INVALID_PARTICIPANTS_CONFIGURATION',
          message: `The activity cannot be reserved for more than ${product.maxParticipants} participants`,
          participantsConfiguration: {
            min: product.minParticipants || 1,
            max: product.maxParticipants
          }
        }
      };
    }

    // Check group size constraints for GROUP category
    const groupItems = bookingItems.filter(item => item.category === 'GROUP');
    if (groupItems.length > 0) {
      for (const groupItem of groupItems) {
        if (product.maxGroupSize && groupItem.groupSize > product.maxGroupSize) {
          return {
            valid: false,
            error: {
              name: 'INVALID_PARTICIPANTS_CONFIGURATION',
              message: `The activity cannot be reserved for more than ${product.maxGroupSize} participants per group`,
              participantsConfiguration: {
                min: product.minParticipants || 1,
                max: product.maxGroupSize
              },
              groupConfiguration: {
                max: product.maxGroups || 1
              }
            }
          };
        }
      }

      // Check maximum number of groups
      if (product.maxGroups && groupItems.length > product.maxGroups) {
        return {
          valid: false,
          error: {
            name: 'INVALID_PARTICIPANTS_CONFIGURATION',
            message: `Maximum ${product.maxGroups} groups allowed per booking`,
            participantsConfiguration: {
              min: product.minParticipants || 1,
              max: product.maxGroupSize || 999
            },
            groupConfiguration: {
              max: product.maxGroups
            }
          }
        };
      }
    }

    return { valid: true };
  }

  /**
   * Calculate total capacity required for booking items
   */
  calculateRequiredCapacity(bookingItems) {
    return bookingItems.reduce((total, item) => {
      if (item.category === 'GROUP') {
        return total + (item.groupSize * item.count);
      }
      return total + item.count;
    }, 0);
  }

  /**
   * Reserve capacity temporarily
   */
  async reserveCapacity(productId, dateTime, bookingItems) {
    const requiredCapacity = this.calculateRequiredCapacity(bookingItems);
    const dateKey = `${productId}_${new Date(dateTime).toISOString().split('T')[0]}`;
    
    // In production, this would update database capacity
    console.log(`Reserved ${requiredCapacity} capacity for ${dateKey}`);
  }

  /**
   * Release reserved capacity
   */
  async releaseCapacity(productId, dateTime, bookingItems) {
    const requiredCapacity = this.calculateRequiredCapacity(bookingItems);
    const dateKey = `${productId}_${new Date(dateTime).toISOString().split('T')[0]}`;
    
    // In production, this would update database capacity
    console.log(`Released ${requiredCapacity} capacity for ${dateKey}`);
  }

  /**
   * Generate unique reservation reference
   */
  generateReservationReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `RES_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Expire a reservation and clean up
   */
  async expireReservation(reservationReference) {
    const reservation = this.reservations.get(reservationReference);
    if (reservation) {
      // Release capacity
      await this.releaseCapacity(
        reservation.productId,
        reservation.dateTime,
        reservation.bookingItems
      );

      // Remove reservation
      this.reservations.delete(reservationReference);
      
      console.log(`Expired reservation: ${reservationReference}`);
    }
  }

  /**
   * Start cleanup interval for expired reservations
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredReservations();
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  /**
   * Clean up expired reservations
   */
  async cleanupExpiredReservations() {
    const now = new Date();
    const expiredReservations = [];

    for (const [reference, reservation] of this.reservations.entries()) {
      if (now > reservation.reservationExpiration) {
        expiredReservations.push(reference);
      }
    }

    for (const reference of expiredReservations) {
      await this.expireReservation(reference);
    }

    if (expiredReservations.length > 0) {
      console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
    }
  }

  /**
   * Get product details (mock implementation)
   */
  async getProduct(productId) {
    // Mock product data - in production, integrate with product service
    const mockProducts = {
      'prod123': {
        id: 'prod123',
        title: 'Dubai City Tour',
        minParticipants: 1,
        maxParticipants: 20,
        maxGroupSize: 8,
        maxGroups: 3,
        capacity: 50
      },
      'prod124': {
        id: 'prod124',
        title: 'Desert Safari',
        minParticipants: 2,
        maxParticipants: 15,
        maxGroupSize: 6,
        maxGroups: 2,
        capacity: 30
      }
    };
    
    return mockProducts[productId] || null;
  }

  /**
   * Get availability for a specific date
   */
  async getAvailabilityForDate(productId, date) {
    // Mock availability - in production, integrate with availability service
    return {
      vacancies: 25,
      totalCapacity: 50,
      date: date.toISOString().split('T')[0]
    };
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
      'NO_AVAILABILITY': {
        errorCode: 'NO_AVAILABILITY',
        errorMessage: 'No availability for the requested date and time'
      },
      'INVALID_RESERVATION': {
        errorCode: 'INVALID_RESERVATION',
        errorMessage: 'Invalid reservation reference or reservation has expired'
      },
      'VALIDATION_FAILURE': {
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Invalid request data'
      },
      'AUTHORIZATION_FAILURE': {
        errorCode: 'AUTHORIZATION_FAILURE',
        errorMessage: 'Incorrect credentials provided'
      }
    };

    // Handle participant configuration errors
    if (error.name === 'INVALID_PARTICIPANTS_CONFIGURATION') {
      return {
        errorCode: error.name,
        errorMessage: error.message,
        participantsConfiguration: error.participantsConfiguration,
        groupConfiguration: error.groupConfiguration
      };
    }

    return errorMap[error.message] || {
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    };
  }
}

// Initialize reservation manager
const reservationManager = new ReservationManager();

// API Routes

/**
 * POST /api/reservations
 * Create a new reservation
 */
router.post('/', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.productId || !data.dateTime || !data.bookingItems || !data.expskBookingReference) {
      return res.status(400).json({
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Missing required fields: productId, dateTime, bookingItems, expskBookingReference'
      });
    }

    const result = await reservationManager.createReservation(data);

    if (result.errorCode) {
      const statusCode = result.errorCode === 'NO_AVAILABILITY' ? 400 : 
                        result.errorCode === 'INVALID_PRODUCT' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/reservations/cancel
 * Cancel a reservation
 */
router.post('/cancel', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.reservationReference || !data.expskBookingReference) {
      return res.status(400).json({
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Missing required fields: reservationReference, expskBookingReference'
      });
    }

    const result = await reservationManager.cancelReservation(data);

    if (result.errorCode) {
      const statusCode = result.errorCode === 'INVALID_RESERVATION' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Reservation cancellation error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/reservations/:reference
 * Get reservation details
 */
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    const reservation = await reservationManager.getReservation(reference);
    
    if (!reservation) {
      return res.status(404).json({
        errorCode: 'INVALID_RESERVATION',
        errorMessage: 'Reservation not found or has expired'
      });
    }

    res.json({
      data: reservation
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/reservations/extend
 * Extend reservation expiration time
 */
router.post('/extend', async (req, res) => {
  try {
    const { reservationReference, extensionMinutes = 30 } = req.body;
    
    const reservation = await reservationManager.getReservation(reservationReference);
    if (!reservation) {
      return res.status(404).json({
        errorCode: 'INVALID_RESERVATION',
        errorMessage: 'Reservation not found or has expired'
      });
    }

    // Extend expiration time
    const newExpiration = new Date(Date.now() + extensionMinutes * 60 * 1000);
    reservation.reservationExpiration = newExpiration;
    reservation.lastUpdated = new Date();

    reservationManager.reservations.set(reservationReference, reservation);

    res.json({
      data: {
        reservationReference,
        reservationExpiration: newExpiration.toISOString(),
        message: `Reservation extended by ${extensionMinutes} minutes`
      }
    });
  } catch (error) {
    console.error('Reservation extension error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/reservations/stats
 * Get reservation statistics (admin only)
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const now = new Date();
    const reservations = Array.from(reservationManager.reservations.values());
    
    const stats = {
      total: reservations.length,
      active: reservations.filter(r => r.status === 'ACTIVE' && now <= r.reservationExpiration).length,
      expired: reservations.filter(r => now > r.reservationExpiration).length,
      averageHoldTime: 0,
      topProducts: {}
    };

    // Calculate average hold time
    const activeDurations = reservations
      .filter(r => r.status === 'ACTIVE')
      .map(r => now - r.createdAt);
    
    if (activeDurations.length > 0) {
      stats.averageHoldTime = Math.round(
        activeDurations.reduce((a, b) => a + b, 0) / activeDurations.length / 1000 / 60
      ); // in minutes
    }

    // Top products by reservation count
    reservations.forEach(r => {
      stats.topProducts[r.productId] = (stats.topProducts[r.productId] || 0) + 1;
    });

    res.json({ data: stats });
  } catch (error) {
    console.error('Reservation stats error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

module.exports = router;
