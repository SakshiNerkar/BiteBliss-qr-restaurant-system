import { Outlet, useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setSessionParams } from '../../features/cart/cartSlice';
import { MdShoppingCart, MdRestaurantMenu, MdReceiptLong, MdDinnerDining } from 'react-icons/md';

const CustomerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const cartItems = useSelector((state) => state.cart.cartItems);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Read query params ?table=5 and save to Redux/localStorage
    useEffect(() => {
        const table = searchParams.get('table');
        if (table) {
            dispatch(setSessionParams({ tableNo: Number(table) }));
        }
    }, [searchParams, dispatch]);

    const tableNo = useSelector((state) => state.cart.tableNo);

    if (!tableNo && !searchParams.get('table')) {
        return <Navigate to="/" replace />;
    }

    // Advanced Zomato-style Bottom Navigation link
    const NavLink = ({ to, icon, label, exact = false, badge = 0 }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);

        return (
            <button
                onClick={() => navigate(to)}
                className={`flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${isActive ? 'text-primary-600 dark:text-primary-400 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
            >
                {isActive && (
                    <div className="absolute -top-3 w-12 h-1 bg-primary-600 dark:bg-primary-500 rounded-b-full transition-all duration-300 shadow-[0_4px_10px_rgba(79,70,229,0.4)]"></div>
                )}
                <div className={`relative p-2 rounded-2xl transition-colors duration-300 ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-transparent'}`}>
                    {icon}
                    {badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in-50 duration-300">
                            {badge > 9 ? '9+' : badge}
                        </span>
                    )}
                </div>
                <span className={`text-[11px] mt-1 transition-all duration-300 tracking-wide ${isActive ? 'font-black' : 'font-bold'}`}>{label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Top Header Placeholder (Can be removed if individual pages have their own headers) */}
            <header className="hidden md:flex bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors">
                <div className="max-w-3xl mx-auto px-4 h-16 w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white capitalize flex items-center tracking-tight gap-2">
                        <MdDinnerDining className="text-primary-600 dark:text-primary-400" size={28} /> BiteBliss
                    </h1>
                </div>
            </header>

            {/* Main Content Area - with generous bottom padding so the sticky nav NEVER hides content */}
            <main className="flex-grow w-full max-w-md md:max-w-3xl mx-auto pb-28 md:pb-32">
                <Outlet />
            </main>

            {/* Zomato-Style Sticky Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 h-[84px] md:h-[92px] z-[100] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-colors duration-300 flex justify-center pb-safe">
                <div className="w-full max-w-md md:max-w-3xl flex justify-around items-center h-full px-2 sm:px-6">
                    <NavLink to="/menu" icon={<MdRestaurantMenu size={28} />} label="Menu" exact={true} />
                    <NavLink to="/cart" icon={<MdShoppingCart size={28} />} label="Cart" badge={cartCount} />
                    <NavLink to="/order-status" icon={<MdReceiptLong size={28} />} label="Tracker" />
                </div>
            </nav>
        </div>
    );
};

export default CustomerLayout;

