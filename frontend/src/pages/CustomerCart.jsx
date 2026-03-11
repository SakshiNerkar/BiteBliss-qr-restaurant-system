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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 bg-slate-50 dark:bg-[#020617] transition-all duration-700">
                <div className="w-32 h-32 bg-white dark:bg-slate-900 glass-card rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary-500/10 animate-float">
                    <MdShoppingCart className="text-primary-600 dark:text-primary-400" size={64} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Your Cart is Empty</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg">Your gourmet journey starts with a single tap.</p>
                <button
                    onClick={() => navigate('/menu')}
                    className="flex items-center gap-3 text-white font-black bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all px-10 py-5 rounded-2xl shadow-xl shadow-primary-600/30 font-black tracking-widest uppercase text-sm"
                >
                    <MdArrowBack size={20} /> Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto relative font-sans animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-30 glass-card border-b border-white/10 dark:border-white/5 px-4 sm:px-6 py-5 flex items-center justify-between shadow-sm transition-all duration-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/menu')} className="w-11 h-11 flex items-center justify-center glass-card text-slate-900 dark:text-white rounded-xl hover:text-primary-500 active:scale-90 transition-all">
                        <MdArrowBack size={26} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">Your Order</h1>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                            <MdDinnerDining size={14} className="text-primary-600" /> BiteBliss Cuisine
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-6">

                {/* Table Info & ETA Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center glass-card p-5 rounded-[2rem] border border-white/10 dark:border-white/5 premium-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                                <MdDinnerDining size={24} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Table Number</h3>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Table {tableNo}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-100/50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-400 font-bold p-5 rounded-[2rem] border border-amber-200/50 dark:border-amber-800/30 flex items-center gap-4 shadow-sm text-sm">
                        <div className="p-2 bg-white dark:bg-amber-900/40 rounded-xl shadow-sm">
                            <MdOutlineTimer size={24} className="shrink-0" />
                        </div>
                        <p>Estimated preparation time: <span className="font-black text-amber-700 dark:text-amber-300">15–20 minutes</span></p>
                    </div>
                </div>

                {activeSessionFound && (
                    <div className="bg-primary-600/10 dark:bg-primary-900/20 border border-primary-600/20 dark:border-primary-800/30 p-5 rounded-[2rem] flex items-start gap-4 shadow-inner">
                        <div className="w-2.5 h-2.5 mt-1.5 shrink-0 rounded-full bg-primary-600 animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                        <p className="text-xs font-black text-primary-700 dark:text-primary-300 leading-relaxed uppercase tracking-widest">Active session linked. New items will be appended to your bill.</p>
                    </div>
                )}
                {/* CART ITEMS LIST */}
                <div className="glass-card rounded-[2.5rem] premium-shadow border border-white/10 dark:border-white/5 p-3 space-y-3">
                    {cartItems.map((item) => (
                        <div key={item._id} className="p-4 flex gap-5 transition-all relative isolate animate-fade-in-up">
                            {/* Improved Thumbnail */}
                            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg border border-white/5">
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
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl leading-tight line-clamp-2 pr-4 uppercase tracking-tighter">{item.name}</h3>
                                        <button onClick={() => dispatch(removeFromCart(item._id))} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                            <MdDeleteOutline size={20} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-1">{item.description}</p>
                                    <span className="inline-block font-black text-primary-600 dark:text-primary-400 text-xl mt-3 tracking-tighter">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-end items-center mt-auto">
                                    <div className="flex items-center bg-primary-600 rounded-2xl overflow-hidden shadow-xl shadow-primary-600/30 h-11 w-32 p-1">
                                        <button onClick={() => handleQuantity(item, 'dec')} className="flex-1 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-xl font-bold">
                                            {item.quantity === 1 ? <MdDeleteOutline size={20} /> : <MdRemove size={20} />}
                                        </button>
                                        <span className="w-8 text-center font-black text-white text-lg leading-none">{item.quantity}</span>
                                        <button onClick={() => handleQuantity(item, 'inc')} className="flex-1 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-xl font-bold">
                                            <MdAdd size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SPECIAL INSTRUCTIONS */}
                <div className="glass-card rounded-[2.5rem] premium-shadow border border-white/10 dark:border-white/5 p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tighter uppercase">Kitchen Notes</h3>
                    </div>
                    <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any dietary requirements or preferences? (e.g. Extra spicy, No cilantro)"
                        rows="3"
                        className="w-full rounded-[1.5rem] border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30 py-5 px-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all font-semibold resize-none"
                    />
                </div>

                {/* RECOMMENDED ADD-ONS CAROUSEL */}
                {recommendedItems.length > 0 && (
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">Best <span className="text-primary-600">Pairings</span></h3>
                            <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl">
                                <MdLocalFireDepartment className="text-amber-600 animate-pulse" size={20} />
                                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Trending</span>
                            </div>
                        </div>
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {recommendedItems.map(item => (
                                <div key={item._id} className="min-w-[170px] w-[170px] glass-card rounded-[2rem] border border-white/10 dark:border-white/5 p-3 premium-shadow flex flex-col shrink-0 hover:-translate-y-2 transition-transform duration-500">
                                    <div className="h-28 w-full rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3 shadow-inner">
                                        {item.image ? (
                                            <img src={getImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><MdRestaurant size={28} /></div>
                                        )}
                                    </div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1 flex-1 px-1 uppercase tracking-tight">{item.name}</h4>
                                    <div className="flex justify-between items-center mt-3 px-1 pb-1">
                                        <span className="font-black text-primary-600 dark:text-primary-400 text-base tracking-tighter">₹{item.price}</span>
                                        <button onClick={() => handleAddRecommended(item)} className="bg-primary-600 text-white p-2 rounded-xl active:scale-90 transition-all shadow-lg shadow-primary-600/20">
                                            <MdAdd size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DETAILED BILL SUMMARY */}
                <div className="glass-card rounded-[2.5rem] premium-shadow border border-white/10 dark:border-white/5 p-8 relative overflow-hidden mb-10">
                    <h3 className="font-black text-slate-900 dark:text-white text-2xl mb-8 tracking-tighter uppercase">Bill <span className="text-primary-600">Breakdown</span></h3>

                    <div className="space-y-5">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
                            <span>Item Total</span>
                            <span className="text-slate-900 dark:text-white font-black">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
                            <span className="border-b border-dashed border-slate-300 dark:border-slate-800 pb-0.5">GST (5%)</span>
                            <span className="text-slate-900 dark:text-white font-black">₹{gstAmount.toFixed(2)}</span>
                        </div>

                        {/* Custom visual separator */}
                        <div className="flex items-center gap-4 py-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
                            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <span className="font-black text-slate-900 dark:text-white text-xl tracking-tighter uppercase">Total Payable</span>
                                <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1">Order Summary</p>
                            </div>
                            <span className="font-black text-4xl text-primary-600 dark:text-primary-400 leading-none tracking-tighter">₹{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Sticky Place Order Bar) */}
            <div className="fixed bottom-[110px] w-full max-w-[92%] md:max-w-xl left-1/2 -translate-x-1/2 z-40">
                <button
                    disabled={isSubmitting}
                    onClick={handleSubmitOrder}
                    className={`glass-card-primary w-full bg-primary-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary-600/40 flex justify-between items-center p-2 transition-all hover:bg-primary-700 active:scale-95 group border border-white/20 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <div className="flex items-center gap-5 pl-8">
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-2xl font-black mb-1">₹{finalTotal.toFixed(2)}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-200">Total Price</span>
                        </div>
                    </div>

                    <div className="h-16 px-8 bg-white/20 rounded-[2rem] flex items-center justify-center gap-3 backdrop-blur-md">
                        <span className="uppercase tracking-widest text-sm">{activeSessionFound ? 'Add Items' : 'Place Order'}</span>
                        <MdArrowBack className="group-hover:translate-x-1 transition-transform rotate-180" size={24} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default CustomerCart;
