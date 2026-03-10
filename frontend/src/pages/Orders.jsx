import { useState } from 'react';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../features/order/orderApiSlice';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MdReceiptLong, MdCheckCircleOutline, MdClose, MdVisibility, MdOutlineArrowBack } from 'react-icons/md';

const Orders = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useGetOrdersQuery(page);
    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get('status');

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateOrderStatus({ id, status: newStatus }).unwrap();
            toast.success(`Order marked as ${newStatus}`);
            // Auto close modal if we update
            setSelectedOrder(null);
        } catch (err) {
            toast.error('Failed to update order status');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Live Orders...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error loading live orders</div>;

    const { orders, pages } = data || { orders: [], pages: 1 };

    // Apply client-side filter
    let displayOrders = orders;
    if (statusFilter) {
        displayOrders = orders.filter(o => o.status === statusFilter);
    }

    const clearFilter = () => {
        navigate('/admin/orders');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Pending</span>;
            case 'Preparing': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Preparing</span>;
            case 'Ready': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">Ready</span>;
            case 'Served': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">Served</span>;
            case 'Paid': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Paid</span>;
            case 'Cancelled': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">Cancelled</span>;
            default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">{status}</span>;
        }
    };

    const renderActionButtons = (order) => {
        if (order.status === 'Pending') {
            return <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'Preparing'); }} disabled={isUpdating} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors w-full text-center">Start Preparing</button>;
        }
        if (order.status === 'Preparing') {
            return <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'Ready'); }} disabled={isUpdating} className="text-xs bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 shadow-sm transition-colors w-full text-center">Mark Ready</button>;
        }
        if (order.status === 'Ready') {
            return <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'Served'); }} disabled={isUpdating} className="text-xs bg-sky-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-sky-700 shadow-sm transition-colors w-full text-center">Mark Served</button>;
        }
        if (order.status === 'Served' && order.paymentStatus !== 'Paid') {
            if (order.paymentStatus === 'Requested') {
                return (
                    <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'Paid'); }} disabled={isUpdating} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition-colors w-full text-center animate-pulse">
                        Confirm {order.paymentMode}
                    </button>
                );
            }
            return <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'Paid'); }} disabled={isUpdating} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition-colors w-full text-center">Mark Paid</button>;
        }
        return <span className="text-xs text-gray-400 font-medium w-full block text-center">No Action Required</span>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 relative transition-colors duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Live Orders {statusFilter && <span className="text-orange-600 dark:text-orange-400 text-lg">({statusFilter})</span>}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">Manage incoming tickets and update their real-time status.</p>
                </div>

                {/* Tabs for Order Status */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full lg:w-auto">
                    {['All', 'Pending', 'Preparing', 'Ready', 'Served', 'Paid'].map(status => {
                        const isActive = status === 'All' ? !statusFilter : statusFilter === status;
                        return (
                            <Link
                                key={status}
                                to={status === 'All' ? '/admin/orders' : `/admin/orders?status=${status}`}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${isActive ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                            >
                                {status}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                {displayOrders.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                        <MdReceiptLong size={56} className="text-gray-300 dark:text-slate-600 mb-4 transition-colors duration-300" />
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">No {statusFilter ? statusFilter.toLowerCase() : 'active'} orders found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Order Info</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Detail</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Total</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Status</th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px] transition-colors duration-300">Quick Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 transition-colors duration-300">
                                {displayOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                        title="Click to view details"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 font-extrabold border border-orange-200 dark:border-orange-800/50 shadow-sm transition-colors duration-300">
                                                    T{order.tableNo}
                                                </div>
                                                <div className="ml-5">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">Table {order.tableNo}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 transition-colors duration-300">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider transition-colors duration-300">#{order._id.substring(order._id.length - 6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium max-w-[200px] truncate transition-colors duration-300">
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                            </div>
                                            <button className="text-xs flex items-center text-orange-500 hover:text-orange-700 mt-1 font-bold">
                                                <MdVisibility className="mr-1" /> View Request
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold transition-colors duration-300">
                                            ₹{order.totalAmount.toFixed(2)}
                                            {order.isPaid && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 uppercase tracking-wide transition-colors duration-300"><MdCheckCircleOutline className="mr-1" /> Paid</span>}
                                            {order.paymentStatus === 'Requested' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400 uppercase tracking-wide transition-colors duration-300">{order.paymentMode}</span>}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            {renderActionButtons(order)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                        <div className="p-6 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center transition-colors duration-300">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Table {selectedOrder.tableNo} Details</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors duration-300">Order #{selectedOrder._id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-white dark:bg-slate-800 p-2 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                                <MdClose size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 transition-colors duration-300">Order Items</h4>
                                <ul className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-start border-b border-gray-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0 transition-colors duration-300">
                                            <div>
                                                <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{item.quantity}x</span> <span className="text-gray-800 dark:text-gray-300 font-medium ml-1 transition-colors duration-300">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-600 dark:text-gray-400 transition-colors duration-300">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors duration-300">
                                <div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300 block text-sm transition-colors duration-300">Total Price</span>
                                    {selectedOrder.paymentMode && selectedOrder.paymentMode !== 'None' && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors duration-300">Via {selectedOrder.paymentMode}</span>
                                    )}
                                </div>
                                <span className="text-xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700 pt-4 transition-colors duration-300">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">Current Status:</span>
                                {getStatusBadge(selectedOrder.status)}
                            </div>

                            <div className="pt-2">
                                {renderActionButtons(selectedOrder)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
