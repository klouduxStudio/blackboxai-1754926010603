// Booking Management System with Ticket Triggering Feature

// Configurable ticket trigger timing in minutes (default values)
const ticketTriggerConfig = {
    defaultTriggerMinutesBefore: 1440, // 1 day
    sameDayTriggerMinutesBefore: 30,   // 30 minutes
    manualTriggerEnabled: true
};

// Sample bookings data
let bookingList = [
    {
        id: '#12345',
        customer: 'John Doe',
        product: 'Mountain Trek',
        productId: 'pid_1',
        variationId: 'var_1',
        date: '2025-06-25T09:00:00',
        guests: 2,
        totalPrice: 299,
        status: 'confirmed',
        ticketAllocated: false,
        ticketDownloadUrl: null,
        ticketTriggerTime: null
    },
    {
        id: '#12346',
        customer: 'Jane Smith',
        product: 'River Rafting',
        productId: 'pid_2',
        variationId: 'var_2',
        date: '2025-06-26T14:00:00',
        guests: 4,
        totalPrice: 149,
        status: 'pending',
        ticketAllocated: false,
        ticketDownloadUrl: null,
        ticketTriggerTime: null
    }
];

// Render bookings table
function renderBookings(bookingsToRender = bookingList) {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    tbody.innerHTML = bookingsToRender.map(booking => `
        <tr class="hover:bg-gray-50">
            <td class="py-3 px-4">${booking.id}</td>
            <td class="py-3 px-4">${booking.customer}</td>
            <td class="py-3 px-4">${booking.product}</td>
            <td class="py-3 px-4">${new Date(booking.date).toLocaleString()}</td>
            <td class="py-3 px-4">${booking.guests}</td>
            <td class="py-3 px-4">$${booking.totalPrice}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-sm ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }">${booking.status}</span>
            </td>
            <td class="py-3 px-4">
                <button onclick="editBooking('${booking.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBooking('${booking.id}')" class="text-red-600 hover:text-red-800 mr-2" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                ${
                    booking.ticketAllocated ? 
                    `<a href="${booking.ticketDownloadUrl}" class="text-green-600 hover:text-green-800" title="Download Ticket" download>
                        <i class="fas fa-download"></i>
                    </a>` :
                    (ticketTriggerConfig.manualTriggerEnabled ? 
                    `<button onclick="manualTriggerTicket('${booking.id}')" class="text-indigo-600 hover:text-indigo-800" title="Manual Ticket Trigger">
                        <i class="fas fa-bolt"></i>
                    </button>` : '')
                }
            </td>
        </tr>
    `).join('');
}

// Edit booking
function editBooking(id) {
    const booking = bookingList.find(b => b.id === id);
    if (!booking) return;

    // Populate form with booking data
    document.getElementById('customerName').value = booking.customer;
    document.getElementById('product').value = booking.product;
    document.getElementById('bookingDate').value = booking.date;
    document.getElementById('guests').value = booking.guests;
    document.getElementById('status').value = booking.status;

    // Show modal
    openModal();
}

// Delete booking
function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking?')) {
        bookingList = bookingList.filter(b => b.id !== id);
        renderBookings();
        showNotification('Booking deleted successfully', 'success');
    }
}

// Calculate ticket trigger time for a booking
function calculateTicketTriggerTime(booking) {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    let triggerMinutesBefore = ticketTriggerConfig.defaultTriggerMinutesBefore;

    // If booking is for same day, use sameDayTriggerMinutesBefore
    if (bookingDate.toDateString() === now.toDateString()) {
        triggerMinutesBefore = ticketTriggerConfig.sameDayTriggerMinutesBefore;
    }

    // Calculate trigger time
    const triggerTime = new Date(bookingDate.getTime() - triggerMinutesBefore * 60000);
    return triggerTime;
}

// Auto-trigger tickets for bookings if trigger time reached
function autoTriggerTickets() {
    const now = new Date();

    bookingList.forEach(booking => {
        if (!booking.ticketAllocated && booking.status === 'confirmed') {
            const triggerTime = calculateTicketTriggerTime(booking);
            if (now >= triggerTime) {
                allocateTicketToBooking(booking);
            }
        }
    });
}

// Allocate ticket to booking and send email
function allocateTicketToBooking(booking) {
    // Simulate ticket allocation logic
    booking.ticketAllocated = true;
    booking.ticketDownloadUrl = `/tickets/${booking.id}.pdf`; // Example path
    booking.ticketTriggerTime = new Date().toISOString();

    // Simulate sending email to customer
    sendTicketEmail(booking);

    // Update UI
    renderBookings();
    showNotification(`Ticket allocated and email sent for booking ${booking.id}`, 'success');
}

// Manual trigger ticket allocation
function manualTriggerTicket(bookingId) {
    const booking = bookingList.find(b => b.id === bookingId);
    if (!booking) {
        showNotification('Booking not found', 'error');
        return;
    }
    if (booking.ticketAllocated) {
        showNotification('Ticket already allocated', 'info');
        return;
    }
    allocateTicketToBooking(booking);
}

// Simulate sending ticket email
function sendTicketEmail(booking) {
    console.log(`Sending ticket email to ${booking.customer} for booking ${booking.id}`);
    // In real app, integrate with email service
}

// Initialize booking management
document.addEventListener('DOMContentLoaded', () => {
    renderBookings();

    // Start auto-trigger interval (e.g., every 5 minutes)
    setInterval(autoTriggerTickets, 5 * 60 * 1000);
});
