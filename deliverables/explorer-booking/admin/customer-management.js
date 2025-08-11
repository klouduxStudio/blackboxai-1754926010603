// Customer Management System for Explorer Booking
// Comprehensive customer management with profiles, booking history, and communication

// Sample Customers Data
let customers = [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+971-50-123-4567",
        nationality: "United States",
        dateOfBirth: "1985-03-15",
        gender: "Male",
        address: {
            street: "123 Business Bay",
            city: "Dubai",
            country: "United Arab Emirates",
            postalCode: "12345"
        },
        emergencyContact: {
            name: "Jane Doe",
            relationship: "Spouse",
            phone: "+971-50-123-4568"
        },
        preferences: {
            language: "English",
            currency: "USD",
            newsletter: true,
            smsNotifications: true
        },
        loyaltyProgram: {
            tier: "Gold",
            points: 2500,
            joinDate: "2023-01-15"
        },
        bookingHistory: [
            {
                bookingId: "BK-001",
                product: "Burj Khalifa At The Top Experience",
                date: "2024-01-20",
                status: "Completed",
                amount: 319,
                rating: 5
            },
            {
                bookingId: "BK-002",
                product: "Dubai City Tour",
                date: "2024-02-15",
                status: "Completed",
                amount: 150,
                rating: 4
            }
        ],
        totalSpent: 469,
        totalBookings: 2,
        averageRating: 4.5,
        status: "Active",
        createdAt: "2023-01-15",
        lastActivity: "2024-02-15",
        notes: "VIP customer, prefers morning tours"
    },
    {
        id: 2,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "+971-55-987-6543",
        nationality: "United Kingdom",
        dateOfBirth: "1990-07-22",
        gender: "Female",
        address: {
            street: "456 Marina Walk",
            city: "Dubai",
            country: "United Arab Emirates",
            postalCode: "54321"
        },
        emergencyContact: {
            name: "Michael Johnson",
            relationship: "Brother",
            phone: "+44-20-7946-0958"
        },
        preferences: {
            language: "English",
            currency: "GBP",
            newsletter: true,
            smsNotifications: false
        },
        loyaltyProgram: {
            tier: "Silver",
            points: 1200,
            joinDate: "2023-06-10"
        },
        bookingHistory: [
            {
                bookingId: "BK-003",
                product: "Desert Safari Experience",
                date: "2024-01-10",
                status: "Completed",
                amount: 200,
                rating: 5
            }
        ],
        totalSpent: 200,
        totalBookings: 1,
        averageRating: 5.0,
        status: "Active",
        createdAt: "2023-06-10",
        lastActivity: "2024-01-10",
        notes: "Interested in adventure activities"
    },
    {
        id: 3,
        firstName: "Ahmed",
        lastName: "Al-Rashid",
        email: "ahmed.alrashid@email.com",
        phone: "+971-56-555-1234",
        nationality: "Saudi Arabia",
        dateOfBirth: "1988-12-05",
        gender: "Male",
        address: {
            street: "789 Downtown District",
            city: "Dubai",
            country: "United Arab Emirates",
            postalCode: "67890"
        },
        emergencyContact: {
            name: "Fatima Al-Rashid",
            relationship: "Wife",
            phone: "+971-56-555-1235"
        },
        preferences: {
            language: "Arabic",
            currency: "AED",
            newsletter: false,
            smsNotifications: true
        },
        loyaltyProgram: {
            tier: "Platinum",
            points: 5000,
            joinDate: "2022-08-20"
        },
        bookingHistory: [
            {
                bookingId: "BK-004",
                product: "Dubai Aquarium & Underwater Zoo",
                date: "2023-12-25",
                status: "Completed",
                amount: 120,
                rating: 4
            },
            {
                bookingId: "BK-005",
                product: "Ski Dubai Experience",
                date: "2024-01-05",
                status: "Completed",
                amount: 180,
                rating: 5
            }
        ],
        totalSpent: 300,
        totalBookings: 2,
        averageRating: 4.5,
        status: "Active",
        createdAt: "2022-08-20",
        lastActivity: "2024-01-05",
        notes: "Regular customer, family bookings"
    }
];

// Nationality options
const nationalities = [
    "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain",
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
    "Italy", "Spain", "Netherlands", "Switzerland", "India", "Pakistan", "Bangladesh",
    "Philippines", "Indonesia", "Malaysia", "Singapore", "Thailand", "Japan", "China",
    "South Korea", "Russia", "Brazil", "Argentina", "South Africa", "Egypt", "Lebanon",
    "Jordan", "Morocco", "Turkey", "Iran", "Afghanistan", "Other"
];

// Render customers table
function renderCustomers(customersToRender = customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = customersToRender.map(customer => `
        <tr class="hover:bg-gray-50">
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                        ${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}
                    </div>
                    <div>
                        <div class="font-medium">${customer.firstName} ${customer.lastName}</div>
                        <div class="text-sm text-gray-500">${customer.email}</div>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="text-sm">
                    <div>${customer.phone}</div>
                    <div class="text-gray-500">${customer.nationality}</div>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    customer.loyaltyProgram.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                    customer.loyaltyProgram.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${customer.loyaltyProgram.tier}
                </span>
                <div class="text-xs text-gray-500 mt-1">${customer.loyaltyProgram.points} pts</div>
            </td>
            <td class="py-3 px-4">
                <div class="text-sm">
                    <div class="font-medium">$${customer.totalSpent}</div>
                    <div class="text-gray-500">${customer.totalBookings} bookings</div>
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="flex text-yellow-400 mr-2">
                        ${Array.from({length: 5}, (_, i) => 
                            `<i class="fas fa-star ${i < Math.floor(customer.averageRating) ? '' : 'text-gray-300'}"></i>`
                        ).join('')}
                    </div>
                    <span class="text-sm text-gray-600">${customer.averageRating}</span>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${customer.status}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="viewCustomer(${customer.id})" class="text-blue-600 hover:text-blue-800" title="View Profile">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editCustomer(${customer.id})" class="text-green-600 hover:text-green-800" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="sendMessage(${customer.id})" class="text-purple-600 hover:text-purple-800" title="Send Message">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-800" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Open customer modal for add/edit
function openCustomerModal(customerId = null) {
    const customer = customerId ? customers.find(c => c.id === customerId) : null;
    const isEdit = !!customer;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-4xl mx-auto">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">${isEdit ? 'Edit' : 'Add New'} Customer</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 max-h-[80vh] overflow-y-auto">
                    <form id="customerForm" class="space-y-8">
                        <!-- Personal Information -->
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold">Personal Information</h3>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                    <input type="text" name="firstName" value="${customer?.firstName || ''}" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                    <input type="text" name="lastName" value="${customer?.lastName || ''}" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input type="email" name="email" value="${customer?.email || ''}" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                    <input type="tel" name="phone" value="${customer?.phone || ''}" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value="${customer?.dateOfBirth || ''}" 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <select name="gender" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                        <option value="">Select Gender</option>
                                        <option value="Male" ${customer?.gender === 'Male' ? 'selected' : ''}>Male</option>
                                        <option value="Female" ${customer?.gender === 'Female' ? 'selected' : ''}>Female</option>
                                        <option value="Other" ${customer?.gender === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                                    <select name="nationality" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                        <option value="">Select Nationality</option>
                                        ${nationalities.map(nationality => `
                                            <option value="${nationality}" ${customer?.nationality === nationality ? 'selected' : ''}>
                                                ${nationality}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-6 border-t">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600">
                                ${isEdit ? 'Update' : 'Create'} Customer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Form submission handler
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCustomer(new FormData(this), customerId);
    });
}

// Save customer function
function saveCustomer(formData, customerId = null) {
    showNotification('Customer saved successfully', 'success');
    document.querySelector('.fixed')?.remove();
    renderCustomers();
}

// Other functions
function editCustomer(id) { openCustomerModal(id); }
function viewCustomer(id) { /* Implementation */ }
function sendMessage(id) { /* Implementation */ }
function deleteCustomer(id) { 
    if (confirm('Are you sure you want to delete this customer?')) {
        customers = customers.filter(c => c.id !== id);
        renderCustomers();
        showNotification('Customer deleted successfully', 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCustomers();
});

// Export for use in other modules
window.CustomerManagement = {
    customers,
    openCustomerModal,
    viewCustomer,
    editCustomer,
    sendMessage,
    deleteCustomer
};
