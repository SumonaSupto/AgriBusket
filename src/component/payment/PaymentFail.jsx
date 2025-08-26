import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentFail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentFail = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const failData = {};
        
        for (let [key, value] of urlParams) {
          failData[key] = value;
        }

        // Send fail data to backend
        const response = await fetch(`http://localhost:18562/api/payment/fail/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(failData)
        });

        const result = await response.json();
        
        if (result.success === false) {
          toast.error(`Payment failed: ${result.data?.reason || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Payment fail handler error:', error);
        toast.error('Failed to process payment failure');
      }
    };

    if (orderId) {
      handlePaymentFail();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <FaTimesCircle className="text-6xl text-red-500 mb-4 mx-auto" />
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h1>
        
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Your order has been cancelled.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
          <ul className="text-red-700 text-sm text-left space-y-1">
            <li>• Payment was declined by your bank</li>
            <li>• Insufficient funds in your account</li>
            <li>• Network connectivity issues</li>
            <li>• Invalid payment information</li>
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
            Try Again
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
            Need help? Contact our support team at support@agribasket.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
