import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTableOrderStatusQuery, useUpdateOrderStatusMutation, useCreatePaymentIntentMutation } from '../features/order/orderApiSlice';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../features/cart/cartSlice';
import { MdOutlineTimer, MdCheckCircleOutline, MdLocalDining, MdArrowBack, MdRefresh, MdPayment, MdDownload, MdClose, MdContentCopy, MdDinnerDining } from 'react-icons/md';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';

const OrderStatus = () => {
    const { tableNo } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: activeOrder, isLoading, refetch, isFetching } = useGetTableOrderStatusQuery(tableNo, {
        skip: !tableNo,
        pollingInterval: 10000,
    });

    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();
    const [rating, setRating] = useState(0);
    const [feedbackInfo, setFeedbackInfo] = useState('');
    const [isRated, setIsRated] = useState(false);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const handleInitiatePayment = async () => {
        if (!activeOrder) return;
        try {
            const res = await createPaymentIntent({ orderId: activeOrder._id }).unwrap();
            setClientSecret(res.clientSecret);
            setShowPaymentOptions(false);
            setIsPaymentModalOpen(true);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to initialize payment');
        }
    };

    const handleOfflinePayment = async (mode) => {
        try {
            await updateOrderStatus({ id: activeOrder._id, paymentMode: mode }).unwrap();
            setShowPaymentOptions(false);
            toast.success(`${mode} requested. Our staff will assist you shortly.`);
            refetch();
        } catch (err) {
            toast.error('Failed to notify staff');
        }
    };

    const handleDownloadBill = () => {
        if (!activeOrder) return;

        let billContent = `BITEBLISS RECEIPT\n`;
        billContent += `Table: ${activeOrder.tableNo}\n`;
        billContent += `Order ID: ${activeOrder._id}\n`;
        billContent += `Date: ${new Date(activeOrder.createdAt).toLocaleString()}\n`;
        billContent += `--------------------------------\n`;

        activeOrder.items.forEach(item => {
            billContent += `${item.quantity}x ${item.name} - ₹${item.subtotal.toFixed(2)}\n`;
        });

        billContent += `--------------------------------\n`;
        if (activeOrder.notes) {
            billContent += `Notes: ${activeOrder.notes}\n`;
            billContent += `--------------------------------\n`;
        }

        billContent += `Total: ₹${activeOrder.totalAmount.toFixed(2)}\n`;
        billContent += `Mode: ${activeOrder.paymentMode || 'Pending'}\n`;
        billContent += `Status: ${activeOrder.paymentStatus}\n`;
        billContent += `\nThank you for dining with us!`;

        const blob = new Blob([billContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BiteBliss_Bill_${activeOrder._id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("E-Receipt downloaded successfully.");
    };

    const handleSubmitRating = () => {
        if (rating === 0) return toast.error("Please tap a star to rate");
        setIsRated(true);
        toast.success("Thank you for your valuable feedback!");
    };

    if (!tableNo) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-md drop-shadow-xl border border-primary-200 dark:border-primary-800 rotate-6">
                    <MdOutlineTimer size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No Table Selected</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Please scan your QR code again to securely track your order.</p>
                <button onClick={() => navigate('/')} className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                    Return to Home
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 dark:border-primary-900 dark:border-t-primary-500 rounded-full animate-spin mb-4 shadow-lg shadow-primary-500/20"></div>
                <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400 tracking-widest uppercase">Syncing Order...</h2>
            </div>
        );
    }

    if (!activeOrder) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center pt-20 pb-40 transition-colors">
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-[3rem] flex items-center justify-center mb-8 shadow-inner border border-slate-200 dark:border-slate-800 rotate-3">
                    <MdLocalDining size={64} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">No active orders</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium max-w-sm leading-relaxed">
                    You haven't placed an order yet, or your previous session was finalized.
                </p>
                <button onClick={() => navigate('/menu')} className="flex items-center text-primary-600 dark:text-primary-400 font-bold bg-white dark:bg-slate-900 border-2 border-primary-200 dark:border-primary-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40 shadow-sm transition-all px-8 py-4 rounded-2xl active:scale-95 group">
                    <MdArrowBack className="mr-3 group-hover:-translate-x-1 transition-transform" size={24} />
                    <span>Browse Menu</span>
                </button>
            </div>
        );
    }

    // Timeline Configuration
    const steps = [
        { key: 'Pending', label: 'Order Received', desc: 'Securely transmitted to the kitchen.', icon: <MdOutlineTimer /> },
        { key: 'Preparing', label: 'Preparing', desc: 'Our chefs are actively cooking your meal.', icon: <span className="animate-spin duration-[3000ms] inline-block">🍳</span> },
        { key: 'Ready', label: 'Ready', desc: 'Plated and ready for pickup/service.', icon: <MdLocalDining /> },
        { key: 'Served', label: 'Served', desc: 'Hope you enjoy your BiteBliss experience!', icon: <MdCheckCircleOutline /> }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === activeOrder.status);

    if (activeOrder.status === 'Cancelled') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-red-500/10 border border-red-200 dark:border-red-800">
                    <MdClose size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Order Cancelled</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Your order was successfully aborted by the staff.</p>
                <button onClick={() => navigate('/menu')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-10 py-4 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-white/10 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <MdArrowBack size={20} /> Return to Menu
                </button>
            </div>
        );
    }

    const isPaid = activeOrder.paymentStatus === 'Paid';
    const isPaymentRequested = activeOrder.paymentStatus === 'Requested';
    const isReadyOrServed = activeOrder.status === 'Ready' || activeOrder.status === 'Served';

    if (isPaid) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors animate-in zoom-in-95 duration-500 pt-10">
                <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 border border-emerald-200 dark:border-emerald-800 backdrop-blur-md">
                    <MdCheckCircleOutline size={64} />
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Thank You!</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium max-w-sm text-lg leading-relaxed">Payment successful. Your session is now complete. Please visit us again!</p>

                <div className="space-y-4 w-full max-w-sm">
                    <button onClick={handleDownloadBill} className="w-full flex justify-center items-center bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all px-6 py-5 rounded-2xl active:scale-95 group">
                        <MdDownload className="mr-3 group-hover:translate-y-1 transition-transform" size={24} /> Download E-Receipt
                    </button>
                    <button onClick={() => { dispatch(clearSession()); window.location.href = '/'; }} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-5 rounded-2xl shadow-xl shadow-primary-600/30 border border-primary-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                        Close Table <MdClose size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto relative font-sans animate-in fade-in duration-300 pb-10">

            {/* Minimal Zomato-style Header Overlay */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/menu')} className="w-10 h-10 flex items-center justify-center bg-transparent text-slate-900 dark:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors active:scale-90">
                        <MdArrowBack size={26} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">Live Tracker</h1>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                            <MdDinnerDining size={14} /> Tracking Order
                        </p>
                    </div>
                </div>
                <button onClick={() => refetch()} className={`w-10 h-10 flex items-center justify-center bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 transition-colors shadow-sm ${isFetching ? 'animate-spin' : 'active:scale-90'}`}>
                    <MdRefresh size={22} />
                </button>
            </div>

            <div className="max-w-3xl mx-auto p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-300">

                {/* Status Timeline Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-primary-500/5 dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden transition-all">

                    {/* Header info */}
                    <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 relative z-10">
                        <div>
                            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MdOutlineTimer size={14} /> Estimated Delivery</p>
                            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {activeOrder.status === 'Pending' ? '15-20' : activeOrder.status === 'Preparing' ? '10-15' : activeOrder.status === 'Ready' ? '1-2' : '--'}
                                <span className="text-lg md:text-xl text-slate-400 dark:text-slate-500 font-bold ml-1">mins</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3 translate-y-2">
                            <span className="bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm border border-accent-200 dark:border-accent-800 uppercase tracking-widest shadow-sm">
                                Table {tableNo}
                            </span>
                        </div>
                    </div>

                    <div className="relative pl-2 sm:pl-4 space-y-12 pb-4 z-10">
                        {/* Timeline Line Connector */}
                        <div className="absolute left-[36px] sm:left-[44px] top-[10px] bottom-[10px] w-[3px] bg-slate-100 dark:bg-slate-800 rounded-full shadow-inner"></div>
                        {currentStepIndex > 0 && (
                            <div
                                className="absolute left-[36px] sm:left-[44px] top-[10px] w-[3px] bg-gradient-to-b from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-400 rounded-full transition-all duration-[1500ms] ease-out shadow-lg shadow-primary-500/50"
                                style={{
                                    height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                                    maxHeight: 'calc(100% - 20px)'
                                }}
                            ></div>
                        )}

                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.key} className={`relative flex items-center gap-6 sm:gap-8 transition-all duration-[800ms] ${!isCompleted ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 z-10 transition-colors duration-500 border-4 border-white dark:border-slate-900 ${isCurrent ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/40 ring-4 ring-primary-100 dark:ring-primary-900/30' :
                                        isCompleted ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 shadow-md border-transparent' :
                                            'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                        }`}>
                                        {isCompleted && !isCurrent && step.key !== 'Pending' ? <MdCheckCircleOutline size={28} className="text-primary-600 dark:text-primary-400" /> : <div className="text-[28px]">{step.icon}</div>}
                                    </div>
                                    <div className="pt-0.5 relative top-[2px]">
                                        <h3 className={`font-black text-xl sm:text-2xl tracking-tight mb-1 ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{step.label}</h3>
                                        <p className="text-sm border-slate-500 dark:border-slate-400 font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Decorative fade / blur blob */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-400/10 rounded-full blur-[80px] pointer-events-none"></div>
                </div>

                {/* Bill Summary Accordion/Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-4 relative overflow-hidden">
                    {/* Decorative Top pattern */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNIDEwIDggTCBUIDEwIDAgQyA3LjUgMCA3LjUgOCA1IDggQyAyLjUgOCAyLjUgMCAwIDAgTCAwIDggWiIgZmlsbD0iIzQzMzhDQSJmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20 flex w-full"></div>

                    <h3 className="font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mt-2 flex justify-between items-center tracking-tight text-xl">
                        <span>Order Breakdown</span>
                        <div className="flex gap-2 items-center">
                            {isPaid && (
                                <button onClick={handleDownloadBill} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Download E-Receipt">
                                    <MdDownload size={16} />
                                </button>
                            )}
                            <span className={`text-xs px-3 py-1.5 rounded-lg font-black tracking-widest ${isPaid ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 shadow-sm'}`}>
                                {isPaid ? 'PAID' : 'UNPAID'}
                            </span>
                        </div>
                    </h3>

                    <div className="space-y-4 pt-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                        {activeOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-base">
                                <div className="flex gap-3">
                                    <span className="font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md text-sm mt-0.5">{item.quantity}x</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 leading-tight">{item.name}</span>
                                </div>
                                <span className="font-black text-slate-900 dark:text-white pl-4">₹{item.subtotal.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {activeOrder.notes && (
                        <div className="text-sm bg-accent-50 dark:bg-accent-900/20 text-accent-800 dark:text-accent-300 p-4 rounded-2xl font-medium border border-accent-100 dark:border-accent-800/50 mt-4 leading-relaxed shadow-inner">
                            <span className="font-black uppercase tracking-wider text-xs mb-1 block">Special Requests</span>
                            {activeOrder.notes}
                        </div>
                    )}

                    <div className="pt-4 flex justify-between items-end">
                        <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs relative top-[-4px]">Total Due</span>
                        <span className="font-black text-3xl sm:text-4xl text-primary-600 dark:text-primary-400 tracking-tighter leading-none">₹{activeOrder.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Status/Action Banners */}
                <div className="space-y-4">
                    {/* Payment Requested Alert */}
                    {isPaymentRequested && (
                        <div className="bg-sky-50 dark:bg-sky-900/20 p-6 sm:p-8 rounded-[2rem] border border-sky-100 dark:border-sky-800 shadow-sm text-center flex flex-col items-center transition-colors">
                            <div className="w-16 h-16 bg-sky-100 dark:bg-sky-800 text-sky-500 dark:text-sky-300 rounded-full flex items-center justify-center mb-4">
                                <MdOutlineTimer size={32} className="animate-pulse" />
                            </div>
                            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">Resolving Payment</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Please wait momentarily. Our staff is heading to your table to collect your {activeOrder.paymentMode} payment.</p>
                        </div>
                    )}

                    {/* Ratings Section */}
                    {isReadyOrServed && !isRated && (
                        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] text-center transition-all animate-in slide-in-from-bottom-5">
                            <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2 tracking-tight">How did we do?</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Tap a star to rate your dining experience with BiteBliss.</p>

                            <div className="flex justify-center gap-3 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl inline-flex border border-slate-100 dark:border-slate-800">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-4xl sm:text-5xl transition-all duration-300 ${rating >= star ? 'text-amber-400 scale-110 drop-shadow-lg' : 'text-slate-200 dark:text-slate-800 hover:text-amber-200 dark:hover:text-amber-900 hover:scale-105 active:scale-90'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            {rating > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 max-w-sm mx-auto">
                                    <textarea
                                        value={feedbackInfo}
                                        onChange={(e) => setFeedbackInfo(e.target.value)}
                                        placeholder="Any additional feedback? (Optional)"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none transition-all placeholder:text-slate-400 dark:text-white font-medium shadow-inner"
                                        rows="3"
                                    />
                                    <button
                                        onClick={handleSubmitRating}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black w-full py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 active:scale-95 transition-all text-lg"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isRated && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 p-6 sm:p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50 shadow-sm text-center flex items-center justify-center flex-col gap-3 transition-colors animate-in zoom-in-95">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                <MdCheckCircleOutline size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl mb-1">Feedback Received</h3>
                                <p className="font-medium opacity-80">Thank you for helping BiteBliss improve!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button (Pay / Order More) - Stickied above the Global Bottom Nav */}
            <div className="fixed bottom-[84px] md:bottom-[92px] w-full max-w-md md:max-w-3xl left-1/2 -translate-x-1/2 p-4 z-40 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent pb-6">
                <div className="flex gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className={`flex-1 rounded-[1.5rem] font-bold text-base shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 flex justify-center items-center px-6 transition-all active:scale-95 border-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl`}
                    >
                        Order More
                    </button>
                    {!isPaymentRequested && (
                        <button
                            onClick={() => setShowPaymentOptions(true)}
                            className={`flex-[1.5] bg-emerald-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-500/30 flex justify-between items-center p-4 px-6 transition-all hover:bg-emerald-600 hover:shadow-emerald-600/40 active:scale-95 group`}
                        >
                            <span className="flex items-center gap-2"><MdPayment size={24} /> Pay Bill</span>
                            <span className="bg-white/20 px-3 py-1.5 rounded-xl text-base shadow-inner group-hover:bg-white/30 transition-colors">₹{activeOrder.totalAmount.toFixed(2)}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Payment Selection Modal */}
            {showPaymentOptions && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col">

                        {/* Drag indicator for mobile */}
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 sm:hidden"></div>

                        <div className="absolute top-6 right-6 z-10">
                            <button onClick={() => setShowPaymentOptions(false)} className="w-10 h-10 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full flex items-center justify-center transition-all hover:rotate-90">
                                <MdClose size={24} />
                            </button>
                        </div>

                        <div className="text-center px-6 sm:px-8 py-8 md:py-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner border border-emerald-200 dark:border-emerald-800 rotate-6">
                                <MdPayment size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Checkout</h3>
                            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                Amount Due <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> ₹{activeOrder.totalAmount.toFixed(2)}
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[60vh]">
                            <button onClick={handleInitiatePayment} disabled={isCreatingIntent} className="w-full flex items-center p-5 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left group shadow-sm hover:shadow-md">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-800">
                                    <MdPayment size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-900 dark:text-white text-lg">Pay Online</h4>
                                    <p className="text-sm text-slate-500 font-medium">Secure local payment modal</p>
                                </div>
                                {isCreatingIntent ? <span className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full shadow-sm"></span> : <span className="text-emerald-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black text-2xl">→</span>}
                            </button>

                            <button onClick={() => handleOfflinePayment('Cash')} disabled={isUpdating} className="w-full flex items-center p-5 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950 transition-all text-left group shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0 mr-4 group-hover:text-slate-900 dark:group-hover:text-white transition-colors border border-slate-200 dark:border-slate-800">
                                    <span className="font-black text-xl">₹</span>
                                </div>
                                <div className="flex-1 text-slate-900 dark:text-white">
                                    <h4 className="font-bold text-lg">Pay with Cash</h4>
                                    <p className="text-sm text-slate-500 font-medium">BiteBliss staff will collect</p>
                                </div>
                            </button>

                            <button onClick={() => handleOfflinePayment('UPI')} disabled={isUpdating} className="w-full flex items-center p-5 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950 transition-all text-left group shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0 mr-4 group-hover:text-slate-900 dark:group-hover:text-white transition-colors border border-slate-200 dark:border-slate-800">
                                    <MdContentCopy size={20} />
                                </div>
                                <div className="flex-1 text-slate-900 dark:text-white">
                                    <h4 className="font-bold text-lg">Pay with UPI App</h4>
                                    <p className="text-sm text-slate-500 font-medium">Scan QR directly at table</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                clientSecret={clientSecret}
                orderAmount={activeOrder.totalAmount}
                onSuccess={() => {
                    setIsPaymentModalOpen(false);
                    refetch();
                }}
            />
        </div>
    );
};

export default OrderStatus;
