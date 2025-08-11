// Initial bookings data
let bookings = [
    {
        id: '#12345',
        customer: 'John Doe',
        adventure: 'Mountain Trek',
        date: '2025-06-25',
        status: 'confirmed'
    },
    {
        id: '#12346',
        customer: 'Jane Smith',
        adventure: 'River Rafting',
        date: '2025-06-26',
        status: 'pending'
    }
];

// Update analytics dashboard
function updateAnalytics() {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status.toLowerCase() === 'confirmed').length;
    const pending = bookings.filter(b => b.status.toLowerCase() === 'pending').length;
    const cancelled = bookings.filter(b => b.status.toLowerCase() === 'cancelled').length;

    document.getElementById('totalBookings').textContent = total;
    document.getElementById('confirmedBookings').textContent = confirmed;
    document.getElementById('pendingBookings').textContent = pending;
    document.getElementById('cancelledBookings').textContent = cancelled;
}

// Render bookings in the table
function renderBookings(bookingsToRender) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    bookingsToRender.forEach(booking => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-2">${booking.id}</td>
            <td class="py-2">${booking.customer}</td>
            <td class="py-2">${booking.adventure}</td>
            <td class="py-2">${booking.date}</td>
            <td class="py-2">
                <span class="px-2 py-1 rounded-full text-sm ${getStatusClass(booking.status)}">
                    ${booking.status}
                </span>
            </td>
            <td class="py-2">
                <button onclick="editBooking('${booking.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBooking('${booking.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Update analytics whenever bookings are rendered
    updateAnalytics();
}

// Get status color class
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Modal functions
function openModal() {
    document.getElementById('newBookingModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('newBookingModal').classList.add('hidden');
    document.getElementById('newBookingForm').reset();
    resetModalToAddMode();
}

// Edit and Delete functionality
function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    // Populate the form with existing data
    document.getElementById('customerName').value = booking.customer;
    document.getElementById('adventure').value = booking.adventure;
    document.getElementById('bookingDate').value = booking.date;
    document.getElementById('status').value = booking.status;

    // Change modal title and button text
    document.querySelector('#newBookingModal h3').textContent = 'Edit Booking';
    document.querySelector('#newBookingModal button[type="submit"]').textContent = 'Update Booking';

    // Store the booking ID for update
    document.getElementById('newBookingForm').dataset.editingId = id;

    openModal();
}

function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        bookings = bookings.filter(booking => booking.id !== id);
        renderBookings(bookings);
        showNotification('Booking deleted successfully', 'success');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Reset modal to add mode
function resetModalToAddMode() {
    document.querySelector('#newBookingModal h3').textContent = 'Add New Booking';
    document.querySelector('#newBookingModal button[type="submit"]').textContent = 'Save Booking';
    delete document.getElementById('newBookingForm').dataset.editingId;
}

// Authentication functions
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginModal = document.getElementById('loginModal');
    
    if (!isLoggedIn) {
        loginModal.classList.remove('hidden');
        return false;
    } else {
        loginModal.classList.add('hidden');
        const username = localStorage.getItem('adminUsername') || 'Admin';
        document.getElementById('currentUser').textContent = username;
        return true;
    }
}

function login(username, password) {
    // Simple demo authentication
    if (username === 'admin' && password === 'password123') {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('currentUser').textContent = username;
        showNotification('Login successful!', 'success');
        return true;
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
        return false;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        document.getElementById('loginModal').classList.remove('hidden');
        showNotification('Logged out successfully', 'info');
    }
}

// Initialize the table and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Always set up login form handler first
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (login(username, password)) {
            renderBookings(bookings);
            setupEventListeners();
        }
    });

    // Check authentication and initialize if logged in
    if (checkAuth()) {
        renderBookings(bookings);
        setupEventListeners();
    }
});

// Setup event listeners for authenticated users
function setupEventListeners() {

    // Form submission (handles both add and edit)
    document.getElementById('newBookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editingId = this.dataset.editingId;
        const bookingData = {
            customer: document.getElementById('customerName').value,
            adventure: document.getElementById('adventure').value,
            date: document.getElementById('bookingDate').value,
            status: document.getElementById('status').value
        };

        if (editingId) {
            // Update existing booking
            const bookingIndex = bookings.findIndex(b => b.id === editingId);
            if (bookingIndex !== -1) {
                bookings[bookingIndex] = { ...bookings[bookingIndex], ...bookingData };
                showNotification('Booking updated successfully', 'success');
            }
        } else {
            // Add new booking
            const newBooking = {
                id: '#' + Math.floor(10000 + Math.random() * 90000),
                ...bookingData
            };
            bookings.unshift(newBooking);
            showNotification('Booking added successfully', 'success');
        }

        renderBookings(bookings);
        closeModal();
        this.reset();
        resetModalToAddMode();
    });

    // Search functionality
    document.querySelector('input[placeholder="Search bookings..."]').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredBookings = bookings.filter(booking => 
            booking.customer.toLowerCase().includes(searchTerm) ||
            booking.id.toLowerCase().includes(searchTerm) ||
            booking.adventure.toLowerCase().includes(searchTerm)
        );
        renderBookings(filteredBookings);
    });

    // Status filter
    document.querySelector('select').addEventListener('change', function(e) {
        const status = e.target.value.toLowerCase();
        const filteredBookings = status 
            ? bookings.filter(booking => booking.status.toLowerCase() === status)
            : bookings;
        renderBookings(filteredBookings);
    });
}
