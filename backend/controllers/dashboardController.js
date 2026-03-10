const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Table = require('../models/Table');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalDailyOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
        const totalMonthlyOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

        const totalRevenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const popularItems = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.menuId",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.subtotal" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'menus',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuData'
                }
            },
            {
                $addFields: {
                    image: { $arrayElemAt: ["$menuData.image", 0] }
                }
            },
            {
                $project: { menuData: 0 }
            }
        ]);

        // 1. Active Tables (Tables with pending/preparing/ready orders)
        const activeTablesResult = await Order.distinct('tableNo', { status: { $in: ['Pending', 'Preparing', 'Ready'] } });
        const activeTables = activeTablesResult.length;

        // 1.5. Most Ordered Category
        const categoryStats = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: 'menus',
                    localField: 'items.menuId',
                    foreignField: '_id',
                    as: 'menuData'
                }
            },
            { $unwind: "$menuData" },
            {
                $group: {
                    _id: "$menuData.category",
                    totalSold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $addFields: {
                    name: { $arrayElemAt: ["$categoryData.name", 0] }
                }
            },
            {
                $project: { categoryData: 0 }
            }
        ]);
        const mostOrderedCategory = categoryStats.length > 0 ? categoryStats[0].name : 'N/A';

        // 2. Recent Orders for Table and Activity Feed
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

        // 3. Activity Feed mapping
        const activityFeed = recentOrders.map(order => ({
            _id: order._id,
            tableNo: order.tableNo,
            status: order.status,
            amount: order.totalAmount,
            time: order.createdAt
        }));

        // 4. Low Inventory / Unavailable Items Alert
        const inventoryAlerts = await Menu.find({ isAvailable: false }).select('name image price totalOrders');

        res.json({
            totalOrders,
            totalDailyOrders,
            totalMonthlyOrders,
            totalRevenue,
            averageOrderValue,
            ordersByStatus,
            dailyRevenue,
            popularItems,
            activeTables,
            mostOrderedCategory,
            recentOrders,
            activityFeed,
            inventoryAlerts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};
