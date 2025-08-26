import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      priceText: product.priceText,
      image: product.image,
      unit: product.unit
    });
    onClose();
    navigate('/cart');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="space-y-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
            
            {/* Additional Product Images (placeholder for future) */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <img
                  key={index}
                  src={product.image}
                  alt={`${product.title} view ${index}`}
                  className="w-full h-20 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-[#1D7603]"
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-[#1D7603]">{product.priceText}</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800">
                    <strong>Unit Price:</strong> ৳{product.price.toFixed(2)} per {product.unit}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {product.unit === 'kg' ? 'Price per kilogram' : 
                     product.unit === 'liter' ? 'Price per liter' :
                     product.unit === 'dozen' ? 'Price per dozen' :
                     product.unit === 'piece' ? 'Price per piece' :
                     `Price per ${product.unit}`}
                  </div>
                </div>
              </div>
              
              {/* Rating (placeholder) */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  100% Organic & Natural
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Pesticide-Free
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Farm Fresh Daily
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Same Day Delivery Available
                </li>
              </ul>
            </div>

            {/* Nutritional Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutritional Benefits</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">Rich in Vitamins</div>
                  <div className="text-gray-600">A, C, K</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">Minerals</div>
                  <div className="text-gray-600">Iron, Potassium</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">Fiber Content</div>
                  <div className="text-gray-600">High</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">Calories</div>
                  <div className="text-gray-600">Low</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-800">-</button>
                  <span className="px-4 py-2 border-x border-gray-300">1</span>
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-800">+</button>
                </div>
                <span className="text-gray-600">{product.unit}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#1D7603] text-white py-3 px-6 rounded-md hover:bg-[#155502] transition duration-300 font-medium text-lg"
              >
                Buy Now - {product.priceText}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="border border-[#1D7603] text-[#1D7603] py-2 px-4 rounded-md hover:bg-[#1D7603] hover:text-white transition duration-300">
                  Add to Wishlist
                </button>
                <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-300">
                  Share Product
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Same day delivery available for orders before 2 PM</li>
                <li>• Free delivery on orders above ৳500</li>
                <li>• Fresh products delivered in insulated bags</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
