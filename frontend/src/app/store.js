import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import { dashboardApi } from '../features/dashboard/dashboardApiSlice';
import { categoryApi } from '../features/category/categoryApiSlice';
import { menuApi } from '../features/menu/menuApiSlice';
import { tableApi } from '../features/table/tableApiSlice';
import { orderApi } from '../features/order/orderApiSlice';
import { profileApi } from '../features/profile/profileApiSlice';
import { subcategoryApi } from '../features/subcategory/subcategoryApiSlice';

export const rtkQueryErrorLogger = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        if (action.payload?.status === 401) {
            // Only redirect if we are currently in an admin route
            if (window.location.pathname.startsWith('/admin')) {
                api.dispatch(logout());
                window.location.href = '/admin/login';
            }
        }
    }
    return next(action);
};

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [menuApi.reducerPath]: menuApi.reducer,
        [tableApi.reducerPath]: tableApi.reducer,
        [orderApi.reducerPath]: orderApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        [subcategoryApi.reducerPath]: subcategoryApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            rtkQueryErrorLogger,
            dashboardApi.middleware,
            categoryApi.middleware,
            menuApi.middleware,
            tableApi.middleware,
            orderApi.middleware,
            profileApi.middleware,
            subcategoryApi.middleware
        ),
    devTools: process.env.NODE_ENV !== 'production',
});
