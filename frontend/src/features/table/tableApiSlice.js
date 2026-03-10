import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tableApi = createApi({
    reducerPath: 'tableApi',
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
    tagTypes: ['Table'],
    endpoints: (builder) => ({
        getTables: builder.query({
            query: () => 'tables',
            providesTags: ['Table'],
        }),
        createTable: builder.mutation({
            query: (newTable) => ({
                url: 'tables',
                method: 'POST',
                body: newTable,
            }),
            invalidatesTags: ['Table'],
        }),
        deleteTable: builder.mutation({
            query: (id) => ({
                url: `tables/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Table'],
        }),
    }),
});

export const { useGetTablesQuery, useCreateTableMutation, useDeleteTableMutation } = tableApi;
