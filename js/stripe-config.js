/**
 * Stripe Payment Configuration
 *
 * SETUP INSTRUCTIONS:
 *
 * Option 1: Stripe Payment Links (Easiest - No Code Required)
 * ============================================================
 * 1. Go to https://dashboard.stripe.com/payment-links
 * 2. Create a new payment link for your premium subscription
 * 3. Set the price (e.g., $9.99/month or $49.99/year)
 * 4. Copy the payment link URL and paste it below
 * 5. Users click the link, pay, and you manually enable their account
 *
 * Option 2: Stripe Checkout (Requires Backend)
 * ============================================================
 * For automatic premium activation, you'll need:
 * 1. A backend server (Node.js, Python, etc.)
 * 2. Stripe webhook to listen for successful payments
 * 3. Update user's premium status in Firebase when payment succeeds
 *
 * For now, we'll use Payment Links (Option 1) which is simpler.
 */

const stripeConfig = {
  // Replace with your actual Stripe payment link
  // Create one at: https://dashboard.stripe.com/payment-links
    paymentLink: "https://buy.stripe.com/test_8x27sNakUcTYbE2aG43oA00",

  // Your publishable key (only needed for Stripe Checkout integration)
  publishableKey: "pk_test_YOUR_PUBLISHABLE_KEY",

  // Price IDs for different plans (only needed for Stripe Checkout)
  prices: {
    monthly: "price_YOUR_MONTHLY_PRICE_ID",
    yearly: "price_YOUR_YEARLY_PRICE_ID",
    lifetime: "price_YOUR_LIFETIME_PRICE_ID"
  }
};

/**
 * Open Stripe payment link
 * This is the simplest way to accept payments
 */
function openPaymentLink() {
  if (stripeConfig.paymentLink === "https://buy.stripe.com/YOUR_PAYMENT_LINK_ID") {
    alert("Stripe payment link not configured. See js/stripe-config.js for setup instructions.");
    return;
  }

  // Open payment link in new tab
  window.open(stripeConfig.paymentLink, '_blank');
}

/**
 * Pricing display helper
 */
const pricingPlans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$4.99',
    period: 'per month',
    features: [
      'All premium templates',
      'Cloud sync',
      'Unlimited exports',
      'Priority support'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$29.99',
    period: 'per year',
    savings: 'Save 50%',
    features: [
      'All premium templates',
      'Cloud sync',
      'Unlimited exports',
      'Priority support'
    ],
    recommended: true
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$79.99',
    period: 'one-time',
    features: [
      'All premium templates',
      'Cloud sync',
      'Unlimited exports',
      'Priority support',
      'All future updates'
    ]
  }
];

/**
 * Generate pricing cards HTML
 */
function getPricingHTML() {
  return `
    <div class="pricing-container">
      ${pricingPlans.map(plan => `
        <div class="pricing-card ${plan.recommended ? 'recommended' : ''}">
          ${plan.recommended ? '<div class="pricing-badge">Best Value</div>' : ''}
          ${plan.savings ? `<div class="pricing-savings">${plan.savings}</div>` : ''}
          <h3 class="pricing-name">${plan.name}</h3>
          <div class="pricing-price">
            <span class="price">${plan.price}</span>
            <span class="period">${plan.period}</span>
          </div>
          <ul class="pricing-features">
            ${plan.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <button class="btn btn-primary btn-block" onclick="openPaymentLink()">
            Get ${plan.name}
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// Export
if (typeof window !== 'undefined') {
  window.stripeConfig = stripeConfig;
  window.openPaymentLink = openPaymentLink;
  window.pricingPlans = pricingPlans;
  window.getPricingHTML = getPricingHTML;
}
