import { useNavigate } from 'react-router-dom';
import {
    MdQrCodeScanner, MdRestaurantMenu, MdOutlineTrackChanges,
    MdSpeed, MdAdminPanelSettings, MdCheckCircle, MdPhone, MdLocationOn, MdEmail
} from 'react-icons/md';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden selection:bg-primary-200 selection:text-primary-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-200">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="text-white font-black text-2xl leading-none px-1">B</span>
                        </div>
                        <h1 className="text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500 leading-none font-bold">
                            Bite<span className="font-extrabold text-slate-900 dark:text-white">Bliss</span>
                        </h1>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">How it Works</a>
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 rounded-full transition-colors"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center relative">
                {/* Decorative background blurs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-300/20 dark:bg-primary-900/20 rounded-full blur-3xl -z-10 animate-pulse hidden md:block"></div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[1.1]">
                    <span className="block mb-2">Scan. Order.</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Enjoy.</span>
                </h1>

                <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                    Transform your restaurant experience with a seamless, contactless QR ordering platform. Empower your customers and optimize your kitchen instantly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    <button
                        onClick={() => navigate('/table/12')}
                        className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-1 hover:shadow-primary-500/40 flex items-center justify-center gap-3 active:scale-95"
                    >
                        <MdQrCodeScanner size={24} />
                        Open Customer Menu
                    </button>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-full font-bold text-lg shadow-sm transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <MdAdminPanelSettings size={26} className="text-accent-500" />
                        Admin Dashboard
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-3">Enterprise Grade</h2>
                        <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Everything you need to run smoothly.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: MdQrCodeScanner, title: 'QR Code Ordering', desc: 'Instant access to dynamic, digital menus via unique table QR codes.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                            { icon: MdRestaurantMenu, title: 'Contactless Dining', desc: 'Hygienic, zero-touch browsing and ordering right from the customer phone.', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                            { icon: MdOutlineTrackChanges, title: 'Live Order Tracking', desc: 'Real-time kitchen status updates directly to the connected device.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                            { icon: MdSpeed, title: 'Fast Checkout', desc: 'Pay instantly via Stripe or securely at the counter without waiting.', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 group">
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                        <h2 className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-3">Simple Process</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-8">How BiteBliss Works</h3>

                        <div className="space-y-6">
                            {[
                                { step: '1', title: 'Scan QR Code', desc: 'Customers sit down and scan the code on their table.' },
                                { step: '2', title: 'Browse Menu', desc: 'Interact with high-res images and detailed item modals.' },
                                { step: '3', title: 'Add Items', desc: 'Send items directly to the kitchen display system (KDS).' },
                                { step: '4', title: 'Track Order', desc: 'Watch real-time progress from Pending to Served.' },
                                { step: '5', title: 'Pay Bill', desc: 'Instant digital checkout or traditional counter payment.' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-5">
                                    <div className="w-10 h-10 shrink-0 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-black rounded-full flex items-center justify-center text-lg mt-1">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Graphic Representation */}
                    <div className="flex-1 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[3xl] p-4 sm:p-8 md:p-12 shadow-inner border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/20 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>

                        {/* High-Fidelity App Mockup: Order Tracking */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border-8 border-white dark:border-slate-800 relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto">
                            {/* App Header */}
                            <div className="bg-primary-600 text-white p-6 pb-8 rounded-b-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><MdQrCodeScanner size={16} /></div>
                                    <div className="font-bold tracking-widest text-sm text-primary-100 uppercase">Table 12</div>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">...</div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-primary-100 font-medium mb-1">Order #BITE-892</p>
                                    <h3 className="text-3xl font-black">Preparing</h3>
                                </div>
                            </div>

                            {/* App Body - Order Tracking Timeline */}
                            <div className="p-6 -mt-4 relative z-20">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700 mb-6">
                                    <div className="relative pl-8 space-y-6">
                                        {/* Timeline Line */}
                                        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-slate-700"></div>
                                        <div className="absolute left-[11px] top-2 h-1/2 w-[2px] bg-primary-500"></div>

                                        {/* Step 1: Placed */}
                                        <div className="relative">
                                            <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary-500 border-4 border-white dark:border-slate-800 flex items-center justify-center">
                                                <MdCheckCircle className="text-white text-sm" />
                                            </div>
                                            <h4 className="text-slate-900 dark:text-white font-bold text-sm">Order Placed</h4>
                                            <p className="text-slate-500 text-xs">12:42 PM</p>
                                        </div>

                                        {/* Step 2: Preparing (Active) */}
                                        <div className="relative">
                                            <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary-500 border-4 border-white dark:border-slate-800 flex items-center justify-center animate-pulse">
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            </div>
                                            <h4 className="text-primary-600 dark:text-primary-400 font-bold text-sm">In the Kitchen</h4>
                                            <p className="text-slate-500 text-xs text-primary-500/80 font-medium">Chef is preparing your meal</p>
                                        </div>

                                        {/* Step 3: Served (Pending) */}
                                        <div className="relative">
                                            <div className="absolute -left-8 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800"></div>
                                            <h4 className="text-slate-400 dark:text-slate-500 font-bold text-sm">Served to Table</h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Summary */}
                                <h4 className="font-bold text-slate-900 dark:text-white mb-3 px-1 text-sm uppercase tracking-wider">Your Items</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200 to-orange-300"></div>
                                            <div>
                                                <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1">Truffle Burger</h5>
                                                <p className="text-xs text-slate-500 font-medium">Qty: 2</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">₹560</div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-200 to-teal-300"></div>
                                            <div>
                                                <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1">Mint Mojito</h5>
                                                <p className="text-xs text-slate-500 font-medium">Qty: 1</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">₹150</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preview Cards Section */}
            <section className="py-24 bg-slate-900 text-white border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-5xl font-extrabold mb-4">Powerful Dashboards & UI</h3>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Purpose-built interfaces designed specifically for restaurant operations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Admin Analytics Card */}
                        <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-700 hover:border-primary-500 transition-colors flex flex-col group relative overflow-hidden z-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent -z-10 group-hover:from-primary-500/10 transition-colors"></div>
                            <h4 className="font-bold text-xl mb-2 flex items-center gap-2"><MdAdminPanelSettings className="text-primary-400 group-hover:scale-110 transition-transform" /> Admin Analytics</h4>
                            <p className="text-slate-400 text-sm mb-6 flex-grow">Track revenue, monitor daily orders, and analyze most popular items securely.</p>

                            {/* High-Fidelity UI Mockup: Dashboard */}
                            <div className="h-48 rounded-2xl border border-slate-600 bg-[#0f172a] shadow-inner overflow-hidden relative group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all flex flex-col">
                                <div className="p-3 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between shadow-sm z-10">
                                    <div className="text-xs font-bold text-white">Dashboard</div>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></div>
                                </div>
                                <div className="flex-1 p-3 flex flex-col gap-3 relative">
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-[#1e293b] rounded-lg p-2 border border-slate-700/50 relative overflow-hidden">
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Revenue</div>
                                            <div className="text-sm font-black text-white">₹45.2k</div>
                                        </div>
                                        <div className="flex-1 bg-[#1e293b] rounded-lg p-2 border border-slate-700/50 relative overflow-hidden">
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Orders</div>
                                            <div className="text-sm font-black text-white">128</div>
                                        </div>
                                    </div>
                                    {/* Chart Curve */}
                                    <div className="flex-1 bg-[#1e293b] rounded-lg border border-slate-700/50 relative overflow-hidden px-2 pt-2">
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pl-1 mb-1">Growth</div>
                                        <svg viewBox="0 0 100 40" className="absolute bottom-0 left-0 w-full h-24 preserveAspectRatio-none" preserveAspectRatio="none">
                                            <path d="M0,40 L0,25 Q15,15 30,22 T60,10 T85,15 T100,5 L100,40 Z" fill="url(#gradDash)" opacity="0.4" />
                                            <path d="M0,25 Q15,15 30,22 T60,10 T85,15 T100,5" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="30" cy="21.5" r="2" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                                            <circle cx="60" cy="9.5" r="2" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                                            <circle cx="85" cy="14.5" r="2" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                                            <defs>
                                                <linearGradient id="gradDash" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Menu Card */}
                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 hover:border-accent-500 transition-colors md:-translate-y-8 flex flex-col group relative overflow-hidden z-0 shadow-2xl shadow-slate-900/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent -z-10 group-hover:from-accent-500/10 transition-colors"></div>
                            <h4 className="font-bold text-xl mb-2 flex items-center gap-2"><MdRestaurantMenu className="text-accent-400 group-hover:scale-110 transition-transform" /> Customer Menu</h4>
                            <p className="text-slate-400 text-sm mb-6 flex-grow">Beautiful, image-first catalog view designed to increase cart sizing.</p>

                            {/* High-Fidelity UI Mockup: Customer Menu */}
                            <div className="h-48 rounded-2xl border border-slate-600 bg-white dark:bg-[#0f172a] shadow-inner overflow-hidden relative group-hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] transition-all flex flex-col">
                                {/* Mobile notch/header */}
                                <div className="bg-white dark:bg-[#1e293b] h-10 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-10 py-2">
                                    <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600"></div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Main Course</div>
                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                                    </div>
                                </div>
                                <div className="flex-1 p-3 bg-slate-50 dark:bg-[#0f172a] flex flex-col gap-3 overflow-hidden">
                                    {/* Item 1 */}
                                    <div className="bg-white dark:bg-[#1e293b] rounded-xl p-2 flex gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="w-14 h-14 rounded-lg bg-gradient-to-tr from-amber-200 to-orange-300 shrink-0 shadow-inner"></div>
                                        <div className="flex flex-col justify-center flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="h-3 w-20 bg-slate-800 dark:bg-slate-200 rounded-full"></div>
                                                <div className="h-3 w-8 bg-accent-500/20 rounded-full"></div>
                                            </div>
                                            <div className="h-2 w-3/4 bg-slate-300 dark:bg-slate-600 rounded-full mb-1"></div>
                                            <div className="h-2 w-1/2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    {/* Item 2 */}
                                    <div className="bg-white dark:bg-[#1e293b] rounded-xl p-2 flex gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="w-14 h-14 rounded-lg bg-gradient-to-tr from-emerald-200 to-teal-300 shrink-0 shadow-inner"></div>
                                        <div className="flex flex-col justify-center flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="h-3 w-24 bg-slate-800 dark:bg-slate-200 rounded-full"></div>
                                                <div className="h-3 w-8 bg-accent-500/20 rounded-full"></div>
                                            </div>
                                            <div className="h-2 w-2/3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Floating Checkout Button */}
                                <div className="absolute bottom-2 left-3 right-3 h-10 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-lg flex items-center justify-between px-4 z-20">
                                    <div className="w-6 h-6 rounded bg-white/20"></div>
                                    <div className="h-3 w-24 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Kitchen Display Content */}
                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 hover:border-orange-500 transition-colors flex flex-col group relative overflow-hidden z-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent -z-10 group-hover:from-orange-500/10 transition-colors"></div>
                            <h4 className="font-bold text-xl mb-2 flex items-center gap-2"><MdSpeed className="text-orange-400 group-hover:scale-110 transition-transform" /> Kitchen Display</h4>
                            <p className="text-slate-400 text-sm mb-6 flex-grow">Live KDS system with timers to maintain Service Level Agreements (SLAs).</p>

                            {/* High-Fidelity UI Mockup: KDS */}
                            <div className="h-48 rounded-2xl border border-slate-600 bg-[#0f172a] shadow-inner overflow-hidden relative group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all flex flex-col p-3 gap-3">
                                {/* KDS Header */}
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex gap-2">
                                        <div className="h-5 w-16 bg-slate-700 rounded-full font-bold text-[9px] text-white flex items-center justify-center">Pending (5)</div>
                                        <div className="h-5 w-16 bg-[#1e293b] text-slate-400 rounded-full font-bold text-[9px] flex items-center justify-center">Ready (2)</div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">15:23 PM</div>
                                </div>

                                <div className="flex gap-3 h-full">
                                    {/* Ticket 1: Urgent */}
                                    <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-rose-500/30 flex flex-col overflow-hidden relative shadow-lg">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
                                        <div className="bg-rose-50 dark:bg-rose-500/10 p-2 flex justify-between items-center border-b border-rose-100 dark:border-rose-500/20">
                                            <div className="text-[10px] font-black text-rose-700 dark:text-rose-400">#102</div>
                                            <div className="text-[9px] font-bold text-rose-600 dark:text-rose-300 bg-rose-200 dark:bg-rose-500/20 px-2 py-0.5 rounded-sm">18m</div>
                                        </div>
                                        <div className="p-2 space-y-2 flex-1 bg-white dark:bg-[#1e293b]">
                                            <div className="flex items-start gap-1">
                                                <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">2x</div>
                                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded mt-1"></div>
                                            </div>
                                            <div className="flex items-start gap-1">
                                                <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">1x</div>
                                                <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-600 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket 2: Normal */}
                                    <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden relative shadow-lg">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
                                        <div className="bg-slate-50 dark:bg-slate-800 p-2 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                                            <div className="text-[10px] font-black text-slate-800 dark:text-white">#105</div>
                                            <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-sm">3m</div>
                                        </div>
                                        <div className="p-2 space-y-2 flex-1 bg-white dark:bg-[#1e293b]">
                                            <div className="flex items-start gap-1">
                                                <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">1x</div>
                                                <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-600 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-950 pt-20 pb-10 border-t border-slate-100 dark:border-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-primary-500 w-8 h-8 rounded flex items-center justify-center text-white font-black">B</div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">BiteBliss.</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 font-medium">Empowering restaurants with modern, scalable, and intuitive digital ordering solutions.</p>
                            <div className="flex gap-4 text-slate-400">
                                {/* Social placeholders */}
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:text-primary-600 transition-colors cursor-pointer">In</div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:text-primary-600 transition-colors cursor-pointer">X</div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:text-primary-600 transition-colors cursor-pointer">Fb</div>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Contact Us</h5>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                                <li className="flex items-center gap-3"><MdLocationOn size={18} className="text-primary-500" /> 123 Tech Park, SF, CA</li>
                                <li className="flex items-center gap-3"><MdPhone size={18} className="text-primary-500" /> (555) 123-4567</li>
                                <li className="flex items-center gap-3"><MdEmail size={18} className="text-primary-500" /> hello@bitebliss.io</li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Legal & Links</h5>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                                <li><a href="/admin/login" className="hover:text-primary-600 transition-colors font-bold text-slate-700 dark:text-slate-300">Staff Portal</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} BiteBliss. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
