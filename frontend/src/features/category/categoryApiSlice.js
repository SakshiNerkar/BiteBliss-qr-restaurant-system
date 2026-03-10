import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.userInfo?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Category'],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => 'category',
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation({
            query: (newCategory) => ({
                url: 'category',
                method: 'POST',
                body: newCategory,
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...updatedCategory }) => ({
                url: `category/${id}`,
                method: 'PUT',
                body: updatedCategory,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `category/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } = categoryApi;
