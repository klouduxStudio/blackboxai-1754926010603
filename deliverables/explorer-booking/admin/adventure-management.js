// Adventure Management System
// Initialize categories
const adventureCategories = {
    tours: {
        name: "Tours & Activities",
        subcategories: {
            "landmarks": "Landmarks & Monuments",
            "museums": "Museums & Galleries",
            "food-drink": "Food & Drink",
            "outdoor": "Outdoor Activities",
            "cultural": "Cultural Experiences",
            "adventure": "Adventure Sports",
            "nightlife": "Nightlife",
            "shopping": "Shopping Tours",
            "photography": "Photography Tours",
            "walking": "Walking Tours"
        }
    },
    transfers: {
        name: "Transfers",
        subcategories: {
            "airport": "Airport Transfers",
            "city": "City Transfers",
            "intercity": "Intercity Transfers",
            "private": "Private Transfers",
            "shared": "Shared Transfers"
        }
    },
    hotels: {
        name: "Hotels",
        subcategories: {
            "luxury": "Luxury Hotels",
            "boutique": "Boutique Hotels",
            "budget": "Budget Hotels",
            "resort": "Resorts",
            "hostel": "Hostels"
        }
    },
    flights: {
        name: "Flights",
        subcategories: {
            "domestic": "Domestic Flights",
            "international": "International Flights",
            "charter": "Charter Flights"
        }
    },
    "car-rentals": {
        name: "Car Rentals",
        subcategories: {
            "economy": "Economy Cars",
            "compact": "Compact Cars",
            "luxury": "Luxury Cars",
            "suv": "SUVs",
            "van": "Vans"
        }
    }
};

// Initialize adventures array with sample data
const adventures = [
    {
        id: 1,
        title: "Eiffel Tower Skip-the-Line Tour",
        slug: "eiffel-tower-skip-line-tour",
        location: "Paris, France",
        country: "France",
        city: "Paris",
        category: "tours",
        subcategory: "landmarks",
        price: 89,
        originalPrice: 120,
        duration: "2 hours",
        maxParticipants: 25,
        description: "Skip the long lines and explore the iconic Eiffel Tower with an expert guide.",
        status: "active",
        featured: true,
        rating: 4.8,
        reviewCount: 2847,
        images: [
            { url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800", alt: "Eiffel Tower", isPrimary: true }
        ],
        highlights: ["Skip-the-line access", "Expert guide", "2nd floor access", "Photo opportunities"],
        includes: ["Professional guide", "Skip-the-line tickets", "Small group tour"]
    },
    {
        id: 2,
        title: "Tokyo Food Walking Tour",
        slug: "tokyo-food-walking-tour",
        location: "Tokyo, Japan",
        country: "Japan",
        city: "Tokyo",
        category: "tours",
        subcategory: "food-drink",
        price: 95,
        originalPrice: 125,
        duration: "4 hours",
        maxParticipants: 8,
        description: "Discover authentic Japanese cuisine in Tokyo's hidden food spots.",
        status: "active",
        featured: true,
        rating: 4.9,
        reviewCount: 856,
        images: [
            { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", alt: "Tokyo street food", isPrimary: true }
        ],
        highlights: ["Local food guide", "8 food tastings", "Hidden local spots", "Cultural insights"],
        includes: ["Professional food guide", "8 food tastings", "Drinks", "Cultural explanations"]
    }
];

// Render adventures table
function renderAdventures(adventuresToRender = adventures) {
    const tbody = document.getElementById('adventuresTableBody');
    if (!tbody) return;

    tbody.innerHTML = adventuresToRender.map(adventure => `
        <tr class="hover:bg-gray-50">
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <img src="${adventure.images[0]?.url}" alt="${adventure.title}" class="w-12 h-12 object-cover rounded-lg mr-3">
                    <div>
                        <div class="font-medium">${adventure.title}</div>
                        <div class="text-sm text-gray-500">${adventure.location}</div>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    ${adventureCategories[adventure.category]?.name || adventure.category}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="font-medium">$${adventure.price}</div>
                ${adventure.originalPrice > adventure.price ? `<div class="text-sm text-gray-500 line-through">$${adventure.originalPrice}</div>` : ''}
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <i class="fas fa-star text-yellow-400 mr-1"></i>
                    <span class="font-medium">${adventure.rating}</span>
                    <span class="text-gray-500 ml-1">(${adventure.reviewCount})</span>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    adventure.status === 'active' ? 'bg-green-100 text-green-800' :
                    adventure.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${adventure.status}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editAdventure(${adventure.id})" class="text-blue-600 hover:text-blue-800" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="duplicateAdventure(${adventure.id})" class="text-green-600 hover:text-green-800" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="viewAdventure(${adventure.id})" class="text-purple-600 hover:text-purple-800" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteAdventure(${adventure.id})" class="text-red-600 hover:text-red-800" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Save adventure (add or update)
function saveAdventure(formData, adventureId = null) {
    const adventureData = {
        title: formData.get('title'),
        slug: formData.get('slug') || generateSlug(formData.get('title')),
        location: formData.get('location'),
        country: formData.get('country'),
        city: formData.get('city'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        price: parseFloat(formData.get('price')),
        originalPrice: parseFloat(formData.get('originalPrice')) || parseFloat(formData.get('price')),
        duration: formData.get('duration'),
        maxParticipants: parseInt(formData.get('maxParticipants')) || 50,
        description: formData.get('description'),
        longDescription: formData.get('longDescription'),
        highlights: formData.get('highlights').split('\n').filter(h => h.trim()),
        includes: formData.get('includes').split('\n').filter(i => i.trim()),
        agePolicy: {
            adult: {
                min: parseInt(formData.get('adultMinAge')),
                max: parseInt(formData.get('adultMaxAge')),
                price: parseFloat(formData.get('price'))
            },
            child: {
                min: parseInt(formData.get('childMinAge')),
                max: parseInt(formData.get('childMaxAge')),
                price: parseFloat(formData.get('price')) * 0.75 // 25% discount for children
            }
        },
        pickupAvailable: formData.get('pickupAvailable') === 'on',
        featured: formData.get('featured') === 'on',
        status: formData.get('status'),
        seo: {
            metaTitle: formData.get('metaTitle'),
            metaDescription: formData.get('metaDescription'),
            keywords: formData.get('keywords').split(',').map(k => k.trim()).filter(k => k),
            canonicalUrl: `/tours/${formData.get('city').toLowerCase()}/${formData.get('slug')}`
        }
    };

    if (adventureId) {
        // Update existing adventure
        const index = adventures.findIndex(a => a.id === adventureId);
        if (index !== -1) {
            adventures[index] = {
                ...adventures[index],
                ...adventureData,
                updatedAt: new Date().toISOString().split('T')[0]
            };
            showNotification('Adventure updated successfully', 'success');
        }
    } else {
        // Add new adventure
        const newAdventure = {
            ...adventureData,
            id: Math.max(...adventures.map(a => a.id)) + 1,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        adventures.unshift(newAdventure);
        showNotification('Adventure created successfully', 'success');
    }

    renderAdventures();
    document.querySelector('.fixed')?.remove();
}

// Generate URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Duplicate adventure
function duplicateAdventure(adventureId) {
    const adventure = adventures.find(a => a.id === adventureId);
    if (!adventure) return;

    const duplicate = {
        ...adventure,
        id: Math.max(...adventures.map(a => a.id)) + 1,
        title: `${adventure.title} (Copy)`,
        slug: `${adventure.slug}-copy`,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };

    adventures.unshift(duplicate);
    renderAdventures();
    showNotification('Adventure duplicated successfully', 'success');
}

// Delete adventure
function deleteAdventure(adventureId) {
    if (!confirm('Are you sure you want to delete this adventure? This action cannot be undone.')) return;

    const index = adventures.findIndex(a => a.id === adventureId);
    if (index !== -1) {
        adventures.splice(index, 1);
        renderAdventures();
        showNotification('Adventure deleted successfully', 'success');
    }
}

// View adventure details
function viewAdventure(adventureId) {
    const adventure = adventures.find(a => a.id === adventureId);
    if (!adventure) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-4xl mx-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">${adventure.title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Left Column -->
                        <div>
                            <img src="${adventure.images?.[0]?.url || ''}" alt="${adventure.title}" 
                                 class="w-full h-64 object-cover rounded-lg mb-4">
                            
                            <div class="space-y-4">
                                <div>
                                    <h3 class="font-semibold mb-2">Description</h3>
                                    <p class="text-gray-600">${adventure.description}</p>
                                </div>
                                
                                <div>
                                    <h3 class="font-semibold mb-2">Highlights</h3>
                                    <ul class="list-disc pl-5 space-y-1">
                                        ${adventure.highlights.map(h => `
                                            <li class="text-gray-600">${h}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 class="font-semibold mb-2">What's Included</h3>
                                    <ul class="list-disc pl-5 space-y-1">
                                        ${adventure.includes.map(i => `
                                            <li class="text-gray-600">${i}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column -->
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-semibold mb-2">Details</h3>
                                <dl class="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt class="text-gray-600">Location</dt>
                                        <dd class="font-medium">${adventure.location}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Duration</dt>
                                        <dd class="font-medium">${adventure.duration}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Category</dt>
                                        <dd class="font-medium">${adventureCategories[adventure.category]?.name}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Max Participants</dt>
                                        <dd class="font-medium">${adventure.maxParticipants}</dd>
                                    </div>
                                </dl>
                            </div>
                            
                            <div>
                                <h3 class="font-semibold mb-2">Pricing</h3>
                                <dl class="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt class="text-gray-600">Current Price</dt>
                                        <dd class="font-medium">$${adventure.price}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Original Price</dt>
                                        <dd class="font-medium">$${adventure.originalPrice}</dd>
                                    </div>
                                </dl>
                            </div>
                            
                            <div>
                                <h3 class="font-semibold mb-2">Age Policy</h3>
                                <dl class="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt class="text-gray-600">Adults</dt>
                                        <dd class="font-medium">${adventure.agePolicy.adult.min}-${adventure.agePolicy.adult.max} years</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Children</dt>
                                        <dd class="font-medium">${adventure.agePolicy.child.min}-${adventure.agePolicy.child.max} years</dd>
                                    </div>
                                </dl>
                            </div>
                            
                            <div>
                                <h3 class="font-semibold mb-2">SEO Information</h3>
                                <dl class="space-y-2">
                                    <div>
                                        <dt class="text-gray-600">Meta Title</dt>
                                        <dd class="font-medium">${adventure.seo.metaTitle}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Meta Description</dt>
                                        <dd class="font-medium">${adventure.seo.metaDescription}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-gray-600">Keywords</dt>
                                        <dd class="font-medium">${adventure.seo.keywords.join(', ')}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize adventure management
document.addEventListener('DOMContentLoaded', () => {
    renderAdventures();
    
    // Add adventure button handler
    const addButton = document.querySelector('button[onclick="openAdventureModal()"]');
    if (addButton) {
        addButton.addEventListener('click', () => openAdventureModal());
    }
    
    // Search functionality
    const searchInput = document.querySelector('input[placeholder="Search adventures..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredAdventures = adventures.filter(adventure => 
                adventure.title.toLowerCase().includes(searchTerm) ||
                adventure.location.toLowerCase().includes(searchTerm) ||
                adventure.description.toLowerCase().includes(searchTerm)
            );
            renderAdventures(filteredAdventures);
        });
    }
    
    // Status filter
    const statusFilter = document.querySelector('select[name="status-filter"]');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            const status = e.target.value.toLowerCase();
            const filteredAdventures = status 
                ? adventures.filter(adventure => adventure.status.toLowerCase() === status)
                : adventures;
            renderAdventures(filteredAdventures);
        });
    }
});

// Open adventure modal for add/edit
function openAdventureModal(adventureId = null) {
    const adventure = adventureId ? adventures.find(a => a.id === adventureId) : null;
    const isEdit = !!adventure;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-6xl mx-auto">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">${isEdit ? 'Edit' : 'Add New'} Adventure</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6">
                    <form id="adventureForm" class="space-y-6">
                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input type="text" name="title" value="${adventure?.title || ''}" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                                <input type="text" name="slug" value="${adventure?.slug || ''}" 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                        </div>
                        
                        <!-- Location -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                <input type="text" name="country" value="${adventure?.country || ''}" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                <input type="text" name="city" value="${adventure?.city || ''}" required 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Full Location</label>
                                <input type="text" name="location" value="${adventure?.location || ''}" 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                        </div>
                        
                        <!-- Category -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select name="category" required onchange="updateSubcategories(this.value)"
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                    <option value="">Select Category</option>
                                    ${Object.entries(adventureCategories).map(([key, cat]) => `
                                        <option value="${key}" ${adventure?.category === key ? 'selected' : ''}>
                                            ${cat.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                                <select name="subcategory" id="subcategorySelect"
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                    <option value="">Select Subcategory</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Pricing -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                                <input type="number" name="price" value="${adventure?.price || ''}" required min="0" step="0.01"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                                <input type="number" name="originalPrice" value="${adventure?.originalPrice || ''}" min="0" step="0.01"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                <input type="text" name="duration" value="${adventure?.duration || ''}" placeholder="e.g., 2 hours"
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            </div>
                        </div>
                        
                        <!-- Descriptions -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                                <textarea name="description" required rows="3" 
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${adventure?.description || ''}</textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
                                <textarea name="longDescription" rows="5" 
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${adventure?.longDescription || ''}</textarea>
                            </div>
                        </div>
                        
                        <!-- Highlights & Includes -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Highlights (one per line)</label>
                                <textarea name="highlights" rows="4" placeholder="Skip-the-line access&#10;Expert guide&#10;Photo opportunities"
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${adventure?.highlights?.join('\n') || ''}</textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">What's Included (one per line)</label>
                                <textarea name="includes" rows="4" placeholder="Professional guide&#10;Skip-the-line tickets&#10;Small group tour"
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${adventure?.includes?.join('\n') || ''}</textarea>
                            </div>
                        </div>
                        
                        <!-- Status & Settings -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select name="status" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                    <option value="draft" ${adventure?.status === 'draft' ? 'selected' : ''}>Draft</option>
                                    <option value="active" ${adventure?.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${adventure?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" name="featured" ${adventure?.featured ? 'checked' : ''} 
                                           class="mr-2 rounded border-gray-300 text-primary focus:ring-primary">
                                    <span class="text-sm font-medium text-gray-700">Featured Adventure</span>
                                </label>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" name="pickupAvailable" ${adventure?.pickupAvailable ? 'checked' : ''} 
                                           class="mr-2 rounded border-gray-300 text-primary focus:ring-primary">
                                    <span class="text-sm font-medium text-gray-700">Pickup Available</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-6 border-t">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600">
                                ${isEdit ? 'Update' : 'Create'} Adventure
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize subcategories if editing
    if (adventure?.category) {
        updateSubcategories(adventure.category, adventure.subcategory);
    }
    
    // Form submission handler
    document.getElementById('adventureForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAdventure(new FormData(this), adventureId);
    });
}

// Export for use in other modules
window.AdventureManagement = {
    adventures,
    adventureCategories,
    openAdventureModal,
    editAdventure: (id) => openAdventureModal(id),
    duplicateAdventure,
    deleteAdventure,
    viewAdventure
};
