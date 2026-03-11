import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.userInfo?.token;
            // Only strictly attach token if it exists (public routes won't have it)
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Order', 'DashboardStats', 'OrderStatus'],
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: (pageNumber = 1) => `orders?pageNumber=${pageNumber}`,
            providesTags: ['Order'],
        }),
        getTableOrderStatus: builder.query({
            query: (tableNo) => `orders/table/${tableNo}/status`,
            providesTags: ['OrderStatus'],
        }),
        createOrder: builder.mutation({
            query: (orderItems) => ({
                url: 'orders',
                method: 'POST',
                body: orderItems,
            }),
            invalidatesTags: ['Order', 'DashboardStats', 'OrderStatus'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `orders/${id}/status`,
                method: 'PUT',
                body: body,
            }),
            invalidatesTags: ['Order', 'DashboardStats', 'OrderStatus'],
        }),
        createPaymentIntent: builder.mutation({
            query: (data) => ({
                url: 'payments/create-intent',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useGetOrdersQuery, useGetTableOrderStatusQuery, useCreateOrderMutation, useUpdateOrderStatusMutation, useCreatePaymentIntentMutation } = orderApi;
