import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import axios from "axios";

const NewArival = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [newArivals, setNewArivals] = useState([]);

  useEffect(() => {
    const fetchNewArivals = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`);
        
        setNewArivals(response.data);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      }
    };

    fetchNewArivals();
  }, []);


  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX); // Store only the initial mouse position
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX; 
    const walk = x - startX; // Difference in mouse movement
    scrollRef.current.scrollLeft = scrollLeft - walk; // Adjust scroll position
  };
  
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };
  


  // functionality of buttons
  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const updateScrollButton = () => {
    const container = scrollRef.current;

    if (container) {
      const leftScroll = container.scrollLeft;
      const rightScrollable =
        container.scrollWidth > leftScroll + container.clientWidth;

      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(rightScrollable);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;

    if (container) {
      container.addEventListener("scroll", updateScrollButton);
      updateScrollButton();

      return () => {
        container.removeEventListener("scroll", updateScrollButton);
      };
    }
  }, [newArivals]);

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>

        {/* Scroll Buttons */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded border ${
              canScrollLeft
                ? "bg-white text-black cursor-pointer"
                : "border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded border ${
              canScrollRight
                ? "bg-white text-black cursor-pointer"
                : "border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={`container mx-auto overflow-x-scroll flex space-x-6 relative ${isDragging ? "cursor-grabbing" : "cursor-grab" }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {newArivals.map((product) => (
          <div
            key={product._id}
            className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative"
          >
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-[500px] object-cover rounded-lg"
              draggable="false"
            />
            <div
              className="absolute bottom-0 w-full border-0 left-0 bg-black/10 backdrop-blur-md text-white
                        p-4 rounded-b-lg"
            >
              <Link to={`/product/${product._id}`} className="block">
                <h4 className="font-medium">{product.name}</h4>
                <p className="mt-1">${product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArival;
