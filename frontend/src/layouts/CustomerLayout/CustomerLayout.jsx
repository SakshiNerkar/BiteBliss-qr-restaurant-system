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

    const NavLink = ({ to, icon, label, exact = false, badge = 0 }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);

        return (
            <button
                onClick={() => navigate(to)}
                className={`flex flex-col items-center justify-center w-full h-full relative transition-all duration-500 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
                <div className={`relative p-3 rounded-2xl transition-all duration-500 transform ${isActive ? 'bg-primary-50 dark:bg-primary-900/40 scale-110 -translate-y-1' : 'bg-transparent hover:scale-105'}`}>
                    {icon}
                    {badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-lg shadow-red-500/20 animate-in zoom-in-50 duration-300">
                            {badge > 9 ? '9+' : badge}
                        </span>
                    )}
                    {isActive && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-600 dark:bg-primary-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                    )}
                </div>
                <span className={`text-[10px] mt-2 transition-all duration-500 uppercase tracking-widest font-black ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'}`}>{label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-all duration-700">
            {/* Desktop Header */}
            <header className="hidden md:flex glass-card border-b border-white/10 dark:border-white/5 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-6 h-20 w-full flex items-center justify-between">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize flex items-center tracking-tighter gap-3">
                        <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-600/20 animate-float">
                            <MdDinnerDining size={24} />
                        </div>
                        BiteBliss
                    </h1>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow w-full max-w-md md:max-w-3xl mx-auto pb-32 md:pb-36 px-0 sm:px-4">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full z-[100] px-4 pb-6 sm:px-8">
                <div className="max-w-2xl mx-auto glass-card rounded-[2.5rem] border border-white/20 dark:border-white/10 h-[88px] premium-shadow flex items-center justify-around px-4">
                    <NavLink to="/menu" icon={<MdRestaurantMenu size={28} />} label="Menu" exact={true} />
                    <NavLink to="/cart" icon={<MdShoppingCart size={28} />} label="Cart" badge={cartCount} />
                    <NavLink to="/order-status" icon={<MdReceiptLong size={28} />} label="Track" />
                </div>
            </nav>
        </div>
    );
};

export default CustomerLayout;

