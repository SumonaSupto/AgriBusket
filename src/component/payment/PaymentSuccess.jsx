import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get URL parameters (SSLCommerz sends data as URL parameters)
        const urlParams = new URLSearchParams(window.location.search);
        const paymentData = {};
        
        for (let [key, value] of urlParams) {
          paymentData[key] = value;
        }

        // Send success data to backend
        const response = await fetch(`http://localhost:18562/api/payment/success/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success) {
          // Get order details
          const orderResponse = await fetch(`http://localhost:18562/api/payment/order/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('agribasket_token')}`
            }
          });

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            setOrder(orderData.data);
          }

          toast.success('Payment successful! Your order has been confirmed.');
        } else {
          setError(result.message || 'Payment verification failed');
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment success handler error:', error);
        setError('Failed to process payment success');
        toast.error('Failed to process payment');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      handlePaymentSuccess();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">Processing Payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
            >
              Return to Cart
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 border-b border-green-200 px-6 py-8 text-center">
            <FaCheckCircle className="text-6xl text-green-600 mb-4 mx-auto" />
            <h1 className="text-3xl font-bold text-green-800">Payment Successful!</h1>
            <p className="text-green-600 mt-2">Thank you for your order. Your payment has been processed successfully.</p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Order Number:</span>
                    <span className="ml-2 text-gray-800">{order.orderId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Transaction ID:</span>
                    <span className="ml-2 text-gray-800">{order.paymentInfo.sslcommerz?.bank_tran_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <span className="ml-2 text-gray-800 capitalize">{order.paymentInfo.method}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Order Status:</span>
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <img 
                          src={item.productImage || '/placeholder.jpg'} 
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{item.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-800">৳{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800">৳{order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="text-gray-800">৳{order.pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-800">৳{order.pricing.tax.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-green-600">৳{order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800">{order.customerInfo.name}</p>
                  <p className="text-gray-600">{order.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.district}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.division}, {order.shippingAddress.country}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.postalCode}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/cards')}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition duration-200 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• You will receive an order confirmation email shortly</li>
            <li>• Your order will be processed and prepared for delivery</li>
            <li>• You can track your order status in the "My Orders" section</li>
            <li>• Estimated delivery time is 2-5 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
