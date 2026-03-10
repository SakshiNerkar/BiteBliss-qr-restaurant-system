import { useState } from 'react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../features/category/categoryApiSlice';
import { useGetSubcategoriesQuery, useCreateSubcategoryMutation, useUpdateSubcategoryMutation, useDeleteSubcategoryMutation } from '../features/subcategory/subcategoryApiSlice';
import { toast } from 'react-toastify';
import { MdAdd, MdDeleteOutline, MdOutlineCategory, MdSave, MdArrowBack, MdEdit, MdCheck, MdClose, MdSubdirectoryArrowRight, MdSearch, MdExpandMore, MdExpandLess } from 'react-icons/md';

const Categories = () => {
    // Categories Queries & Mutations
    const { data: categories, isLoading: isCatLoading, error: catError } = useGetCategoriesQuery();
    const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    // Subcategories Queries & Mutations
    const { data: subcategories, isLoading: isSubLoading } = useGetSubcategoriesQuery();
    const [createSubcategory, { isLoading: isCreatingSub }] = useCreateSubcategoryMutation();
    const [updateSubcategory] = useUpdateSubcategoryMutation();
    const [deleteSubcategory] = useDeleteSubcategoryMutation();

    // Category Add State
    const [isAddCatMode, setIsAddCatMode] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Subcategory Add State
    const [isAddSubMode, setIsAddSubMode] = useState(false);
    const [activeParentCatId, setActiveParentCatId] = useState(null);
    const [newSubcategoryName, setNewSubcategoryName] = useState('');

    // Edit UI State
    const [editingCatId, setEditingCatId] = useState(null);
    const [editCatName, setEditCatName] = useState('');
    const [editingSubId, setEditingSubId] = useState(null);
    const [editSubName, setEditSubName] = useState('');

    // Search and Accordion UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCats, setExpandedCats] = useState({});

    // --- Category Handlers ---
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return toast.error('Category name cannot be empty');
        try {
            await createCategory({ name: newCategoryName }).unwrap();
            toast.success('Category created successfully');
            setNewCategoryName('');
            setIsAddCatMode(false);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to create category');
        }
    };

    const handleSaveCategoryEdit = async (id) => {
        if (!editCatName.trim()) return toast.error('Category name cannot be empty');
        try {
            await updateCategory({ id, name: editCatName }).unwrap();
            toast.success('Category updated successfully');
            setEditingCatId(null);
            setEditCatName('');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Delete this category? This will also remove access to its subcategories and menu items.')) {
            try {
                await deleteCategory(id).unwrap();
                toast.success('Category removed correctly');
            } catch (err) {
                toast.error(err?.data?.message || 'Failed to delete category');
            }
        }
    };

    // --- Subcategory Handlers ---
    const openAddSubcategory = (catId) => {
        setActiveParentCatId(catId);
        setIsAddSubMode(true);
        setNewSubcategoryName('');
    };

    const handleCreateSubcategory = async (e) => {
        e.preventDefault();
        if (!newSubcategoryName.trim()) return toast.error('Subcategory name cannot be empty');
        try {
            await createSubcategory({ name: newSubcategoryName, category: activeParentCatId }).unwrap();
            toast.success('Subcategory created successfully');
            setNewSubcategoryName('');
            setIsAddSubMode(false);
            setActiveParentCatId(null);
            // Auto expand the parent category to show the new subcategory
            setExpandedCats(prev => ({ ...prev, [activeParentCatId]: true }));
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to create subcategory');
        }
    };

    const handleSaveSubcategoryEdit = async (id, parentCatId) => {
        if (!editSubName.trim()) return toast.error('Name is required');
        try {
            await updateSubcategory({ id, name: editSubName, category: parentCatId }).unwrap();
            toast.success('Subcategory updated successfully');
            setEditingSubId(null);
            setEditSubName('');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update subcategory');
        }
    };

    const handleDeleteSubcategory = async (id) => {
        if (window.confirm('Delete this subcategory? This cannot be undone.')) {
            try {
                await deleteSubcategory(id).unwrap();
                toast.success('Subcategory removed');
            } catch (err) {
                toast.error(err?.data?.message || 'Failed to delete subcategory');
            }
        }
    };

    const toggleExpand = (catId) => {
        setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    if (isCatLoading || isSubLoading) return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;
    if (catError) return <div className="p-8 text-center text-red-500 font-bold">Error loading categories</div>;

    // Filter Categories
    const filteredCategories = categories?.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // View: Add Category Form
    if (isAddCatMode) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in slide-in-from-right-4">
                <div className="flex items-center mb-6 gap-4">
                    <button onClick={() => setIsAddCatMode(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-700 p-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Category</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create a top-level grouping for your menu.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-slate-700 p-6 md:p-8 max-w-3xl transition-colors duration-300">
                    <form onSubmit={handleCreateCategory} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold leading-6 text-gray-900 dark:text-gray-200">Category Name <span className="text-red-500">*</span></label>
                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Starters" className="mt-2 block w-full rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium shadow-sm transition-colors duration-300" autoFocus />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button type="button" onClick={() => setIsAddCatMode(false)} className="flex-1 bg-white dark:bg-slate-700 flex justify-center items-center py-3 px-4 border-2 border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            <button type="submit" disabled={isCreatingCat} className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors ${isCreatingCat ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                <MdSave className="mr-2" size={18} /> {isCreatingCat ? 'Saving...' : 'Save Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // View: Add Subcategory Form
    if (isAddSubMode && activeParentCatId) {
        const parentName = categories?.find(c => c._id === activeParentCatId)?.name;
        return (
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in slide-in-from-right-4">
                <div className="flex items-center mb-6 gap-4">
                    <button onClick={() => { setIsAddSubMode(false); setActiveParentCatId(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-700 p-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Subcategory</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Under Category: <span className="font-bold text-orange-600 dark:text-orange-400">{parentName}</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-slate-700 p-6 md:p-8 max-w-3xl transition-colors duration-300">
                    <form onSubmit={handleCreateSubcategory} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold leading-6 text-gray-900 dark:text-gray-200">Subcategory Name <span className="text-red-500">*</span></label>
                            <input type="text" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder="e.g. Indian Veg Starters" className="mt-2 block w-full rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-3 px-4 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium shadow-sm transition-colors duration-300" autoFocus />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button type="button" onClick={() => { setIsAddSubMode(false); setActiveParentCatId(null); }} className="flex-1 bg-white dark:bg-slate-700 flex justify-center items-center py-3 px-4 border-2 border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            <button type="submit" disabled={isCreatingSub} className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors ${isCreatingSub ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                <MdSave className="mr-2" size={18} /> {isCreatingSub ? 'Saving...' : 'Save Subcategory'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // View: Combined List
    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 pb-20 transition-colors duration-300">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Categories & Subcategories</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">Manage all your menu sections in one place.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* Search Filter */}
                    <div className="relative flex-1 sm:min-w-[300px]">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm transition-all duration-300"
                        />
                    </div>
                    {/* Add Button */}
                    <button onClick={() => setIsAddCatMode(true)} className="flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-700 active:scale-95 transition-all whitespace-nowrap">
                        <MdAdd className="mr-2 text-lg" /> Add Category
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {filteredCategories?.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
                        <MdOutlineCategory size={56} className="text-gray-300 dark:text-slate-600 mb-4 transition-colors duration-300" />
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">No categories found.</p>
                        {categories?.length === 0 ? (
                            <>
                                <p className="text-sm mt-2 mb-6">Create your first category to get started.</p>
                                <button onClick={() => setIsAddCatMode(true)} className="text-orange-600 font-bold hover:underline">Click here to add one</button>
                            </>
                        ) : (
                            <p className="text-sm mt-2">Adjust your search to find what you're looking for.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredCategories?.map((cat) => {
                            const catSubcategories = subcategories?.filter(s => s.category?._id === cat._id || s.category === cat._id) || [];
                            const isExpanded = expandedCats[cat._id];

                            return (
                                <div key={cat._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all hover:border-gray-200 dark:hover:border-slate-600">
                                    {/* Category Row */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 bg-white dark:bg-slate-800 z-10 relative transition-colors duration-300">
                                        <div className="flex items-center flex-grow cursor-pointer" onClick={() => toggleExpand(cat._id)}>
                                            <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                                                {cat.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                {editingCatId === cat._id ? (
                                                    <input
                                                        type="text"
                                                        value={editCatName}
                                                        onChange={(e) => setEditCatName(e.target.value)}
                                                        className="w-full max-w-sm rounded-lg border-2 border-orange-500 py-1.5 px-3 text-gray-900 dark:text-white dark:bg-slate-700 font-bold outline-none"
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">{cat.name}</h2>
                                                        <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-600 transition-colors duration-300">
                                                            {catSubcategories.length} {catSubcategories.length === 1 ? 'Sub' : 'Subs'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2 sm:self-center self-end pl-16 sm:pl-0">
                                            {editingCatId === cat._id ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleSaveCategoryEdit(cat._id); }} className="text-emerald-600 dark:text-emerald-400 hover:text-white p-2 rounded-lg hover:bg-emerald-500 transition-colors border border-emerald-200 dark:border-emerald-900 hover:border-emerald-500"><MdCheck size={20} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingCatId(null); setEditCatName(''); }} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-red-500 transition-colors border border-gray-200 dark:border-slate-600 hover:border-red-500"><MdClose size={20} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingCatId(cat._id); setEditCatName(cat.name); }} className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors" title="Edit Category"><MdEdit size={20} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors" title="Delete Category"><MdDeleteOutline size={20} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); openAddSubcategory(cat._id); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-bold text-sm flex items-center gap-1">
                                                        <MdAdd size={16} /> <span className="hidden sm:inline">Add Sub</span>
                                                    </button>

                                                    {catSubcategories.length > 0 && (
                                                        <button onClick={() => toggleExpand(cat._id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg bg-gray-50 dark:bg-slate-700 transition-colors ml-2">
                                                            {isExpanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subcategories Nested Accordion */}
                                    <div className={`transition-all duration-300 ease-in-out bg-slate-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700/50 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                        {catSubcategories.length > 0 && (
                                            <div className="p-4 md:p-6 lg:pl-20">
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {catSubcategories.map(sub => (
                                                        <li key={sub._id} className="flex items-center justify-between bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-3 shadow-sm group hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-300">
                                                            <div className="flex items-center flex-grow text-sm font-bold text-gray-700 dark:text-gray-200 overflow-hidden mr-2 transition-colors duration-300">
                                                                <MdSubdirectoryArrowRight className="text-blue-400 dark:text-blue-500 mr-2 flex-shrink-0" size={18} />
                                                                {editingSubId === sub._id ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editSubName}
                                                                        onChange={(e) => setEditSubName(e.target.value)}
                                                                        className="w-full rounded-md border border-blue-400 dark:border-blue-500 py-1 px-2 text-gray-900 dark:text-white dark:bg-slate-600 outline-none"
                                                                        autoFocus
                                                                    />
                                                                ) : (
                                                                    <span className="truncate">{sub.name}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex space-x-1 flex-shrink-0">
                                                                {editingSubId === sub._id ? (
                                                                    <>
                                                                        <button onClick={() => handleSaveSubcategoryEdit(sub._id, cat._id)} className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 p-1.5 rounded-md"><MdCheck size={16} /></button>
                                                                        <button onClick={() => { setEditingSubId(null); setEditSubName(''); }} className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 p-1.5 rounded-md"><MdClose size={16} /></button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => { setEditingSubId(sub._id); setEditSubName(sub.name); }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 p-1.5 rounded-md transition-colors sm:opacity-0 sm:group-hover:opacity-100"><MdEdit size={16} /></button>
                                                                        <button onClick={() => handleDeleteSubcategory(sub._id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600 p-1.5 rounded-md transition-colors sm:opacity-0 sm:group-hover:opacity-100"><MdDeleteOutline size={16} /></button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
