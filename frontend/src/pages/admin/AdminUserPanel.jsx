import { MdOpenInNew, MdRefresh } from 'react-icons/md';
import { useState } from 'react';

const AdminUserPanel = () => {
    const [key, setKey] = useState(0); // Used to force refresh iframe

    // URL to the customer menu with a mock table number to bypass protection
    const userPanelUrl = window.location.origin + '/menu?table=1';

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
            {/* Header / Controls */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-700/50 shrink-0 transition-colors duration-300">
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">User Panel Preview</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Live view of the customer menu interface.</p>
                </div>
                <div className="flex gap-2 text-sm font-bold">
                    <button
                        onClick={() => setKey(prev => prev + 1)}
                        className="flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 px-4 py-2 rounded-xl transition-colors border border-gray-200 dark:border-slate-600 hover:border-orange-200 dark:hover:border-slate-500 shadow-sm"
                    >
                        <MdRefresh size={18} /> Refresh View
                    </button>
                    <a
                        href={userPanelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-900 dark:bg-slate-900 text-white hover:bg-black dark:hover:bg-black px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                        <MdOpenInNew size={18} /> Open in New Tab
                    </a>
                </div>
            </div>

            {/* Responsive Container for accurate testing context */}
            <div className="flex-1 min-h-[800px] bg-gray-100 dark:bg-slate-900/50 p-4 sm:p-8 flex justify-center overflow-hidden items-center transition-colors duration-300">
                <div className="w-full max-w-[400px] h-[750px] bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-0 sm:border-[10px] border-gray-900 dark:border-slate-950 relative transition-colors duration-300 flex-shrink-0">
                    <iframe
                        key={key}
                        src={userPanelUrl}
                        className="w-full h-full border-none bg-gray-50 dark:bg-slate-900"
                        title="User Panel Preview"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminUserPanel;
