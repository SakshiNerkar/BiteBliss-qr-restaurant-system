import { useState, useMemo } from 'react';
import { useGetMenuQuery, useGetReviewsQuery, useCreateReviewMutation } from '../features/menu/menuApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useGetTableOrderStatusQuery } from '../features/order/orderApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart, clearSession } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { MdAdd, MdRemove, MdFastfood, MdSearch, MdReceiptLong, MdDeleteOutline, MdStarRate, MdStar, MdClose, MdLocalFireDepartment, MdThumbUp, MdSort, MdDarkMode, MdLightMode, MdFilterList, MdHome, MdShoppingCart, MdHistory, MdRestaurantMenu, MdWineBar, MdCoffee, MdIcecream, MdLunchDining, MdLocalPizza, MdSetMeal } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/getImageUrl';
import { useEffect, useRef } from 'react';

const CustomerMenu = () => {
    const { data: menuItems, isLoading: isMenuLoading } = useGetMenuQuery();
    const { data: categories, isLoading: isCatLoading } = useGetCategoriesQuery();

    // Secure session state
    const { tableNo, cartItems } = useSelector((state) => state.cart);
    const { data: activeOrder, isLoading: isOrderLoading } = useGetTableOrderStatusQuery(tableNo, {
        skip: !tableNo,
        refetchOnMountOrArgChange: true
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('none'); // 'none', 'lowToHigh', 'highToLow'
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initialize from local storage or system preference
        return localStorage.getItem('theme') === 'dark' || 
               (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const [selectedItem, setSelectedItem] = useState(null);

    const [createReview] = useCreateReviewMutation();
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [isWritingReview, setIsWritingReview] = useState(false);

    // Dark Mode Side Effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Derived State
    const activeSessionFound = activeOrder && activeOrder.status !== 'Paid' && activeOrder.status !== 'Cancelled';

    const popularItems = useMemo(() => {
        return [...(menuItems || [])]
            .filter(item => item.isAvailable)
            .sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
            .slice(0, 4);
    }, [menuItems]);

    const recommendedItems = useMemo(() => {
        return [...(menuItems || [])]
            .filter(item => item.isAvailable)
            .sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0))
            .filter(item => !popularItems.find(p => p._id === item._id)) // Avoid duplicates
            .slice(0, 4);
    }, [menuItems, popularItems]);

    const filteredItems = useMemo(() => {
        let items = (menuItems || []).filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category?._id === activeCategory || item.category === activeCategory;
            const matchesSearch = (item.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes((searchTerm || '').toLowerCase()));
            return matchesCategory && matchesSearch;
        });

        if (sortOrder === 'lowToHigh') {
            return [...items].sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'highToLow') {
            return [...items].sort((a, b) => b.price - a.price);
        }
        return items;
    }, [menuItems, activeCategory, searchTerm, sortOrder]);

    const getCartQuantity = (id) => {
        const item = (cartItems || []).find(c => c._id === id);
        return item ? item.quantity : 0;
    };

    const cartTotalAmount = useMemo(() => 
        (cartItems || []).reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0)
    , [cartItems]);

    const cartTotalItems = useMemo(() => 
        (cartItems || []).reduce((acc, item) => acc + item.quantity, 0)
    , [cartItems]);

    const groupedItems = useMemo(() => {
        return filteredItems.reduce((acc, item) => {
            const subName = item.subcategory?.name || 'Menu Iterations';
            if (!acc[subName]) acc[subName] = [];
            acc[subName].push(item);
            return acc;
        }, {});
    }, [filteredItems]);

    const sortedSubcategories = useMemo(() => {
        return Object.keys(groupedItems).sort((a, b) => {
            if (a === 'Menu Iterations') return 1;
            if (b === 'Menu Iterations') return -1;
            return a.localeCompare(b);
        });
    }, [groupedItems]);

    const showSpotlights = searchTerm === '' && activeCategory === 'All';

    // Event Handlers
    const handleInitialAdd = (item) => {
        dispatch(addToCart({ ...item, quantity: 1 }));
        toast.success(`Added ${item.name} to cart!`, { autoClose: 1500 });
    };

    const handleQuantityChange = (item, type) => {
        const cartItem = cartItems.find(c => c._id === item._id);
        if (!cartItem) return;

        let newQty = type === 'inc' ? cartItem.quantity + 1 : cartItem.quantity - 1;
        if (newQty > 0) {
            dispatch(updateQuantity({ id: item._id, quantity: newQty }));
        } else {
            dispatch(removeFromCart(item._id));
        }
    };

    // Category Icon Mapping
    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('pizza')) return <MdLocalPizza size={20} />;
        if (lower.includes('burger') || lower.includes('fast')) return <MdLunchDining size={20} />;
        if (lower.includes('drink') || lower.includes('bev')) return <MdWineBar size={20} />;
        if (lower.includes('coffee') || lower.includes('tea')) return <MdCoffee size={20} />;
        if (lower.includes('dessert') || lower.includes('sweet')) return <MdIcecream size={20} />;
        if (lower.includes('meal') || lower.includes('main')) return <MdSetMeal size={20} />;
        return <MdRestaurantMenu size={20} />;
    };

    if (isMenuLoading || isCatLoading || isOrderLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-pulse flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-primary-200 dark:bg-primary-900/50 rounded-3xl animate-bounce flex items-center justify-center shadow-xl shadow-primary-500/20">
                    <MdRestaurantMenu className="text-primary-600 dark:text-primary-400" size={40} />
                </div>
                <div className="text-primary-600 dark:text-primary-400 font-black tracking-widest uppercase text-sm">Crafting Magic...</div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-[#020617] transition-all duration-700 pb-36 font-sans ${isDarkMode ? 'dark' : ''} animate-in fade-in duration-1000`}>
                {/* Top Navigation */}
                <div className="sticky top-0 z-50 glass-card border-b border-white/10 dark:border-white/5 px-4 sm:px-6 py-4 transition-all">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30 animate-float">
                                <MdRestaurantMenu size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">BiteBliss</h2>
                                {tableNo && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-accent-600 dark:text-accent-400 uppercase tracking-widest bg-accent-50 dark:bg-accent-900/30 px-2 py-0.5 rounded-md">Table {tableNo}</span>
                                        <button onClick={() => {
                                            dispatch(clearSession());
                                            window.location.href = '/';
                                        }} className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors uppercase font-bold tracking-tighter">Exit</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-all active:scale-90"
                            >
                                {isDarkMode ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                    {/* Hero Section */}
                    <div className="mb-10">
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                            Fresh & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Delicious</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">Discover the finest flavors crafted with authentic ingredients and passion.</p>
                    </div>

                    {/* Search & Sort Area */}
                    <div className="flex flex-col gap-6 mb-10">
                        <div className="relative group soft-glow">
                            <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-all" size={26} />
                            <input
                                type="text"
                                placeholder="What are you craving today?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-all premium-shadow font-semibold text-lg"
                            />
                        </div>
 
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                            <div className="flex items-center gap-2 bg-primary-100 dark:bg-primary-900/20 px-5 py-3 rounded-2xl text-primary-600 dark:text-primary-400 shrink-0">
                                <MdSort size={22} />
                                <span className="text-xs font-black uppercase tracking-widest">Sort Price</span>
                            </div>
                            
                            <button 
                                onClick={() => setSortOrder(sortOrder === 'lowToHigh' ? 'none' : 'lowToHigh')}
                                className={`whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 active:scale-95 ${sortOrder === 'lowToHigh' ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}
                            >
                                Low to High
                            </button>
                            
                            <button 
                                onClick={() => setSortOrder(sortOrder === 'highToLow' ? 'none' : 'highToLow')}
                                className={`whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 active:scale-95 ${sortOrder === 'highToLow' ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}
                            >
                                High to Low
                            </button>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setActiveCategory('All')}
                            className={`whitespace-nowrap px-8 py-4 rounded-2xl text-sm font-black transition-all flex-shrink-0 flex items-center gap-3 border-2 active:scale-95 ${activeCategory === 'All' ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-600/30' : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-900/40'}`}
                        >
                            <MdRestaurantMenu size={22} />
                            Explore All
                        </button>
                        {categories?.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat._id)}
                                className={`whitespace-nowrap px-8 py-4 rounded-2xl text-sm font-black transition-all flex-shrink-0 flex items-center gap-3 border-2 active:scale-95 ${activeCategory === cat._id ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-600/30' : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-900/40'}`}
                            >
                                {getCategoryIcon(cat.name)}
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Spotlights Sections (Popular & Recommended) */}
                    {showSpotlights && (
                        <div className="space-y-12 mb-12">
                            {popularItems.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
                                            <MdLocalFireDepartment size={18} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Most Popular</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {popularItems.map(item => <ItemCard key={`pop-${item._id}`} item={item} qty={getCartQuantity(item._id)} onQuantityChange={handleQuantityChange} onAdd={handleInitialAdd} onSelect={setSelectedItem} />)}
                                    </div>
                                </section>
                            )}

                            {recommendedItems.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                            <MdThumbUp size={18} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recommended For You</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {recommendedItems.map(item => <ItemCard key={`rec-${item._id}`} item={item} qty={getCartQuantity(item._id)} onQuantityChange={handleQuantityChange} onAdd={handleInitialAdd} onSelect={setSelectedItem} />)}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {/* Main Menu Grid by Subcategories */}
                    <div className="space-y-12">
                        {filteredItems.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 drop-shadow-sm">
                                    <MdSearch size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No items found</h3>
                                <p className="font-medium text-slate-500">We couldn't find anything matching your search.</p>
                                {searchTerm && <button onClick={() => setSearchTerm('')} className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-full active:scale-95 transition-transform hover:bg-slate-800 dark:hover:bg-slate-200">Clear Search</button>}
                            </div>
                        ) : (
                            sortedSubcategories.map(subName => (
                                <section key={subName}>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter flex items-center gap-4 group">
                                        <span className="relative">
                                            {subName}
                                            <div className="absolute -bottom-2 left-0 w-8 h-1 bg-primary-500 rounded-full group-hover:w-full transition-all duration-500"></div>
                                        </span>
                                        <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 dark:to-transparent"></div>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                                        {groupedItems[subName].map((item, idx) => <ItemCard key={item._id} item={item} idx={idx} qty={getCartQuantity(item._id)} onQuantityChange={handleQuantityChange} onAdd={handleInitialAdd} onSelect={setSelectedItem} />)}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </div>

                {/* Sticky Live Bill Banner */}
                {(cartItems.length > 0 || activeSessionFound) && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-lg glass-card rounded-[2.5rem] border border-white/20 dark:border-white/10 premium-shadow p-2 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="flex items-center justify-between gap-2 p-1">
                            <div className="flex items-center gap-4 pl-4 shrink-0">
                                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30 animate-pulse">
                                    <MdReceiptLong size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                                        {activeSessionFound ? 'Live Bill' : 'My Order'}
                                    </p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                        ₹{cartTotalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
 
                            <button
                                onClick={() => {
                                    if (cartItems.length > 0) navigate('/cart');
                                    else navigate('/order-status');
                                }}
                                className="px-6 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.75rem] font-black text-sm shadow-xl shadow-primary-600/30 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <span className="uppercase tracking-widest">View Order</span>
                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[11px]">
                                    {cartTotalItems}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Detailed Item Modal Overlay */}
                {selectedItem && (
                    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}>
                        <div
                            onClick={e => e.stopPropagation()}
                            className="w-full sm:w-[500px] bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800"
                        >
                            {/* Image Header */}
                            <div className="relative h-72 sm:h-80 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                                {selectedItem.image ? (
                                    <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                        <MdFastfood size={80} />
                                    </div>
                                )}

                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                                >
                                    <MdClose size={24} />
                                </button>

                                {/* Modal Rating Floating Block */}
                                <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 shadow-lg px-4 py-2 rounded-xl flex items-center gap-1.5 border border-slate-100 dark:border-slate-800">
                                    <MdStarRate className="text-amber-400" size={20} />
                                    <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">{selectedItem.computedRating || "4.5"}</span>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-hide space-y-8 bg-white dark:bg-slate-950">
                                <div>
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{selectedItem.name}</h2>
                                        <span className="text-3xl font-black text-primary-600 dark:text-primary-400 whitespace-nowrap">₹{selectedItem.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                                        {selectedItem.description || "A delicious meal crafted beautifully for you. Perfect blend of authentic spices."}
                                    </p>
                                </div>

                                {/* Reviews Section Interface */}
                                <ItemReviewsWrapper
                                    item={selectedItem}
                                    tableNo={tableNo}
                                    isWritingReview={isWritingReview}
                                    setIsWritingReview={setIsWritingReview}
                                    reviewText={reviewText}
                                    setReviewText={setReviewText}
                                    reviewRating={reviewRating}
                                    setReviewRating={setReviewRating}
                                    createReview={createReview}
                                />
                            </div>

                            {/* Modal Footer (Sticky add button) */}
                            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                                {(() => {
                                    const qty = getCartQuantity(selectedItem._id);
                                    return qty > 0 ? (
                                        <div className="flex items-center justify-between bg-white dark:bg-slate-950 border-2 border-primary-500 rounded-2xl p-1 shadow-sm w-full h-16">
                                            <button onClick={() => handleQuantityChange(selectedItem, 'dec')} className="w-14 h-full flex items-center justify-center text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                                                {qty === 1 ? <MdDeleteOutline size={24} /> : <MdRemove size={24} />}
                                            </button>
                                            <span className="flex-1 text-center font-black text-primary-600 text-2xl">{qty}</span>
                                            <button onClick={() => handleQuantityChange(selectedItem, 'inc')} className="w-14 h-full flex items-center justify-center text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                                                <MdAdd size={24} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleInitialAdd(selectedItem)} className="w-full h-16 rounded-2xl font-bold text-xl transition-all shadow-lg bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/30 active:scale-95 flex items-center justify-center gap-2">
                                            <MdAdd size={24} />
                                            Add to Order Request
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
};
const ItemCard = ({ item, idx, qty, onQuantityChange, onAdd, onSelect }) => {
    const rating = (item.ratingsAverage || (Math.random() * (4.8 - 3.5) + 3.5)).toFixed(1);
    const isSpicy = item.description?.toLowerCase().includes('spicy');
    const isPopular = item.totalOrders > 10;

    return (
        <div
            onClick={() => item.isAvailable && onSelect({ ...item, computedRating: rating })}
            style={{ animationDelay: `${idx * 100}ms` }}
            className={`glass-card rounded-[2.5rem] premium-shadow hover:shadow-2xl hover:shadow-primary-500/20 overflow-hidden border border-white/10 dark:border-white/5 flex flex-col h-full transition-all duration-500 group animate-fade-in-up ${item.isAvailable ? 'cursor-pointer hover:-translate-y-3' : 'cursor-not-allowed opacity-60 grayscale-[0.5]'}`}
        >
            <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] z-10 flex items-center justify-center">
                        <span className="bg-white text-slate-900 px-6 py-2 rounded-2xl text-xs font-black tracking-widest uppercase shadow-2xl">Sold Out</span>
                    </div>
                )}
                {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${item.isAvailable ? 'group-hover:scale-125' : ''}`} />
                ) : (
                    <MdFastfood size={64} className="text-slate-300 dark:text-slate-700" />
                )}

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isSpicy && <div className="bg-red-500 text-white p-2 rounded-xl shadow-lg"><MdLocalFireDepartment size={18} /></div>}
                    {isPopular && <div className="bg-amber-500 text-white p-2 rounded-xl shadow-lg"><MdThumbUp size={16} /></div>}
                </div>

                <div className="absolute top-4 right-4 glass-card px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl border-white/20">
                    <MdStarRate className="text-amber-400" size={18} />
                    <span className="text-sm font-black text-slate-800 dark:text-white">{rating}</span>
                </div>
            </div>
 
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl leading-tight line-clamp-2 uppercase tracking-tight">{item.name}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed mb-6 flex-grow">
                    {item.description || "A masterfully crafted signature dish bursting with authentic flavors."}
                </p>
 
                <div className="flex items-center justify-between mt-auto pt-4 gap-4">
                    <span className="font-black text-primary-600 dark:text-primary-400 text-2xl tracking-tighter">₹{item.price.toFixed(2)}</span>
 
                    {!item.isAvailable ? (
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl uppercase tracking-widest">Out</span>
                    ) : qty > 0 ? (
                        <div className="flex items-center bg-primary-600 rounded-2xl overflow-hidden h-12 shadow-xl shadow-primary-600/30 p-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => onQuantityChange(item, 'dec')} className="w-10 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-xl font-bold">
                                {qty === 1 ? <MdDeleteOutline size={20} /> : <MdRemove size={20} />}
                            </button>
                            <span className="w-8 text-center font-black text-white text-lg leading-none">{qty}</span>
                            <button onClick={() => onQuantityChange(item, 'inc')} className="w-10 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-xl font-bold">
                                <MdAdd size={20} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); onAdd(item); }} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-all shadow-lg active:scale-90 premium-shadow">
                            <MdAdd size={24} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Extracted Subcomponent for cleaner markup
const ItemReviewsWrapper = ({ item, tableNo, isWritingReview, setIsWritingReview, reviewText, setReviewText, reviewRating, setReviewRating, createReview }) => {
    const { data: reviews, isLoading } = useGetReviewsQuery(item._id, { skip: !item._id });

    const submitReview = async () => {
        if (!tableNo) return toast.error("Session missing table number.");
        if (reviewText.trim().length < 3) return toast.error("Please explicitly write your thoughts.");

        try {
            await createReview({ menuId: item._id, tableNo, rating: reviewRating, reviewText }).unwrap();
            toast.success("Review posted successfully!");
            setIsWritingReview(false);
            setReviewText('');
            setReviewRating(5);
        } catch (err) {
            toast.error(err?.data?.message || "Could not post review. Have you ordered this yet?");
        }
    };

    if (isLoading) return <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-24 rounded-2xl w-full"></div>;

    return (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">Authentic Reviews</h4>
                    <p className="text-xs text-slate-500 font-medium">Verified purchases only.</p>
                </div>
                {!isWritingReview && (
                    <button onClick={() => setIsWritingReview(true)} className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                        Leave a Review
                    </button>
                )}
            </div>

            {isWritingReview && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl mb-6">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">How was your meal?</p>
                    <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <MdStar key={star} size={32} className={`cursor-pointer transition-colors hover:scale-110 active:scale-90 ${reviewRating >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} onClick={() => setReviewRating(star)} />
                        ))}
                    </div>
                    <textarea
                        className="w-full text-base p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none transition-all placeholder-slate-400"
                        rows="3"
                        placeholder="Tell us what you liked..."
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setIsWritingReview(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                        <button onClick={submitReview} className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-600/20 active:scale-95 transition-all">Submit</button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {(!reviews || reviews.length === 0) ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl text-center border border-slate-100 dark:border-slate-800 border-dashed">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-italic">No reviews yet. Be the first to tell us!</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-sm">
                                        {review.reviewerName?.charAt(0) || 'G'}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm block">{review.reviewerName}</span>
                                        <span className="text-[11px] text-slate-400 font-medium block">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex text-amber-400 items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg text-xs font-bold gap-1">
                                    {review.rating}.0 <MdStarRate size={14} />
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-13">{review.reviewText}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CustomerMenu;
