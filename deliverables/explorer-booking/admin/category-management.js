// Category & Product Type Management System

class CategoryManagementSystem {
    constructor() {
        this.productTypes = {
            experiences: {
                id: 'experiences',
                name: 'Experiences',
                icon: 'fa-star',
                enabled: true,
                categories: {
                    attractions: {
                        id: 'attractions',
                        name: 'Attractions',
                        icon: 'fa-building',
                        enabled: true
                    },
                    tours: {
                        id: 'tours',
                        name: 'Tours',
                        icon: 'fa-route',
                        enabled: true
                    },
                    activities: {
                        id: 'activities',
                        name: 'Activities',
                        icon: 'fa-hiking',
                        enabled: true
                    },
                    theme_parks: {
                        id: 'theme_parks',
                        name: 'Theme Parks',
                        icon: 'fa-ferris-wheel',
                        enabled: true
                    },
                    museums: {
                        id: 'museums',
                        name: 'Museums',
                        icon: 'fa-university',
                        enabled: true
                    },
                    aquariums: {
                        id: 'aquariums',
                        name: 'Aquariums',
                        icon: 'fa-fish',
                        enabled: true
                    },
                    waterparks: {
                        id: 'waterparks',
                        name: 'Water Parks',
                        icon: 'fa-water',
                        enabled: true
                    }
                }
            },
            transfers: {
                id: 'transfers',
                name: 'Transfers',
                icon: 'fa-car',
                enabled: true,
                categories: {
                    hotel: {
                        id: 'hotel',
                        name: 'Hotel Transfers',
                        icon: 'fa-hotel',
                        enabled: true
                    },
                    airport: {
                        id: 'airport',
                        name: 'Airport Transfers',
                        icon: 'fa-plane',
                        enabled: true
                    },
                    intercity: {
                        id: 'intercity',
                        name: 'Intercity Transfers',
                        icon: 'fa-road',
                        enabled: true
                    },
                    intracity: {
                        id: 'intracity',
                        name: 'Intracity Transfers',
                        icon: 'fa-city',
                        enabled: true
                    },
                    private: {
                        id: 'private',
                        name: 'Private Vehicle Hire',
                        icon: 'fa-car-side',
                        enabled: true
                    }
                }
            },
            hotels: {
                id: 'hotels',
                name: 'Hotels',
                icon: 'fa-hotel',
                enabled: true,
                categories: {
                    luxury: {
                        id: 'luxury',
                        name: 'Luxury Hotels',
                        icon: 'fa-star',
                        enabled: true
                    },
                    business: {
                        id: 'business',
                        name: 'Business Hotels',
                        icon: 'fa-briefcase',
                        enabled: true
                    },
                    budget: {
                        id: 'budget',
                        name: 'Budget Hotels',
                        icon: 'fa-money-bill',
                        enabled: true
                    },
                    apartments: {
                        id: 'apartments',
                        name: 'Hotel Apartments',
                        icon: 'fa-building',
                        enabled: true
                    }
                }
            },
            'car-rentals': {
                id: 'car-rentals',
                name: 'Car Rentals',
                icon: 'fa-car',
                enabled: true,
                categories: {
                    economy: {
                        id: 'economy',
                        name: 'Economy Cars',
                        icon: 'fa-car',
                        enabled: true
                    },
                    compact: {
                        id: 'compact',
                        name: 'Compact Cars',
                        icon: 'fa-car-side',
                        enabled: true
                    },
                    luxury: {
                        id: 'luxury',
                        name: 'Luxury Cars',
                        icon: 'fa-car-luxury',
                        enabled: true
                    },
                    suv: {
                        id: 'suv',
                        name: 'SUVs',
                        icon: 'fa-truck-monster',
                        enabled: true
                    },
                    sports: {
                        id: 'sports',
                        name: 'Sports Cars',
                        icon: 'fa-car-sport',
                        enabled: true
                    }
                }
            }
        };

        // Custom product types and categories
        this.customProductTypes = {};
        this.customCategories = {};
    }

    // Get all product types
    getAllProductTypes() {
        return {
            ...this.productTypes,
            ...this.customProductTypes
        };
    }

    // Get enabled product types
    getEnabledProductTypes() {
        const allTypes = this.getAllProductTypes();
        const enabledTypes = {};

        for (const [key, type] of Object.entries(allTypes)) {
            if (type.enabled) {
                enabledTypes[key] = {
                    ...type,
                    categories: this.getEnabledCategories(type.categories)
                };
            }
        }

        return enabledTypes;
    }

    // Get enabled categories for a product type
    getEnabledCategories(categories) {
        const enabledCategories = {};

        for (const [key, category] of Object.entries(categories)) {
            if (category.enabled) {
                enabledCategories[key] = category;
            }
        }

        return enabledCategories;
    }

    // Add new product type
    addProductType(config) {
        if (!config.id || !config.name) {
            throw new Error('Product type must have an ID and name');
        }

        if (this.productTypes[config.id] || this.customProductTypes[config.id]) {
            throw new Error('Product type ID already exists');
        }

        const newType = {
            id: config.id,
            name: config.name,
            icon: config.icon || 'fa-box',
            enabled: config.enabled !== false,
            categories: {}
        };

        this.customProductTypes[config.id] = newType;
        return newType;
    }

    // Add new category to product type
    addCategory(productTypeId, config) {
        if (!config.id || !config.name) {
            throw new Error('Category must have an ID and name');
        }

        const productType = this.productTypes[productTypeId] || this.customProductTypes[productTypeId];
        if (!productType) {
            throw new Error('Product type not found');
        }

        if (productType.categories[config.id]) {
            throw new Error('Category ID already exists for this product type');
        }

        const newCategory = {
            id: config.id,
            name: config.name,
            icon: config.icon || 'fa-folder',
            enabled: config.enabled !== false
        };

        productType.categories[config.id] = newCategory;
        return newCategory;
    }

    // Update product type
    updateProductType(typeId, updates) {
        const type = this.productTypes[typeId] || this.customProductTypes[typeId];
        if (!type) {
            throw new Error('Product type not found');
        }

        Object.assign(type, updates);
        return type;
    }

    // Update category
    updateCategory(productTypeId, categoryId, updates) {
        const productType = this.productTypes[productTypeId] || this.customProductTypes[productTypeId];
        if (!productType) {
            throw new Error('Product type not found');
        }

        const category = productType.categories[categoryId];
        if (!category) {
            throw new Error('Category not found');
        }

        Object.assign(category, updates);
        return category;
    }

    // Enable/Disable product type
    toggleProductType(typeId, enabled) {
        const type = this.productTypes[typeId] || this.customProductTypes[typeId];
        if (!type) {
            throw new Error('Product type not found');
        }

        type.enabled = enabled;
        return type;
    }

    // Enable/Disable category
    toggleCategory(productTypeId, categoryId, enabled) {
        const productType = this.productTypes[productTypeId] || this.customProductTypes[productTypeId];
        if (!productType) {
            throw new Error('Product type not found');
        }

        const category = productType.categories[categoryId];
        if (!category) {
            throw new Error('Category not found');
        }

        category.enabled = enabled;
        return category;
    }

    // Generate HTML for product type selection
    generateProductTypeSelect(selectedType = '') {
        const types = this.getEnabledProductTypes();
        return `
            <select class="w-full p-2 border rounded-lg">
                <option value="">Select Product Type</option>
                ${Object.values(types).map(type => `
                    <option value="${type.id}" ${type.id === selectedType ? 'selected' : ''}>
                        ${type.name}
                    </option>
                `).join('')}
            </select>
        `;
    }

    // Generate HTML for category selection
    generateCategorySelect(productTypeId, selectedCategory = '') {
        const type = this.getEnabledProductTypes()[productTypeId];
        if (!type) return '';

        return `
            <select class="w-full p-2 border rounded-lg">
                <option value="">Select Category</option>
                ${Object.values(type.categories).map(category => `
                    <option value="${category.id}" ${category.id === selectedCategory ? 'selected' : ''}>
                        ${category.name}
                    </option>
                `).join('')}
            </select>
        `;
    }

    // Generate HTML for product type and category management UI
    generateManagementUI() {
        const allTypes = this.getAllProductTypes();
        return `
            <div class="space-y-6">
                <!-- Product Types -->
                ${Object.values(allTypes).map(type => `
                    <div class="border rounded-lg p-4">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <i class="fas ${type.icon} mr-3 text-lg"></i>
                                <div>
                                    <h3 class="font-medium">${type.name}</h3>
                                    <p class="text-sm text-gray-500">${Object.keys(type.categories).length} categories</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <label class="flex items-center">
                                    <input type="checkbox" ${type.enabled ? 'checked' : ''}
                                           onchange="categoryManagement.toggleProductType('${type.id}', this.checked)"
                                           class="rounded border-gray-300">
                                    <span class="ml-2">Enabled</span>
                                </label>
                                <button onclick="editProductType('${type.id}')"
                                        class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Categories -->
                        <div class="grid grid-cols-2 gap-4">
                            ${Object.values(type.categories).map(category => `
                                <div class="border rounded p-3 flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas ${category.icon} mr-2"></i>
                                        <span>${category.name}</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" ${category.enabled ? 'checked' : ''}
                                                   onchange="categoryManagement.toggleCategory('${type.id}', '${category.id}', this.checked)"
                                                   class="rounded border-gray-300">
                                            <span class="ml-2">Enabled</span>
                                        </label>
                                        <button onclick="editCategory('${type.id}', '${category.id}')"
                                                class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Add Category Button -->
                        <button onclick="addCategory('${type.id}')"
                                class="mt-4 w-full p-2 border border-dashed rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-600">
                            <i class="fas fa-plus mr-2"></i>
                            Add Category
                        </button>
                    </div>
                `).join('')}

                <!-- Add Product Type Button -->
                <button onclick="addProductType()"
                        class="w-full p-4 border border-dashed rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-600">
                    <i class="fas fa-plus mr-2"></i>
                    Add Product Type
                </button>
            </div>
        `;
    }
}

// Initialize category management system
const categoryManagement = new CategoryManagementSystem();

// Export for use in other modules
export { categoryManagement };
