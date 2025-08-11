// Control Center - Central Configuration Hub

class ControlCenter {
    constructor() {
        this.systemConfig = {
            // Site Configuration
            site: {
                name: 'Explorer Booking',
                logo: '/assets/images/logo.png',
                favicon: '/assets/images/favicon.ico',
            theme: {
                primaryColor: '#ef4444',
                secondaryColor: '#1f2937',
                accentColor: '#f59e0b'
            },
            searchBar: {
                defaultSelectedTab: 'attractions',
                colors: {
                    background: '#ffffff',
                    primary: '#ef4444',
                    secondary: '#1f2937',
                    hover: '#f87171'
                },
                labels: {
                    destinationPlaceholder: 'Where to?',
                    checkInLabel: 'Check-in',
                    guestsLabel: 'Guests',
                    searchButtonLabel: 'Search'
                },
                icons: {
                    attractions: 'fa-mountain',
                    hotels: 'fa-bed',
                    flights: 'fa-plane',
                    transfers: 'fa-car',
                    carRentals: 'fa-key'
                }
            },
                maintenance: {
                    enabled: false,
                    message: 'System under maintenance. Please try again later.'
                }
            },

            // Booking Configuration
            booking: {
                orderIdFormat: 'EB-{YYYY}{MM}-{SEQUENCE}',
                sequenceStart: 1000,
                sequenceReset: 'yearly', // yearly, monthly, never
                allowOverbooking: false,
                defaultCancellationPolicy: {
                    hours: 24,
                    refundPercentage: 100
                }
            },

            // Inventory Configuration
            inventory: {
                lowStockThreshold: 10,
                criticalStockThreshold: 5,
                autoDisableOnStockOut: false,
                enableStockNotifications: true,
                ticketValidityHours: 24
            },

            // Payment Configuration
            payment: {
                currency: 'AED',
                vatPercentage: 5,
                enabledGateways: ['stripe', 'paypal'],
                testMode: true
            },

            // Email Configuration
            email: {
                fromName: 'Explorer Booking',
                fromEmail: 'noreply@explorebooking.com',
                smtp: {
                    host: 'smtp.example.com',
                    port: 587,
                    secure: true,
                    auth: {
                        user: 'username',
                        pass: 'password'
                    }
                },
                templates: {
                    bookingConfirmation: 'booking-confirmation',
                    ticketDelivery: 'ticket-delivery',
                    cancellation: 'booking-cancellation',
                    lowStockAlert: 'low-stock-alert'
                }
            },

            // Security Configuration
            security: {
                sessionTimeout: 30, // minutes
                maxLoginAttempts: 5,
                lockoutDuration: 15, // minutes
                passwordPolicy: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: true
                },
                twoFactorAuth: {
                    enabled: true,
                    requiredForRoles: ['admin']
                }
            },

            // API Configuration
            api: {
                rateLimit: {
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 100 // limit each IP to 100 requests per windowMs
                },
                providers: {
                    expshack: {
                        enabled: true,
                        apiKey: '',
                        apiSecret: '',
                        endpoint: 'https://api.expshack.com/v1'
                    }
                }
            }
        };

        // Role Definitions
        this.roles = {
            admin: {
                name: 'Administrator',
                description: 'Full system access',
                permissions: ['all']
            },
            manager: {
                name: 'Manager',
                description: 'Manage bookings and inventory',
                permissions: [
                    'view_dashboard',
                    'manage_bookings',
                    'manage_inventory',
                    'manage_customers',
                    'view_reports'
                ]
            },
            staff: {
                name: 'Staff',
                description: 'Handle bookings and customer service',
                permissions: [
                    'view_dashboard',
                    'manage_bookings',
                    'view_inventory',
                    'manage_customers'
                ]
            },
            supplier: {
                name: 'Supplier',
                description: 'Manage own products and inventory',
                permissions: [
                    'view_dashboard',
                    'manage_own_products',
                    'manage_own_inventory',
                    'view_own_reports'
                ]
            }
        };

        // Custom Attributes Registry
        this.customAttributes = {
            product: [], // Product custom fields
            booking: [], // Booking custom fields
            customer: [], // Customer custom fields
            supplier: []  // Supplier custom fields
        };

        // Database Tables Configuration
        this.databaseTables = {
            products: {
                name: 'products',
                displayName: 'Products',
                manageable: true,
                columns: [
                    { name: 'id', type: 'string', primary: true },
                    { name: 'title', type: 'string', required: true },
                    { name: 'sku', type: 'string', required: true, unique: true },
                    // ... other columns
                ]
            },
            // ... other table configurations
        };
    }

    // System Configuration Management
    updateConfig(path, value) {
        try {
            const keys = path.split('.');
            let current = this.systemConfig;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!(keys[i] in current)) {
                    throw new Error(`Invalid configuration path: ${path}`);
                }
                current = current[keys[i]];
            }
            
            const lastKey = keys[keys.length - 1];
            if (!(lastKey in current)) {
                throw new Error(`Invalid configuration path: ${path}`);
            }

            // Validate value based on type
            if (typeof current[lastKey] !== typeof value) {
                throw new Error(`Invalid value type for ${path}`);
            }

            current[lastKey] = value;
            this.logConfigChange(path, value);
            return true;
        } catch (error) {
            console.error('Configuration update failed:', error);
            return false;
        }
    }

    getConfig(path = null) {
        if (!path) return this.systemConfig;

        try {
            return path.split('.').reduce((obj, key) => obj[key], this.systemConfig);
        } catch (error) {
            console.error('Error accessing configuration:', error);
            return null;
        }
    }

    // Role Management
    createRole(roleId, config) {
        if (this.roles[roleId]) {
            throw new Error('Role already exists');
        }

        this.roles[roleId] = {
            name: config.name,
            description: config.description,
            permissions: config.permissions || []
        };

        this.logRoleChange('create', roleId);
    }

    updateRole(roleId, config) {
        if (!this.roles[roleId]) {
            throw new Error('Role not found');
        }

        this.roles[roleId] = {
            ...this.roles[roleId],
            ...config
        };

        this.logRoleChange('update', roleId);
    }

    deleteRole(roleId) {
        if (!this.roles[roleId]) {
            throw new Error('Role not found');
        }

        delete this.roles[roleId];
        this.logRoleChange('delete', roleId);
    }

    // Custom Attribute Management
    addCustomAttribute(entityType, attribute) {
        if (!this.customAttributes[entityType]) {
            throw new Error('Invalid entity type');
        }

        const newAttribute = {
            id: `attr_${Math.random().toString(36).substr(2, 9)}`,
            ...attribute,
            created: new Date().toISOString()
        };

        this.customAttributes[entityType].push(newAttribute);
        this.logAttributeChange('add', entityType, newAttribute.id);
        return newAttribute;
    }

    updateCustomAttribute(entityType, attributeId, updates) {
        if (!this.customAttributes[entityType]) {
            throw new Error('Invalid entity type');
        }

        const index = this.customAttributes[entityType].findIndex(attr => attr.id === attributeId);
        if (index === -1) {
            throw new Error('Attribute not found');
        }

        this.customAttributes[entityType][index] = {
            ...this.customAttributes[entityType][index],
            ...updates,
            updated: new Date().toISOString()
        };

        this.logAttributeChange('update', entityType, attributeId);
    }

    deleteCustomAttribute(entityType, attributeId) {
        if (!this.customAttributes[entityType]) {
            throw new Error('Invalid entity type');
        }

        const index = this.customAttributes[entityType].findIndex(attr => attr.id === attributeId);
        if (index === -1) {
            throw new Error('Attribute not found');
        }

        this.customAttributes[entityType].splice(index, 1);
        this.logAttributeChange('delete', entityType, attributeId);
    }

    // Database Table Management
    getTableConfig(tableName) {
        return this.databaseTables[tableName];
    }

    updateTableConfig(tableName, config) {
        if (!this.databaseTables[tableName]) {
            throw new Error('Table not found');
        }

        this.databaseTables[tableName] = {
            ...this.databaseTables[tableName],
            ...config
        };

        this.logTableChange('update', tableName);
    }

    // Logging
    logConfigChange(path, value) {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'config_change',
            path,
            value,
            user: 'system' // In real app, get from current user
        };
        console.log('Configuration Change:', log);
        // In real app, save to database
    }

    logRoleChange(action, roleId) {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'role_change',
            action,
            roleId,
            user: 'system' // In real app, get from current user
        };
        console.log('Role Change:', log);
        // In real app, save to database
    }

    logAttributeChange(action, entityType, attributeId) {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'attribute_change',
            action,
            entityType,
            attributeId,
            user: 'system' // In real app, get from current user
        };
        console.log('Attribute Change:', log);
        // In real app, save to database
    }

    logTableChange(action, tableName) {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'table_change',
            action,
            tableName,
            user: 'system' // In real app, get from current user
        };
        console.log('Table Change:', log);
        // In real app, save to database
    }
}

// Initialize Control Center
const controlCenter = new ControlCenter();

// Export for use in other modules
export { controlCenter };
