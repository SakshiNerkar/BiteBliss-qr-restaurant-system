import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { MdRestaurant, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || (userInfo && userInfo.token)) {
            navigate('/admin/dashboard');
            dispatch(reset());
        }
    }, [userInfo, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please add all fields');
        } else {
            const userData = { email, password };
            dispatch(login(userData));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-500 shadow-lg mb-6">
                        <MdRestaurant className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
                        Admin Sign In
                    </h2>
                    <p className="mt-2 text-center text-sm font-medium text-gray-500">
                        Sign in to manage your restaurant operations.
                    </p>
                </div>

                {isError && message && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-red-700">
                                    {message === 'Invalid email or password' ? 'Incorrect email or password.' : message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-lg border-2 border-gray-200 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-lg border-2 border-gray-200 py-3 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm font-medium transition-colors"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={onChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <MdVisibilityOff size={22} />
                                    ) : (
                                        <MdVisibility size={22} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative flex w-full justify-center rounded-lg bg-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-center mt-6 space-y-3">
                        <div className="text-sm font-medium text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/admin/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
                                Register as Admin
                            </Link>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <Link to="/menu?table=1" className="inline-flex flex items-center justify-center text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors bg-gray-50 hover:bg-orange-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-orange-200">
                                <MdRestaurant className="mr-2" size={16} /> Visit Customer Menu
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
