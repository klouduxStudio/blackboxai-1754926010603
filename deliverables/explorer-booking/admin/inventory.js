// Enhanced Inventory Management System with PDF Ticket Support

class TicketInventoryManager {
    constructor() {
        this.inventoryConfig = {
            allowStockOverride: false,
            enableTicketRevocation: true,
            autoAssignTickets: true,
            ticketStoragePath: '/storage/tickets/',
            defaultTicketValidity: 24, // hours
        };
    }

    // Ticket Storage Structure
    ticketInventory = {
        tickets: [], // Array of ticket objects
        allocations: [], // Track ticket assignments
        revocations: [], // Track ticket revocations
        statistics: {
            totalTickets: 0,
            allocatedTickets: 0,
            availableTickets: 0,
            revokedTickets: 0
        }
    };

    // Ticket object structure
    ticketStructure = {
        id: null,
        productId: null,
        variationId: null,
        pdfPath: null,
        uploadDate: null,
        status: 'available', // available, allocated, revoked
        travelerType: null, // adult, child
        validityPeriod: null,
        allocationHistory: [],
        metadata: {}
    };

    // Upload and process PDF tickets
    async uploadTickets(files, productId, variationId, travelerType) {
        const uploadedTickets = [];
        
        for (const file of files) {
            if (file.type !== 'application/pdf') {
                throw new Error('Invalid file type. Only PDF files are allowed.');
            }

            const ticket = {
                ...this.ticketStructure,
                id: 'TKT_' + Math.random().toString(36).substr(2, 9),
                productId,
                variationId,
                pdfPath: this.inventoryConfig.ticketStoragePath + file.name,
                uploadDate: new Date().toISOString(),
                travelerType,
                validityPeriod: {
                    start: new Date(),
                    end: new Date(Date.now() + this.inventoryConfig.defaultTicketValidity * 3600000)
                }
            };

            // Store ticket in inventory
            this.ticketInventory.tickets.push(ticket);
            uploadedTickets.push(ticket);

            // Update statistics
            this.updateStatistics();
        }

        return uploadedTickets;
    }

    // Allocate ticket to booking
    allocateTicket(bookingId, productId, variationId, travelerType) {
        const availableTicket = this.ticketInventory.tickets.find(ticket => 
            ticket.productId === productId &&
            ticket.variationId === variationId &&
            ticket.travelerType === travelerType &&
            ticket.status === 'available'
        );

        if (!availableTicket) {
            throw new Error('No available tickets for the specified criteria.');
        }

        // Create allocation record
        const allocation = {
            ticketId: availableTicket.id,
            bookingId,
            allocationDate: new Date().toISOString(),
            status: 'active'
        };

        // Update ticket status
        availableTicket.status = 'allocated';
        availableTicket.allocationHistory.push(allocation);
        
        // Store allocation
        this.ticketInventory.allocations.push(allocation);
        
        // Update statistics
        this.updateStatistics();

        return {
            ticket: availableTicket,
            allocation
        };
    }

    // Revoke ticket allocation
    revokeTicket(ticketId, reason) {
        const ticket = this.ticketInventory.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        if (ticket.status !== 'allocated') {
            throw new Error('Ticket is not currently allocated.');
        }

        // Create revocation record
        const revocation = {
            ticketId,
            revocationDate: new Date().toISOString(),
            reason,
            previousAllocation: ticket.allocationHistory[ticket.allocationHistory.length - 1]
        };

        // Update ticket status
        ticket.status = 'available';
        
        // Store revocation
        this.ticketInventory.revocations.push(revocation);
        
        // Update statistics
        this.updateStatistics();

        return {
            ticket,
            revocation
        };
    }

    // Get ticket allocation history
    getTicketHistory(ticketId) {
        const ticket = this.ticketInventory.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        return {
            ticket,
            allocations: ticket.allocationHistory,
            revocations: this.ticketInventory.revocations.filter(r => r.ticketId === ticketId)
        };
    }

    // Update inventory statistics
    updateStatistics() {
        const stats = {
            totalTickets: this.ticketInventory.tickets.length,
            allocatedTickets: this.ticketInventory.tickets.filter(t => t.status === 'allocated').length,
            availableTickets: this.ticketInventory.tickets.filter(t => t.status === 'available').length,
            revokedTickets: this.ticketInventory.revocations.length
        };

        this.ticketInventory.statistics = stats;
        return stats;
    }

    // Generate inventory report
    generateInventoryReport(productId = null) {
        const tickets = productId 
            ? this.ticketInventory.tickets.filter(t => t.productId === productId)
            : this.ticketInventory.tickets;

        return {
            summary: this.ticketInventory.statistics,
            details: {
                byProduct: this.groupTicketsByProduct(tickets),
                byStatus: this.groupTicketsByStatus(tickets),
                byTravelerType: this.groupTicketsByTravelerType(tickets)
            },
            recentAllocations: this.getRecentAllocations(),
            recentRevocations: this.getRecentRevocations()
        };
    }

    // Helper methods for report generation
    groupTicketsByProduct(tickets) {
        return tickets.reduce((acc, ticket) => {
            const key = ticket.productId;
            if (!acc[key]) acc[key] = [];
            acc[key].push(ticket);
            return acc;
        }, {});
    }

    groupTicketsByStatus(tickets) {
        return tickets.reduce((acc, ticket) => {
            const key = ticket.status;
            if (!acc[key]) acc[key] = [];
            acc[key].push(ticket);
            return acc;
        }, {});
    }

    groupTicketsByTravelerType(tickets) {
        return tickets.reduce((acc, ticket) => {
            const key = ticket.travelerType;
            if (!acc[key]) acc[key] = [];
            acc[key].push(ticket);
            return acc;
        }, {});
    }

    getRecentAllocations(limit = 10) {
        return this.ticketInventory.allocations
            .sort((a, b) => new Date(b.allocationDate) - new Date(a.allocationDate))
            .slice(0, limit);
    }

    getRecentRevocations(limit = 10) {
        return this.ticketInventory.revocations
            .sort((a, b) => new Date(b.revocationDate) - new Date(a.revocationDate))
            .slice(0, limit);
    }
}

// Initialize inventory manager
const ticketInventoryManager = new TicketInventoryManager();

// Export for use in other modules
export { ticketInventoryManager };
