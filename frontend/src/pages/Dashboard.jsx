import { useGetDashboardStatsQuery } from '../features/dashboard/dashboardApiSlice';
import { useNavigate } from 'react-router-dom';
import {
    MdCurrencyRupee,
    MdReceiptLong,
    MdOutlinePendingActions,
    MdCheckCircleOutline,
    MdRestaurantMenu,
    MdTrendingUp,
    MdStarRate,
    MdToday,
    MdCalendarMonth,
    MdTableBar,
    MdWarningAmber,
    MdLocalFireDepartment,
    MdHistory,
    MdAddCircleOutline,
    MdPeopleAlt,
    MdShoppingBag
} from 'react-icons/md';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Subcomponents

const LoadingSkeleton = () => (
    <div className="w-full space-y-8 animate-pulse p-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl lg:col-span-2"></div>
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
    </div>
);

// Color mapping for metric cards to avoid Tailwind CSS dynamic class pruning
const themeStyles = {
    emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/20', border: 'border-emerald-200 dark:border-emerald-800/50', blob: 'bg-emerald-500', icon: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/20', border: 'border-orange-200 dark:border-orange-800/50', blob: 'bg-orange-500', icon: 'text-orange-600 dark:text-orange-400' },
    amber: { bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/20', border: 'border-amber-200 dark:border-amber-800/50', blob: 'bg-amber-500', icon: 'text-amber-600 dark:text-amber-400' },
    sky: { bg: 'bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/20', border: 'border-sky-200 dark:border-sky-800/50', blob: 'bg-sky-500', icon: 'text-sky-600 dark:text-sky-400' },
    indigo: { bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/20', border: 'border-indigo-200 dark:border-indigo-800/50', blob: 'bg-indigo-500', icon: 'text-indigo-600 dark:text-indigo-400' },
    fuchsia: { bg: 'bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-900/40 dark:to-fuchsia-800/20', border: 'border-fuchsia-200 dark:border-fuchsia-800/50', blob: 'bg-fuchsia-500', icon: 'text-fuchsia-600 dark:text-fuchsia-400' },
    rose: { bg: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/20', border: 'border-rose-200 dark:border-rose-800/50', blob: 'bg-rose-500', icon: 'text-rose-600 dark:text-rose-400' },
    violet: { bg: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/20', border: 'border-violet-200 dark:border-violet-800/50', blob: 'bg-violet-500', icon: 'text-violet-600 dark:text-violet-400' },
    pink: { bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/40 dark:to-pink-800/20', border: 'border-pink-200 dark:border-pink-800/50', blob: 'bg-pink-500', icon: 'text-pink-600 dark:text-pink-400' },
    slate: { bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50', border: 'border-slate-200 dark:border-slate-700', blob: 'bg-slate-500', icon: 'text-slate-600 dark:text-slate-400' }
};

const MetricCard = ({ title, value, icon, theme, trend }) => {
    const style = themeStyles[theme];

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-1.5 cursor-pointer group flex-1">
            <div className={`absolute -top-16 -right-16 w-32 h-32 opacity-[0.03] dark:opacity-10 rounded-full blur-2xl ${style.blob} transition-transform duration-700 group-hover:scale-150`}></div>
            
            <div className="flex justify-between items-start z-10 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${style.bg} shadow-sm border ${style.border} transition-transform duration-300 group-hover:scale-110`}>
                    <div className={`${style.icon} flex items-center justify-center drop-shadow-sm`}>
                        {icon}
                    </div>
                </div>
                {trend !== undefined && (
                    <span className={`text-[12px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm border ${trend > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800/50'}`}>
                        {trend > 0 ? <MdTrendingUp size={14} /> : <MdTrendingUp size={14} className="rotate-180" />} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            
            <div className="z-10 mt-1">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1.5">{value}</h3>
                <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading, error } = useGetDashboardStatsQuery(undefined, { pollingInterval: 15000 });

    if (isLoading) return <LoadingSkeleton />;
    if (error) return <div className="p-8 text-center text-rose-500 font-bold">Error loading dashboard stats. Check backend server.</div>;

    const getStatusCount = (statusName) => {
        if (!stats?.ordersByStatus) return 0;
        const statusItem = stats.ordersByStatus.find(s => s._id === statusName);
        return statusItem ? statusItem.count : 0;
    };

    const emptyStateSvg = <MdRestaurantMenu className="text-slate-200 dark:text-slate-800 text-6xl mx-auto mb-4" />;

    return (
        <div className="w-full space-y-8 animate-in fade-in zoom-in duration-500 pb-12 transition-colors">
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Overview Setup</h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Live performance metrics at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/menu')} className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                        <MdRestaurantMenu size={18} /> Menu
                    </button>
                    <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5">
                        <MdAddCircleOutline size={20} /> Create Order
                    </button>
                </div>
            </div>

            {/* 10-Card Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <MetricCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toFixed(0) || 0}`} icon={<MdCurrencyRupee size={28} />} theme="emerald" trend={12} />
                <MetricCard title="Daily Orders" value={stats?.totalDailyOrders || 0} icon={<MdShoppingBag size={28} />} theme="orange" trend={5} />
                <MetricCard title="Pending" value={getStatusCount('Pending')} icon={<MdOutlinePendingActions size={28} />} theme="amber" />
                <MetricCard title="Served Orders" value={getStatusCount('Served')} icon={<MdCheckCircleOutline size={28} />} theme="sky" />
                <MetricCard title="Avg Order Value" value={`₹${stats?.averageOrderValue?.toFixed(0) || 0}`} icon={<MdReceiptLong size={28} />} theme="indigo" />
                
                <MetricCard title="Active Tables" value={`${stats?.activeTables || 0} / 20`} icon={<MdTableBar size={28} />} theme="fuchsia" />
                <MetricCard title="Low Inventory" value={stats?.inventoryAlerts?.length || 0} icon={<MdWarningAmber size={28} />} theme="rose" />
                <MetricCard title="Monthly Orders" value={stats?.totalMonthlyOrders || 0} icon={<MdCalendarMonth size={28} />} theme="violet" trend={-2} />
                <MetricCard title="Most Ordered" value={stats?.mostOrderedCategory || 'N/A'} icon={<MdRestaurantMenu size={28} />} theme="pink" />
                <MetricCard title="Total Orders" value={stats?.totalOrders || 0} icon={<MdHistory size={28} />} theme="slate" />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Revenue Chart - Col Span 2 */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-500 p-2 rounded-xl"><MdTrendingUp size={20} /></span>
                                Revenue Analytics
                            </h2>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-wide">Last 7 Days Performance</p>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full mt-4">
                        {stats?.dailyRevenue?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} tickFormatter={(val) => { const d = new Date(val); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tw-prose-body)', color: '#0f172a', fontWeight: 'bold' }} itemStyle={{ color: '#f97316' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                {emptyStateSvg}
                                No revenue data recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Performing Items - Col Span 1 */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col relative overflow-hidden">
                    <div className="mb-8 relative z-10">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 p-2 rounded-xl"><MdStarRate size={20} /></span>
                            Top Performing
                        </h2>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-wide">Highest Grossing Items</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        {stats?.popularItems?.length > 0 ? (
                            stats.popularItems.slice(0, 5).map((item, idx) => (
                                <div key={item._id} className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer hover:shadow-md hover:-translate-y-0.5">
                                    <div className="relative">
                                        {item.image ? (
                                            <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><MdRestaurantMenu size={24}/></div>
                                        )}
                                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white dark:border-slate-800">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">{item.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{item.totalSold} sold</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.revenue.toFixed(0)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center font-bold p-6">
                                {emptyStateSvg}
                                No product data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Split (Recent Orders & Live Side Panels) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Recent Orders Table */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-500 p-2 rounded-xl"><MdHistory size={20} /></span>
                                Recent Orders
                            </h2>
                        </div>
                        <button onClick={() => navigate('/admin/orders')} className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="pb-4 font-bold pl-2">Order ID</th>
                                    <th className="pb-4 font-bold">Table</th>
                                    <th className="pb-4 font-bold text-right">Amount</th>
                                    <th className="pb-4 font-bold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentOrders?.length > 0 ? (
                                    stats.recentOrders.slice(0, 5).map((order) => (
                                        <tr key={order._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/orders')}>
                                            <td className="py-4 pl-2 font-bold text-slate-900 dark:text-slate-200 text-sm">#{order._id.substring(18, 24).toUpperCase()}</td>
                                            <td className="py-4 font-black text-slate-600 dark:text-slate-400">T-{order.tableNo}</td>
                                            <td className="py-4 font-bold text-slate-900 dark:text-white text-right">₹{order.totalAmount}</td>
                                            <td className="py-4 text-center">
                                                <span className={`text-[10px] font-black tracking-wide px-2.5 py-1 rounded-full uppercase ${
                                                    order.status === 'Pending' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                    order.status === 'Preparing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                    order.status === 'Served' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400 font-bold">No recent orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panels */}
                <div className="flex flex-col gap-8">
                    {/* Live Table Pipeline */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col flex-1">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-500 p-2 rounded-xl"><MdTableBar size={20} /></span>
                                Live Kitchen Feed
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {stats?.activityFeed?.length > 0 ? (
                                stats.activityFeed.slice(0, 4).map((feed, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-1.5 bg-orange-500 rounded-full shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Table <span className="text-orange-500">{feed.tableNo}</span> is <span className="lowercase">{feed.status}</span></p>
                                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{new Date(feed.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 font-bold text-sm text-center py-4">Kitchen is currently quiet.</p>
                            )}
                        </div>
                    </div>

                    {/* Low Inventory Alerts */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-rose-100 dark:border-rose-900/30 p-8 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-500 p-2 rounded-xl"><MdWarningAmber size={20} /></span>
                                Inventory Alerts
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {stats?.inventoryAlerts?.length > 0 ? (
                                stats.inventoryAlerts.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                                        <span className="text-sm font-bold text-rose-700 dark:text-rose-400 truncate pr-2">{item.name}</span>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-white bg-rose-500">Out of Stock</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-center">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">All items are sufficiently stocked!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
