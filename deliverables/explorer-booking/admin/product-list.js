// Product List Component
import { categoryManagement } from './category-management.js';
import { productMetadata } from './product-metadata.js';
import { productManager } from './product-management.js';
import { productForm } from './product-form.js';

class ProductList {
    constructor() {
        this.filters = {
            type: '',
            category: '',
            country: '',
            city: '',
            status: '',
            featured: false,
            search: ''
        };
        this.sort = {
            field: 'createdAt',
            direction: 'desc'
        };
    }

    // Initialize list
    init() {
        this.setupEventListeners();
        this.render();
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter changes
        document.getElementById('filterType').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.updateCategoryFilter();
            this.render();
        });

        document.getElementById('filterCategory').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.render();
        });

        document.getElementById('filterCountry').addEventListener('change', (e) => {
            this.filters.country = e.target.value;
            this.updateCityFilter();
            this.render();
        });

        document.getElementById('filterCity').addEventListener('change', (e) => {
            this.filters.city = e.target.value;
            this.render();
        });

        document.getElementById('filterStatus').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.render();
        });

        document.getElementById('filterFeatured').addEventListener('change', (e) => {
            this.filters.featured = e.target.checked;
            this.render();
        });

        // Search input
        document.getElementById('searchProducts').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.render();
        });

        // Sort changes
        document.getElementById('sortField').addEventListener('change', (e) => {
            this.sort.field = e.target.value;
            this.render();
        });

        document.getElementById('sortDirection').addEventListener('change', (e) => {
            this.sort.direction = e.target.value;
            this.render();
        });
    }

    // Update category filter based on selected type
    updateCategoryFilter() {
        const categorySelect = document.getElementById('filterCategory');
        const categories = categoryManagement.getEnabledProductTypes()[this.filters.type]?.categories || {};

        categorySelect.innerHTML = `
            <option value="">All Categories</option>
            ${Object.entries(categories).map(([id, category]) => `
                <option value="${id}">${category.name}</option>
            `).join('')}
        `;
    }

    // Update city filter based on selected country
    updateCityFilter() {
        const citySelect = document.getElementById('filterCity');
        const cities = productManager.destinations[this.filters.country]?.cities || [];

        citySelect.innerHTML = `
            <option value="">All Cities</option>
            ${cities.map(city => `
                <option value="${city}">${city}</option>
