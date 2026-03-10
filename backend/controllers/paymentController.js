const Order = require('../models/Order');
const Menu = require('../models/Menu');
const paymentService = require('../services/paymentService');

// @desc    Create Payment Intent for an Order
// @route   POST /api/payments/create-intent
// @access  Public (Guest)
const createPaymentIntent = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.isPaid || order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Order cannot be paid' });
        }

        // Calculate amount in smallest currency unit (e.g. cents)
        // Assuming Order.totalAmount is in standard units (e.g. Dollars/Rupees)
        // Multiplier depends on currency. For USD/INR it is 100.
        const amount = Math.round(order.totalAmount * 100);

        // Idempotency: If paymentIntent already exists and is valid, return it?
        // For simplicity, we create a new one or update existing if stored (advanced).
        // Here we create a new one.

        const paymentIntent = await paymentService.createPaymentIntent(amount, 'inr', {
            orderId: order._id.toString()
        });

        order.paymentId = paymentIntent.id;
        order.paymentProvider = 'Stripe';
        order.paymentStatus = 'Pending';
        await order.save();

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const handleWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        // req.body MUST be raw buffer here
        event = paymentService.verifyWebhookSignature(req.body, signature);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        console.log(`Payment Succeeded for Order: ${orderId}`);

        try {
            const order = await Order.findById(orderId);
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentStatus = 'Paid';
                order.status = 'Paid'; // Update order status to Paid
                order.paymentMetadata = paymentIntent; // Store full details

                await order.save();

                // Increment totalOrders for Menu Items (Async - don't block response)
                if (order.items) {
                    for (const item of order.items) {
                        await Menu.findByIdAndUpdate(item.menuId, { $inc: { totalOrders: item.quantity } });
                    }
                }
            } else {
                console.log('Order already paid or not found');
            }
        } catch (error) {
            console.error('Error updating order after payment:', error);
            // We return 200 to Stripe anyway to prevent retries if it's our DB error, 
            // OR return 500 to trigger retry. 
            // Better to return 500 here so Stripe retries.
            return res.status(500).send('Internal Server Error');
        }
    } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        console.log(`Payment Failed for Order: ${orderId}`);

        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'Failed';
            await order.save();
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
};

module.exports = {
    createPaymentIntent,
    handleWebhook
};
