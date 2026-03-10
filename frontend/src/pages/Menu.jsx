import { useState } from 'react';
import { useGetMenuQuery, useCreateMenuItemMutation, useUpdateMenuItemMutation, useDeleteMenuItemMutation } from '../features/menu/menuApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useGetSubcategoriesQuery } from '../features/subcategory/subcategoryApiSlice';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDeleteOutline, MdFastfood, MdSave, MdArrowBack, MdSearch, MdFilterList } from 'react-icons/md';
import { getImageUrl } from '../utils/getImageUrl';

const MenuManagement = () => {
    const { data: menuItems, isLoading: isLoadingMenu, error: errorMenu } = useGetMenuQuery();
    const { data: categories, isLoading: isLoadingCategories } = useGetCategoriesQuery();
    const { data: subcategories, isLoading: isLoadingSubcategories } = useGetSubcategoriesQuery();

    const [createMenuItem, { isLoading: isCreating }] = useCreateMenuItemMutation();
    const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();
    const [deleteMenuItem] = useDeleteMenuItemMutation();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        image: '',
        isAvailable: true
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const handleInputChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else if (e.target.name === 'category') {
            setFormData({ ...formData, category: e.target.value, subcategory: '' });
        } else {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setFormData({ ...formData, [e.target.name]: value });
        }
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', category: '', subcategory: '', image: '', isAvailable: true });
        setIsFormVisible(true);
    };

    const handleOpenEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category?._id || item.category,
            subcategory: item.subcategory?._id || item.subcategory || '',
            image: item.image || '',
            isAvailable: item.isAvailable
        });
        setIsFormVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('price', Number(formData.price));
            payload.append('category', formData.category);
            payload.append('subcategory', formData.subcategory);
            payload.append('isAvailable', formData.isAvailable);

            if (formData.image instanceof File) {
                payload.append('image', formData.image);
            } else if (typeof formData.image === 'string' && formData.image !== '') {
                payload.append('image', formData.image);
            }

            if (editingId) {
                await updateMenuItem({ id: editingId, data: payload }).unwrap();
                toast.success('Menu item updated successfully!');
            } else {
                await createMenuItem(payload).unwrap();
                toast.success('Menu item added successfully!');
            }
            setIsFormVisible(false);
        } catch (err) {
            toast.error(err?.data?.message || `Failed to ${editingId ? 'update' : 'add'} item`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                await deleteMenuItem(id).unwrap();
                toast.success('Menu item deleted');
            } catch (err) {
                toast.error('Failed to delete item');
            }
        }
    };

    const toggleAvailability = async (item) => {
        try {
            const updateData = new FormData();
            updateData.append('isAvailable', !item.isAvailable);
            await updateMenuItem({ id: item._id, data: updateData }).unwrap();
            toast.success(`${item.name} is now ${!item.isAvailable ? 'Available' : 'Out of Stock'}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (isLoadingMenu || isLoadingCategories || isLoadingSubcategories) return <div className="p-8 text-center text-gray-500 font-bold">Loading Menu Data...</div>;
    if (errorMenu) return <div className="p-8 text-center text-red-500 font-bold">Error loading menu or categories</div>;

    const filteredSubcategories = subcategories?.filter(sub => sub.category?._id === formData.category || sub.category === formData.category) || [];

    const filteredMenu = menuItems?.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === '' || (item.category?._id === filterCategory || item.category === filterCategory);
        return matchesSearch && matchesCategory;
    });

    if (isFormVisible) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in slide-in-from-right-4 transition-colors duration-300">
                <div className="flex items-center mb-6 gap-4">
                    <button onClick={() => setIsFormVisible(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-700 p-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">{editingId ? 'Update the details for this dish.' : 'Fill out the details below to add a dish to your menu.'}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8 max-w-4xl transition-colors duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">Name <span className="text-red-500">*</span></label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-2 block w-full rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm font-medium shadow-sm transition-all" placeholder="e.g. Classic Cheeseburger" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">Category <span className="text-red-500">*</span></label>
                            <select name="category" required value={formData.category} onChange={handleInputChange} className="mt-2 block w-full rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm font-medium shadow-sm transition-all">
                                <option value="" disabled>Select a category</option>
                                {categories?.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">Subcategory</label>
                            <select name="subcategory" disabled={!formData.category} value={formData.subcategory} onChange={handleInputChange} className="mt-2 block w-full rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm font-medium shadow-sm disabled:bg-gray-100 disabled:dark:bg-slate-800 disabled:text-gray-400 disabled:dark:text-gray-600 transition-all">
                                <option value="">None</option>
                                {filteredSubcategories.map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">Price (₹) <span className="text-red-500">*</span></label>
                            <input type="number" step="0.01" min="0" name="price" required value={formData.price} onChange={handleInputChange} className="mt-2 block w-full rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm font-medium shadow-sm transition-all" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">Image</label>
                            <div className="mt-2 flex items-center gap-3">
                                <label className="cursor-pointer bg-white dark:bg-slate-700 py-2.5 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                                    Choose File
                                    <input type="file" name="image" accept="image/*" onChange={handleInputChange} className="hidden" />
                                </label>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px] transition-colors duration-300">
                                    {formData.image instanceof File ? formData.image.name : (editingId && typeof formData.image === 'string' && formData.image ? 'Existing image attached' : 'No file chosen')}
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors duration-300">Description</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="mt-2 block w-full rounded-md border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm font-medium shadow-sm transition-all" placeholder="Briefly describe the ingredients and preparation..."></textarea>
                        </div>
                        <div className="md:col-span-2 flex items-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 p-4 rounded-xl transition-colors duration-300">
                            <input type="checkbox" name="isAvailable" id="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer" />
                            <label htmlFor="isAvailable" className="ml-3 block text-sm font-bold text-gray-900 dark:text-gray-200 cursor-pointer transition-colors duration-300">Item is available for order immediately</label>
                        </div>

                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="button" onClick={() => setIsFormVisible(false)} className="flex-1 bg-white dark:bg-slate-700 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isCreating || isUpdating} className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all ${(isCreating || isUpdating) ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}>
                                <MdSave className="mr-2" size={18} />
                                {editingId ? (isUpdating ? 'Updating...' : 'Update Item') : (isCreating ? 'Saving...' : 'Save Item')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 pb-20 transition-colors duration-300">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Menu Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">Manage your dishes, prices, images, and availability.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* Category Filter */}
                    <div className="relative flex-1 sm:min-w-[200px]">
                        <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm appearance-none bg-white dark:bg-slate-700 transition-colors duration-300 font-medium text-gray-700 dark:text-gray-200"
                        >
                            <option value="">All Categories</option>
                            {categories?.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Field */}
                    <div className="relative flex-1 sm:min-w-[240px]">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm transition-colors duration-300"
                        />
                    </div>

                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <MdAdd className="mr-2 text-lg" /> Add New Item
                    </button>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="w-full">
                {filteredMenu?.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
                        <MdFastfood size={56} className="text-gray-300 dark:text-slate-600 mb-4 transition-colors duration-300" />
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">No menu items found.</p>
                        {menuItems?.length === 0 ? (
                            <>
                                <p className="text-sm mt-2 mb-6">Click "Add New Item" to start building your menu.</p>
                                <button onClick={handleOpenAdd} className="text-orange-600 font-bold hover:underline">Click here to add one</button>
                            </>
                        ) : (
                            <p className="text-sm mt-2">No items match your current search or filter criteria.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMenu?.map((item) => (
                            <div
                                key={item._id}
                                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:hover:border-slate-600 ${!item.isAvailable ? 'grayscale-[0.4] opacity-80' : ''}`}
                            >
                                {/* Fixed Height Image Container */}
                                <div className="h-48 w-full bg-gray-100 dark:bg-slate-700 relative group overflow-hidden transition-colors duration-300">
                                    {item.image ? (
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <MdFastfood size={48} className="text-gray-300 dark:text-slate-500 transition-colors duration-300" />
                                        </div>
                                    )}

                                    {/* Availability Badge Overlay */}
                                    <div className="absolute top-3 left-3">
                                        {item.isAvailable ? (
                                            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="bg-gray-800/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    {/* Category Badge Overlay */}
                                    {item.category && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-orange-600 dark:text-orange-400 text-xs font-black px-3 py-1.5 rounded-full shadow-sm border border-orange-100/50 dark:border-orange-900/50 transition-colors duration-300">
                                                {item.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Content Container with Flex Grow */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight transition-colors duration-300">{item.name}</h3>
                                        <span className="text-lg font-black text-orange-600 dark:text-orange-400 transition-colors duration-300">₹{(Number(item.price) || 0).toFixed(2)}</span>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-grow line-clamp-3 transition-colors duration-300">
                                        {item.description || 'No description provided for this item.'}
                                    </p>

                                    {/* Card Footer Actions */}
                                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                                        <div className="flex items-center gap-2">
                                            <label className="relative inline-flex items-center cursor-pointer" title="Toggle Availability">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.isAvailable}
                                                    onChange={() => toggleAvailability(item)}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-600 transition-colors duration-300 cursor-pointer"></div>
                                            </label>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                {item.isAvailable ? 'In Stock' : 'Out'}
                                            </span>
                                        </div>

                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleOpenEdit(item)}
                                                className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100/50 dark:border-indigo-800/50"
                                                title="Edit Item"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-100/50 dark:border-red-800/50"
                                                title="Delete Item"
                                            >
                                                <MdDeleteOutline size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuManagement;
