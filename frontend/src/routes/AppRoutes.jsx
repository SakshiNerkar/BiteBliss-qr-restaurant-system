import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout/CustomerLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLogin from '../pages/AdminLogin';
import AdminRegister from '../pages/AdminRegister';
import LandingPage from '../pages/LandingPage';

import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Menu from '../pages/Menu';
import Tables from '../pages/Tables';
import Orders from '../pages/Orders';
import AdminUserPanel from '../pages/admin/AdminUserPanel';
import CustomerMenu from '../pages/CustomerMenu';
import CustomerCart from '../pages/CustomerCart';
import Profile from '../pages/Profile';
import OrderStatus from '../pages/OrderStatus';
import WelcomeScreen from '../pages/WelcomeScreen';
import CustomerThankYou from '../pages/CustomerThankYou';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Root Landing Page / Portal */}
            <Route path="/" element={<LandingPage />} />

            {/* Admin Panel - Public Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Admin Panel - Protected Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="user-panel" element={<AdminUserPanel />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>

            {/* Customer Panel - QR Code Entry Gateway */}
            <Route path="/:restaurantName/:tableNo" element={<WelcomeScreen />} />
            <Route path="/thank-you" element={<CustomerThankYou />} />

            {/* Customer Panel - Main App Routes */}
            <Route element={<CustomerLayout />}>
                <Route path="/menu" element={<CustomerMenu />} />
                <Route path="/cart" element={<CustomerCart />} />
                <Route path="/order-status" element={<OrderStatus />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<div className="p-8 text-center text-red-500 font-bold">404 - Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;
