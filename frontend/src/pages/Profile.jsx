import { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../features/profile/profileApiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { MdPerson, MdSave, MdLockOutline } from 'react-icons/md';

const Profile = () => {
    const { data: profile, isLoading, refetch } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        adminName: '',
        restaurantName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                adminName: profile.adminName || '',
                restaurantName: profile.restaurantName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const res = await updateProfile({
                adminName: formData.adminName,
                restaurantName: formData.restaurantName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                ...(formData.password && { password: formData.password })
            }).unwrap();

            // Update local storage and global auth state with new token/info
            dispatch(setCredentials({ ...res }));

            toast.success('Profile updated successfully');
            setFormData({ ...formData, password: '', confirmPassword: '' });
            refetch(); // Refresh data just in case
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'Failed to update profile');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading profile data...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 transition-colors duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Admin Profile</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors duration-300">Manage your personal and restaurant settings.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 dark:border-slate-700 rounded-2xl transition-colors duration-300">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4 border-b dark:border-slate-700 pb-2 transition-colors duration-300">
                            <MdPerson className="text-orange-500 dark:text-orange-400 text-xl transition-colors duration-300" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">Admin Name</label>
                                <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} required className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">Restaurant Name</label>
                                <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} required className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-gray-400 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300 bg-gray-50" readOnly title="Email cannot be changed directly" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">Restaurant Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-700 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-4 border-b dark:border-slate-700 pb-2 transition-colors duration-300">
                            <MdLockOutline className="text-orange-500 dark:text-orange-400 text-xl transition-colors duration-300" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">Change Password</h2>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-2 transition-colors duration-300">(Leave blank to keep current password)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">New Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300">Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 transition-colors duration-300" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className={`flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 ${isUpdating ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                        >
                            <MdSave size={20} />
                            {isUpdating ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
