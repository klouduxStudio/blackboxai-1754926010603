// Cancellation Policy Manager
// Allows manual setup of cancellation policies per product

class CancellationPolicyManager {
  constructor() {
    // Store cancellation policies keyed by productId
    this.policies = new Map();
  }

  /**
   * Set cancellation policy for a product
   * @param {string} productId 
   * @param {object} policy - { type: string, details: object }
   * Example policy types: 'flexible', 'moderate', 'strict', 'custom'
   * Details can include daysBefore, hoursBefore, refundPercent, etc.
   */
  setPolicy(productId, policy) {
    if (!productId || !policy || !policy.type) {
      throw new Error('Invalid policy data');
    }
    this.policies.set(productId, policy);
  }

  /**
   * Get cancellation policy for a product
   * @param {string} productId 
   * @returns {object|null}
   */
  getPolicy(productId) {
    return this.policies.get(productId) || null;
  }

  /**
   * Check if a booking is eligible for cancellation refund based on policy
   * @param {string} productId 
   * @param {Date} cancellationDate 
   * @param {Date} bookingDate 
   * @returns {object} { eligible: boolean, refundPercent: number }
   */
  checkCancellationEligibility(productId, cancellationDate, bookingDate) {
    const policy = this.getPolicy(productId);
    if (!policy) {
      // Default to no refund
      return { eligible: false, refundPercent: 0 };
    }

    const diffMs = bookingDate - cancellationDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (policy.type) {
      case 'flexible':
        if (diffDays >= (policy.daysBefore || 1)) {
          return { eligible: true, refundPercent: policy.refundPercent || 100 };
        }
        break;
      case 'moderate':
        if (diffDays >= (policy.daysBefore || 7)) {
          return { eligible: true, refundPercent: policy.refundPercent || 50 };
        }
        break;
      case 'strict':
        if (diffDays >= (policy.daysBefore || 14)) {
          return { eligible: true, refundPercent: policy.refundPercent || 25 };
        }
        break;
      case 'custom':
        // Custom logic based on details
        if (policy.details) {
          if (diffDays >= (policy.details.daysBefore || 0)) {
            return { eligible: true, refundPercent: policy.details.refundPercent || 0 };
          }
        }
        break;
      default:
        return { eligible: false, refundPercent: 0 };
    }

    return { eligible: false, refundPercent: 0 };
  }
}

module.exports = CancellationPolicyManager;
