import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const USER_TOKEN = `Bearer ${localStorage.getItem("userToken")}`;

// async Thunk to fetch admin products;
export const fetchAdminProducts = createAsyncThunk(
    "adminProducts/fetchAdminProducts",
    async () => {
        const response = await axios.get(
            `${API_URL}/api/admin/products`,
            {
                headers: {
                    Authorization: USER_TOKEN,
                }
            }
        );
        return response.data;
    }
);

// async thunk to create a new Product
export const createProduct = createAsyncThunk(
    "adminProducts/createProduct",
    async (productData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/api/admin/products`,
                productData,
                {
                    headers: {
                        Authorization: USER_TOKEN,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// async thunk to update a product
export const updateProduct = createAsyncThunk(
    "adminProducts/updateProduct",
    async ({ productId, productData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/admin/products/${productId}`,
                productData,
                {
                    headers: {
                        Authorization: USER_TOKEN,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// async thunk to delete a product
export const deleteProduct = createAsyncThunk(
    "adminProducts/deleteProduct",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${API_URL}/api/products/${productId}`,
                {
                    headers: {
                        Authorization: USER_TOKEN,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const adminProductSlice = createSlice({
    name: "adminProducts",
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchAdminProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(
                    (product) => product._id === action.payload._id
                );
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(
                    (product) => product._id !== action.payload._id
                );
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default adminProductSlice.reducer;