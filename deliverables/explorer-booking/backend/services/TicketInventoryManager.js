// Enhanced Ticket Inventory Management System
// Handles PDF ticket storage and configurable trigger times

const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

class TicketInventoryManager {
  constructor() {
    this.ticketStorage = new Map(); // In production, use database
    this.ticketTriggerConfig = {
      defaultTriggerHours: 24, // Default 24 hours before
      sameDayTriggerMinutes: 30, // 30 minutes for same day
      enableManualTrigger: true,
      enableAutoTrigger: true
    };
    
    // Start automatic ticket triggering
    this.startTicketTriggerScheduler();
  }

  /**
   * Upload and store PDF tickets for a product variation
   */
  async uploadTickets(files, productId, variationId, travelerType, metadata = {}) {
    const uploadedTickets = [];
    const ticketDirectory = path.join(__dirname, '../storage/tickets', productId, variationId);
    
    // Ensure directory exists
    await this.ensureDirectoryExists(ticketDirectory);

    for (const file of files) {
      try {
        const ticketId = this.generateTicketId();
        const fileName = `${ticketId}_${travelerType}.pdf`;
        const filePath = path.join(ticketDirectory, fileName);
        
        // Save PDF file
        await fs.writeFile(filePath, file.buffer);
        
        // Create ticket record
        const ticket = {
          id: ticketId,
          productId,
          variationId,
          travelerType,
          fileName,
          filePath,
          originalName: file.originalname,
          uploadedAt: new Date(),
          status: 'AVAILABLE',
          metadata: {
            fileSize: file.size,
            mimeType: file.mimetype,
            ...metadata
          }
        };

        // Store in inventory
        this.ticketStorage.set(ticketId, ticket);
        uploadedTickets.push(ticket);

      } catch (error) {
        console.error('Error uploading ticket:', error);
        throw new Error(`Failed to upload ticket: ${file.originalname}`);
      }
    }

    return {
      success: true,
      uploadedCount: uploadedTickets.length,
      tickets: uploadedTickets
    };
  }

  /**
   * Generate dynamic PDF ticket with booking information
   */
  async generateDynamicTicket(booking, ticketTemplate = null) {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const ticketId = this.generateTicketId();
      const fileName = `ticket_${booking.bookingReference}_${ticketId}.pdf`;
      const ticketDirectory = path.join(__dirname, '../storage/generated-tickets');
      
      await this.ensureDirectoryExists(ticketDirectory);
      const filePath = path.join(ticketDirectory, fileName);
      
      // Create write stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Generate QR Code
      const qrCodeData = JSON.stringify({
        bookingReference: booking.bookingReference,
        ticketId: ticketId,
        productId: booking.productId,
        dateTime: booking.dateTime,
        validationCode: this.generateValidationCode()
      });
      
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, { width: 200 });

      // Header with Explorer Shack branding
      doc.fontSize(24)
         .fillColor('#FD4C5C')
         .text('EXPLORER SHACK', 50, 50, { align: 'center' });
      
      doc.fontSize(18)
         .fillColor('#008bff')
         .text('Experience Ticket', 50, 80, { align: 'center' });

      // Ticket Information
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`Booking Reference: ${booking.bookingReference}`, 50, 130)
         .text(`Product: ${booking.productName}`, 50, 150)
         .text(`Date & Time: ${new Date(booking.dateTime).toLocaleString()}`, 50, 170)
         .text(`Customer: ${booking.travelers[0]?.firstName} ${booking.travelers[0]?.lastName}`, 50, 190)
         .text(`Participants: ${this.formatParticipants(booking.participants)}`, 50, 210);

      // Meeting Point & Instructions
      if (booking.meetingPoint) {
        doc.text(`Meeting Point: ${booking.meetingPoint}`, 50, 240);
      }

      if (booking.specialInstructions) {
        doc.text(`Special Instructions: ${booking.specialInstructions}`, 50, 260);
      }

      // QR Code
      doc.image(qrCodeBuffer, 400, 130, { width: 150, height: 150 });
      doc.fontSize(10)
         .text('Scan QR code for validation', 400, 290, { width: 150, align: 'center' });

      // Ticket ID and Validation Code
      doc.fontSize(10)
         .text(`Ticket ID: ${ticketId}`, 50, 350)
         .text(`Validation Code: ${this.generateValidationCode()}`, 50, 365);

      // Terms and Conditions
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Terms & Conditions:', 50, 400)
         .text('• This ticket is valid only for the specified date and time', 50, 415)
         .text('• Please arrive 15 minutes before the scheduled time', 50, 425)
         .text('• Cancellation policy applies as per booking terms', 50, 435)
         .text('• Contact support@explorershack.com for assistance', 50, 445);

      // Footer
      doc.fontSize(10)
         .fillColor('#FD4C5C')
         .text('Thank you for choosing Explorer Shack!', 50, 500, { align: 'center' });

      doc.end();

      // Wait for PDF generation to complete
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Create ticket record
      const ticket = {
        id: ticketId,
        bookingReference: booking.bookingReference,
        productId: booking.productId,
        fileName,
        filePath,
        generatedAt: new Date(),
        status: 'GENERATED',
        qrCodeData,
        validationCode: this.generateValidationCode()
      };

      this.ticketStorage.set(ticketId, ticket);

      return ticket;

    } catch (error) {
      console.error('Error generating dynamic ticket:', error);
      throw new Error('Failed to generate ticket');
    }
  }

  /**
   * Allocate ticket to booking based on trigger configuration
   */
  async allocateTicketToBooking(booking) {
    try {
      // Check if tickets already allocated
      if (booking.ticketsAllocated) {
        return { success: false, message: 'Tickets already allocated' };
      }

      // Find available tickets for this product/variation
      const availableTickets = this.findAvailableTickets(
        booking.productId, 
        booking.variationId, 
        booking.participants
      );

      if (availableTickets.length === 0) {
        // Generate dynamic tickets if no pre-uploaded tickets
        const generatedTickets = await this.generateTicketsForBooking(booking);
        return await this.assignTicketsToBooking(booking, generatedTickets);
      }

      return await this.assignTicketsToBooking(booking, availableTickets);

    } catch (error) {
      console.error('Error allocating tickets:', error);
      throw error;
    }
  }

  /**
   * Configure ticket trigger timing for a product
   */
  async configureTicketTrigger(productId, config) {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update product ticket trigger configuration
    product.ticketTriggerConfig = {
      triggerHours: config.triggerHours || 24,
      sameDayTriggerMinutes: config.sameDayTriggerMinutes || 30,
      enableAutoTrigger: config.enableAutoTrigger !== false,
      enableManualTrigger: config.enableManualTrigger !== false,
      customTriggerRules: config.customTriggerRules || []
    };

    await this.saveProduct(product);
    return product.ticketTriggerConfig;
  }

  /**
   * Calculate when tickets should be triggered for a booking
   */
  calculateTicketTriggerTime(booking) {
    const experienceDate = new Date(booking.dateTime);
    const now = new Date();
    
    // Get product-specific configuration or use defaults
    const config = booking.product?.ticketTriggerConfig || this.ticketTriggerConfig;
    
    let triggerHours = config.triggerHours || config.defaultTriggerHours || 24;
    
    // Check if it's same day booking
    if (experienceDate.toDateString() === now.toDateString()) {
      const minutesUntil = (experienceDate - now) / (1000 * 60);
      if (minutesUntil <= (config.sameDayTriggerMinutes || 30)) {
        return now; // Trigger immediately for same day bookings
      }
    }

    // Calculate trigger time
    const triggerTime = new Date(experienceDate.getTime() - triggerHours * 60 * 60 * 1000);
    
    // Don't trigger in the past
    return triggerTime > now ? triggerTime : now;
  }

  /**
   * Start automatic ticket trigger scheduler
   */
  startTicketTriggerScheduler() {
    // Run every 5 minutes
    setInterval(async () => {
      await this.processScheduledTicketTriggers();
    }, 5 * 60 * 1000);

    console.log('Ticket trigger scheduler started');
  }

  /**
   * Process scheduled ticket triggers
   */
  async processScheduledTicketTriggers() {
    try {
      const now = new Date();
      const pendingBookings = await this.getPendingTicketBookings();

      for (const booking of pendingBookings) {
        const triggerTime = this.calculateTicketTriggerTime(booking);
        
        if (now >= triggerTime) {
          await this.allocateTicketToBooking(booking);
          await this.sendTicketEmail(booking);
          
          console.log(`Tickets triggered for booking: ${booking.bookingReference}`);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled ticket triggers:', error);
    }
  }

  /**
   * Manual ticket trigger for admin
   */
  async manualTriggerTicket(bookingId, adminUser) {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.ticketsAllocated) {
        throw new Error('Tickets already allocated');
      }

      // Check if manual trigger is enabled for this product
      const config = booking.product?.ticketTriggerConfig || this.ticketTriggerConfig;
      if (!config.enableManualTrigger) {
        throw new Error('Manual ticket trigger is disabled for this product');
      }

      await this.allocateTicketToBooking(booking);
      await this.sendTicketEmail(booking);

      // Log manual trigger
      await this.logTicketAction(booking.id, 'MANUAL_TRIGGER', {
        triggeredBy: adminUser,
        timestamp: new Date()
      });

      return { success: true, message: 'Tickets triggered successfully' };

    } catch (error) {
      console.error('Manual ticket trigger error:', error);
      throw error;
    }
  }

  /**
   * Get ticket inventory report
   */
  async getInventoryReport(productId = null) {
    const tickets = productId 
      ? Array.from(this.ticketStorage.values()).filter(t => t.productId === productId)
      : Array.from(this.ticketStorage.values());

    const report = {
      totalTickets: tickets.length,
      availableTickets: tickets.filter(t => t.status === 'AVAILABLE').length,
      allocatedTickets: tickets.filter(t => t.status === 'ALLOCATED').length,
      usedTickets: tickets.filter(t => t.status === 'USED').length,
      byProduct: {},
      byTravelerType: {},
      generatedAt: new Date()
    };

    // Group by product
    tickets.forEach(ticket => {
      if (!report.byProduct[ticket.productId]) {
        report.byProduct[ticket.productId] = {
          total: 0,
          available: 0,
          allocated: 0,
          used: 0
        };
      }
      
      report.byProduct[ticket.productId].total++;
      report.byProduct[ticket.productId][ticket.status.toLowerCase()]++;
    });

    // Group by traveler type
    tickets.forEach(ticket => {
      if (!report.byTravelerType[ticket.travelerType]) {
        report.byTravelerType[ticket.travelerType] = 0;
      }
      report.byTravelerType[ticket.travelerType]++;
    });

    return report;
  }

  // Helper methods
  generateTicketId() {
    return 'TKT_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }

  generateValidationCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  formatParticipants(participants) {
    const parts = [];
    if (participants.adults) parts.push(`${participants.adults} Adult${participants.adults > 1 ? 's' : ''}`);
    if (participants.children) parts.push(`${participants.children} Child${participants.children > 1 ? 'ren' : ''}`);
    if (participants.infants) parts.push(`${participants.infants} Infant${participants.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  }

  findAvailableTickets(productId, variationId, participants) {
    // Implementation to find available tickets
    return Array.from(this.ticketStorage.values()).filter(ticket => 
      ticket.productId === productId && 
      ticket.variationId === variationId && 
      ticket.status === 'AVAILABLE'
    );
  }

  async generateTicketsForBooking(booking) {
    const tickets = [];
    const totalParticipants = (booking.participants.adults || 0) + 
                             (booking.participants.children || 0) + 
                             (booking.participants.infants || 0);

    for (let i = 0; i < totalParticipants; i++) {
      const ticket = await this.generateDynamicTicket(booking);
      tickets.push(ticket);
    }

    return tickets;
  }

  async assignTicketsToBooking(booking, tickets) {
    // Mark tickets as allocated
    tickets.forEach(ticket => {
      ticket.status = 'ALLOCATED';
      ticket.bookingReference = booking.bookingReference;
      ticket.allocatedAt = new Date();
    });

    // Update booking
    booking.ticketsAllocated = true;
    booking.tickets = tickets.map(t => ({
      ticketId: t.id,
      filePath: t.filePath,
      validationCode: t.validationCode
    }));

    await this.saveBooking(booking);

    return {
      success: true,
      ticketCount: tickets.length,
      tickets: tickets
    };
  }

  // Mock methods for database operations
  async getProduct(productId) {
    // In production, fetch from database
    return { id: productId, ticketTriggerConfig: this.ticketTriggerConfig };
  }

  async saveProduct(product) {
    // In production, save to database
    console.log('Product saved:', product.id);
  }

  async getBooking(bookingId) {
    // In production, fetch from database
    return { id: bookingId, ticketsAllocated: false };
  }

  async saveBooking(booking) {
    // In production, save to database
    console.log('Booking saved:', booking.id);
  }

  async getPendingTicketBookings() {
    // In production, fetch from database
    return [];
  }

  async sendTicketEmail(booking) {
    // In production, integrate with email service
    console.log('Ticket email sent for booking:', booking.bookingReference);
  }

  async logTicketAction(bookingId, action, metadata) {
    // In production, log to database
    console.log('Ticket action logged:', { bookingId, action, metadata });
  }
}

module.exports = TicketInventoryManager;
