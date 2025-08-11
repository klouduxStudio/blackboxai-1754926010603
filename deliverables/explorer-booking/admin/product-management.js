// Product Management System for Explorer Booking
// Comprehensive product configuration for Experiences (Attractions, Tours, Activities, etc.)

import { categoryManagement } from './category-management.js';
import { productMetadata } from './product-metadata.js';

// Get product types from category management system
const productTypes = categoryManagement.getEnabledProductTypes();

// Destinations Configuration (Countries and Cities)
const destinations = {
    "United Arab Emirates": {
        cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah", "Ras Al Khaimah", "Umm Al Quwain"]
    },
    "Saudi Arabia": {
        cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"]
    },
    "Qatar": {
        cities: ["Doha", "Al Rayyan", "Al Wakrah"]
    },
    "Oman": {
        cities: ["Muscat", "Salalah", "Nizwa", "Sur"]
    },
    "Kuwait": {
        cities: ["Kuwait City", "Hawalli", "Ahmadi"]
    },
    "Bahrain": {
        cities: ["Manama", "Riffa", "Muharraq"]
    }
};

// Product Configuration
const inventoryConfig = {
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoDisableOnStockOut: true,
    enableStockNotifications: true
};

const bookingConfig = {
    maxAdvanceBookingDays: 365,
    minAdvanceBookingHours: 24,
    defaultCutoffTime: "18:00",
    allowWaitlist: true,
    overbookingLimit: 0
};

// Initialize products array with metadata
let products = [
    {
        id: 1,
        enabled: true,
        productType: "experiences",
        title: "Burj Khalifa At The Top Experience",
        sku: "BK-TOP-001",
        supplierId: "SUP-001",
        category: "attractions",
        country: "United Arab Emirates",
        city: "Dubai",
        shortDescription: "Visit the world's tallest building and enjoy breathtaking views from the observation deck.",
        highlights: [
            "Skip-the-line access to Burj Khalifa",
            "High-speed elevator to Level 124 & 125",
            "360-degree panoramic views of Dubai",
            "Multimedia presentation about Dubai's history"
        ],
        metadata: {
            goodFor: ['couple', 'families', 'friends'],
            cancellationPolicy: 'free_cancellation',
            duration: '1-2 hours',
            transfer: 'optional',
            languages: ['en', 'ar'],
            wheelchairAccessible: true,
            rating: 4.8,
            featureTags: ['explorers_choice', 'most_visited', 'must_visit']
        },
        longDescription: "Experience Dubai from new heights at Burj Khalifa, the world's tallest building. Take the high-speed elevator to the observation decks on levels 124 and 125, where you'll be treated to breathtaking 360-degree views of the city, desert, and ocean. Learn about Dubai's remarkable transformation through interactive displays and multimedia presentations.",
        images: [
            { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", alt: "Burj Khalifa", isPrimary: true }
        ],
        inclusions: [
            "Skip-the-line admission tickets",
            "High-speed elevator access",
            "Access to outdoor terrace (Level 124)",
            "Access to indoor observation deck (Level 125)",
            "Complimentary refreshments"
        ],
        exclusions: [
            "Hotel pickup and drop-off",
            "Food and beverages (unless specified)",
            "Personal expenses",
            "Gratuities"
        ],
        timings: {
            operatingHours: "08:30 AM - 11:00 PM",
            duration: "1-2 hours",
            lastEntry: "10:30 PM"
        },
        childPolicy: {
            infantAge: "0-2 years (Free)",
            childAge: "3-12 years (Child rate applies)",
            adultAge: "13+ years (Adult rate applies)"
        },
        cancellationPolicy: "Free cancellation up to 24 hours before the experience starts",
        knowBeforeYouGo: [
            "Dress code: Smart casual attire required",
            "Security screening required before entry",
            "Photography is allowed",
            "Weather conditions may affect outdoor terrace access"
        ],
        importantInformation: [
            "Valid ID required for all visitors",
            "Children must be accompanied by adults",
            "Wheelchair accessible",
            "Not recommended for visitors with acrophobia"
        ],
        postBookingInfo: "You will receive your e-ticket via email within 24 hours of booking. Please present the e-ticket on your mobile device or print it out for entry.",
        location: {
            address: "1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, Dubai, UAE",
            coordinates: {
                latitude: 25.1972,
                longitude: 55.2744
            }
        },
        ticketInventory: {
            enabled: true,
            triggerDays: 3
        },
        ticketOptions: [
            {
                id: 1,
                title: "At The Top - Level 124 & 125",
                childSku: "BK-TOP-STD",
                enabled: true,
                availableFrom: "2024-01-01",
                availableTo: "2024-12-31",
                quantityAvailable: 100,
                pricing: {
                    adult: {
                        gatePrice: 149,
                        b2bPrice: 119,
                        ageGroup: "13+ years"
                    },
                    child: {
                        gatePrice: 119,
                        b2bPrice: 95,
                        ageGroup: "3-12 years"
                    }
                },
                timeslots: [
                    { time: "09:00", available: true },
                    { time: "10:00", available: true },
                    { time: "11:00", available: true },
                    { time: "12:00", available: true },
                    { time: "13:00", available: true },
                    { time: "14:00", available: true },
                    { time: "15:00", available: true },
                    { time: "16:00", available: true },
                    { time: "17:00", available: true },
                    { time: "18:00", available: true },
                    { time: "19:00", available: true },
                    { time: "20:00", available: true },
                    { time: "21:00", available: true }
                ],
                description: "Standard observation deck experience with access to levels 124 and 125"
            },
            {
                id: 2,
                title: "At The Top SKY - Level 148",
                childSku: "BK-TOP-SKY",
                enabled: true,
                availableFrom: "2024-01-01",
                availableTo: "2024-12-31",
                quantityAvailable: 50,
                pricing: {
                    adult: {
                        gatePrice: 399,
                        b2bPrice: 319,
                        ageGroup: "13+ years"
                    },
                    child: {
                        gatePrice: 319,
                        b2bPrice: 255,
                        ageGroup: "3-12 years"
                    }
                },
                timeslots: [
                    { time: "10:00", available: true },
                    { time: "12:00", available: true },
                    { time: "14:00", available: true },
                    { time: "16:00", available: true },
                    { time: "18:00", available: true },
                    { time: "20:00", available: true }
                ],
                description: "Premium experience with access to the highest observation deck on level 148"
            }
        ],
        seo: {
            slug: "burj-khalifa-at-the-top-experience-dubai",
            metaTitle: "Burj Khalifa At The Top Experience - Skip the Line Tickets | Dubai",
            metaDescription: "Visit Burj Khalifa, the world's tallest building. Skip-the-line tickets to observation decks with stunning 360° views of Dubai. Book now!",
            metaTags: ["burj khalifa", "dubai attractions", "observation deck", "skip the line", "dubai tours"],
            focusKeyword: "Burj Khalifa tickets",
            canonicalUrl: "/experiences/dubai/burj-khalifa-at-the-top-experience",
            ogTitle: "Burj Khalifa At The Top Experience - Dubai's Premier Attraction",
            ogDescription: "Experience breathtaking views from the world's tallest building. Skip-the-line access to Burj Khalifa observation decks.",
            ogImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200"
        },
        status: "active",
        featured: true,
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20"
    }
];

// Product Management Class
class ProductManager {
    constructor() {
        this.config = inventoryConfig;
        this.products = products;
    }

    // Create new product
    createProduct(data) {
        const product = {
            id: data.id || 'pid_' + Math.random().toString(36).substr(2, 9),
            enabled: data.enabled !== false,
            productType: data.productType,
            title: data.title,
            sku: data.sku,
            supplierId: data.supplierId,
            category: data.category,
            country: data.country,
            city: data.city,
            shortDescription: data.shortDescription,
            highlights: data.highlights || [],
            longDescription: data.longDescription,
            images: data.images || [],
            inclusions: data.inclusions || [],
            exclusions: data.exclusions || [],
            timings: data.timings || {},
            childPolicy: data.childPolicy || {},
            cancellationPolicy: data.cancellationPolicy,
            knowBeforeYouGo: data.knowBeforeYouGo || [],
            importantInformation: data.importantInformation || [],
            postBookingInfo: data.postBookingInfo,
            location: data.location || {},
            ticketInventory: data.ticketInventory || {
                enabled: true,
                triggerDays: 3
            },
            ticketOptions: data.ticketOptions || [],
            seo: data.seo || {},
            status: data.status || 'active',
            featured: data.featured || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Add metadata
            metadata: productMetadata.addMetadata(data, data.metadata || {})
        };

        this.validateProduct(product);
        this.products.push(product);
        return product;
    }

    // Update existing product
    updateProduct(id, data) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');

        const product = {
            ...this.products[index],
            ...data,
            metadata: productMetadata.addMetadata(data, data.metadata || {}),
            updatedAt: new Date().toISOString()
        };

        this.validateProduct(product);
        this.products[index] = product;
        return product;
    }

    // Validate product data
    validateProduct(product) {
        if (!product.title) throw new Error('Product title is required');
        if (!product.sku) throw new Error('Product SKU is required');
        if (!product.productType) throw new Error('Product type is required');
        if (!product.category) throw new Error('Product category is required');
        if (!product.country) throw new Error('Country is required');
        if (!product.city) throw new Error('City is required');
        if (!product.shortDescription) throw new Error('Short description is required');

        // Validate product type and category
        const types = categoryManagement.getEnabledProductTypes();
        if (!types[product.productType]) {
            throw new Error('Invalid product type');
        }
        if (!types[product.productType].categories[product.category]) {
            throw new Error('Invalid category for product type');
        }
    }

    // Get product by ID
    getProduct(id) {
        return this.products.find(p => p.id === id);
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Get products by type
    getProductsByType(type) {
        return this.products.filter(p => p.productType === type);
    }

    // Get products by category
    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    // Get products by destination
    getProductsByDestination(country, city = null) {
        return this.products.filter(p => 
            p.country === country && (!city || p.city === city)
        );
    }

    // Toggle product status
    toggleProduct(id, enabled) {
        const product = this.getProduct(id);
        if (!product) throw new Error('Product not found');

        product.enabled = enabled;
        product.updatedAt = new Date().toISOString();
        return product;
    }

    // Delete product
    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');

        this.products.splice(index, 1);
    }

    // Generate product card HTML
    generateProductCard(product) {
        return `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- Product Image -->
                <div class="relative h-48">
                    <img src="${product.images[0]?.url || '#'}" 
                         alt="${product.images[0]?.alt || product.title}"
                         class="w-full h-full object-cover">
                    ${this.generateFeatureTagsHTML(product)}
                </div>

                <!-- Product Info -->
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <span class="px-2 py-1 text-xs rounded ${
                                product.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }">${product.enabled ? 'Active' : 'Inactive'}</span>
                            <span class="ml-2 text-sm text-gray-500">${product.sku}</span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="editProduct('${product.id}')" 
                                    class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProduct('${product.id}')" 
                                    class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <h3 class="font-medium mb-1">${product.title}</h3>
                    <p class="text-sm text-gray-600 mb-2">${product.shortDescription}</p>

                    <!-- Product Metadata -->
                    ${this.generateMetadataHTML(product)}

                    <!-- Quick Stats -->
                    <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500">Type:</span>
                            <span class="font-medium">${productTypes[product.productType].name}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Category:</span>
                            <span class="font-medium">${productTypes[product.productType].categories[product.category]}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Location:</span>
                            <span class="font-medium">${product.city}, ${product.country}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Status:</span>
                            <span class="font-medium">${product.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate metadata HTML
    generateMetadataHTML(product) {
        if (!product.metadata) return '';
        return productMetadata.generateMetadataHTML(product.metadata);
    }

    // Generate feature tags HTML
    generateFeatureTagsHTML(product) {
        if (!product.metadata?.featureTags?.length) return '';

        return `
            <div class="absolute top-2 right-2 flex flex-col space-y-1">
                ${product.metadata.featureTags.map(tagId => {
                    const tag = productMetadata.getTag(tagId);
                    if (!tag) return '';
                    return `
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs ${tag.color}">
                            <i class="fas ${tag.icon} mr-1"></i>
                            ${tag.label}
                        </span>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Generate product form HTML
    generateProductForm(product = null) {
        const types = categoryManagement.getEnabledProductTypes();
        return `
            <form id="productForm" class="space-y-6">
                <input type="hidden" name="id" value="${product?.id || ''}">

                <!-- Basic Information -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium">Basic Information</h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" required 
                                   value="${product?.title || ''}"
                                   class="mt-1 block w-full rounded-md border-gray-300">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">SKU</label>
                            <input type="text" name="sku" required 
                                   value="${product?.sku || ''}"
                                   class="mt-1 block w-full rounded-md border-gray-300">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Product Type</label>
                            <select name="productType" required onchange="updateCategoryOptions(this.value)"
                                    class="mt-1 block w-full rounded-md border-gray-300">
                                <option value="">Select Product Type</option>
                                ${Object.entries(types).map(([id, type]) => `
                                    <option value="${id}" ${product?.productType === id ? 'selected' : ''}>
                                        ${type.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <select name="category" required id="categorySelect"
                                    class="mt-1 block w-full rounded-md border-gray-300">
                                <option value="">Select Category</option>
                                ${product?.productType ? Object.entries(types[product.productType].categories).map(([id, name]) => `
                                    <option value="${id}" ${product?.category === id ? 'selected' : ''}>
                                        ${name}
                                    </option>
                                `).join('') : ''}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Short Description</label>
                        <textarea name="shortDescription" required rows="2"
                                  class="mt-1 block w-full rounded-md border-gray-300">${product?.shortDescription || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Long Description</label>
                        <textarea name="longDescription" rows="4"
                                  class="mt-1 block w-full rounded-md border-gray-300">${product?.longDescription || ''}</textarea>
                    </div>
                </div>

                <!-- Metadata -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium">Product Metadata</h3>
                    ${productMetadata.generateMetadataForm()}
                </div>

                <!-- Location -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium">Location</h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Country</label>
                            <select name="country" required onchange="updateCityOptions(this.value)"
                                    class="mt-1 block w-full rounded-md border-gray-300">
                                <option value="">Select Country</option>
                                ${Object.keys(destinations).map(country => `
                                    <option value="${country}" ${product?.country === country ? 'selected' : ''}>
                                        ${country}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">City</label>
                            <select name="city" required id="citySelect"
                                    class="mt-1 block w-full rounded-md border-gray-300">
                                <option value="">Select City</option>
                                ${product?.country ? destinations[product.country].cities.map(city => `
                                    <option value="${city}" ${product?.city === city ? 'selected' : ''}>
                                        ${city}
                                    </option>
                                `).join('') : ''}
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Latitude</label>
                            <input type="number" name="latitude" step="any"
                                   value="${product?.location?.coordinates?.latitude || ''}"
                                   class="mt-1 block w-full rounded-md border-gray-300">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Longitude</label>
                            <input type="number" name="longitude" step="any"
                                   value="${product?.location?.coordinates?.longitude || ''}"
                                   class="mt-1 block w-full rounded-md border-gray-300">
                        </div>
                    </div>
                </div>

                <!-- Settings -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium">Settings</h3>
                    
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center">
                            <input type="checkbox" name="enabled" 
                                   ${product?.enabled ? 'checked' : ''}
                                   class="rounded border-gray-300">
                            <span class="ml-2">Enable Product</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="featured"
                                   ${product?.featured ? 'checked' : ''}
                                   class="rounded border-gray-300">
                            <span class="ml-2">Featured Product</span>
                        </label>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end space-x-4 pt-6 border-t">
                    <button type="button" onclick="closeProductModal()"
                            class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        ${product ? 'Update' : 'Create'} Product
                    </button>
                </div>
            </form>
        `;
    }
}

// Initialize product manager
const productManager = new ProductManager();

// Add inventory management methods to ProductManager class
Object.assign(ProductManager.prototype, {
    // Check stock level for a product option
    checkStock(productId, optionId) {
        const product = this.getProduct(productId);
        if (!product) return null;

        const option = product.ticketOptions.find(opt => opt.id === optionId);
        if (!option) return null;

        const stock = option.quantityAvailable;
        return {
            available: stock > 0,
            quantity: stock,
            status: this.getStockStatus(stock),
            lowStock: stock <= this.config.lowStockThreshold,
            critical: stock <= this.config.criticalStockThreshold
        };
    },

    // Get stock status
    getStockStatus(quantity) {
        if (quantity <= 0) return 'out_of_stock';
        if (quantity <= this.config.criticalStockThreshold) return 'critical';
        if (quantity <= this.config.lowStockThreshold) return 'low';
        return 'in_stock';
    },

    // Update stock level
    updateStock(productId, optionId, quantity, type = 'adjustment') {
        const product = this.getProduct(productId);
        if (!product) return false;

        const option = product.ticketOptions.find(opt => opt.id === optionId);
        if (!option) return false;

        const oldQuantity = option.quantityAvailable;
        let newQuantity;

        switch (type) {
            case 'set':
                newQuantity = Math.max(0, quantity);
                break;
            case 'adjustment':
                newQuantity = Math.max(0, oldQuantity + quantity);
                break;
            default:
                return false;
        }

        option.quantityAvailable = newQuantity;
        this.checkStockThresholds(product, option);
        
        // Log inventory change
        this.logInventoryChange(product, option, oldQuantity, newQuantity, type);
        
        return true;
    },

    // Check stock thresholds and trigger notifications
    checkStockThresholds(product, option) {
        const stock = this.checkStock(product.id, option.id);
        
        if (stock.critical && this.config.enableStockNotifications) {
            this.sendStockNotification(product, option, 'critical');
        } else if (stock.lowStock && this.config.enableStockNotifications) {
            this.sendStockNotification(product, option, 'low');
        }

        if (stock.quantity === 0 && this.config.autoDisableOnStockOut) {
            option.enabled = false;
            this.sendStockNotification(product, option, 'out_of_stock');
        }
    },

    // Send stock notification
    sendStockNotification(product, option, level) {
        const notifications = {
            critical: `Critical stock alert: ${product.title} - ${option.title} (${option.quantityAvailable} remaining)`,
            low: `Low stock warning: ${product.title} - ${option.title} (${option.quantityAvailable} remaining)`,
            out_of_stock: `Out of stock: ${product.title} - ${option.title}`
        };

        // Show notification in UI
        showNotification(notifications[level], 'warning');
        
        // In real app, would also send email/SMS notifications
        console.log('Stock Notification:', notifications[level]);
    },

    // Log inventory change
    logInventoryChange(product, option, oldQuantity, newQuantity, type) {
        const log = {
            timestamp: new Date().toISOString(),
            productId: product.id,
            productTitle: product.title,
            optionId: option.id,
            optionTitle: option.title,
            oldQuantity,
            newQuantity,
            change: newQuantity - oldQuantity,
            type,
            userId: 'admin' // In real app, would get from current user
        };

        console.log('Inventory Change Log:', log);
        // In real app, would save to database
    }
});

// Export for use in other modules
export { productManager };
        return {
            available: stock > 0,
            quantity: stock,
            status: this.getStockStatus(stock),
            lowStock: stock <= this.config.lowStockThreshold,
            critical: stock <= this.config.criticalStockThreshold
        };
    }

    getStockStatus(quantity) {
        if (quantity <= 0) return 'out_of_stock';
        if (quantity <= this.config.criticalStockThreshold) return 'critical';
        if (quantity <= this.config.lowStockThreshold) return 'low';
        return 'in_stock';
    }

    updateStock(product, optionId, quantity, type = 'adjustment') {
        const option = product.ticketOptions.find(opt => opt.id === optionId);
        if (!option) return false;

        const oldQuantity = option.quantityAvailable;
        let newQuantity;

        switch (type) {
            case 'set':
                newQuantity = Math.max(0, quantity);
                break;
            case 'adjustment':
                newQuantity = Math.max(0, oldQuantity + quantity);
                break;
            default:
                return false;
        }

        option.quantityAvailable = newQuantity;
        this.checkStockThresholds(product, option);
        
        // Log inventory change
        this.logInventoryChange(product, option, oldQuantity, newQuantity, type);
        
        return true;
    }

    checkStockThresholds(product, option) {
        const stock = this.checkStock(product, option.id);
        
        if (stock.critical && this.config.enableStockNotifications) {
            this.sendStockNotification(product, option, 'critical');
        } else if (stock.lowStock && this.config.enableStockNotifications) {
            this.sendStockNotification(product, option, 'low');
        }

        if (stock.quantity === 0 && this.config.autoDisableOnStockOut) {
            option.enabled = false;
            this.sendStockNotification(product, option, 'out_of_stock');
        }
    }

    sendStockNotification(product, option, level) {
        const notifications = {
            critical: `Critical stock alert: ${product.title} - ${option.title} (${option.quantityAvailable} remaining)`,
            low: `Low stock warning: ${product.title} - ${option.title} (${option.quantityAvailable} remaining)`,
            out_of_stock: `Out of stock: ${product.title} - ${option.title}`
        };

        showNotification(notifications[level], 'warning');
        // In real app, would also send email/SMS notifications
    }

    logInventoryChange(product, option, oldQuantity, newQuantity, type) {
        const log = {
            timestamp: new Date().toISOString(),
            productId: product.id,
            productTitle: product.title,
            optionId: option.id,
            optionTitle: option.title,
            oldQuantity,
            newQuantity,
            change: newQuantity - oldQuantity,
            type,
            userId: 'admin' // In real app, would get from current user
        };

        console.log('Inventory Change Log:', log);
        // In real app, would save to database
    }
}

// Date Management System
class DateManager {
    constructor() {
        this.config = bookingConfig;
    }

    isDateAvailable(product, date) {
        if (!this.isWithinBookingWindow(date)) return false;
        if (this.isDisabledDate(product, date)) return false;
        if (this.isCutoffPassed(date)) return false;
        return true;
    }

    isWithinBookingWindow(date) {
        const now = new Date();
        const bookingDate = new Date(date);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + this.config.maxAdvanceBookingDays);

        // Check minimum advance booking hours
        const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
        if (hoursDiff < this.config.minAdvanceBookingHours) return false;

        // Check maximum advance booking days
        return bookingDate <= maxDate;
    }

    isDisabledDate(product, date) {
        if (!product.disabledDates) return false;
        return product.disabledDates.some(disabled => {
            const disabledDate = new Date(disabled);
            return disabledDate.toDateString() === new Date(date).toDateString();
        });
    }

    isCutoffPassed(date) {
        const now = new Date();
        const bookingDate = new Date(date);
        const cutoffTime = new Date(date);
        const [hours, minutes] = this.config.defaultCutoffTime.split(':');
        cutoffTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If booking for today, check if past cutoff time
        if (bookingDate.toDateString() === now.toDateString()) {
            return now > cutoffTime;
        }

        return false;
    }

    disableDate(product, date) {
        if (!product.disabledDates) product.disabledDates = [];
        const dateStr = new Date(date).toISOString().split('T')[0];
        if (!this.isDisabledDate(product, dateStr)) {
            product.disabledDates.push(dateStr);
            return true;
        }
        return false;
    }

    enableDate(product, date) {
        if (!product.disabledDates) return false;
        const dateStr = new Date(date).toISOString().split('T')[0];
        const index = product.disabledDates.indexOf(dateStr);
        if (index !== -1) {
            product.disabledDates.splice(index, 1);
            return true;
        }
        return false;
    }

    getAvailableDates(product, startDate, endDate) {
        const dates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            if (this.isDateAvailable(product, current)) {
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }
}

// Initialize managers
const inventoryManager = new InventoryManager();
const dateManager = new DateManager();

function renderProducts(productsToRender = products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = productsToRender.map(product => {
        // Get inventory status for each ticket option
        const inventoryStatuses = product.ticketOptions.map(option => {
            const stock = inventoryManager.checkStock(product, option.id);
            return {
                optionId: option.id,
                status: stock.status,
                quantity: stock.quantity,
                statusClass: 
                    stock.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                    stock.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                    stock.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
            };
        });

        // Check if any dates are available in the next 30 days
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        const availableDates = dateManager.getAvailableDates(product, today, nextMonth);
        const hasAvailableDates = availableDates.length > 0;

        return `
        <tr class="hover:bg-gray-50">
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3 ${product.enabled ? 'bg-green-500' : 'bg-red-500'}"></div>
                    <img src="${product.images[0]?.url}" alt="${product.title}" class="w-12 h-12 object-cover rounded-lg mr-3">
                    <div>
                        <div class="font-medium">${product.title}</div>
                        <div class="text-sm text-gray-500">${product.sku}</div>
                        ${!hasAvailableDates ? '<div class="text-xs text-red-600">No available dates</div>' : ''}
                    </div>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    ${productTypes[product.productType]?.categories[product.category] || product.category}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="text-sm">
                    <div class="font-medium">${product.country}</div>
                    <div class="text-gray-500">${product.city}</div>
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="text-sm space-y-2">
                    ${product.ticketOptions.map((option, index) => `
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="font-medium">$${option.pricing.adult.b2bPrice}</span>
                                <span class="text-gray-500 text-xs">(${option.title})</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="px-2 py-1 rounded-full text-xs ${inventoryStatuses[index].statusClass}">
                                    ${inventoryStatuses[index].quantity}
                                </span>
                                <div class="flex space-x-1">
                                    <button onclick="inventoryManager.updateStock(${product.id}, ${option.id}, 1)" 
                                            class="text-blue-600 hover:text-blue-800 text-xs">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                    <button onclick="inventoryManager.updateStock(${product.id}, ${option.id}, -1)" 
                                            class="text-red-600 hover:text-red-800 text-xs">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${product.status}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                    <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-800" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="duplicateProduct(${product.id})" class="text-green-600 hover:text-green-800" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="viewProduct(${product.id})" class="text-purple-600 hover:text-purple-800" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="openDateManager(${product.id})" class="text-yellow-600 hover:text-yellow-800" title="Manage Dates">
                        <i class="fas fa-calendar"></i>
                    </button>
                    <button onclick="openInventoryManager(${product.id})" class="text-indigo-600 hover:text-indigo-800" title="Manage Inventory">
                        <i class="fas fa-box"></i>
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-800" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

// Open product modal for add/edit
function openProductModal(productId = null) {
    const product = productId ? products.find(p => p.id === productId) : null;
    const isEdit = !!product;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-7xl mx-auto">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">${isEdit ? 'Edit' : 'Create New'} Product</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 max-h-[80vh] overflow-y-auto">
                    <form id="productForm" class="space-y-8">
                        <!-- Product Type Selection -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4">Product Type</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                ${Object.entries(productTypes).map(([key, type]) => `
                                    <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white ${product?.productType === key ? 'border-primary bg-white' : 'border-gray-300'}">
                                        <input type="radio" name="productType" value="${key}" ${product?.productType === key ? 'checked' : ''} 
                                               onchange="updateCategoryOptions(this.value)" class="mr-3">
                                        <span class="font-medium">${type.name}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Basic Information -->
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold">Basic Information</h3>
                            
                            <!-- Enable/Disable Switch -->
                            <div class="flex items-center">
                                <label class="flex items-center cursor-pointer">
                                    <input type="checkbox" name="enabled" ${product?.enabled ? 'checked' : ''} 
                                           class="sr-only">
                                    <div class="relative">
                                        <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
                                        <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                    </div>
                                    <span class="ml-3 text-gray-700 font-medium">Enable Product</span>
                                </label>
                            </div>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                                    <input type="text" name="title" value="${product?.title || ''}" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                                    <input type="text" name="sku" value="${product?.sku || ''}" required 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Supplier ID</label>
                                    <input type="text" name="supplierId" value="${product?.supplierId || ''}" 
                                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select name="category" id="categorySelect" required
                                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                        <option value="">Select Category</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Location -->
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold">Location</h3>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                    <select name="country" required onchange="updateCityOptions(this.value)"
                                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                        <option value="">Select Country</option>
                                        ${Object.keys(destinations).map(country => `
                                            <option value="${country}" ${product?.country === country ? 'selected' : ''}>
                                                ${country}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <select name="city" id="citySelect" required
                                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                        <option value="">Select City</option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <textarea name="address" rows="3" 
                                              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${product?.location?.address || ''}</textarea>
                                </div>
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                                        <input type="number" name="latitude" step="any" value="${product?.location?.coordinates?.latitude || ''}" 
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                                        <input type="number" name="longitude" step="any" value="${product?.location?.coordinates?.longitude || ''}" 
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Descriptions -->
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold">Descriptions</h3>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Short Description (2 lines) *</label>
                                <textarea name="shortDescription" required rows="2" 
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${product?.shortDescription || ''}</textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Activity Highlights</label>
                                <div id="highlightsContainer" class="space-y-2">
                                    ${(product?.highlights || ['']).map((highlight, index) => `
                                        <div class="flex items-center space-x-2">
                                            <input type="text" name="highlights[]" value="${highlight}" 
                                                   class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                                            <button type="button" onclick="removeHighlight(this)" class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-minus-circle"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                                <button type="button" onclick="addHighlight()" class="mt-2 text-primary hover:text-red-600">
                                    <i class="fas fa-plus-circle mr-1"></i> Add Highlight
                                </button>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
                                <textarea name="longDescription" rows="6" 
                                          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">${product?.longDescription || ''}</textarea>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4 pt-6 border-t">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600">
                                ${isEdit ? 'Update' : 'Create'} Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize form data if editing
    if (product) {
        updateCategoryOptions(product.productType);
        updateCityOptions(product.country);
        setTimeout(() => {
            document.querySelector(`select[name="category"]`).value = product.category;
            document.querySelector(`select[name="city"]`).value = product.city;
        }, 100);
    }
    
    // Form submission handler
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct(new FormData(this), productId);
    });
}

// Update category options based on product type
function updateCategoryOptions(productType) {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect || !productType) return;
    
    const categories = productTypes[productType]?.categories || {};
    categorySelect.innerHTML = '<option value="">Select Category</option>' +
        Object.entries(categories).map(([key, name]) => 
            `<option value="${key}">${name}</option>`
        ).join('');
}

// Update city options based on country
function updateCityOptions(country) {
    const citySelect = document.getElementById('citySelect');
    if (!citySelect || !country) return;
    
    const cities = destinations[country]?.cities || [];
    citySelect.innerHTML = '<option value="">Select City</option>' +
        cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

// Add/Remove highlight functions
function addHighlight() {
    const container = document.getElementById('highlightsContainer');
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" name="highlights[]" 
               class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
        <button type="button" onclick="removeHighlight(this)" class="text-red-600 hover:text-red-800">
            <i class="fas fa-minus-circle"></i>
        </button>
    `;
    container.appendChild(div);
}

function removeHighlight(button) {
    button.closest('div').remove();
}

// Save product function
// Product Management Functions
function saveProduct(formData, productId = null) {
    const productData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['title', 'sku', 'category', 'country', 'city'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
        showNotification(`Missing required fields: ${missingFields.join(', ')}`, 'error');
        return;
    }

    // Create or update product
    const product = productId ? 
        { ...products.find(p => p.id === productId), ...productData } :
        { 
            id: generateUniqueId(),
            ...productData,
            enabled: formData.get('enabled') === 'on',
            createdAt: new Date().toISOString()
        };

    product.updatedAt = new Date().toISOString();

    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        products[index] = product;
    } else {
        products.push(product);
    }

    showNotification(`Product ${productId ? 'updated' : 'created'} successfully`, 'success');
    document.querySelector('.fixed')?.remove();
    renderProducts();
}

// Product Actions
function editProduct(id) { 
    openProductModal(id); 
}

function duplicateProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const duplicate = {
        ...product,
        id: generateUniqueId(),
        title: `${product.title} (Copy)`,
        sku: `${product.sku}-COPY`,
        enabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    products.push(duplicate);
    renderProducts();
    showNotification('Product duplicated successfully', 'success');
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        renderProducts();
        showNotification('Product deleted successfully', 'success');
    }
}

function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-4xl mx-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">View Product</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-6 max-h-[80vh] overflow-y-auto">
                    ${generateProductView(product)}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Toggle product status (enable/disable)
function toggleProductStatus(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    product.enabled = !product.enabled;
    product.updatedAt = new Date().toISOString();
    
    renderProducts();
    showNotification(`Product ${product.enabled ? 'enabled' : 'disabled'} successfully`, 'success');
}

// Inventory Management
function updateInventory(productId, ticketOptionId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const option = product.ticketOptions.find(opt => opt.id === ticketOptionId);
    if (!option) return;

    option.quantityAvailable = Math.max(0, option.quantityAvailable + quantity);
    product.updatedAt = new Date().toISOString();

    renderProducts();
    showNotification('Inventory updated successfully', 'success');
}

// Disable specific dates
function updateDisabledDates(productId, dates) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    product.disabledDates = dates;
    product.updatedAt = new Date().toISOString();

    renderProducts();
    showNotification('Disabled dates updated successfully', 'success');
}

// Generate unique ID
function generateUniqueId() {
    return 'pid_' + Math.random().toString(36).substr(2, 9);
}

// Generate product view
function generateProductView(product) {
    return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-semibold">${product.title}</h3>
                    <p class="text-gray-500">SKU: ${product.sku}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-sm ${
                    product.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${product.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-medium mb-2">Category</h4>
                    <p>${productTypes[product.productType]?.categories[product.category] || product.category}</p>
                </div>
                <div>
                    <h4 class="font-medium mb-2">Location</h4>
                    <p>${product.city}, ${product.country}</p>
                </div>
            </div>

            <div>
                <h4 class="font-medium mb-2">Description</h4>
                <p class="text-gray-700">${product.shortDescription}</p>
            </div>

            ${product.highlights ? `
                <div>
                    <h4 class="font-medium mb-2">Highlights</h4>
                    <ul class="list-disc pl-5 space-y-1">
                        ${product.highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div>
                <h4 class="font-medium mb-2">Ticket Options</h4>
                <div class="space-y-4">
                    ${product.ticketOptions.map(option => `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h5 class="font-medium">${option.title}</h5>
                                    <p class="text-sm text-gray-500">SKU: ${option.childSku}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-medium">Adult: ${formatPrice(option.pricing.adult.b2bPrice)}</p>
                                    <p class="text-sm">Child: ${formatPrice(option.pricing.child.b2bPrice)}</p>
                                </div>
                            </div>
                            <div class="mt-2 flex items-center">
                                <span class="text-sm text-gray-600">Available: ${option.quantityAvailable}</span>
                                <button onclick="updateInventory(${product.id}, ${option.id}, 1)" 
                                        class="ml-2 text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-plus-circle"></i>
                                </button>
                                <button onclick="updateInventory(${product.id}, ${option.id}, -1)"
                                        class="ml-1 text-red-600 hover:text-red-800">
                                    <i class="fas fa-minus-circle"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="border-t pt-6">
                <p class="text-sm text-gray-500">
                    Created: ${formatDate(product.createdAt)}<br>
                    Last Updated: ${formatDate(product.updatedAt)}
                </p>
            </div>
        </div>
    `;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED'
    }).format(price);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Date Manager Modal
function openDateManager(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-4xl mx-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">Date Management - ${product.title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Calendar View -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Calendar</h3>
                            <div id="dateCalendar" class="border rounded-lg p-4">
                                <!-- Calendar will be initialized here -->
                            </div>
                        </div>
                        
                        <!-- Date Settings -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Date Settings</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Booking Window
                                    </label>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs text-gray-500">Min Hours Before</label>
                                            <input type="number" value="${bookingConfig.minAdvanceBookingHours}"
                                                   class="w-full p-2 border rounded-lg" 
                                                   onchange="updateBookingWindow('min', this.value)">
                                        </div>
                                        <div>
                                            <label class="block text-xs text-gray-500">Max Days Ahead</label>
                                            <input type="number" value="${bookingConfig.maxAdvanceBookingDays}"
                                                   class="w-full p-2 border rounded-lg"
                                                   onchange="updateBookingWindow('max', this.value)">
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Cutoff Time
                                    </label>
                                    <input type="time" value="${bookingConfig.defaultCutoffTime}"
                                           class="w-full p-2 border rounded-lg"
                                           onchange="updateCutoffTime(this.value)">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Disabled Dates
                                    </label>
                                    <div class="max-h-48 overflow-y-auto border rounded-lg p-2">
                                        ${(product.disabledDates || []).map(date => `
                                            <div class="flex items-center justify-between py-1">
                                                <span>${new Date(date).toLocaleDateString()}</span>
                                                <button onclick="dateManager.enableDate('${product.id}', '${date}')"
                                                        class="text-red-600 hover:text-red-800">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    initializeDateCalendar(product);
}

// Inventory Manager Modal
function openInventoryManager(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-4xl mx-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">Inventory Management - ${product.title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Inventory Overview -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Inventory Overview</h3>
                            <div class="space-y-4">
                                ${product.ticketOptions.map(option => {
                                    const stock = inventoryManager.checkStock(product, option.id);
                                    return `
                                        <div class="border rounded-lg p-4">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 class="font-medium">${option.title}</h4>
                                                    <p class="text-sm text-gray-500">SKU: ${option.childSku}</p>
                                                </div>
                                                <span class="px-2 py-1 rounded-full text-xs ${
                                                    stock.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                                                    stock.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                                                    stock.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }">
                                                    ${stock.quantity} available
                                                </span>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <input type="number" min="0" value="${stock.quantity}"
                                                       class="w-24 p-2 border rounded-lg"
                                                       id="stock-${option.id}">
                                                <button onclick="updateInventoryQuantity('${product.id}', '${option.id}')"
                                                        class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- Inventory Settings -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Inventory Settings</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Low Stock Threshold
                                    </label>
                                    <input type="number" value="${inventoryConfig.lowStockThreshold}"
                                           class="w-full p-2 border rounded-lg"
                                           onchange="updateInventoryThreshold('low', this.value)">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Critical Stock Threshold
                                    </label>
                                    <input type="number" value="${inventoryConfig.criticalStockThreshold}"
                                           class="w-full p-2 border rounded-lg"
                                           onchange="updateInventoryThreshold('critical', this.value)">
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" id="autoDisableStockOut"
                                           ${inventoryConfig.autoDisableOnStockOut ? 'checked' : ''}
                                           onchange="toggleInventoryOption('autoDisable', this.checked)">
                                    <label for="autoDisableStockOut" class="text-sm text-gray-700">
                                        Auto-disable when out of stock
                                    </label>
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" id="enableNotifications"
                                           ${inventoryConfig.enableStockNotifications ? 'checked' : ''}
                                           onchange="toggleInventoryOption('notifications', this.checked)">
                                    <label for="enableNotifications" class="text-sm text-gray-700">
                                        Enable stock notifications
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update inventory quantity
function updateInventoryQuantity(productId, optionId) {
    const quantity = parseInt(document.getElementById(`stock-${optionId}`).value);
    if (isNaN(quantity) || quantity < 0) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }

    inventoryManager.updateStock(productId, optionId, quantity, 'set');
    renderProducts();
}

// Update inventory thresholds
function updateInventoryThreshold(type, value) {
    const threshold = parseInt(value);
    if (isNaN(threshold) || threshold < 0) {
        showNotification('Please enter a valid threshold', 'error');
        return;
    }

    if (type === 'low') {
        inventoryConfig.lowStockThreshold = threshold;
    } else {
        inventoryConfig.criticalStockThreshold = threshold;
    }
    
    renderProducts();
}

// Toggle inventory options
function toggleInventoryOption(option, enabled) {
    switch(option) {
        case 'autoDisable':
            inventoryConfig.autoDisableOnStockOut = enabled;
            break;
        case 'notifications':
            inventoryConfig.enableStockNotifications = enabled;
            break;
    }
}

// Update booking window
function updateBookingWindow(type, value) {
    const val = parseInt(value);
    if (isNaN(val) || val < 0) {
        showNotification('Please enter a valid value', 'error');
        return;
    }

    if (type === 'min') {
        bookingConfig.minAdvanceBookingHours = val;
    } else {
        bookingConfig.maxAdvanceBookingDays = val;
    }
}

// Update cutoff time
function updateCutoffTime(time) {
    bookingConfig.defaultCutoffTime = time;
}

// Calendar Management
function initializeDateCalendar(product) {
    const calendar = document.getElementById('dateCalendar');
    if (!calendar) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Generate calendar HTML
    calendar.innerHTML = generateCalendarHTML(currentMonth, currentYear, product);

    // Add navigation event listeners
    document.getElementById('prevMonth').addEventListener('click', () => {
        const [month, year] = getPreviousMonth(currentMonth, currentYear);
        calendar.innerHTML = generateCalendarHTML(month, year, product);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        const [month, year] = getNextMonth(currentMonth, currentYear);
        calendar.innerHTML = generateCalendarHTML(month, year, product);
    });
}

function generateCalendarHTML(month, year, product) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

    let html = `
        <div class="calendar">
            <!-- Calendar Header -->
            <div class="flex justify-between items-center mb-4">
                <button id="prevMonth" class="text-gray-600 hover:text-gray-800">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h4 class="text-lg font-semibold">${monthNames[month]} ${year}</h4>
                <button id="nextMonth" class="text-gray-600 hover:text-gray-800">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
                <!-- Weekday Headers -->
                <div class="text-center font-medium text-sm py-2">Sun</div>
                <div class="text-center font-medium text-sm py-2">Mon</div>
                <div class="text-center font-medium text-sm py-2">Tue</div>
                <div class="text-center font-medium text-sm py-2">Wed</div>
                <div class="text-center font-medium text-sm py-2">Thu</div>
                <div class="text-center font-medium text-sm py-2">Fri</div>
                <div class="text-center font-medium text-sm py-2">Sat</div>
    `;

    // Fill in empty cells before start of month
    for (let i = 0; i < startingDay; i++) {
        html += '<div class="text-center py-2 text-gray-400"></div>';
    }

    // Fill in days of month
    for (let day = 1; day <= monthLength; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isDisabled = dateManager.isDisabledDate(product, date);
        const isAvailable = dateManager.isDateAvailable(product, date);
        const isPast = date < new Date();

        html += `
            <div class="relative">
                <button onclick="toggleDate('${product.id}', '${dateStr}')"
                        class="w-full h-full min-h-[2.5rem] text-sm ${
                            isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            isDisabled ? 'bg-red-100 text-red-800' :
                            isAvailable ? 'hover:bg-blue-50' : 'bg-yellow-100 text-yellow-800'
                        } rounded-lg">
                    ${day}
                    ${isDisabled ? '<i class="fas fa-ban text-xs"></i>' : ''}
                </button>
            </div>
        `;
    }

    // Fill in empty cells after end of month
    const totalCells = Math.ceil((startingDay + monthLength) / 7) * 7;
    for (let i = startingDay + monthLength; i < totalCells; i++) {
        html += '<div class="text-center py-2 text-gray-400"></div>';
    }

    html += '</div></div>';
    return html;
}

function getPreviousMonth(month, year) {
    if (month === 0) {
        return [11, year - 1];
    }
    return [month - 1, year];
}

function getNextMonth(month, year) {
    if (month === 11) {
        return [0, year + 1];
    }
    return [month + 1, year];
}

function toggleDate(productId, dateStr) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const date = new Date(dateStr);
    if (date < new Date()) {
        showNotification('Cannot modify past dates', 'error');
        return;
    }

    if (dateManager.isDisabledDate(product, dateStr)) {
        if (dateManager.enableDate(product, dateStr)) {
            showNotification('Date enabled successfully', 'success');
        }
    } else {
        if (dateManager.disableDate(product, dateStr)) {
            showNotification('Date disabled successfully', 'success');
        }
    }

    // Refresh calendar
    initializeDateCalendar(product);
    // Refresh product list to update availability indicators
    renderProducts();
}

// Bulk Operations
function bulkUpdateInventory(productIds, action) {
    const products = productIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (products.length === 0) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-2xl mx-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">Bulk Inventory Update</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <p class="text-gray-600">Update inventory for ${products.length} selected products:</p>
                        
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">
                                Action
                            </label>
                            <select id="bulkAction" class="w-full p-2 border rounded-lg">
                                <option value="set">Set to specific quantity</option>
                                <option value="adjust">Adjust by quantity</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <input type="number" id="bulkQuantity" class="w-full p-2 border rounded-lg">
                        </div>

                        <div class="pt-4 flex justify-end space-x-3">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onclick="executeBulkInventoryUpdate('${products.map(p => p.id).join(',')}')"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Update Inventory
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function executeBulkInventoryUpdate(productIds) {
    const action = document.getElementById('bulkAction').value;
    const quantity = parseInt(document.getElementById('bulkQuantity').value);
    
    if (isNaN(quantity)) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }

    const ids = productIds.split(',');
    let updated = 0;

    ids.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        product.ticketOptions.forEach(option => {
            inventoryManager.updateStock(product, option.id, quantity, action);
            updated++;
        });
    });

    document.querySelector('.fixed').remove();
    showNotification(`Updated inventory for ${updated} ticket options`, 'success');
    renderProducts();
}

function bulkUpdateDates(productIds, action) {
    const products = productIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (products.length === 0) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="min-h-screen px-4 py-8">
            <div class="bg-white rounded-lg max-w-2xl mx-auto">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-2xl font-bold">Bulk Date Update</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <p class="text-gray-600">Update dates for ${products.length} selected products:</p>
                        
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">
                                Date Range
                            </label>
                            <div class="grid grid-cols-2 gap-4">
                                <input type="date" id="bulkStartDate" class="w-full p-2 border rounded-lg">
                                <input type="date" id="bulkEndDate" class="w-full p-2 border rounded-lg">
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">
                                Action
                            </label>
                            <select id="bulkDateAction" class="w-full p-2 border rounded-lg">
                                <option value="disable">Disable dates</option>
                                <option value="enable">Enable dates</option>
                            </select>
                        </div>

                        <div class="pt-4 flex justify-end space-x-3">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onclick="executeBulkDateUpdate('${products.map(p => p.id).join(',')}')"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Update Dates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function executeBulkDateUpdate(productIds) {
    const startDate = new Date(document.getElementById('bulkStartDate').value);
    const endDate = new Date(document.getElementById('bulkEndDate').value);
    const action = document.getElementById('bulkDateAction').value;
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        showNotification('Please select valid dates', 'error');
        return;
    }

    if (endDate < startDate) {
        showNotification('End date must be after start date', 'error');
        return;
    }

    const ids = productIds.split(',');
    let updated = 0;

    ids.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const current = new Date(startDate);
        while (current <= endDate) {
            if (action === 'disable') {
                if (dateManager.disableDate(product, current)) updated++;
            } else {
                if (dateManager.enableDate(product, current)) updated++;
            }
            current.setDate(current.getDate() + 1);
        }
    });

    document.querySelector('.fixed').remove();
    showNotification(`${action === 'disable' ? 'Disabled' : 'Enabled'} ${updated} dates`, 'success');
    renderProducts();
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
    renderProducts();
    
    // Add CSS for toggle switch and form styling
    const style = document.createElement('style');
    style.textContent = `
        /* Toggle Switch */
        .dot {
            transition: transform 0.3s ease-in-out;
        }
        input[type="checkbox"]:checked ~ div > .dot {
            transform: translateX(100%);
        }
        input[type="checkbox"]:checked ~ div {
            background-color: #ef4444;
        }
        
        /* Form Focus Styles */
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
        
        /* Radio Button Styles */
        input[type="radio"]:checked + span {
            color: #ef4444;
        }
        
        /* Modal Animation */
        .fixed {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other modules
window.ProductManagement = {
    products,
    productTypes,
    destinations,
    openProductModal,
    editProduct,
    duplicateProduct,
    deleteProduct,
    viewProduct
};
