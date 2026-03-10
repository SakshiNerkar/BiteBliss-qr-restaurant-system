// If using RTK Query createApi directly:
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const profileApi = createApi({
    reducerPath: 'profileApi',
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
    tagTypes: ['Profile'],
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => 'auth/profile',
            providesTags: ['Profile'],
        }),
        updateProfile: builder.mutation({
            query: (profileData) => ({
                url: 'auth/profile',
                method: 'PUT',
                body: profileData,
            }),
            invalidatesTags: ['Profile'],
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
