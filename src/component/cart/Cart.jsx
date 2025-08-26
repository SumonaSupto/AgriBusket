import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import UnitPrice from '../../components/common/UnitPrice';

const Cart = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Add some fresh products to get started!</p>
                <Link to="/cards">
                  <button className="bg-[#1D7603] text-white py-3 px-8 rounded-md hover:bg-[#155502] transition duration-300 font-medium">
                    Start Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart ({totalItems} items)</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex items-center space-x-4">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-[#1D7603] font-medium">{item.priceText}</p>
                  <UnitPrice 
                    price={item.price} 
                    unit={item.unit} 
                    variant="muted" 
                    size="sm"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition duration-200"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition duration-200"
                  >
                    +
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm transition duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-[#1D7603]">৳{totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={clearCart}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition duration-300 font-medium"
              >
                Clear Cart
              </button>
              <Link to="/checkout" className="flex-1">
                <button className="w-full bg-[#1D7603] text-white py-3 px-6 rounded-md hover:bg-[#155502] transition duration-300 font-medium">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/cards" className="text-[#1D7603] hover:text-[#155502] transition duration-200">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
