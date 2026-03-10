const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Stripe Webhook requires RAW body. 
// Must be defined BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tableRoutes = require('./routes/tableRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
