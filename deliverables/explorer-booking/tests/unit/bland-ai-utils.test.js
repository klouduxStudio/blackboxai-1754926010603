const { validateGatewayConfig, calculateDiscount } = require('../../backend/services/PaymentGatewayManager');

describe('PaymentGatewayManager Utilities', () => {
  test('validateGatewayConfig returns true for valid config', () => {
    const gatewayId = 'stripe';
    const config = {
      apiKey: 'test_api_key',
      secretKey: 'test_secret_key',
      webhookSecret: 'test_webhook_secret',
      enabled: true
    };
    expect(validateGatewayConfig(gatewayId, config)).toBe(true);
  });

  test('validateGatewayConfig returns false for missing required fields', () => {
    const gatewayId = 'paypal';
    const config = {
      clientId: 'test_client_id',
      enabled: true
    };
    expect(validateGatewayConfig(gatewayId, config)).toBe(false);
  });

  test('calculateDiscount returns correct flat discount', () => {
    const offer = { offerType: 'flat_discount', value: 50 };
    const context = { product: { price: 200 }, quantity: 1 };
    expect(calculateDiscount(offer, context)).toBe(50);
  });

  test('calculateDiscount returns correct percentage discount', () => {
    const offer = { offerType: 'percentage_discount', value: 10 };
    const context = { product: { price: 200 }, quantity: 1 };
    expect(calculateDiscount(offer, context)).toBe(20);
  });

  test('calculateDiscount returns 0 for unknown offer type', () => {
    const offer = { offerType: 'unknown', value: 10 };
    const context = { product: { price: 200 }, quantity: 1 };
    expect(calculateDiscount(offer, context)).toBe(0);
  });
});
