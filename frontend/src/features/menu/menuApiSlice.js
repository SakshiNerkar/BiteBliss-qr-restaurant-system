import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const menuApi = createApi({
    reducerPath: 'menuApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api/',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.userInfo?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Menu', 'Review'],
    endpoints: (builder) => ({
        getMenu: builder.query({
            query: () => 'menu',
            providesTags: ['Menu'],
        }),
        createMenuItem: builder.mutation({
            query: (newItem) => ({
                url: 'menu',
                method: 'POST',
                body: newItem,
            }),
            invalidatesTags: ['Menu'],
        }),
        updateMenuItem: builder.mutation({
            query: ({ id, data }) => ({
                url: `menu/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Menu'],
        }),
        deleteMenuItem: builder.mutation({
            query: (id) => ({
                url: `menu/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Menu'],
        }),
        getReviews: builder.query({
            query: (menuId) => `reviews/${menuId}`,
            providesTags: (result, error, arg) => [{ type: 'Review', id: arg }],
        }),
        createReview: builder.mutation({
            query: (data) => ({
                url: 'reviews',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Review', id: arg.menuId },
                'Menu'
            ],
        }),
    }),
});

export const {
    useGetMenuQuery,
    useCreateMenuItemMutation,
    useUpdateMenuItemMutation,
    useDeleteMenuItemMutation,
    useGetReviewsQuery,
    useCreateReviewMutation
} = menuApi;
