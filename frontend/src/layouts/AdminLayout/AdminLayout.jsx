import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
    MdDashboard,
    MdRestaurantMenu,
    MdCategory,
    MdReceipt,
    MdTableRestaurant,
    MdPerson,
    MdLogout,
    MdLocalFireDepartment,
    MdNotifications,
    MdDarkMode,
    MdLightMode,
    MdMenuOpen,
    MdMenu,
    MdAdd,
    MdOutlinePreview,
    MdChevronRight
} from 'react-icons/md';
import { useGetOrdersQuery } from '../../features/order/orderApiSlice';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useSelector((state) => state.auth);
    const { data: ordersData } = useGetOrdersQuery(undefined, { pollingInterval: 15000 });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const pendingOrders = ordersData?.orders?.filter(o => o.status === 'Pending').length || 0;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login');
    };

    const navGroups = [
        {
            title: "Overview",
            links: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: MdDashboard }
            ]
        },
        {
            title: "Menu Management",
            links: [
                { name: 'Categories', path: '/admin/categories', icon: MdCategory },
                { name: 'Menu Items', path: '/admin/menu', icon: MdRestaurantMenu }
            ]
        },
        {
            title: "Operations",
            links: [
                { name: 'Orders', path: '/admin/orders', icon: MdReceipt, badge: pendingOrders },
                { name: 'Tables & QR', path: '/admin/tables', icon: MdTableRestaurant },
                { name: 'Preview UI', path: '/admin/user-panel', icon: MdOutlinePreview }
            ]
        },
        {
            title: "Settings",
            links: [
                { name: 'Profile', path: '/admin/profile', icon: MdPerson }
            ]
        }
    ];

    if (!userInfo) return null;

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64 lg:w-64'} bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section */}
                <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'} border-b border-slate-100 dark:border-slate-800/50 shrink-0`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-2 rounded-xl shadow-lg shadow-orange-500/20 shrink-0">
                            <MdLocalFireDepartment className="text-white text-2xl" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden whitespace-nowrap fade-in">
                                <h1 className="text-2xl tracking-normal text-slate-900 dark:text-white leading-none">
                                    <span className="font-normal">Bite</span>
                                    <span className="font-black">Bliss</span>
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-6 py-4">
                    <div className="px-4 space-y-8">
                        {navGroups.map((group, idx) => (
                            <div key={idx} className="space-y-2">
                                {!isSidebarCollapsed && (
                                    <p className="px-3 text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase fade-in">{group.title}</p>
                                )}
                                <ul className="space-y-1">
                                    {group.links.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = location.pathname.startsWith(link.path);
                                        return (
                                            <li key={link.name}>
                                                <Link
                                                    to={link.path}
                                                    onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                                    className={`group relative flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} py-3 rounded-xl transition-all duration-300 font-semibold ease-in-out px-3
                                                    ${isActive
                                                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500'
                                                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className={`w-[22px] h-[22px] transition-colors duration-300 ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                                        {!isSidebarCollapsed && <span className="text-[15px] whitespace-nowrap">{link.name}</span>}
                                                    </div>

                                                    {/* Active Indicator & Badge */}
                                                    {!isSidebarCollapsed && link.badge > 0 && (
                                                        <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                    {isSidebarCollapsed && link.badge > 0 && (
                                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all duration-300 font-semibold group`}
                    >
                        <MdLogout className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                        {!isSidebarCollapsed && <span>Sign Out</span>}
                    </button>
                    {!isSidebarCollapsed && (
                        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400 px-2">
                            <span>v2.1.0 SaaS</span>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mix-blend-multiply filter blur-[1px]"></span>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* Smart Header Topbar */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-transparent shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 transition-colors duration-300 relative">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
                    
                    {/* Header Left */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:text-orange-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                        >
                            <MdMenu size={24} />
                        </button>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <MdMenuOpen size={24} className={`transform transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="hidden md:block fade-in">
                            <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span className="font-medium text-slate-500 dark:text-slate-400">Welcome,</span> {userInfo?.adminName?.split(' ')[0]} 👋
                            </h2>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {userInfo?.restaurantName}
                            </p>
                        </div>
                    </div>

                    {/* Header Right */}
                    <div className="flex items-center gap-3 lg:gap-5">
                        {/* Quick Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <button onClick={()=>navigate('/admin/menu')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 font-bold text-sm transition-colors border border-orange-200/50 dark:border-transparent">
                                <MdAdd size={18} /> Add Item
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

                        {/* Theme Toggle */}
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="relative p-2.5 text-slate-400 dark:text-slate-300 hover:text-amber-500 transition-all duration-300 bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                            {isDarkMode ? <MdLightMode size={20} className="animate-[spin_0.5s_ease-in-out_1]" /> : <MdDarkMode size={20} className="transition-transform active:scale-90" />}
                        </button>

                        {/* Notifications */}
                        <button onClick={()=>navigate('/admin/orders')} className="relative p-2.5 text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hidden sm:block group">
                            <MdNotifications size={20} className="group-hover:animate-wiggle" />
                            {pendingOrders > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white dark:border-slate-900">
                                    {pendingOrders}
                                </span>
                            )}
                        </button>

                        {/* Profile Dropdown Minimal */}
                        <Link to="/admin/profile" className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm transition-all duration-200 group ml-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white font-black shadow-inner">
                                {userInfo?.adminName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start hidden lg:flex">
                                <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">{userInfo?.adminName}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">{userInfo?.role || 'Admin'}</span>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content Viewport */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-6 md:px-8 bg-[#F8FAFC] dark:bg-slate-900 scroll-smooth">
                    <Outlet />
                </main>
            </div>
            
            <style>{`
                .animate-wiggle {
                    animation: wiggle 1s ease-in-out infinite;
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-3deg); }
                    50% { transform: rotate(3deg); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
