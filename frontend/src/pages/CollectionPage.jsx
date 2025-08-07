import { useEffect, useState, useRef } from 'react'
import { FaFilter } from 'react-icons/fa'
import FilterSidebar from '../components/Products/FilterSidebar'
import SortOptions from '../components/Products/SortOptions'
import ProductGrid from '../components/Products/ProductGrid'
import { useParams, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsByFilters } from '../redux/slices/productSlice'

const CollectionPage = () => {
  const { Collection } = useParams();
  const [searchParams] = useSearchParams(); 
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state) => state.products);

  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const queryParams = Object.fromEntries([...searchParams]);
    dispatch(fetchProductsByFilters({ collection: Collection, ...queryParams}));
  }, [dispatch, Collection, searchParams]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  }

  useEffect(() => {
    // Add Event listner if clicked outside
    document.addEventListener('mousedown', handleClickOutside);

    // Clean event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }

  }, []);

 
  

  return (
    <div className='flex flex-col lg:flex-row'>
      {/* Mobile Filter Button */}
      <button
        onClick={toggleSidebar}
       className='lg:hidden border p-2 flex justify-center items-center'>
        <FaFilter className='mr-2'/> Filter
      </button>

      {/* Filter Sidebar */}
      <div ref={sidebarRef}
        className={` fixed inset-y-0 left-0 z-50 bg-white w-64 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } `}
      >
        <FilterSidebar />
      </div>
      <div className="flex-grow p-4">
        <h2 className="text-2xl uppercase mb-4">All Collection</h2>

        {/* Sort options */}
        <SortOptions />

        {/* Product grid */}
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default CollectionPage