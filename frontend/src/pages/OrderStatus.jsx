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
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center transition-all duration-700">
                <div className="w-24 h-24 glass-card bg-primary-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary-600/30 rotate-6 animate-float">
                    <MdOutlineTimer className="text-white" size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase">No Table Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-bold max-w-xs mx-auto uppercase tracking-widest text-xs">Please scan the table QR code to track your order.</p>
                <button onClick={() => navigate('/')} className="bg-primary-600 hover:bg-primary-700 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-primary-600/30 active:scale-95 transition-all uppercase tracking-widest text-sm">
                    Return Home
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center transition-all duration-700">
                <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-8 shadow-2xl shadow-primary-600/20"></div>
                <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-[0.3em] uppercase animate-pulse">Establishing Connection...</h2>
            </div>
        );
    }

    if (!activeOrder) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center pt-20 pb-40 transition-all duration-700">
                <div className="w-32 h-32 glass-card bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner border border-white/5 rotate-3">
                    <MdLocalDining size={64} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Quiet Kitchen</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-bold max-w-xs mx-auto uppercase tracking-widest text-xs leading-loose">
                    No active orders found. Time to explore our latest specials?
                </p>
                <button onClick={() => navigate('/menu')} className="flex items-center gap-3 text-white font-black bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all px-10 py-5 rounded-2xl shadow-xl shadow-primary-600/30 uppercase tracking-widest text-sm">
                    <MdArrowBack size={24} />
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
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center transition-all duration-700 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-rose-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-rose-600/30">
                    <MdClose className="text-white" size={48} />
                </div>
                <h2 className="text-4xl font-black text-rose-600 mb-3 tracking-tighter uppercase">Order Cancelled</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-bold max-w-xs mx-auto uppercase tracking-widest text-xs leading-loose">This order was cancelled. Please contact staff for details.</p>
                <button onClick={() => navigate('/menu')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black px-12 py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">
                    Back to Menu
                </button>
            </div>
        );
    }

    const isPaid = activeOrder.paymentStatus === 'Paid';
    const isPaymentRequested = activeOrder.paymentStatus === 'Requested';
    const isReadyOrServed = activeOrder.status === 'Ready' || activeOrder.status === 'Served';

    if (isPaid) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-center transition-all duration-700 animate-in zoom-in-95 pt-10">
                <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-float">
                    <MdCheckCircleOutline size={64} className="text-white" />
                </div>
                <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase"><span className="text-emerald-500">Success!</span></h1>
                <p className="text-slate-500 dark:text-slate-400 mb-12 font-bold max-w-sm text-xs uppercase tracking-[0.2em] leading-loose">Payment confirmed. Your culinary session is complete. We hope to see you again soon!</p>

                <div className="space-y-5 w-full max-w-sm">
                    <button onClick={handleDownloadBill} className="w-full flex justify-center items-center glass-card text-slate-900 dark:text-white font-black px-6 py-6 rounded-[2rem] active:scale-95 group uppercase tracking-widest text-sm">
                        <MdDownload className="mr-3 group-hover:translate-y-1 transition-transform" size={24} /> E-Receipt
                    </button>
                    <button onClick={() => { dispatch(clearSession()); window.location.href = '/'; }} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-6 rounded-[2.5rem] shadow-2xl shadow-primary-600/40 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter text-lg">
                        Close Table <MdClose size={24} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto relative font-sans animate-in fade-in duration-300 pb-10">

            {/* Header */}
            <div className="sticky top-0 z-30 glass-card border-b border-white/10 dark:border-white/5 px-4 sm:px-6 py-5 flex items-center justify-between shadow-sm transition-all duration-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/menu')} className="w-11 h-11 flex items-center justify-center glass-card text-slate-900 dark:text-white rounded-xl hover:text-primary-500 active:scale-90 transition-all">
                        <MdArrowBack size={26} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">Live Tracker</h1>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                            <MdDinnerDining size={14} className="text-primary-600" /> Tracking Active
                        </p>
                    </div>
                </div>
                <button onClick={() => refetch()} className={`w-11 h-11 flex items-center justify-center glass-card text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all ${isFetching ? 'animate-spin' : 'active:scale-90'}`}>
                    <MdRefresh size={22} />
                </button>
            </div>

            <div className="max-w-3xl mx-auto p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-300">

                {/* Status Timeline Card */}
                <div className="glass-card rounded-[2.5rem] premium-shadow border border-white/10 dark:border-white/5 p-8 relative overflow-hidden transition-all duration-700 animate-fade-in-up">
                    <div className="flex justify-between items-end border-b border-white/10 dark:border-white/5 pb-8 mb-10 relative z-10">
                        <div>
                            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2"><MdOutlineTimer size={16} className="text-primary-500" /> Current Stage</p>
                            <p className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                                {activeOrder.status === 'Pending' ? 'Received' : activeOrder.status === 'Preparing' ? 'Cooking' : activeOrder.status === 'Ready' ? 'Plated' : 'Served'}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <span className="bg-primary-600 text-white font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary-600/20">
                                Table {tableNo}
                            </span>
                        </div>
                    </div>

                    <div className="relative pl-6 sm:pl-8 space-y-12 pb-4 z-10">
                        {/* Timeline Line Connector */}
                        <div className="absolute left-[40px] sm:left-[48px] top-[10px] bottom-[10px] w-1 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                        {currentStepIndex > 0 && (
                            <div
                                className="absolute left-[40px] sm:left-[48px] top-[10px] w-1 bg-primary-600 rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>
                        )}

                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.key} className={`relative flex items-center gap-8 transition-all duration-1000 ${!isCompleted ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}>
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] flex items-center justify-center flex-shrink-0 z-10 transition-all duration-700 border-4 ${isCurrent ? 'bg-primary-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] border-white dark:border-slate-900 scale-110' :
                                        isCompleted ? 'bg-primary-600/10 text-primary-600 border-transparent' :
                                            'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent'
                                        }`}>
                                        {isCompleted && !isCurrent ? <MdCheckCircleOutline size={32} /> : <div className="text-3xl">{step.icon}</div>}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-black text-xl sm:text-2xl tracking-tighter uppercase mb-1 ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{step.label}</h3>
                                        <p className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-primary-600' : 'text-slate-400 line-clamp-1'}`}>{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bill Summary Card */}
                <div className="glass-card rounded-[2.5rem] premium-shadow border border-white/10 dark:border-white/5 p-8 space-y-6 relative overflow-hidden animate-fade-in-up">
                    <h3 className="font-black text-slate-900 dark:text-white border-b border-white/10 dark:border-white/5 pb-6 flex justify-between items-center tracking-tighter text-2xl uppercase">
                        <span>Items <span className="text-primary-600">Ordered</span></span>
                        <div className="flex gap-3 items-center">
                            <span className={`text-[10px] px-4 py-2 rounded-xl font-black tracking-[0.2em] shadow-lg ${isPaid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'}`}>
                                {isPaid ? 'PAID' : 'PENDING'}
                            </span>
                        </div>
                    </h3>

                    <div className="space-y-5 pt-2">
                        {activeOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-primary-600 bg-primary-600/10 w-9 h-9 flex items-center justify-center rounded-xl text-xs">{item.quantity}</span>
                                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-sm group-hover:text-primary-600 transition-colors">{item.name}</span>
                                </div>
                                <span className="font-black text-slate-900 dark:text-white tracking-tighter">₹{item.subtotal.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {activeOrder.notes && (
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-white/5 mt-4 leading-relaxed shadow-inner">
                            <span className="font-black uppercase tracking-[0.2em] text-[10px] text-primary-600 mb-2 block">Chef Instructions</span>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{activeOrder.notes}</p>
                        </div>
                    )}

                    <div className="pt-6 flex justify-between items-end border-t border-white/10 dark:border-white/5">
                        <span className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] mb-2">Grand Total</span>
                        <span className="font-black text-4xl text-primary-600 dark:text-primary-400 tracking-tighter leading-none">₹{activeOrder.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Status/Action Banners */}
                <div className="space-y-4">
                    {/* Payment Requested Alert */}
                    {isPaymentRequested && (
                        <div className="glass-card-primary p-8 rounded-[2.5rem] text-center flex flex-col items-center transition-all animate-pulse shadow-2xl shadow-primary-600/20 duration-[2000ms]">
                            <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                                <MdOutlineTimer size={40} />
                            </div>
                            <h3 className="font-black text-2xl text-white mb-3 tracking-tighter uppercase">Processing Payment</h3>
                            <p className="text-primary-100 font-bold text-xs uppercase tracking-[0.2em] leading-loose">Please wait. A member of our team is arriving at Table {tableNo} to assist you.</p>
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

            {/* Floating Action Button (Pay / Order More) */}
            <div className="fixed bottom-[110px] w-full max-w-[92%] md:max-w-xl left-1/2 -translate-x-1/2 z-40 bg-gradient-to-t from-slate-50 dark:from-[#020617] via-transparent to-transparent pb-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex-1 glass-card bg-slate-100 dark:bg-white/5 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-700 dark:text-white h-16 transition-all active:scale-95 border border-white/10 premium-shadow"
                    >
                        Order More
                    </button>
                    {!isPaymentRequested && (
                        <button
                            onClick={() => setShowPaymentOptions(true)}
                            className="flex-[1.8] bg-emerald-600 text-white rounded-[2.5rem] font-black text-lg shadow-2xl shadow-emerald-600/40 flex justify-between items-center p-1.5 h-20 transition-all hover:bg-emerald-700 active:scale-95 group border border-white/20"
                        >
                            <span className="flex items-center gap-3 pl-8 uppercase tracking-widest text-sm"><MdPayment size={28} /> Pay</span>
                            <div className="h-16 px-6 bg-white/20 rounded-[2rem] flex items-center justify-center font-black tracking-tighter text-xl backdrop-blur-md">
                                ₹{activeOrder.totalAmount.toFixed(2)}
                            </div>
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
