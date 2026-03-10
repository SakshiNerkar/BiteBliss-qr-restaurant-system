import { useEffect } from 'react';
import { MdRestaurant } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession } from '../features/cart/cartSlice';

const CustomerThankYou = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear the table session on mount securely away from routing checks
        dispatch(clearSession());
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden items-center justify-center pb-20">
            <div className="z-10 text-center px-6 animate-in zoom-in-95 fade-in duration-500">
                <div className="w-24 h-24 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-inner mb-6 ring-8 ring-orange-50/50">
                    <MdRestaurant size={48} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Thank You! <br /> <span className="text-orange-600">Please Visit Again</span>
                </h1>
                <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                    We hope you enjoyed your meal at Bitebliss. We would love to serve you again soon!
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="bg-white text-gray-700 font-bold px-8 py-3.5 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    Back to Home
                </button>
            </div>

            {/* Background design elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply opacity-5 filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply opacity-5 filter blur-3xl pointer-events-none"></div>
        </div>
    );
};

export default CustomerThankYou;
