import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBan } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentCancel = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentCancel = async () => {
      try {
        // Send cancel data to backend
        const response = await fetch(`http://localhost:18562/api/payment/cancel/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });

        const result = await response.json();
        
        if (result.success) {
          toast.error('Payment cancelled. Your order has been cancelled.');
        }
      } catch (error) {
        console.error('Payment cancel handler error:', error);
        toast.error('Failed to process payment cancellation');
      }
    };

    if (orderId) {
      handlePaymentCancel();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <FaBan className="text-6xl text-orange-500 mb-4 mx-auto" />
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
        
        <p className="text-gray-600 mb-6">
          You have cancelled the payment process. Your order has been cancelled and no charges have been made.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-2">What you can do next:</h3>
          <ul className="text-orange-700 text-sm text-left space-y-1">
            <li>• Review your cart and try again</li>
            <li>• Choose a different payment method</li>
            <li>• Continue shopping for more items</li>
            <li>• Contact support if you need assistance</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium"
          >
            Return to Cart
          </button>
          
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Try Different Payment
          </button>
          
          <button
            onClick={() => navigate('/cards')}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition duration-200 font-medium"
          >
            Continue Shopping
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition duration-200 font-medium"
          >
            Go to Home
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your cart items are still saved. You can complete your purchase anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
