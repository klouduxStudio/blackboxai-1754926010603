// Booking Status Management System
// Handles status transitions, automation, and workflow management

class BookingStatusManager {
  constructor() {
    // Define all possible booking statuses with metadata
    this.statuses = {
      PENDING: {
        code: 'PENDING',
        label: 'Pending Payment',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Awaiting payment confirmation',
        priority: 1,
        isActive: true,
        allowRefund: false
      },
      FAILED: {
        code: 'FAILED',
        label: 'Payment Failed',
        color: 'bg-red-100 text-red-800 border-red-200',
        description: 'Payment failed or booking expired',
        priority: 2,
        isActive: false,
        allowRefund: false
      },
      CONFIRMED: {
        code: 'CONFIRMED',
        label: 'Confirmed',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Booking confirmed and paid',
        priority: 3,
        isActive: true,
        allowRefund: true
      },
      UPCOMING: {
        code: 'UPCOMING',
        label: 'Upcoming',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Experience is scheduled within 24 hours',
        priority: 4,
        isActive: true,
        allowRefund: true
      },
      EXPLORING: {
        code: 'EXPLORING',
        label: 'In Progress',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Experience is currently happening',
        priority: 5,
        isActive: true,
        allowRefund: false
      },
      COMPLETED: {
        code: 'COMPLETED',
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Experience completed successfully',
        priority: 6,
        isActive: false,
        allowRefund: false
      },
      CANCELLED: {
        code: 'CANCELLED',
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
        description: 'Booking has been cancelled',
        priority: 7,
        isActive: false,
        allowRefund: false
      },
      REFUNDED: {
        code: 'REFUNDED',
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        description: 'Full refund processed',
        priority: 8,
        isActive: false,
        allowRefund: false
      },
      PARTIALLY_REFUNDED: {
        code: 'PARTIALLY_REFUNDED',
        label: 'Partially Refunded',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        description: 'Partial refund processed',
        priority: 9,
        isActive: false,
        allowRefund: true
      }
    };

    // Define valid status transitions
    this.statusTransitions = {
      PENDING: ['CONFIRMED', 'FAILED', 'CANCELLED'],
      FAILED: ['CONFIRMED', 'CANCELLED'], // Allow rebooking
      CONFIRMED: ['UPCOMING', 'CANCELLED', 'REFUNDED'],
      UPCOMING: ['EXPLORING', 'CANCELLED', 'REFUNDED'],
      EXPLORING: ['COMPLETED', 'CANCELLED'],
      COMPLETED: ['REFUNDED', 'PARTIALLY_REFUNDED'],
      CANCELLED: ['REFUNDED', 'PARTIALLY_REFUNDED'],
      REFUNDED: [],
      PARTIALLY_REFUNDED: ['REFUNDED']
    };

    // Configuration for automatic status updates
    this.automationConfig = {
      pendingTimeoutHours: 24, // Auto-expire pending bookings after 24 hours
      upcomingThresholdHours: 24, // Mark as upcoming 24 hours before
      exploringStartOffset: 0, // Start exploring at experience time
      completionOffsetHours: 2, // Mark as completed 2 hours after start
      reviewRequestDelayHours: 2 // Send review request 2 hours after completion
    };

    // Start automation intervals
    this.startAutomationIntervals();
  }

  /**
   * Update booking status with validation and history tracking
   */
  async updateBookingStatus(bookingId, newStatus, reason = null, metadata = {}) {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const currentStatus = booking.status;

      // Validate status transition
      if (!this.canTransition(currentStatus, newStatus)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }

      // Update booking status
      booking.status = newStatus;
      booking.lastUpdated = new Date();

      // Add to status history
      if (!booking.statusHistory) {
        booking.statusHistory = [];
      }

      booking.statusHistory.push({
        fromStatus: currentStatus,
        toStatus: newStatus,
        timestamp: new Date(),
        reason,
        metadata,
        triggeredBy: metadata.triggeredBy || 'system'
      });

      // Handle multi-product bookings
      if (booking.products && booking.products.length > 1) {
        await this.updateMultiProductStatus(booking, newStatus, reason, metadata);
      }

      // Save booking
      await this.saveBooking(booking);

      // Trigger status-specific actions
      await this.triggerStatusActions(booking, newStatus, currentStatus);

      return booking;

    } catch (error) {
      console.error('Status update error:', error);
      throw error;
    }
  }

  /**
   * Check if status transition is valid
   */
  canTransition(fromStatus, toStatus) {
    if (!this.statuses[fromStatus] || !this.statuses[toStatus]) {
      return false;
    }

    return this.statusTransitions[fromStatus]?.includes(toStatus) || false;
  }

  /**
   * Handle multi-product booking status updates
   */
  async updateMultiProductStatus(booking, newStatus, reason, metadata) {
    // Initialize product statuses if not exists
    if (!booking.productStatuses) {
      booking.productStatuses = {};
      booking.products.forEach(product => {
        booking.productStatuses[product.id] = booking.status;
      });
    }

    // Update specific product status if specified
    if (metadata.productId) {
      booking.productStatuses[metadata.productId] = newStatus;
    } else {
      // Update all products
      Object.keys(booking.productStatuses).forEach(productId => {
        booking.productStatuses[productId] = newStatus;
      });
    }

    // Calculate overall booking status
    booking.overallStatus = this.calculateOverallStatus(booking.productStatuses);
  }

  /**
   * Calculate overall status for multi-product bookings
   */
  calculateOverallStatus(productStatuses) {
    const statuses = Object.values(productStatuses);
    const uniqueStatuses = [...new Set(statuses)];

    // If all products have the same status
    if (uniqueStatuses.length === 1) {
      return uniqueStatuses[0];
    }

    // Priority-based calculation for mixed statuses
    const priorities = uniqueStatuses.map(status => this.statuses[status]?.priority || 0);
    const highestPriority = Math.max(...priorities);
    
    return uniqueStatuses.find(status => 
      this.statuses[status]?.priority === highestPriority
    );
  }

  /**
   * Trigger actions based on status changes
   */
  async triggerStatusActions(booking, newStatus, previousStatus) {
    try {
      switch (newStatus) {
        case 'CONFIRMED':
          await this.handleConfirmedStatus(booking);
          break;
        case 'UPCOMING':
          await this.handleUpcomingStatus(booking);
          break;
        case 'EXPLORING':
          await this.handleExploringStatus(booking);
          break;
        case 'COMPLETED':
          await this.handleCompletedStatus(booking);
          break;
        case 'CANCELLED':
          await this.handleCancelledStatus(booking, previousStatus);
          break;
        case 'REFUNDED':
        case 'PARTIALLY_REFUNDED':
          await this.handleRefundedStatus(booking, newStatus);
          break;
        case 'FAILED':
          await this.handleFailedStatus(booking);
          break;
      }
    } catch (error) {
      console.error('Status action error:', error);
    }
  }

  /**
   * Handle CONFIRMED status actions
   */
  async handleConfirmedStatus(booking) {
    // Send confirmation email
    await this.sendEmail(booking, 'booking_confirmation', {
      bookingReference: booking.bookingReference,
      customerName: booking.travelers[0]?.firstName,
      productName: booking.productName,
      dateTime: booking.dateTime,
      totalPrice: booking.totalPrice
    });

    // Schedule ticket delivery
    await this.scheduleTicketDelivery(booking);

    // Update inventory
    await this.updateInventoryOnConfirmation(booking);

    // Set up automatic status progression
    await this.scheduleAutomaticStatusUpdate(booking, 'UPCOMING');
  }

  /**
   * Handle UPCOMING status actions
   */
  async handleUpcomingStatus(booking) {
    // Send reminder email
    await this.sendEmail(booking, 'experience_reminder', {
      customerName: booking.travelers[0]?.firstName,
      productName: booking.productName,
      dateTime: booking.dateTime,
      meetingPoint: booking.meetingPoint
    });

    // Schedule transition to EXPLORING
    await this.scheduleAutomaticStatusUpdate(booking, 'EXPLORING');
  }

  /**
   * Handle EXPLORING status actions
   */
  async handleExploringStatus(booking) {
    // Log experience start
    console.log(`Experience started for booking: ${booking.bookingReference}`);

    // Schedule completion
    await this.scheduleAutomaticStatusUpdate(booking, 'COMPLETED');
  }

  /**
   * Handle COMPLETED status actions
   */
  async handleCompletedStatus(booking) {
    // Schedule review request
    setTimeout(async () => {
      await this.sendReviewRequest(booking);
    }, this.automationConfig.reviewRequestDelayHours * 60 * 60 * 1000);

    // Update customer loyalty points
    await this.updateLoyaltyPoints(booking);

    // Generate completion certificate if applicable
    await this.generateCompletionCertificate(booking);
  }

  /**
   * Handle CANCELLED status actions
   */
  async handleCancelledStatus(booking, previousStatus) {
    // Send cancellation email
    await this.sendEmail(booking, 'booking_cancellation', {
      customerName: booking.travelers[0]?.firstName,
      bookingReference: booking.bookingReference,
      cancellationReason: booking.cancellationReason,
      refundAmount: booking.refundAmount
    });

    // Release inventory
    await this.releaseInventory(booking);

    // Process refund if applicable
    if (this.shouldProcessRefund(booking, previousStatus)) {
      await this.processRefund(booking, 'FULL');
    }
  }

  /**
   * Handle REFUNDED status actions
   */
  async handleRefundedStatus(booking, refundType) {
    // Send refund confirmation
    await this.sendEmail(booking, 'refund_confirmation', {
      customerName: booking.travelers[0]?.firstName,
      bookingReference: booking.bookingReference,
      refundAmount: booking.refundAmount,
      refundType: refundType === 'PARTIALLY_REFUNDED' ? 'Partial' : 'Full'
    });

    // Update financial records
    await this.updateFinancialRecords(booking, refundType);
  }

  /**
   * Handle FAILED status actions
   */
  async handleFailedStatus(booking) {
    // Send failure notification
    await this.sendEmail(booking, 'booking_failed', {
      customerName: booking.travelers[0]?.firstName,
      bookingReference: booking.bookingReference,
      failureReason: booking.failureReason
    });

    // Release reserved inventory
    await this.releaseInventory(booking);

    // Allow rebooking with special offer
    await this.createRebookingOffer(booking);
  }

  /**
   * Process automatic status updates based on time
   */
  async processScheduledStatusUpdates() {
    try {
      const now = new Date();
      const bookings = await this.getActiveBookings();

      for (const booking of bookings) {
        const experienceDate = new Date(booking.dateTime);
        const hoursDiff = (experienceDate - now) / (1000 * 60 * 60);

        // Auto-expire PENDING bookings
        if (booking.status === 'PENDING') {
          const hoursOld = (now - new Date(booking.createdAt)) / (1000 * 60 * 60);
          if (hoursOld >= this.automationConfig.pendingTimeoutHours) {
            await this.updateBookingStatus(booking.id, 'FAILED', 'Auto-expired due to timeout', {
              triggeredBy: 'automation',
              hoursOld
            });
          }
        }

        // Update CONFIRMED to UPCOMING
        if (booking.status === 'CONFIRMED' && hoursDiff <= this.automationConfig.upcomingThresholdHours && hoursDiff > 0) {
          await this.updateBookingStatus(booking.id, 'UPCOMING', 'Auto-updated: 24 hours before experience', {
            triggeredBy: 'automation',
            hoursDiff
          });
        }

        // Update UPCOMING to EXPLORING
        if (booking.status === 'UPCOMING' && hoursDiff <= this.automationConfig.exploringStartOffset) {
          await this.updateBookingStatus(booking.id, 'EXPLORING', 'Auto-updated: Experience started', {
            triggeredBy: 'automation'
          });
        }

        // Update EXPLORING to COMPLETED
        if (booking.status === 'EXPLORING') {
          const duration = booking.duration || this.automationConfig.completionOffsetHours;
          const endTime = new Date(experienceDate.getTime() + duration * 60 * 60 * 1000);
          
          if (now >= endTime) {
            await this.updateBookingStatus(booking.id, 'COMPLETED', 'Auto-updated: Experience completed', {
              triggeredBy: 'automation',
              duration
            });
          }
        }
      }
    } catch (error) {
      console.error('Scheduled status update error:', error);
    }
  }

  /**
   * Start automation intervals
   */
  startAutomationIntervals() {
    // Run status updates every 5 minutes
    setInterval(() => {
      this.processScheduledStatusUpdates();
    }, 5 * 60 * 1000);

    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldStatusHistory();
    }, 60 * 60 * 1000);
  }

  /**
   * Schedule automatic status update
   */
  async scheduleAutomaticStatusUpdate(booking, targetStatus) {
    const experienceDate = new Date(booking.dateTime);
    let triggerTime;

    switch (targetStatus) {
      case 'UPCOMING':
        triggerTime = new Date(experienceDate.getTime() - this.automationConfig.upcomingThresholdHours * 60 * 60 * 1000);
        break;
      case 'EXPLORING':
        triggerTime = new Date(experienceDate.getTime() - this.automationConfig.exploringStartOffset * 60 * 60 * 1000);
        break;
      case 'COMPLETED':
        const duration = booking.duration || this.automationConfig.completionOffsetHours;
        triggerTime = new Date(experienceDate.getTime() + duration * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    const delay = triggerTime.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(async () => {
        await this.updateBookingStatus(booking.id, targetStatus, `Auto-scheduled transition to ${targetStatus}`, {
          triggeredBy: 'scheduler'
        });
      }, delay);
    }
  }

  /**
   * Get status display information
   */
  getStatusDisplay(status, productStatuses = null) {
    const statusInfo = this.statuses[status];
    if (!statusInfo) {
      return {
        code: status,
        label: status,
        color: 'bg-gray-100 text-gray-800',
        description: 'Unknown status'
      };
    }

    // For multi-product bookings, show split status
    if (productStatuses && Object.keys(productStatuses).length > 1) {
      const uniqueStatuses = [...new Set(Object.values(productStatuses))];
      if (uniqueStatuses.length > 1) {
        return {
          ...statusInfo,
          label: 'Mixed Status',
          description: 'Different products have different statuses',
          splitStatuses: productStatuses
        };
      }
    }

    return statusInfo;
  }

  /**
   * Get bookings by status with filtering
   */
  async getBookingsByStatus(status, filters = {}) {
    const allBookings = await this.getAllBookings();
    
    return allBookings.filter(booking => {
      // Status filter
      if (booking.status !== status) return false;

      // Date range filter
      if (filters.fromDate && new Date(booking.dateTime) < new Date(filters.fromDate)) return false;
      if (filters.toDate && new Date(booking.dateTime) > new Date(filters.toDate)) return false;

      // Product filter
      if (filters.productId && booking.productId !== filters.productId) return false;

      // Customer filter
      if (filters.customerId && booking.customerId !== filters.customerId) return false;

      return true;
    });
  }

  /**
   * Generate status report
   */
  async generateStatusReport(dateRange = {}) {
    const bookings = await this.getAllBookings();
    const report = {
      totalBookings: bookings.length,
      statusBreakdown: {},
      trends: {},
      averageProcessingTime: {},
      generatedAt: new Date()
    };

    // Status breakdown
    Object.keys(this.statuses).forEach(status => {
      report.statusBreakdown[status] = bookings.filter(b => b.status === status).length;
    });

    // Calculate average processing times
    bookings.forEach(booking => {
      if (booking.statusHistory && booking.statusHistory.length > 0) {
        booking.statusHistory.forEach((history, index) => {
          if (index > 0) {
            const prevHistory = booking.statusHistory[index - 1];
            const processingTime = new Date(history.timestamp) - new Date(prevHistory.timestamp);
            const transition = `${prevHistory.toStatus}_to_${history.toStatus}`;
            
            if (!report.averageProcessingTime[transition]) {
              report.averageProcessingTime[transition] = [];
            }
            report.averageProcessingTime[transition].push(processingTime);
          }
        });
      }
    });

    // Calculate averages
    Object.keys(report.averageProcessingTime).forEach(transition => {
      const times = report.averageProcessingTime[transition];
      report.averageProcessingTime[transition] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        count: times.length
      };
    });

    return report;
  }

  // Mock implementations for external services
  async getBooking(bookingId) {
    // In production, fetch from database
    return { id: bookingId, status: 'CONFIRMED' };
  }

  async saveBooking(booking) {
    // In production, save to database
    console.log(`Saved booking: ${booking.id}`);
  }

  async getActiveBookings() {
    // In production, fetch active bookings from database
    return [];
  }

  async getAllBookings() {
    // In production, fetch all bookings from database
    return [];
  }

  async sendEmail(booking, template, data) {
    console.log(`Sending ${template} email for booking: ${booking.bookingReference}`);
  }

  async scheduleTicketDelivery(booking) {
    console.log(`Scheduling ticket delivery for: ${booking.bookingReference}`);
  }

  async updateInventoryOnConfirmation(booking) {
    console.log(`Updating inventory for: ${booking.bookingReference}`);
  }

  async releaseInventory(booking) {
    console.log(`Releasing inventory for: ${booking.bookingReference}`);
  }

  async processRefund(booking, type) {
    console.log(`Processing ${type} refund for: ${booking.bookingReference}`);
  }

  async sendReviewRequest(booking) {
    console.log(`Sending review request for: ${booking.bookingReference}`);
  }

  async updateLoyaltyPoints(booking) {
    console.log(`Updating loyalty points for: ${booking.bookingReference}`);
  }

  async generateCompletionCertificate(booking) {
    console.log(`Generating completion certificate for: ${booking.bookingReference}`);
  }

  async updateFinancialRecords(booking, refundType) {
    console.log(`Updating financial records for: ${booking.bookingReference}`);
  }

  async createRebookingOffer(booking) {
    console.log(`Creating rebooking offer for: ${booking.bookingReference}`);
  }

  shouldProcessRefund(booking, previousStatus) {
    return ['CONFIRMED', 'UPCOMING'].includes(previousStatus);
  }

  async cleanupOldStatusHistory() {
    // Clean up status history older than 1 year
    console.log('Cleaning up old status history');
  }
}

module.exports = BookingStatusManager;
