import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to Fetch Product by Collection and Optional Filters
export const fetchProductsByFilters = createAsyncThunk(
    "products/fetchBy",
    async({
        collection,
        size,
        color,
        gender,
        minPrice,
        maxPrice,
        sortBy,
        search,
        category,
        material,
        brand,
        limit,
    }) => {
        const query = new URLSearchParams();
        if(collection) query.append("collection", collection);
        if(size) query.append("size", size);
        if(color) query.append("color", color);
        if(gender) query.append("gender", gender);
        if(minPrice) query.append("minPrice", minPrice);
        if(maxPrice) query.append("maxPrice", maxPrice);
        if(sortBy) query.append("sortBy", sortBy);
        if(search) query.append("search", search);
        if(material) query.append("material", material);
        if(brand) query.append("brand", brand);
        if(limit) query.append("limit", limit);
        if(category) query.append("category", category);

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`);

        return response.data;
    }
);

// Asunc thunk to fetch a single product by id
export const fetchProductsDetails = createAsyncThunk('products/fetchProductsDetails',
    async(id) => {
        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
        );

        return response.data;
    }
);

// Async thunk to update a exiting product
export const updateProduct = createAsyncThunk("products/updateProduct", 
async({id, productData}) => {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        productData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`
            }
        }
    );

    return response.data;
}
);

// Async thunk to fetch similar product
export const fetchSimilarProducts = createAsyncThunk("products/fetchSimilarProducts",
    async(id) => {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`);
        return response.data;
    }
)

const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        selectedProduct: null, // State the details fo the single Product
        similarProducts: [],
        loading: false,
        error: null,
        filters: {
            category: "",
            size: "",
            color: "",
            gender: "",
            brand: "",
            minPrice: "",
            maxPrice: "",
            sortBy: "",
            material: "",
            collection: "",
        },
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload};
        },
        clearFilters: (state) => {
            state.filters = {
                category: "",
                size: "",
                color: "",
                gender: "",
                brand: "",
                minPrice: "",
                maxPrice: "",
                sortBy: "",
                material: "",
                collection: "",
            }
        }
    },
    extraReducers: (builder) => {
        builder
        // handle fetching products with filter
        .addCase(fetchProductsByFilters.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
            state.loading = false;
            state.products = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchProductsByFilters.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // Handle fetching single product details
        .addCase(fetchProductsDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProductsDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedProduct = action.payload;
        })
        .addCase(fetchProductsDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // handle updating product
        .addCase(updateProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateProduct.fulfilled, (state, action) => {
            state.loading = false;
            const updatedProduct = action.payload;
            const index = state.products.findIndex(
                (product) => product._id === updateProduct._id
            );

            if(index !== -1) {
                state.products[index] = updatedProduct;
            }
        })
        .addCase(updateProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // for similar products
        .addCase(fetchSimilarProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.similarProducts = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchSimilarProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
    }
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer
