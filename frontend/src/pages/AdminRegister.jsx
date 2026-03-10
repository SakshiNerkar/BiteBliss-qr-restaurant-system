import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { MdRestaurant, MdArrowBack } from 'react-icons/md';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        adminName: '',
        restaurantName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });

    const { adminName, restaurantName, email, password, phone, address } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || userInfo) {
            navigate('/admin/dashboard');
        }
        dispatch(reset());
    }, [userInfo, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!adminName || !restaurantName || !email || !password) {
            toast.error('Please fill in all required fields');
        } else {
            dispatch(register(formData));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative">
                <Link to="/admin/login" className="absolute top-6 left-6 flex items-center text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors">
                    <MdArrowBack className="mr-1 h-4 w-4" /> Back
                </Link>

                <div className="flex flex-col items-center pt-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-500 shadow-lg mb-6">
                        <MdRestaurant className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
                        Admin Registration
                    </h2>
                    <p className="mt-2 text-center text-sm font-medium text-gray-500">
                        Set up your Admin Panel and Restaurant.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="adminName" className="block text-sm font-bold leading-6 text-gray-700 mb-1">Your Name *</label>
                                <input id="adminName" name="adminName" type="text" required
                                    className="block w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                    placeholder="John Doe" value={adminName} onChange={onChange} />
                            </div>
                            <div>
                                <label htmlFor="restaurantName" className="block text-sm font-bold leading-6 text-gray-700 mb-1">Restaurant Name *</label>
                                <input id="restaurantName" name="restaurantName" type="text" required
                                    className="block w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                    placeholder="Best Pizza" value={restaurantName} onChange={onChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold leading-6 text-gray-700 mb-1">Email Address *</label>
                            <input id="email" name="email" type="email" autoComplete="email" required
                                className="block w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                placeholder="admin@example.com" value={email} onChange={onChange} />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-700 mb-1">Password *</label>
                            <input id="password" name="password" type="password" autoComplete="new-password" required minLength="6"
                                className="block w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                placeholder="••••••••" value={password} onChange={onChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold leading-6 text-gray-700 mb-1">Phone</label>
                                <input id="phone" name="phone" type="text"
                                    className="block w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                    placeholder="123-456-7890" value={phone} onChange={onChange} />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-bold leading-6 text-gray-700 mb-1">Address</label>
                                <input id="address" name="address" type="text"
                                    className="block w-full rounded-lg border-2 border-gray-200 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                    placeholder="123 Main St" value={address} onChange={onChange} />
                            </div>
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative flex w-full justify-center rounded-lg bg-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Register as Admin'}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <span className="text-sm font-medium text-gray-600">
                            Already have an account?{' '}
                            <Link to="/admin/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
                                Sign In
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
