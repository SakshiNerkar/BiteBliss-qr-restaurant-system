import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSessionParams } from '../features/cart/cartSlice';
import { MdRestaurant, MdQrCodeScanner } from 'react-icons/md';

const WelcomeScreen = () => {
    const { restaurantName, tableNo } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (tableNo) {
            // Securely lock the table number into the session state
            dispatch(setSessionParams({ tableNo, restaurantId: null }));
        }
    }, [tableNo, dispatch]);

    // Format restaurant name gracefully if provided
    const displayRestaurant = restaurantName
        ? restaurantName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'BiteBliss';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-300">
            {/* Top Branding Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 pt-12">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-[2rem] flex items-center justify-center shadow-inner mb-8 animate-in zoom-in duration-500 rotate-3 hover:rotate-0 transition-transform">
                    <MdRestaurant size={48} />
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
                    Welcome to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
                        {displayRestaurant}
                    </span>
                </h1>

                <div className="mt-8 bg-white dark:bg-slate-900 px-10 py-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">You are seated at</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-2xl font-bold text-slate-400 dark:text-slate-600">Table</span>
                        <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{tableNo}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Action Section with Curve styling */}
            <div className="relative pt-24 pb-12 px-6 z-10 bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.2)] border-t border-slate-100 dark:border-slate-800 transition-colors">

                {/* Decorative Pill Puller */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>

                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to order?</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Tap below to explore our interactive digital menu and start adding items to your tab.</p>
                </div>

                <button
                    onClick={() => navigate('/menu')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary-600/20 flex justify-center items-center gap-3 active:scale-95 transition-all"
                >
                    <MdQrCodeScanner size={24} />
                    Start Ordering
                </button>
            </div>

            {/* Background design elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply opacity-10 filter blur-3xl pointer-events-none"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-accent-400 rounded-full mix-blend-multiply opacity-10 filter blur-3xl pointer-events-none"></div>
        </div>
    );
};

export default WelcomeScreen;
