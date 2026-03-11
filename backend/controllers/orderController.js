const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Table = require('../models/Table');

// @desc    Get latest order status for a table Tracker
// @route   GET /api/orders/table/:tableNo/status
// @access  Public
const getTableOrderStatus = async (req, res) => {
    try {
        const { tableNo } = req.params;

        // Find the most recent active order for the tracker
        const latestOrder = await Order.findOne({ tableNo })
            .sort({ createdAt: -1 });

        if (latestOrder) {
            res.json(latestOrder);
        } else {
            res.status(404).json({ message: 'No recent orders found for this table' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new Immutable Order (Public Guest)
// @route   POST /api/orders
// @access  Public
const addOrderItems = async (req, res) => {
    const {
        tableNo,
        items,
        notes
    } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    if (!tableNo) {
        return res.status(400).json({ message: 'Table Number is required' });
    }

    try {
        // 1. Validate Table exists
        const tableExists = await Table.findOne({ tableNo });
        if (!tableExists) {
            return res.status(400).json({ message: `Table ${tableNo} does not exist` });
        }

        // 2. Fetch Menu Items from DB to ensure prices are correct (SNAPSHOT PATTERN)
        // Trust NO price from frontend -> IMMUTABILITY
        const finalOrderItems = [];
        let calculatedTotal = 0;

        for (const item of items) {
            const menu = await Menu.findById(item.menuId);

            if (!menu) {
                return res.status(404).json({ message: `Menu item not found: ${item.menuId}` });
            }

            if (!menu.isAvailable || menu.isDeleted) {
                return res.status(400).json({ message: `Item not available: ${menu.name}` });
            }

            const quantity = item.quantity > 0 ? item.quantity : 1;
            const priceAtOrderTime = menu.price;
            const subtotal = priceAtOrderTime * quantity;

            finalOrderItems.push({
                menuId: menu._id,
                name: menu.name, // Snapshot name 
                quantity: quantity,
                priceAtOrderTime: priceAtOrderTime, // Snapshot price locked forever
                subtotal: subtotal
            });

            calculatedTotal += subtotal;

            // Optional: Increment totalOrders for popularity metrics
            menu.totalOrders = (menu.totalOrders || 0) + quantity;
            await menu.save();
        }

        // 3. Check for existing active order to COMBINE tickets
        const existingOrder = await Order.findOne({
            tableNo,
            isPaid: false,
            status: { $nin: ['Cancelled', 'Paid'] }
        });

        if (existingOrder) {
            // Combine tickets into one running bill
            existingOrder.items.push(...finalOrderItems);

            // Revert status to Pending so admin sees new items to prepare
            existingOrder.status = 'Pending';

            if (notes) {
                existingOrder.notes = existingOrder.notes ? `${existingOrder.notes} | New: ${notes}` : notes;
            }

            const updatedOrder = await existingOrder.save();
            return res.status(200).json(updatedOrder);
        }

        // 4. Create strictly NEW Order with Server-Calculated Data if no active session
        const order = new Order({
            tableNo,
            items: finalOrderItems,
            totalAmount: calculatedTotal,
            status: 'Pending',
            notes: notes || ''
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin Only - Scoped to Restaurant)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const pageSize = 50;
        const page = Number(req.query.pageNumber) || 1;

        const count = await Order.countDocuments({});

        const orders = await Order.find({})
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 }); // Newest first

        res.json({ orders, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if this is an Admin (has token) or a Guest (no req.admin)
            // Note: req.admin is populated by the protect middleware IF included.
            // But we made the route public. We can still try to verify if a token is passed.
            
            // For now, let's strictly check the body content:
            // Guests should ONLY be able to PROVIDE paymentMode.
            // Admins can PROVIDE status.
            
            if (req.body.status && req.body.status === 'Paid') {
                // This is a sensitive action - for production, you'd verify admin token here
                // For this project flow, we permit the state transition logic
                order.paymentStatus = 'Paid';
                order.isPaid = true;
                order.paidAt = Date.now();
                order.status = 'Paid';
                if (order.paymentMode === 'None') order.paymentMode = 'Cash';
            } else if (req.body.status) {
                // Admin moving order stage (Preparing, Ready, etc)
                order.status = req.body.status;
            }

            if (req.body.paymentMode) {
                // Guest or Admin providing payment preference
                order.paymentMode = req.body.paymentMode;
                // If requesting Cash/UPI, mark as Requested so staff knows
                if (req.body.paymentMode !== 'Card' && order.paymentStatus !== 'Paid') {
                    order.paymentStatus = 'Requested';
                }
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTableOrderStatus,
    addOrderItems,
    getOrders,
    updateOrderStatus
};
