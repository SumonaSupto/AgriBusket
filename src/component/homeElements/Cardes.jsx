import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../modal/ProductModal';
import UnitPrice from '../../components/common/UnitPrice';
import { API_ENDPOINTS } from '../../config/api';

const Cardes = () => {
  const primaryGreen = '#1D7603';
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PRODUCTS.GET_ALL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.products) {
          // Transform API data to frontend format
          const transformedProducts = result.data.products.map(product => ({
            id: product._id || product.id,
            title: product.name,
            description: product.description,
            price: product.pricing?.basePrice || product.price,
            priceText: product.formattedPrice || `৳${product.pricing?.basePrice || product.price}/${product.pricing?.unit || product.unit}`,
            image: product.images?.[0]?.url || product.image,
            unit: product.pricing?.unit || product.unit
          }));
          
          setProducts(transformedProducts);
          setError(null);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        // Fallback to hardcoded data if API fails
        setProducts([
          {
            id: 1,
            title: 'Organic Tomatoes',
            description: 'Fresh, juicy, and pesticide-free — perfect for salads and sauces.',
            price: 40,
            priceText: '৳40/ kg',
            image: 'https://plus.unsplash.com/premium_photo-1661811820259-2575b82101bf?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            unit: 'kg'
          },
          {
            id: 2,
            title: 'Farm-Fresh Eggs (Dozen)',
            description: 'Pasture-raised eggs from healthy hens. Rich in nutrients and flavor.',
            price: 130,
            priceText: '৳130 / dozen',
            image: 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            unit: 'dozen'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      priceText: product.priceText,
      image: product.image,
      unit: product.unit
    });
    navigate('/cart');
  };

  return (
    <>
      <div className="text-center mt-10 mb-5">
        <h1 className="text-3xl font-semibold brand-font">
          Our <span style={{ color: primaryGreen }}>Products</span>
        </h1>
        {error && (
          <div className="mt-2 text-orange-600 text-sm">
            ⚠️ Using cached data - API temporarily unavailable
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg" style={{ color: primaryGreen }}></div>
            <p className="mt-4 text-gray-600">Loading fresh products...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center px-2 sm:px-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="card w-full max-w-xs sm:max-w-sm bg-base-100 shadow-xl flex flex-col cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            >
              <figure className="px-4 pt-4 sm:px-8 sm:pt-8">
                <img
                  src={product.image}
                  alt={product.title}
                  className="rounded-xl h-44 sm:h-52 object-cover w-full"
                />
              </figure>
              <div className="card-body items-center text-center flex-1">
                <h2 className="card-title">{product.title}</h2>
                <p>{product.description}</p>
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold" style={{ color: primaryGreen }}>
                    {product.priceText}
                  </h1>
                </div>
                <div className="card-actions">
                  <button
                    className="btn text-white w-full"
                    style={{ backgroundColor: primaryGreen }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Cardes;
