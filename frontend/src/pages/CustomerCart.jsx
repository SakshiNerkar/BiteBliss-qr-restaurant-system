import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart, updateQuantity, removeFromCart, clearCart } from '../features/cart/cartSlice';
import { useCreateOrderMutation, useGetTableOrderStatusQuery } from '../features/order/orderApiSlice';
import { useGetMenuQuery } from '../features/menu/menuApiSlice';
import { toast } from 'react-toastify';
import { MdAdd, MdRemove, MdDeleteOutline, MdArrowBack, MdRestaurant, MdOutlineTimer, MdLocalFireDepartment, MdDinnerDining } from 'react-icons/md';
import { getImageUrl } from '../utils/getImageUrl';

const CustomerCart = () => {
    const { cartItems, tableNo } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: menuItems } = useGetMenuQuery();
    const { data: activeOrder } = useGetTableOrderStatusQuery(tableNo, {
        skip: !tableNo,
        refetchOnMountOrArgChange: true
    });

    const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
    const [specialInstructions, setSpecialInstructions] = useState('');

    const activeSessionFound = activeOrder && activeOrder.status !== 'Paid' && activeOrder.status !== 'Cancelled';

    // Calculations
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const gstRate = 0.05; // 5% GST
    const gstAmount = subtotal * gstRate;
    const finalTotal = subtotal + gstAmount;

    // Recommendation logic: find popular items NOT currently in the cart
    const recommendedItems = useMemo(() => {
        if (!menuItems) return [];
        return [...menuItems]
            .filter(item => item.isAvailable && !cartItems.some(c => c._id === item._id))
            .sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
            .slice(0, 4);
    }, [menuItems, cartItems]);

    const handleQuantity = (item, type) => {
        const cartItem = cartItems.find(c => c._id === item._id);
        if (!cartItem) return;

        let newQty = type === 'inc' ? cartItem.quantity + 1 : cartItem.quantity - 1;
        if (newQty > 0) {
            dispatch(updateQuantity({ id: item._id, quantity: newQty }));
        } else {
            dispatch(removeFromCart(item._id));
        }
    };

    const handleAddRecommended = (item) => {
        dispatch(addToCart({ ...item, quantity: 1 }));
        toast.success(`Added ${item.name} to cart!`);
    };

    const handleSubmitOrder = async () => {
        if (!tableNo) {
            return toast.error("Missing Table Number. Please scan your QR code again.");
        }

        const orderData = {
            tableNo,
            items: cartItems.map(item => ({
                menuId: item._id,
                quantity: item.quantity
            })),
            notes: specialInstructions
        };

        try {
            await createOrder(orderData).unwrap();
            dispatch(clearCart());
            toast.success(activeSessionFound ? "Items Added to Bill!" : "Order Placed Successfully!");
            navigate('/order-status');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to submit order to the kitchen');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 border-[8px] border-white dark:border-slate-950 text-slate-300 dark:text-slate-700 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
                    <MdShoppingCart size={64} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Your Cart is Empty</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Looks like you haven't decided yet.</p>
                <button
                    onClick={() => navigate('/menu')}
                    className="flex items-center text-primary-600 dark:text-primary-400 font-bold bg-white dark:bg-slate-900 border-2 border-primary-100 dark:border-primary-900/50 hover:border-primary-500 hover:bg-primary-50 active:scale-95 transition-all px-8 py-4 rounded-2xl shadow-sm"
                >
                    <MdArrowBack className="mr-2" size={20} /> Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto relative font-sans animate-in fade-in duration-300">
            {/* Minimal Zomato-style Header Overlay */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/menu')} className="w-10 h-10 flex items-center justify-center bg-transparent text-slate-900 dark:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors active:scale-90">
                        <MdArrowBack size={26} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">Your Cart</h1>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                            <MdDinnerDining size={14} /> Restaurant Menu
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-6">

                {/* Table Info & ETA Bar */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 rounded-full flex items-center justify-center">
                                <MdDinnerDining size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Dining In</h3>
                                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">Table {tableNo}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 font-bold p-4 rounded-2xl border border-orange-100 dark:border-orange-800/50 flex items-center gap-3 shadow-sm text-sm">
                        <MdOutlineTimer size={22} className="shrink-0" />
                        <p>Estimated preparation time: <span className="font-black">15–20 minutes</span></p>
                    </div>
                </div>

                {activeSessionFound && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4 rounded-2xl flex items-start gap-3 shadow-inner">
                        <div className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-primary-500 animate-pulse"></div>
                        <p className="text-sm font-bold text-primary-800 dark:text-primary-300 leading-relaxed">You already have an active session running. Adding items now will instantly send them to the kitchen.</p>
                    </div>
                )}

                {/* CART ITEMS LIST */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-2 space-y-2">
                    {cartItems.map((item) => (
                        <div key={item._id} className="p-4 flex gap-4 transition-colors relative isolate">

                            {/* Massive Thumbnail */}
                            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                                {item.image ? (
                                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                        <MdRestaurant size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow flex flex-col justify-between py-1 h-28 sm:h-32">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl leading-tight line-clamp-2 pr-4">{item.name}</h3>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-1">{item.description}</p>
                                    <span className="inline-block font-black text-slate-900 dark:text-white text-lg mt-2">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-end items-center mt-auto">
                                    {/* Large Zomato Style Quantity Controls */}
                                    <div className="flex items-center bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/60 rounded-xl overflow-hidden shadow-sm h-10 w-28 shrink-0">
                                        <button onClick={() => handleQuantity(item, 'dec')} className="flex-1 h-full flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors active:bg-primary-200">
                                            {item.quantity === 1 ? <MdDeleteOutline size={20} /> : <MdRemove size={20} />}
                                        </button>
                                        <span className="w-8 text-center font-black text-primary-700 dark:text-primary-300 text-sm">{item.quantity}</span>
                                        <button onClick={() => handleQuantity(item, 'inc')} className="flex-1 h-full flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors active:bg-primary-200">
                                            <MdAdd size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Border separator except for last child */}
                            <div className="absolute bottom-0 left-6 right-6 h-px bg-slate-100 dark:bg-slate-800 last-of-type:hidden"></div>
                        </div>
                    ))}
                </div>

                {/* SPECIAL INSTRUCTIONS */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-3">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Special Instructions for Kitchen</h3>
                    <p className="text-xs font-bold text-slate-500">Optional notes for the chef.</p>
                    <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="E.g. No onions, less spicy, extra sauce..."
                        rows="3"
                        className="w-full rounded-[1.25rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-4 px-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 font-medium resize-none transition-all"
                    />
                </div>

                {/* RECOMMENDED ADD-ONS CAROUSEL */}
                {recommendedItems.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Complete your meal</h3>
                            <MdLocalFireDepartment className="text-orange-500" size={20} />
                        </div>
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {recommendedItems.map(item => (
                                <div key={item._id} className="min-w-[140px] w-[140px] bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-2 shadow-sm flex flex-col shrink-0">
                                    <div className="h-24 w-full rounded-[1rem] bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2 shadow-inner">
                                        {item.image ? (
                                            <img src={getImageUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><MdRestaurant /></div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 flex-1 px-1">{item.name}</h4>
                                    <div className="flex justify-between items-center mt-2 px-1 pb-1">
                                        <span className="font-black text-slate-900 dark:text-white text-sm">₹{item.price}</span>
                                        <button onClick={() => handleAddRecommended(item)} className="bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 p-1.5 rounded-lg active:scale-90 transition-transform hover:bg-primary-100">
                                            <MdAdd size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DETAILED BILL SUMMARY */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden">
                    {/* Decorative Top pattern */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNIDEwIDggTCBUIDEwIDAgQyA3LjUgMCA3LjUgOCA1IDggQyAyLjUgOCAyLjUgMCAwIDAgTCAwIDggWiIgZmlsbD0iIzQzMzhDQSJmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20 flex w-full"></div>

                    <h3 className="font-black text-slate-900 dark:text-white text-xl mb-6 tracking-tight mt-2">Bill Summary</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold text-sm">
                            <span>Item Total</span>
                            <span className="text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold text-sm">
                            <span className="border-b border-dashed border-slate-300 dark:border-slate-700 pb-0.5">Restaurant GST (5%)</span>
                            <span className="text-slate-900 dark:text-white">₹{gstAmount.toFixed(2)}</span>
                        </div>

                        {/* Dashed separator line */}
                        <div className="border-t-[2px] border-dashed border-slate-200 dark:border-slate-800 my-4"></div>

                        <div className="flex justify-between items-end">
                            <div>
                                <span className="font-black text-slate-900 dark:text-white text-lg">Grand Total</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                            </div>
                            <span className="font-black text-3xl text-primary-600 dark:text-primary-400 leading-none tracking-tighter shadow-sm">₹{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Sticky Place Order Bar) */}
            <div className="fixed bottom-[84px] md:bottom-[92px] w-full max-w-md md:max-w-3xl left-1/2 -translate-x-1/2 p-4 z-40">
                <button
                    disabled={isSubmitting}
                    onClick={handleSubmitOrder}
                    className={`w-full bg-primary-600 text-white rounded-[1.5rem] font-bold text-lg sm:text-xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] dark:shadow-[0_10px_30px_rgba(79,70,229,0.15)] flex justify-between items-center p-4 px-6 transition-all border border-primary-500 hover:bg-primary-700 active:scale-95 group ${isSubmitting ? 'opacity-70 cursor-not-allowed hidden' : ''}`}
                >
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-2xl font-black mb-1">₹{finalTotal.toFixed(2)}</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary-100">TOTAL</span>
                    </div>

                    <div className="flex items-center gap-2 font-black tracking-tight">
                        {activeSessionFound ? 'Add to Bill' : 'Place Order'}
                        <MdArrowBack className="group-hover:translate-x-1 transition-transform rotate-180 drop-shadow-md" size={24} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default CustomerCart;
