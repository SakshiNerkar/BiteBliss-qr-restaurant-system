import { useState, useMemo } from 'react';
import { useGetMenuQuery, useGetReviewsQuery, useCreateReviewMutation } from '../features/menu/menuApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useGetTableOrderStatusQuery } from '../features/order/orderApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart, clearSession } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { MdAdd, MdRemove, MdFastfood, MdSearch, MdReceiptLong, MdDeleteOutline, MdStarRate, MdStar, MdClose, MdLocalFireDepartment, MdThumbUp } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/getImageUrl';

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
    const [selectedItem, setSelectedItem] = useState(null);

    const [createReview] = useCreateReviewMutation();
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [isWritingReview, setIsWritingReview] = useState(false);

    // If an order exists but is paid/cancelled, we allow NEW orders (backend handles this cleanly)
    const activeSessionFound = activeOrder && activeOrder.status !== 'Paid' && activeOrder.status !== 'Cancelled';

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

    if (isMenuLoading || isCatLoading || isOrderLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary-200 dark:bg-primary-900 rounded-full"></div>
                <div className="text-primary-600 dark:text-primary-400 font-bold tracking-widest uppercase">Loading Menu...</div>
            </div>
        </div>
    );

    try {
        const filteredItems = (menuItems || []).filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category?._id === activeCategory || item.category === activeCategory;
            const matchesSearch = (item.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes((searchTerm || '').toLowerCase()));
            return matchesCategory && matchesSearch;
        });

        const getCartQuantity = (id) => {
            const item = (cartItems || []).find(c => c._id === id);
            return item ? item.quantity : 0;
        };

        const cartTotalAmount = (cartItems || []).reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
        const cartTotalItems = (cartItems || []).reduce((acc, item) => acc + item.quantity, 0);

        // Group filtered items by subcategory conditionally
        const groupedItems = filteredItems.reduce((acc, item) => {
            const subName = item.subcategory?.name || 'Menu Iterations';
            if (!acc[subName]) acc[subName] = [];
            acc[subName].push(item);
            return acc;
        }, {});

        const sortedSubcategories = Object.keys(groupedItems).sort((a, b) => {
            if (a === 'Menu Iterations') return 1;
            if (b === 'Menu Iterations') return -1;
            return a.localeCompare(b);
        });

        const showSpotlights = searchTerm === '' && activeCategory === 'All';

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-36 font-sans">
                {/* Top Navigation */}
                <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 transition-colors">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Our Menu</h2>
                            {tableNo && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest bg-accent-50 dark:bg-accent-900/30 px-2 py-0.5 rounded-md">Table {tableNo}</span>
                                    <button onClick={() => {
                                        dispatch(clearSession());
                                        window.location.href = '/';
                                    }} className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors underline underline-offset-2">Leave</button>
                                </div>
                            )}
                        </div>

                        <div className="relative group w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            <MdLocalFireDepartment className="text-slate-600 dark:text-slate-300 group-hover:text-accent-500 transition-colors" size={20} />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                        <input
                            type="text"
                            placeholder="Search dishes, ingredients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm font-medium text-lg"
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setActiveCategory('All')}
                            className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all flex-shrink-0 border-2 ${activeCategory === 'All' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            Explore All
                        </button>
                        {categories?.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat._id)}
                                className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all flex-shrink-0 border-2 ${activeCategory === cat._id ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
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
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                        {subName}
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                        {groupedItems[subName].map(item => <ItemCard key={item._id} item={item} qty={getCartQuantity(item._id)} onQuantityChange={handleQuantityChange} onAdd={handleInitialAdd} onSelect={setSelectedItem} />)}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </div>

                {/* Sticky Live Bill Banner */}
                {(cartItems.length > 0 || activeSessionFound) && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-colors">
                        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex flex-shrink-0 items-center justify-center text-primary-600 dark:text-primary-400 shadow-inner">
                                    <MdReceiptLong size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">
                                        {activeSessionFound ? 'Live Bill Running' : 'Your Order'}
                                    </p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                        ₹{cartTotalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (cartItems.length > 0) navigate('/cart');
                                    else navigate('/order-status');
                                }}
                                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {cartItems.length > 0
                                    ? (activeSessionFound ? 'Add to Bill' : 'Review & Place Order')
                                    : 'View Live Tracker'
                                }
                                <div className="bg-white/20 px-2 py-0.5 rounded text-sm ml-2">
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
    } catch (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-red-500">
                <h1 className="text-3xl font-black mb-4">React Render Crash</h1>
                <p className="font-bold">{error.message}</p>
                <pre className="text-xs text-left bg-slate-100 p-4 rounded-xl mt-4 max-w-2xl overflow-auto">{error.stack}</pre>
            </div>
        );
    }
};

const ItemCard = ({ item, qty, onQuantityChange, onAdd, onSelect }) => {
    const rating = (item.ratingsAverage || (Math.random() * (4.8 - 3.5) + 3.5)).toFixed(1);

    return (
        <div
            onClick={() => item.isAvailable && onSelect({ ...item, computedRating: rating })}
            className={`bg-white dark:bg-slate-900 rounded-[20px] shadow-sm hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-900/20 overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-all duration-300 relative group ${item.isAvailable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed opacity-75'}`}
        >
            <div className={`aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center relative overflow-hidden flex-shrink-0 ${!item.isAvailable ? 'grayscale-[0.8]' : ''}`}>
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">Sold Out</span>
                    </div>
                )}
                {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className={`w-full h-full object-cover transition-transform duration-700 ${item.isAvailable ? 'group-hover:scale-110' : ''}`} />
                ) : (
                    <MdFastfood size={48} className="text-slate-300 dark:text-slate-700" />
                )}

                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <MdStarRate className="text-amber-400" size={14} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rating}</span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed mb-4 flex-grow">
                    {item.description || "A delicious meal crafted beautifully for you."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-black text-slate-900 dark:text-white text-xl">₹{item.price.toFixed(2)}</span>

                    {!item.isAvailable ? (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg uppercase tracking-wider">Out</span>
                    ) : qty > 0 ? (
                        <div className="flex items-center bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl overflow-hidden h-9 shadow-sm" onClick={e => e.stopPropagation()}>
                            <button onClick={() => onQuantityChange(item, 'dec')} className="w-8 h-full flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
                                {qty === 1 ? <MdDeleteOutline size={16} /> : <MdRemove size={16} />}
                            </button>
                            <span className="w-8 text-center font-bold text-primary-700 dark:text-primary-300 text-sm">{qty}</span>
                            <button onClick={() => onQuantityChange(item, 'inc')} className="w-8 h-full flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
                                <MdAdd size={16} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); onAdd(item); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-colors shadow-sm">
                            <MdAdd size={20} />
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
