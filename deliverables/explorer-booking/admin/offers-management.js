// Enhanced Offer Management System

class OfferManagementSystem {
    constructor() {
        this.offers = [];
        this.coupons = [];
        
        // Offer Types Configuration
        this.offerTypes = {
            FLAT_DISCOUNT: 'flat_discount',
            PERCENTAGE_DISCOUNT: 'percentage_discount',
            BOGO: 'buy_one_get_one',
            BOGO_DISCOUNT: 'buy_one_get_discount',
            BUY_2_GET_1: 'buy_2_get_1'
        };

        // Targeting Conditions Configuration
        this.targetingTypes = {
            USER: 'user',
            USER_GROUP: 'user_group',
            PRODUCT: 'product',
            PRODUCT_VARIATION: 'product_variation',
            PRODUCT_TYPE: 'product_type',
            DESTINATION: 'destination',
            CATEGORY: 'category'
        };

        // Status Types
        this.statusTypes = {
            ACTIVE: 'active',
            INACTIVE: 'inactive',
            EXPIRED: 'expired',
            EXHAUSTED: 'exhausted'
        };
    }

    // Create new offer
    createOffer({
        title,
        description,
        offerType,
        value,
        targeting,
        startDate,
        endDate,
        usageLimit,
        usagePerCustomer,
        enabled = true
    }) {
        const offer = {
            id: 'OFF_' + Math.random().toString(36).substr(2, 9),
            title,
            description,
            offerType,
            value,
            targeting,
            startDate,
            endDate,
            usageLimit,
            usagePerCustomer,
            enabled,
            usageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.validateOffer(offer);
        this.offers.push(offer);
        return offer;
    }

    // Validate offer configuration
    validateOffer(offer) {
        if (!offer.title) throw new Error('Offer title is required');
        if (!offer.offerType) throw new Error('Offer type is required');
        if (!offer.value) throw new Error('Offer value is required');
        if (!offer.startDate || !offer.endDate) throw new Error('Offer dates are required');
        if (new Date(offer.startDate) > new Date(offer.endDate)) {
            throw new Error('End date must be after start date');
        }
    }

    // Create new coupon
    createCoupon({
        title,
        description,
        code,
        offerType,
        value,
        targeting,
        startDate,
        endDate,
        usageLimit,
        usagePerCustomer,
        usagePerCoupon,
        enabled = true,
        bulkGeneration = null
    }) {
        // Handle bulk generation if enabled
        if (bulkGeneration) {
            return this.generateBulkCoupons({
                title,
                description,
                offerType,
                value,
                targeting,
                startDate,
                endDate,
                usageLimit,
                usagePerCustomer,
                usagePerCoupon,
                enabled,
                ...bulkGeneration
            });
        }

        const coupon = {
            id: 'CPN_' + Math.random().toString(36).substr(2, 9),
            title,
            description,
            code: code || this.generateCouponCode(),
            offerType,
            value,
            targeting,
            startDate,
            endDate,
            usageLimit,
            usagePerCustomer,
            usagePerCoupon,
            enabled,
            usageCount: 0,
            usageHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.validateCoupon(coupon);
        this.coupons.push(coupon);
        return coupon;
    }

    // Generate bulk coupons
    generateBulkCoupons({
        quantity,
        prefix,
        suffix,
        separator,
        codeLength,
        codeFormat,
        ...couponConfig
    }) {
        const generatedCoupons = [];
        
        for (let i = 0; i < quantity; i++) {
            const code = this.generateFormattedCode(prefix, suffix, separator, codeLength, codeFormat);
            const coupon = this.createCoupon({
                ...couponConfig,
                code
            });
            generatedCoupons.push(coupon);
        }

        return generatedCoupons;
    }

    // Generate formatted coupon code
    generateFormattedCode(prefix = '', suffix = '', separator = '-', length = 8, format = 'alphanumeric') {
        let characters = '';
        switch (format) {
            case 'alphabetical':
                characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'numerical':
                characters = '0123456789';
                break;
            case 'alphanumeric':
            default:
                characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                break;
        }

        let code = '';
        for (let i = 0; i < length; i++) {
            if (separator && i > 0 && i % 4 === 0) {
                code += separator;
            }
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return `${prefix}${prefix ? separator : ''}${code}${suffix ? separator : ''}${suffix}`;
    }

    // Validate coupon
    validateCoupon(coupon) {
        if (!coupon.title) throw new Error('Coupon title is required');
        if (!coupon.code) throw new Error('Coupon code is required');
        if (!coupon.offerType) throw new Error('Offer type is required');
        if (!coupon.value) throw new Error('Coupon value is required');
        if (!coupon.startDate || !coupon.endDate) throw new Error('Coupon dates are required');
        if (new Date(coupon.startDate) > new Date(coupon.endDate)) {
            throw new Error('End date must be after start date');
        }
        if (this.coupons.some(c => c.code === coupon.code)) {
            throw new Error('Coupon code already exists');
        }
    }

    // Check if targeting conditions are met
    checkTargetingConditions(targeting, context) {
        for (const [type, condition] of Object.entries(targeting)) {
            switch (type) {
                case this.targetingTypes.USER:
                    if (!this.checkUserTargeting(condition, context.user)) return false;
                    break;
                case this.targetingTypes.USER_GROUP:
                    if (!this.checkUserGroupTargeting(condition, context.userGroup)) return false;
                    break;
                case this.targetingTypes.PRODUCT:
                    if (!this.checkProductTargeting(condition, context.product)) return false;
                    break;
                case this.targetingTypes.PRODUCT_VARIATION:
                    if (!this.checkProductVariationTargeting(condition, context.variation)) return false;
                    break;
                case this.targetingTypes.PRODUCT_TYPE:
                    if (!this.checkProductTypeTargeting(condition, context.productType)) return false;
                    break;
                case this.targetingTypes.DESTINATION:
                    if (!this.checkDestinationTargeting(condition, context.destination)) return false;
                    break;
                case this.targetingTypes.CATEGORY:
                    if (!this.checkCategoryTargeting(condition, context.category)) return false;
                    break;
            }
        }
        return true;
    }

    // Individual targeting checks
    checkUserTargeting(condition, user) {
        return condition.includes(user.email);
    }

    checkUserGroupTargeting(condition, userGroup) {
        return condition.includes(userGroup);
    }

    checkProductTargeting(condition, product) {
        return condition.includes(product.sku);
    }

    checkProductVariationTargeting(condition, variation) {
        return condition.includes(variation.id);
    }

    checkProductTypeTargeting(condition, productType) {
        return condition.includes(productType);
    }

    checkDestinationTargeting(condition, destination) {
        return (
            condition.cities.includes(destination.city) ||
            condition.countries.includes(destination.country)
        );
    }

    checkCategoryTargeting(condition, category) {
        return condition.includes(category);
    }

    // Calculate discount value
    calculateDiscount(offer, context) {
        const { offerType, value } = offer;
        const { product, quantity } = context;

        switch (offerType) {
            case this.offerTypes.FLAT_DISCOUNT:
                return value;

            case this.offerTypes.PERCENTAGE_DISCOUNT:
                return (product.price * value) / 100;

            case this.offerTypes.BOGO:
                if (quantity >= 2) {
                    return product.price;
                }
                return 0;

            case this.offerTypes.BOGO_DISCOUNT:
                if (quantity >= 2) {
                    return (product.price * value) / 100;
                }
                return 0;

            case this.offerTypes.BUY_2_GET_1:
                if (quantity >= 3) {
                    return product.price;
                }
                return 0;

            default:
                return 0;
        }
    }

    // Apply coupon to booking
    applyCoupon(code, context) {
        const coupon = this.coupons.find(c => c.code === code && c.enabled);
        if (!coupon) throw new Error('Invalid coupon code');

        // Check if coupon is valid
        if (!this.isCouponValid(coupon, context)) {
            throw new Error('Coupon is not valid for this booking');
        }

        // Check targeting conditions
        if (!this.checkTargetingConditions(coupon.targeting, context)) {
            throw new Error('Coupon targeting conditions not met');
        }

        // Calculate discount
        const discount = this.calculateDiscount(coupon, context);

        // Record usage
        this.recordCouponUsage(coupon, context, discount);

        return {
            couponId: coupon.id,
            discount,
            type: coupon.offerType
        };
    }

    // Check if coupon is valid
    isCouponValid(coupon, context) {
        const now = new Date();
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);

        // Check dates
        if (now < startDate || now > endDate) return false;

        // Check usage limits
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return false;

        // Check per-customer usage
        if (coupon.usagePerCustomer) {
            const customerUsage = coupon.usageHistory.filter(
                usage => usage.customerId === context.user.id
            ).length;
            if (customerUsage >= coupon.usagePerCustomer) return false;
        }

        // Check per-coupon usage
        if (coupon.usagePerCoupon && coupon.usageCount >= coupon.usagePerCoupon) return false;

        return true;
    }

    // Record coupon usage
    recordCouponUsage(coupon, context, discount) {
        const usage = {
            timestamp: new Date().toISOString(),
            customerId: context.user.id,
            bookingId: context.bookingId,
            discount,
            productDetails: {
                sku: context.product.sku,
                variation: context.variation?.id,
                quantity: context.quantity
            }
        };

        coupon.usageHistory.push(usage);
        coupon.usageCount++;
        coupon.updatedAt = new Date().toISOString();

        // Check if coupon should be disabled
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            coupon.enabled = false;
        }
    }

    // Get available offers for a context
    getAvailableOffers(context) {
        return this.offers.filter(offer => 
            offer.enabled && 
            this.isCouponValid(offer, context) &&
            this.checkTargetingConditions(offer.targeting, context)
        );
    }

    // Export coupon usage report
    exportCouponReport(format = 'csv') {
        const report = this.coupons.map(coupon => ({
            code: coupon.code,
            title: coupon.title,
            status: this.getCouponStatus(coupon),
            usageCount: coupon.usageCount,
            usageLimit: coupon.usageLimit || 'Unlimited',
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            value: `${coupon.offerType === this.offerTypes.PERCENTAGE_DISCOUNT ? coupon.value + '%' : 'AED ' + coupon.value}`
        }));

        if (format === 'csv') {
            return this.convertToCSV(report);
        }

        return report;
    }

    // Get coupon status
    getCouponStatus(coupon) {
        if (!coupon.enabled) return this.statusTypes.INACTIVE;
        
        const now = new Date();
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);

        if (now < startDate) return this.statusTypes.INACTIVE;
        if (now > endDate) return this.statusTypes.EXPIRED;
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return this.statusTypes.EXHAUSTED;
        }

        return this.statusTypes.ACTIVE;
    }

    // Convert data to CSV
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(header => obj[header]));
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
}

// Export for use in other modules
export const offerManagement = new OfferManagementSystem();
