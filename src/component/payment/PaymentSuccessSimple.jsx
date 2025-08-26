import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentSuccessSimple = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Show success message
    toast.success('Payment completed successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <FaCheckCircle className="text-green-500 text-6xl mb-4 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>
        
        {orderId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Order ID:</p>
            <p className="font-mono text-sm font-semibold text-gray-800">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessSimple;
