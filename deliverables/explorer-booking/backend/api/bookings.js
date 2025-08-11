// Booking Management API - Explorer Shack Compatible
// Handles booking creation, cancellation, and ticket generation

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

class BookingManager {
  constructor() {
    // In-memory storage for bookings
    // In production, this would be backed by a database
    this.bookings = new Map();
    this.tickets = new Map();
    this.bookingSequence = 1000;
  }

  /**
   * Create a new booking from reservation
   * Following Explorer Shack booking flow
   */
  async createBooking(bookingData) {
    try {
      const {
        productId,
        reservationReference,
        expskBookingReference,
        expskActivityReference,
        currency,
        dateTime,
        bookingItems,
        addonItems = [],
        language = 'en',
        travelers,
        travelerHotel,
        comment
      } = bookingData;

      // Validate reservation exists and is valid
      const reservation = await this.getReservation(reservationReference);
      if (!reservation) {
        throw new Error('INVALID_RESERVATION');
      }

      // Validate product exists
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error('INVALID_PRODUCT');
      }

      // Validate participant configuration
      const participantValidation = this.validateParticipants(product, bookingItems);
      if (!participantValidation.valid) {
        throw participantValidation.error;
      }

      // Validate addons if provided
      if (addonItems.length > 0) {
        const addonValidation = await this.validateAddons(product, addonItems);
        if (!addonValidation.valid) {
          throw new Error('INVALID_ADDONS_CONFIGURATION');
        }
      }

      // Generate booking reference
      const bookingReference = this.generateBookingReference();

      // Generate tickets
      const tickets = await this.generateTickets(bookingItems, product);

      // Create booking object
      const booking = {
        bookingReference,
        productId,
        reservationReference,
        expskBookingReference,
        expskActivityReference,
        currency,
        dateTime,
        bookingItems,
        addonItems,
        language,
        travelers,
        travelerHotel,
        comment,
        tickets,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: new Date(),
        lastUpdated: new Date(),
        metadata: {
          source: 'api',
          userAgent: 'Explorer Booking System',
          ipAddress: '127.0.0.1' // In production, get from request
        }
      };

      // Store booking
      this.bookings.set(bookingReference, booking);

      // Store tickets separately for quick lookup
      tickets.forEach(ticket => {
        this.tickets.set(ticket.ticketCode, {
          ...ticket,
          bookingReference,
          expskBookingReference,
          productId,
          dateTime,
          status: 'ACTIVE'
        });
      });

      // Remove reservation (it's now converted to booking)
      await this.removeReservation(reservationReference);

      // Trigger post-booking actions
      await this.triggerPostBookingActions(booking);

      return {
        data: {
          bookingReference,
          tickets: tickets.map(ticket => ({
            category: ticket.category,
            ticketCode: ticket.ticketCode,
            ticketCodeType: ticket.ticketCodeType
          }))
        }
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(cancellationData) {
    try {
      const { bookingReference, expskBookingReference, productId } = cancellationData;

      // Find booking
      const booking = this.bookings.get(bookingReference);
      if (!booking) {
        throw new Error('INVALID_BOOKING');
      }

      // Verify booking reference matches
      if (booking.expskBookingReference !== expskBookingReference) {
        throw new Error('INVALID_BOOKING');
      }

      // Check if booking can be cancelled
      const cancellationCheck = await this.checkCancellationEligibility(booking);
      if (!cancellationCheck.canCancel) {
        throw new Error(cancellationCheck.reason);
      }

      // Update booking status
      booking.status = 'CANCELLED';
      booking.cancelledAt = new Date();
      booking.lastUpdated = new Date();

      // Deactivate tickets
      booking.tickets.forEach(ticket => {
        const storedTicket = this.tickets.get(ticket.ticketCode);
        if (storedTicket) {
          storedTicket.status = 'CANCELLED';
        }
      });

      // Release capacity
      await this.releaseCapacity(booking.productId, booking.dateTime, booking.bookingItems);

      // Trigger cancellation actions
      await this.triggerCancellationActions(booking);

      return {
        data: {}
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generate tickets for booking items
   */
  async generateTickets(bookingItems, product) {
    const tickets = [];

    for (const item of bookingItems) {
      const ticketCount = item.category === 'GROUP' ? item.count : item.count;
      
      for (let i = 0; i < ticketCount; i++) {
        const ticket = {
          category: item.category,
          ticketCode: this.generateTicketCode(),
          ticketCodeType: this.getTicketCodeType(product),
          groupSize: item.category === 'GROUP' ? item.groupSize : undefined,
          retailPrice: item.retailPrice,
          generatedAt: new Date()
        };

        tickets.push(ticket);
      }
    }

    return tickets;
  }

  /**
   * Generate unique ticket code
   */
  generateTicketCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `TKT${timestamp}${random}`;
  }

  /**
   * Get ticket code type based on product configuration
   */
  getTicketCodeType(product) {
    // Default to QR_CODE, but can be configured per product
    const supportedTypes = [
      'TEXT', 'BARCODE_CODE39', 'BARCODE_CODE128', 
      'QR_CODE', 'DATA_MATRIX', 'EAN_13', 'ITF', 'AZTEC'
    ];

    return product.ticketCodeType || 'QR_CODE';
  }

  /**
   * Generate unique booking reference
   */
  generateBookingReference() {
    const sequence = this.bookingSequence++;
    const timestamp = Date.now().toString(36).toUpperCase();
    return `BK${sequence}${timestamp}`;
  }

  /**
   * Validate participant configuration
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

    return { valid: true };
  }

  /**
   * Validate addons configuration
   */
  async validateAddons(product, addonItems) {
    // Get available addons for product
    const availableAddons = await this.getProductAddons(product.id);
    
    for (const addonItem of addonItems) {
      const availableAddon = availableAddons.find(a => a.addonType === addonItem.addonType);
      
      if (!availableAddon) {
        return {
          valid: false,
          reason: `Addon type ${addonItem.addonType} not available for this product`
        };
      }

      // Validate addon description if multiple addons of same type
      if (addonItem.addonDescription && 
          availableAddon.addonDescription !== addonItem.addonDescription) {
        return {
          valid: false,
          reason: `Invalid addon description for ${addonItem.addonType}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Calculate total capacity required
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
   * Check if booking can be cancelled
   */
  async checkCancellationEligibility(booking) {
    const now = new Date();
    const experienceDate = new Date(booking.dateTime);

    // Check if booking is in the past
    if (experienceDate < now) {
      return {
        canCancel: false,
        reason: 'BOOKING_IN_PAST'
      };
    }

    // Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return {
        canCancel: false,
        reason: 'BOOKING_ALREADY_CANCELLED'
      };
    }

    // Check if tickets have been redeemed
    const hasRedeemedTickets = booking.tickets.some(ticket => {
      const storedTicket = this.tickets.get(ticket.ticketCode);
      return storedTicket && storedTicket.status === 'REDEEMED';
    });

    if (hasRedeemedTickets) {
      return {
        canCancel: false,
        reason: 'BOOKING_REDEEMED'
      };
    }

    return { canCancel: true };
  }

  /**
   * Redeem ticket by ticket code
   */
  async redeemTicket(ticketCode, expskBookingReference) {
    try {
      const ticket = this.tickets.get(ticketCode);
      
      if (!ticket) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      if (ticket.expskBookingReference !== expskBookingReference) {
        throw new Error('AUTHORIZATION_FAILURE');
      }

      if (ticket.status === 'REDEEMED') {
        throw new Error('VALIDATION_FAILURE');
      }

      // Mark ticket as redeemed
      ticket.status = 'REDEEMED';
      ticket.redeemedAt = new Date();

      // Update booking if all tickets are redeemed
      const booking = this.bookings.get(ticket.bookingReference);
      if (booking) {
        const allTicketsRedeemed = booking.tickets.every(t => {
          const storedTicket = this.tickets.get(t.ticketCode);
          return storedTicket && storedTicket.status === 'REDEEMED';
        });

        if (allTicketsRedeemed) {
          booking.status = 'COMPLETED';
          booking.completedAt = new Date();
          booking.lastUpdated = new Date();
        }
      }

      return { success: true };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Redeem all tickets for a booking
   */
  async redeemBooking(expskBookingReference) {
    try {
      // Find booking by EXPSK reference
      const booking = Array.from(this.bookings.values())
        .find(b => b.expskBookingReference === expskBookingReference);

      if (!booking) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      // Check if already redeemed
      const allTicketsRedeemed = booking.tickets.every(t => {
        const storedTicket = this.tickets.get(t.ticketCode);
        return storedTicket && storedTicket.status === 'REDEEMED';
      });

      if (allTicketsRedeemed) {
        throw new Error('VALIDATION_FAILURE');
      }

      // Redeem all tickets
      booking.tickets.forEach(ticket => {
        const storedTicket = this.tickets.get(ticket.ticketCode);
        if (storedTicket && storedTicket.status !== 'REDEEMED') {
          storedTicket.status = 'REDEEMED';
          storedTicket.redeemedAt = new Date();
        }
      });

      // Update booking status
      booking.status = 'COMPLETED';
      booking.completedAt = new Date();
      booking.lastUpdated = new Date();

      return { success: true };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Trigger post-booking actions
   */
  async triggerPostBookingActions(booking) {
    try {
      // Send confirmation email
      await this.sendBookingConfirmation(booking);

      // Schedule ticket delivery if configured
      await this.scheduleTicketDelivery(booking);

      // Update inventory
      await this.updateInventory(booking);

      // Trigger webhooks if configured
      await this.triggerWebhooks('booking.created', booking);

    } catch (error) {
      console.error('Post-booking actions error:', error);
    }
  }

  /**
   * Trigger cancellation actions
   */
  async triggerCancellationActions(booking) {
    try {
      // Send cancellation email
      await this.sendCancellationNotification(booking);

      // Process refund if applicable
      await this.processRefund(booking);

      // Trigger webhooks
      await this.triggerWebhooks('booking.cancelled', booking);

    } catch (error) {
      console.error('Cancellation actions error:', error);
    }
  }

  /**
   * Mock implementations for external services
   */
  async getReservation(reservationReference) {
    // In production, integrate with reservation service
    return { valid: true, expired: false };
  }

  async removeReservation(reservationReference) {
    // In production, integrate with reservation service
    console.log(`Removed reservation: ${reservationReference}`);
  }

  async getProduct(productId) {
    // Mock product data
    const mockProducts = {
      'prod123': {
        id: 'prod123',
        title: 'Dubai City Tour',
        minParticipants: 1,
        maxParticipants: 20,
        ticketCodeType: 'QR_CODE'
      }
    };
    return mockProducts[productId] || null;
  }

  async getProductAddons(productId) {
    // Mock addons data
    return [
      {
        addonType: 'FOOD',
        addonDescription: 'Traditional lunch',
        retailPrice: 5000,
        currency: 'AED'
      }
    ];
  }

  async releaseCapacity(productId, dateTime, bookingItems) {
    console.log(`Released capacity for ${productId} on ${dateTime}`);
  }

  async sendBookingConfirmation(booking) {
    console.log(`Sending confirmation for booking: ${booking.bookingReference}`);
  }

  async scheduleTicketDelivery(booking) {
    console.log(`Scheduling ticket delivery for: ${booking.bookingReference}`);
  }

  async updateInventory(booking) {
    console.log(`Updating inventory for booking: ${booking.bookingReference}`);
  }

  async triggerWebhooks(event, data) {
    console.log(`Triggering webhook: ${event}`);
  }

  async sendCancellationNotification(booking) {
    console.log(`Sending cancellation notification: ${booking.bookingReference}`);
  }

  async processRefund(booking) {
    console.log(`Processing refund for: ${booking.bookingReference}`);
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
      'INVALID_RESERVATION': {
        errorCode: 'INVALID_RESERVATION',
        errorMessage: 'Invalid reservation reference or reservation has expired'
      },
      'INVALID_BOOKING': {
        errorCode: 'INVALID_BOOKING',
        errorMessage: 'Invalid booking reference'
      },
      'NO_AVAILABILITY': {
        errorCode: 'NO_AVAILABILITY',
        errorMessage: 'No availability for the requested booking'
      },
      'VALIDATION_FAILURE': {
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Validation failed'
      },
      'INVALID_ADDONS_CONFIGURATION': {
        errorCode: 'INVALID_ADDONS_CONFIGURATION',
        errorMessage: 'Invalid addons configuration'
      },
      'BOOKING_REDEEMED': {
        errorCode: 'BOOKING_REDEEMED',
        errorMessage: 'Booking has already been redeemed'
      },
      'BOOKING_IN_PAST': {
        errorCode: 'BOOKING_IN_PAST',
        errorMessage: 'Booking is in the past and cannot be cancelled'
      },
      'BOOKING_ALREADY_CANCELLED': {
        errorCode: 'BOOKING_ALREADY_CANCELLED',
        errorMessage: 'Booking has already been cancelled'
      },
      'RESOURCE_NOT_FOUND': {
        errorCode: 'RESOURCE_NOT_FOUND',
        errorMessage: 'Resource not found'
      },
      'AUTHORIZATION_FAILURE': {
        errorCode: 'AUTHORIZATION_FAILURE',
        errorMessage: 'Authorization failed'
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

// Initialize booking manager
const bookingManager = new BookingManager();

// API Routes

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.productId || !data.reservationReference || !data.expskBookingReference) {
      return res.status(400).json({
        errorCode: 'VALIDATION_FAILURE',
        errorMessage: 'Missing required fields'
      });
    }

    const result = await bookingManager.createBooking(data);

    if (result.errorCode) {
      const statusCode = result.errorCode === 'INVALID_RESERVATION' ? 400 :
                        result.errorCode === 'INVALID_PRODUCT' ? 404 :
                        result.errorCode === 'NO_AVAILABILITY' ? 400 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/bookings/cancel
 * Cancel a booking
 */
router.post('/cancel', async (req, res) => {
  try {
    const { data } = req.body;
    
    const result = await bookingManager.cancelBooking(data);

    if (result.errorCode) {
      const statusCode = result.errorCode === 'INVALID_BOOKING' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/bookings/redeem-ticket
 * Redeem a ticket by ticket code
 */
router.post('/redeem-ticket', async (req, res) => {
  try {
    const { data } = req.body;
    const { ticketCode, expskBookingReference } = data;
    
    const result = await bookingManager.redeemTicket(ticketCode, expskBookingReference);

    if (result.errorCode) {
      const statusCode = result.errorCode === 'RESOURCE_NOT_FOUND' ? 404 :
                        result.errorCode === 'AUTHORIZATION_FAILURE' ? 401 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Ticket redemption error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/bookings/redeem-booking
 * Redeem all tickets for a booking
 */
router.post('/redeem-booking', async (req, res) => {
  try {
    const { data } = req.body;
    const { expskBookingReference } = data;
    
    const result = await bookingManager.redeemBooking(expskBookingReference);

    if (result.errorCode) {
      const statusCode = result.errorCode === 'RESOURCE_NOT_FOUND' ? 404 :
                        result.errorCode === 'AUTHORIZATION_FAILURE' ? 401 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Booking redemption error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/bookings/:reference
 * Get booking details
 */
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    const booking = bookingManager.bookings.get(reference);
    
    if (!booking) {
      return res.status(404).json({
        errorCode: 'INVALID_BOOKING',
        errorMessage: 'Booking not found'
      });
    }

    res.json({
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      errorCode: 'INTERNAL_SYSTEM_FAILURE',
      errorMessage: 'An unexpected error occurred'
    });
  }
});

module.exports = router;
