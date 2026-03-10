import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
    tableNo: localStorage.getItem('tableNo') ? JSON.parse(localStorage.getItem('tableNo')) : null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setSessionParams: (state, action) => {
            const { tableNo } = action.payload;
            state.tableNo = tableNo;
            localStorage.setItem('tableNo', JSON.stringify(tableNo));
        },
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find((x) => x._id === id);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem('cartItems');
        },
        clearSession: (state) => {
            state.cartItems = [];
            state.tableNo = null;
            localStorage.removeItem('cartItems');
            localStorage.removeItem('tableNo');
        }
    },
});

export const { setSessionParams, addToCart, removeFromCart, updateQuantity, clearCart, clearSession } = cartSlice.actions;

export default cartSlice.reducer;
