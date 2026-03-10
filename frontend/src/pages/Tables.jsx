import { useState } from 'react';
import { useGetTablesQuery, useCreateTableMutation, useDeleteTableMutation } from '../features/table/tableApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MdAdd, MdDeleteOutline, MdTableBar, MdQrCode2, MdArrowBack, MdSave } from 'react-icons/md';
import { QRCodeSVG } from 'qrcode.react';

const Tables = () => {
    const { data: tables, isLoading, error } = useGetTablesQuery();
    const [createTable, { isLoading: isCreating }] = useCreateTableMutation();
    const [deleteTable] = useDeleteTableMutation();
    const [newTableNo, setNewTableNo] = useState('');
    const [isAddMode, setIsAddMode] = useState(false);

    // Get logged-in admin data to construct the QR URL
    const { userInfo } = useSelector((state) => state.auth);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTableNo) return toast.error('Table number is required');

        try {
            await createTable({ tableNo: Number(newTableNo) }).unwrap();
            toast.success(`Table ${newTableNo} created successfully`);
            setNewTableNo('');
            setIsAddMode(false);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to create table');
        }
    };

    const handleDelete = async (id, tableNo) => {
        if (window.confirm(`Are you sure you want to delete Table ${tableNo}?`)) {
            try {
                await deleteTable(id).unwrap();
                toast.success('Table deleted');
            } catch (err) {
                toast.error('Failed to delete table');
            }
        }
    };

    // Helper to generate Frontend Menu URL
    const generateTableUrl = (tableNo) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/table/${tableNo}`;
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Tables...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error loading tables</div>;

    // View: Add New Table Form
    if (isAddMode) {
        return (
            <div className="p-6 max-w-3xl mx-auto animate-in slide-in-from-right-4 transition-colors duration-300">
                <div className="flex items-center mb-8 gap-4">
                    <button onClick={() => setIsAddMode(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors">Add New Table</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Generate a new unique QR code station.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-8 sm:p-10 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <form onSubmit={handleCreate} className="space-y-8 relative z-10">
                        <div>
                            <label htmlFor="tableNo" className="block text-sm font-bold leading-6 text-slate-900 dark:text-slate-200 transition-colors">Table Number <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                id="tableNo"
                                min="1"
                                required
                                value={newTableNo}
                                onChange={(e) => setNewTableNo(e.target.value)}
                                placeholder="e.g. 5"
                                className="mt-2 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:text-white py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm font-bold shadow-sm transition-all outline-none hover:border-slate-400 dark:hover:border-slate-600"
                            />
                            <div className="flex items-start gap-3 mt-4 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30">
                                <MdQrCode2 size={24} className="shrink-0 text-primary-500 dark:text-primary-400" />
                                <p className="text-sm font-medium leading-relaxed">A unique QR code will be generated automatically that links directly to this specific table, keeping the customer menu firmly tied to it.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsAddMode(false)}
                                className="flex-1 bg-white dark:bg-slate-800 flex justify-center items-center py-3.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className={`flex-1 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors ${isCreating ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                <MdSave className="mr-2" size={18} />
                                {isCreating ? 'Adding...' : 'Save Table'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // View: Table List & QR Codes
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Table Setup</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium transition-colors">Generate unique QR codes for your dining areas to enable contactless ordering.</p>
                </div>
                <button
                    onClick={() => setIsAddMode(true)}
                    className="flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 active:scale-95 transition-all outline-none"
                >
                    <MdAdd className="mr-2 text-xl" /> Add New Table
                </button>
            </div>

            <div className="bg-transparent print:bg-white overflow-hidden transition-colors">
                {tables?.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-[24px] p-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center transition-colors">
                        <MdTableBar size={64} className="text-slate-300 dark:text-slate-700 mb-6 transition-colors" />
                        <p className="text-xl font-black text-slate-900 dark:text-white transition-colors">No tables configured</p>
                        <p className="text-sm mt-2 mb-8 font-medium">Add your first table to generate a scannable QR code.</p>
                        <button onClick={() => setIsAddMode(true)} className="text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 transition-colors bg-primary-50 dark:bg-primary-900/20 px-6 py-2 rounded-full">Add a Table</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tables?.map((table) => {
                            const tableUrl = generateTableUrl(table.tableNo);
                            return (
                                <div key={table._id} className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 transition-all overflow-hidden flex flex-col group -translate-y-0 hover:-translate-y-1">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-primary-50/50 dark:group-hover:bg-slate-800 transition-colors">
                                        <span className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center transition-colors"><MdTableBar className="mr-2.5 text-primary-500 dark:text-primary-400" /> Table {table.tableNo}</span>
                                        <button
                                            onClick={() => handleDelete(table._id, table.tableNo)}
                                            className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors print:hidden"
                                            title="Delete Table"
                                        >
                                            <MdDeleteOutline size={20} />
                                        </button>
                                    </div>
                                    <div className="p-8 flex flex-col items-center justify-center flex-grow bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 mb-6 group-hover:border-primary-200 dark:group-hover:border-primary-500/50 transition-colors group-hover:shadow-primary-500/20 shadow-xl relative overflow-hidden">
                                            {/* decorative accent dot */}
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                            {/* IMPORTANT: QR Code MUST sit on a white background for perfect contrast/scanning regardless of Dark Mode */}
                                            <QRCodeSVG value={tableUrl} size={150} level={"H"} className="bg-white" />
                                        </div>
                                        <div className="text-center w-full px-4 print:hidden">
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Scan to view menu</p>
                                        </div>
                                        <p className="text-xs font-mono text-center text-slate-400 dark:text-slate-500 break-all px-2 hidden print:block transition-colors">
                                            {tableUrl}
                                        </p>
                                    </div>
                                    <div className="px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 print:hidden text-center transition-colors">
                                        <button onClick={handlePrint} className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors flex items-center justify-center w-full bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 py-2.5 rounded-xl border border-primary-100 dark:border-primary-900/30">
                                            <MdQrCode2 className="mr-2 text-lg" /> Print Quality Code
                                        </button>
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

export default Tables;
