import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

// Use environment variable for Publishable Key, fallback to a standard test key if not set
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ orderAmount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-status`,
            },
            redirect: 'if_required'
        });

        if (error) {
            toast.error(error.message || "An unexpected error occurred.");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success("Payment successful!");
            onSuccess();
        } else {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <button disabled={isProcessing || !stripe || !elements} id="submit" className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all flex justify-center items-center h-14">
                {isProcessing ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : `Pay ₹${orderAmount.toFixed(2)}`}
            </button>
        </form>
    );
};

const PaymentModal = ({ isOpen, onClose, clientSecret, orderAmount, onSuccess }) => {
    if (!isOpen || !clientSecret) return null;

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#ea580c', // orange-600
                colorBackground: '#ffffff',
                colorText: '#111827', // gray-900
                colorDanger: '#ef4444', // red-500
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
        },
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Checkout</h2>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Complete your payment instantly</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 bg-white shadow-sm p-2 rounded-full transition-colors border border-gray-100">
                        <MdClose size={20} />
                    </button>
                </div>
                <div className="p-6 pb-10 sm:pb-6">
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm orderAmount={orderAmount} onSuccess={onSuccess} />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
