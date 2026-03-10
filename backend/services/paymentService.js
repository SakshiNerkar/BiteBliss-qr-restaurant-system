const Stripe = require('stripe');

class PaymentService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    /**
     * Create a Payment Intent
     * @param {number} amount - Amount in smallest currency unit (e.g., cents)
     * @param {string} currency - Currency code (e.g., 'usd')
     * @param {object} metadata - Additional data (orderId, restaurantId)
     */
    async createPaymentIntent(amount, currency, metadata) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        } catch (error) {
            console.error('Stripe Create Intent Error:', error);
            throw new Error('Payment initialization failed');
        }
    }

    /**
     * Verify Webhook Signature
     * @param {Buffer} payload - Raw request body
     * @param {string} signature - Stripe signature header
     */
    verifyWebhookSignature(payload, signature) {
        try {
            return this.stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            console.error('Webhook verified failed:', error.message);
            throw new Error(`Webhook Error: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
