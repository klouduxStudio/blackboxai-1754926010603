// Product Metadata and Tagging System

class ProductMetadataSystem {
    constructor() {
        // Quick Info Tag Options
        this.goodForOptions = [
            { id: 'solo', label: 'Solo', icon: 'fa-user' },
            { id: 'couple', label: 'Couple', icon: 'fa-heart' },
            { id: 'families', label: 'Families', icon: 'fa-users' },
            { id: 'friends', label: 'Friends', icon: 'fa-user-friends' },
            { id: 'groups', label: 'Groups', icon: 'fa-users-line' },
            { id: 'seniors', label: 'Seniors', icon: 'fa-person-cane' }
        ];

        // Cancellation Policy Options
        this.cancellationPolicyOptions = [
            { id: 'no_cancellation', label: 'No Cancellation' },
            { id: 'free_cancellation', label: 'Free Cancellation' }
        ];

        // Transfer Options
        this.transferOptions = [
            { id: 'sharing', label: 'Sharing' },
            { id: 'private', label: 'Private' },
            { id: 'optional', label: 'Optional' },
            { id: 'available', label: 'Available' },
            { id: 'not_available', label: 'Not Available' }
        ];

        // Language Options
        this.languageOptions = [
            { id: 'en', label: 'English', icon: 'gb' },
            { id: 'ar', label: 'Arabic', icon: 'sa' }
        ];

        // Feature Tags Configuration
        this.featureTags = [
            {
                id: 'explorers_choice',
                label: "Explorer's Choice",
                icon: 'fa-award',
                color: 'bg-purple-100 text-purple-800'
            },
            {
                id: 'most_visited',
                label: 'Most-Visited',
                icon: 'fa-fire',
                color: 'bg-red-100 text-red-800'
            },
            {
                id: 'offers_available',
                label: 'Offers Available',
                icon: 'fa-tag',
                color: 'bg-green-100 text-green-800'
            },
            {
                id: 'popular',
                label: 'Popular',
                icon: 'fa-star',
                color: 'bg-yellow-100 text-yellow-800'
            },
            {
                id: 'handpicked',
                label: 'Handpicked',
                icon: 'fa-hand-holding-heart',
                color: 'bg-pink-100 text-pink-800'
            },
            {
                id: 'must_visit',
                label: 'Must Visit',
                icon: 'fa-location-dot',
                color: 'bg-blue-100 text-blue-800'
            },
            {
                id: 'combo_offer',
                label: 'Combo Offer',
                icon: 'fa-boxes',
                color: 'bg-indigo-100 text-indigo-800'
            },
            {
                id: 'reduced_prices',
                label: 'Reduced Prices',
                icon: 'fa-percent',
                color: 'bg-orange-100 text-orange-800'
            }
        ];

        // Custom Tags Storage
        this.customTags = [];
    }

    // Add metadata to product
    addMetadata(product, metadata) {
        return {
            ...product,
            metadata: {
                goodFor: metadata.goodFor || [],
                cancellationPolicy: metadata.cancellationPolicy,
                duration: metadata.duration,
                transfer: metadata.transfer,
                languages: metadata.languages || [],
                wheelchairAccessible: metadata.wheelchairAccessible || false,
                rating: metadata.rating || 0,
                featureTags: metadata.featureTags || []
            }
        };
    }

    // Add custom tag
    addCustomTag(tag) {
        if (!tag.id || !tag.label || !tag.color) {
            throw new Error('Invalid tag configuration');
        }

        const newTag = {
            id: tag.id,
            label: tag.label,
            icon: tag.icon || 'fa-tag',
            color: tag.color
        };

        this.customTags.push(newTag);
        return newTag;
    }

    // Get all available tags
    getAllTags() {
        return [...this.featureTags, ...this.customTags];
    }

    // Get tag by ID
    getTag(tagId) {
        return [...this.featureTags, ...this.customTags].find(tag => tag.id === tagId);
    }

    // Format duration
    formatDuration(duration) {
        if (!duration) return '';
        return duration.toString();
    }

    // Generate metadata HTML
    generateMetadataHTML(metadata) {
        const html = [];

        // Good For Tags
        if (metadata.goodFor && metadata.goodFor.length > 0) {
            const goodForHtml = metadata.goodFor.map(id => {
                const option = this.goodForOptions.find(opt => opt.id === id);
                if (!option) return '';
                return `
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        <i class="fas ${option.icon} mr-1"></i>
                        ${option.label}
                    </span>
                `;
            }).join('');
            html.push(`
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium">Good for:</span>
                    <div class="flex flex-wrap gap-2">
                        ${goodForHtml}
                    </div>
                </div>
            `);
        }

        // Cancellation Policy
        if (metadata.cancellationPolicy) {
            const policy = this.cancellationPolicyOptions.find(p => p.id === metadata.cancellationPolicy);
            if (policy) {
                html.push(`
                    <div class="flex items-center">
                        <i class="fas fa-calendar-xmark mr-2"></i>
                        <span class="text-sm">${policy.label}</span>
                    </div>
                `);
            }
        }

        // Duration
        if (metadata.duration) {
            html.push(`
                <div class="flex items-center">
                    <i class="fas fa-clock mr-2"></i>
                    <span class="text-sm">${this.formatDuration(metadata.duration)}</span>
                </div>
            `);
        }

        // Transfer
        if (metadata.transfer) {
            const transfer = this.transferOptions.find(t => t.id === metadata.transfer);
            if (transfer) {
                html.push(`
                    <div class="flex items-center">
                        <i class="fas fa-car mr-2"></i>
                        <span class="text-sm">Transfer: ${transfer.label}</span>
                    </div>
                `);
            }
        }

        // Languages
        if (metadata.languages && metadata.languages.length > 0) {
            const languagesHtml = metadata.languages.map(id => {
                const lang = this.languageOptions.find(l => l.id === id);
                if (!lang) return '';
                return `
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        <span class="fi fi-${lang.icon} mr-1"></span>
                        ${lang.label}
                    </span>
                `;
            }).join('');
            html.push(`
                <div class="flex items-center space-x-2">
                    <i class="fas fa-language mr-2"></i>
                    <div class="flex flex-wrap gap-2">
                        ${languagesHtml}
                    </div>
                </div>
            `);
        }

        // Wheelchair Accessible
        if (metadata.wheelchairAccessible) {
            html.push(`
                <div class="flex items-center">
                    <i class="fas fa-wheelchair mr-2"></i>
                    <span class="text-sm">Wheelchair Accessible</span>
                </div>
            `);
        }

        // Rating
        if (metadata.rating) {
            const stars = '★'.repeat(Math.floor(metadata.rating)) + '☆'.repeat(5 - Math.floor(metadata.rating));
            html.push(`
                <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">${stars}</span>
                    <span class="text-sm">${metadata.rating.toFixed(1)}</span>
                </div>
            `);
        }

        // Feature Tags
        if (metadata.featureTags && metadata.featureTags.length > 0) {
            const tagsHtml = metadata.featureTags.map(tagId => {
                const tag = this.getTag(tagId);
                if (!tag) return '';
                return `
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs ${tag.color}">
                        <i class="fas ${tag.icon} mr-1"></i>
                        ${tag.label}
                    </span>
                `;
            }).join('');
            html.push(`
                <div class="flex flex-wrap gap-2 mt-2">
                    ${tagsHtml}
                </div>
            `);
        }

        return html.join('\n');
    }

    // Generate metadata form fields
    generateMetadataForm() {
        return `
            <!-- Good For -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Good For</label>
                <div class="grid grid-cols-2 gap-2">
                    ${this.goodForOptions.map(option => `
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="goodFor" value="${option.id}" class="rounded border-gray-300">
                            <span class="ml-2">
                                <i class="fas ${option.icon} mr-1"></i>
                                ${option.label}
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- Cancellation Policy -->
            <div>
                <label class="block text-sm font-medium text-gray-700">Cancellation Policy</label>
                <select name="cancellationPolicy" class="mt-1 block w-full rounded-md border-gray-300">
                    <option value="">Select Policy</option>
                    ${this.cancellationPolicyOptions.map(policy => `
                        <option value="${policy.id}">${policy.label}</option>
                    `).join('')}
                </select>
            </div>

            <!-- Duration -->
            <div>
                <label class="block text-sm font-medium text-gray-700">Duration</label>
                <input type="text" name="duration" placeholder="e.g., 2 hours" 
                       class="mt-1 block w-full rounded-md border-gray-300">
            </div>

            <!-- Transfer -->
            <div>
                <label class="block text-sm font-medium text-gray-700">Transfer</label>
                <select name="transfer" class="mt-1 block w-full rounded-md border-gray-300">
                    <option value="">Select Transfer Option</option>
                    ${this.transferOptions.map(option => `
                        <option value="${option.id}">${option.label}</option>
                    `).join('')}
                </select>
            </div>

            <!-- Languages -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Languages</label>
                <div class="grid grid-cols-2 gap-2">
                    ${this.languageOptions.map(lang => `
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="languages" value="${lang.id}" class="rounded border-gray-300">
                            <span class="ml-2">
                                <span class="fi fi-${lang.icon} mr-1"></span>
                                ${lang.label}
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- Wheelchair Accessible -->
            <div>
                <label class="inline-flex items-center">
                    <input type="checkbox" name="wheelchairAccessible" class="rounded border-gray-300">
                    <span class="ml-2">Wheelchair Accessible</span>
                </label>
            </div>

            <!-- Feature Tags -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Feature Tags</label>
                <div class="grid grid-cols-2 gap-2">
                    ${this.getAllTags().map(tag => `
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="featureTags" value="${tag.id}" class="rounded border-gray-300">
                            <span class="ml-2">
                                <i class="fas ${tag.icon} mr-1"></i>
                                ${tag.label}
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Initialize metadata system
const productMetadata = new ProductMetadataSystem();

// Export for use in other modules
export { productMetadata };
