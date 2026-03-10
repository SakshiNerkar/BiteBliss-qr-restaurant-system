import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

let userInfo = null;
try {
    const item = sessionStorage.getItem('userInfo');
    if (item && item !== 'undefined') {
        userInfo = JSON.parse(item);
    }
} catch (error) {
    console.error("Error parsing userInfo from sessionStorage:", error);
    sessionStorage.removeItem('userInfo');
}

const initialState = {
    userInfo: userInfo,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
    try {
        const response = await api.post('/auth/login', user);
        if (response.data) {
            sessionStorage.setItem('userInfo', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Register user
export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
    try {
        const response = await api.post('/auth/register', user);
        if (response.data) {
            sessionStorage.setItem('userInfo', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
        logout: (state) => {
            sessionStorage.removeItem('userInfo');
            state.userInfo = null;
        },
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            sessionStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.userInfo = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.userInfo = null;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.userInfo = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.userInfo = null;
            });
    },
});

export const { reset, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
