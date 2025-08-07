import { useState, useEffect } from 'react'
import Hero from './../components/Layout/Hero.jsx'
import GenderCollectionSection from './../components/Products/GenderCollectionSection.jsx'
import NewArival from './../components/Products/NewArival.jsx'
import ProductDetails from '../components/Products/ProductDetails.jsx'
import ProductGrid from '../components/Products/ProductGrid.jsx'
import FeaturedCollection from '../components/Products/FeaturedCollection.jsx'
import FeaturesSection from '../components/Products/FeaturesSection.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsByFilters } from '../redux/slices/productSlice.js'
import axios from 'axios'



const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products); 
  const [bestSellerProducts, setBestSellerProducts] = useState(null);

  useEffect(() => {
    // Fetch products for a specific collection
    dispatch(fetchProductsByFilters({
      gender: 'Women',
      category: 'Bottom Wear',
      limit: 8
    }));
    // Fetch best seller products
    const bestSeller = async() => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
        );
        setBestSellerProducts(response.data);
      } catch (error) {
        console.error("Error fetching best seller products:", error);
      }
    }

    bestSeller();
  }, [dispatch]);

  return (
    <div>
        <Hero />
        <GenderCollectionSection />
        <NewArival />

        {/* Best seller section */}
        <h2 className="text-3xl text-center font-bold mb-4">
          Best Seller
        </h2>
        
        {bestSellerProducts ? (
          <ProductDetails productId={bestSellerProducts._id} />
        ) : (
          <p className='text-center'>Loading best seller Product</p>
        ) }

        <div className="container mx-auto">
          <h2 className="text-3xl text-center font-bold mb-4">
            Top Wears for Women
          </h2>
          <ProductGrid products={products} loading={loading} error={error} />
        </div>
        <FeaturedCollection />
        <FeaturesSection />
    </div>
  )
}

export default Home