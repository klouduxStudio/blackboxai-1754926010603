// Product Form Component
import { categoryManagement } from './category-management.js';
import { productMetadata } from './product-metadata.js';
import { productManager } from './product-management.js';

class ProductForm {
    constructor() {
        this.destinations = {
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
    }

    // Initialize form
    init() {
        this.setupEventListeners();
        this.setupValidation();
    }

    // Setup event listeners
    setupEventListeners() {
        // Product type change
        document.getElementById('productType').addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });

        // Country change
        document.getElementById('country').addEventListener('change', (e) => {
            this.updateCityOptions(e.target.value);
        });

        // Form submission
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });
    }

    // Update category options based on product type
    updateCategoryOptions(productType) {
        const categorySelect = document.getElementById('category');
        const categories = categoryManagement.getEnabledProductTypes()[productType]?.categories || {};

        categorySelect.innerHTML = `
            <option value="">Select Category</option>
            ${Object.entries(categories).map(([id, category]) => `
                <option value="${id}">${category.name}</option>
            `).join('')}
        `;
    }

    // Update city options based on country
    updateCityOptions(country) {
        const citySelect = document.getElementById('citySelect');
        const cities = this.destinations[country]?.cities || [];

        citySelect.innerHTML = `
            <option value="">Select City</option>
            ${cities.map(city => `
                <option value="${city}">${city}</option>
            `).join('')}
        `;
    }

    // Handle form submission
    async handleSubmit(event) {
        const formData = new FormData(event.target);
        const productData = this.processFormData(formData);

        try {
            if (productData.id) {
                await productManager.updateProduct(productData.id, productData);
                showNotification('Product updated successfully', 'success');
            } else {
                await productManager.createProduct(productData);
                showNotification('Product created successfully', 'success');
            }

            // Close modal and refresh list
            closeProductModal();
            refreshProductList();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    // Process form data
    processFormData(formData) {
        return {
            id: formData.get('id') || undefined,
            title: formData.get('title'),
            sku: formData.get('sku'),
            productType: formData.get('productType'),
            category: formData.get('category'),
            country: formData.get('country'),
            city: formData.get('city'),
            shortDescription: formData.get('shortDescription'),
            longDescription: formData.get('longDescription'),
            enabled: formData.get('enabled') === 'on',
            featured: formData.get('featured') === 'on',
            location: {
                coordinates: {
                    latitude: parseFloat(formData.get('latitude')) || null,
                    longitude: parseFloat(formData.get('longitude')) || null
                }
            },
            metadata: {
                goodFor: formData.getAll('goodFor'),
                cancellationPolicy: formData.get('cancellationPolicy'),
                duration: formData.get('duration'),
                transfer: formData.get('transfer'),
                languages: formData.getAll('languages'),
                wheelchairAccessible: formData.get('wheelchairAccessible') === 'on',
                featureTags: formData.getAll('featureTags')
            }
        };
    }

    // Setup form validation
    setupValidation() {
        const form = document.getElementById('productForm');
        
        // Add validation classes to required fields
        form.querySelectorAll('[required]').forEach(field => {
            field.addEventListener('invalid', (e) => {
                e.preventDefault();
                field.classList.add('border-red-500');
            });

            field.addEventListener('input', () => {
                if (field.validity.valid) {
                    field.classList.remove('border-red-500');
                }
            });
        });
    }

    // Generate form HTML
    generateForm(product = null) {
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
                            <select name="productType" required id="productType"
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
                            <select name="category" required id="category"
                                    class="mt-1 block w-full rounded-md border-gray-300">
                                <option value="">Select Category</option>
                                ${product?.productType ? Object.entries(types[product.productType].categories).map(([id, category]) => `
                                    <option value="${id}" ${product?.category === id ? 'selected' : ''}>
                                        ${category.name}
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
                    ${productMetadata.generateMetadataForm(product?.metadata)}
                </div>

                <!-- Location -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium">Location</h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Country</label>
                            <select name="country" required id="country"
                                    class="mt-1 block w-full rounded-md border-gray-300">
                                <option value="">Select Country</option>
                                ${Object.keys(this.destinations).map(country => `
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
                                ${product?.country ? this.destinations[product.country].cities.map(city => `
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

// Initialize and export
const productForm = new ProductForm();
export { productForm };
