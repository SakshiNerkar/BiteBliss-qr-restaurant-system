import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const subcategoryApi = createApi({
    reducerPath: 'subcategoryApi',
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
    tagTypes: ['Subcategory'],
    endpoints: (builder) => ({
        getSubcategories: builder.query({
            query: (category = '') => `subcategories${category ? `?category=${category}` : ''}`,
            providesTags: ['Subcategory'],
        }),
        createSubcategory: builder.mutation({
            query: (data) => ({
                url: 'subcategories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subcategory'],
        }),
        updateSubcategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `subcategories/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Subcategory'],
        }),
        deleteSubcategory: builder.mutation({
            query: (id) => ({
                url: `subcategories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Subcategory'],
        }),
    }),
});

export const {
    useGetSubcategoriesQuery,
    useCreateSubcategoryMutation,
    useUpdateSubcategoryMutation,
    useDeleteSubcategoryMutation
} = subcategoryApi;
