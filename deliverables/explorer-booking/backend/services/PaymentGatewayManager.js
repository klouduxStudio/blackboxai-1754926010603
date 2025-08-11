// Universal Payment Gateway Manager
// Supports multiple payment gateways with dynamic configuration

class PaymentGatewayManager {
  constructor() {
    // Store payment gateway configurations keyed by gatewayId
    this.gateways = new Map();

    // Example: Load default gateways
    this.loadDefaultGateways();
  }

  loadDefaultGateways() {
    // Load some common gateways with default config
    this.gateways.set('stripe', {
      id: 'stripe',
      name: 'Stripe',
      configSchema: [
        { key: 'apiKey', label: 'API Key', type: 'string', required: true },
        { key: 'secretKey', label: 'Secret Key', type: 'string', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'string', required: false }
      ],
      enabled: false,
      config: {}
    });

    this.gateways.set('paypal', {
      id: 'paypal',
      name: 'PayPal',
      configSchema: [
        { key: 'clientId', label: 'Client ID', type: 'string', required: true },
        { key: 'clientSecret', label: 'Client Secret', type: 'string', required: true },
        { key: 'mode', label: 'Mode', type: 'select', options: ['sandbox', 'live'], required: true }
      ],
      enabled: false,
      config: {}
    });
  }

  /**
   * Add or update a payment gateway configuration
   * @param {string} gatewayId 
   * @param {object} config 
   */
  setGatewayConfig(gatewayId, config) {
    if (!this.gateways.has(gatewayId)) {
      throw new Error(`Gateway ${gatewayId} not found`);
    }
    const gateway = this.gateways.get(gatewayId);
    gateway.config = config;
    gateway.enabled = config.enabled === true;
    this.gateways.set(gatewayId, gateway);
  }

  /**
   * Get payment gateway configuration
   * @param {string} gatewayId 
   * @returns {object|null}
   */
  getGatewayConfig(gatewayId) {
    return this.gateways.get(gatewayId) || null;
  }

  /**
   * List all available payment gateways
   * @returns {Array}
   */
  listGateways() {
    return Array.from(this.gateways.values());
  }

  /**
   * Process a payment request
   * @param {string} gatewayId 
   * @param {object} paymentData 
   * @returns {Promise<object>} Payment result
   */
  async processPayment(gatewayId, paymentData) {
    const gateway = this.gateways.get(gatewayId);
    if (!gateway || !gateway.enabled) {
      throw new Error(`Payment gateway ${gatewayId} is not enabled`);
    }

    // Dispatch to specific gateway handler
    switch (gatewayId) {
      case 'stripe':
        return await this.processStripePayment(gateway.config, paymentData);
      case 'paypal':
        return await this.processPaypalPayment(gateway.config, paymentData);
      default:
        return await this.processCustomGateway(gateway.config, paymentData);
    }
  }

  /**
   * Process payment via Stripe
   */
  async processStripePayment(config, paymentData) {
    // Use Stripe SDK or API calls
    // This is a placeholder for actual implementation
    return {
      success: true,
      transactionId: 'stripe_txn_123456',
      message: 'Payment processed via Stripe'
    };
  }

  /**
   * Process payment via PayPal
   */
  async processPaypalPayment(config, paymentData) {
    // Use PayPal SDK or API calls
    // This is a placeholder for actual implementation
    return {
      success: true,
      transactionId: 'paypal_txn_123456',
      message: 'Payment processed via PayPal'
    };
  }

  /**
   * Process payment via custom gateway
   */
  async processCustomGateway(config, paymentData) {
    // Implement custom gateway logic based on config
    // This is a placeholder for actual implementation
    return {
      success: true,
      transactionId: 'custom_txn_123456',
      message: 'Payment processed via custom gateway'
    };
  }

  /**
   * Validate payment gateway configuration
   * @param {string} gatewayId 
   * @param {object} config 
   * @returns {boolean}
   */
  validateGatewayConfig(gatewayId, config) {
    const gateway = this.gateways.get(gatewayId);
    if (!gateway) return false;

    for (const field of gateway.configSchema) {
      if (field.required && !(field.key in config)) {
        return false;
      }
    }
    return true;
  }
}

module.exports = PaymentGatewayManager;
