const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public route for Guest User to initiate payment
// Usually this might be protected if we had Guest Auth, but for now we rely on Order ID validation.
// Or we can say only logged-in users? No, guests order.
router.post('/create-intent', createPaymentIntent);

// Webhook route (Stripe calls this)
// MUST be raw body. Handled in server.js or here if we use express.raw specific to this route?
// Better to handle parsing in the controller or globally with a conditional.
// We will register it here, but server.js needs to handle the raw parsing for this path.
router.post('/webhook', handleWebhook);

module.exports = router;
