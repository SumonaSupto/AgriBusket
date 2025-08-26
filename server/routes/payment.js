const express = require('express');
const router = express.Router();
const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('../models/Order');
const AuthUser = require('../models/AuthUser');
const { protect } = require('../middleware/auth');

// Initialize SSLCommerz
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

// @route   GET /api/payment/test
// @desc    Test payment routes
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Payment routes are working!',
    sslcommerz: {
      store_id: store_id ? 'Configured' : 'Missing',
      is_live: is_live
    }
  });
});

// @route   POST /api/payment/init
// @desc    Initialize payment with SSLCommerz
// @access  Private
router.post('/init', protect, async (req, res) => {
  try {
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      customerNotes
    } = req.body;

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Calculate pricing
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 1000 ? 0 : 50; // Free delivery over ৳1000
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;

    // Create order
    const orderData = {
      userId: req.user._id,
      customerInfo: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone || shippingAddress.phone
      },
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.title,
        productImage: item.image,
        quantity: item.quantity,
        unit: item.unit || 'piece',
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        farmerId: item.farmerId || null, // Make farmerId optional
        farmerName: item.farmerName || 'AgriBasket Store'
      })),
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        discount: 0,
        total
      },
      shippingAddress: {
        street: shippingAddress.address,
        city: shippingAddress.city,
        district: shippingAddress.city, // Use city as district for now
        division: shippingAddress.state || shippingAddress.city, // Use state or city as division
        postalCode: shippingAddress.zipCode || shippingAddress.postalCode,
        country: shippingAddress.country || 'Bangladesh'
      },
      paymentInfo: {
        method: paymentMethod
      },
      notes: {
        customerNote: customerNotes
      }
    };

    const order = new Order(orderData);
    await order.save();

    // If payment method is SSLCommerz, initialize payment
    if (paymentMethod === 'sslcommerz') {
      const transactionId = `${order.orderId}_${Date.now()}`;
      
      const data = {
        total_amount: total,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `http://localhost:${process.env.PORT}/api/payment/success-redirect/${order._id}`,
        fail_url: `http://localhost:${process.env.PORT}/api/payment/fail-redirect/${order._id}`,
        cancel_url: `http://localhost:${process.env.PORT}/api/payment/cancel-redirect/${order._id}`,
        ipn_url: `http://localhost:${process.env.PORT}/api/payment/ipn`,
        shipping_method: 'Courier',
        product_name: `AgriBasket Order ${order.orderId}`,
        product_category: 'Food',
        product_profile: 'general',
        cus_name: `${req.user.firstName} ${req.user.lastName}`,
        cus_email: req.user.email,
        cus_add1: shippingAddress.address,
        cus_add2: '',
        cus_city: shippingAddress.city,
        cus_state: shippingAddress.state,
        cus_postcode: shippingAddress.zipCode || shippingAddress.postalCode || '',
        cus_country: shippingAddress.country || 'Bangladesh',
        cus_phone: req.user.phone || shippingAddress.phone,
        cus_fax: '',
        ship_name: `${req.user.firstName} ${req.user.lastName}`,
        ship_add1: shippingAddress.address,
        ship_add2: '',
        ship_city: shippingAddress.city,
        ship_state: shippingAddress.state,
        ship_postcode: shippingAddress.zipCode || shippingAddress.postalCode || '',
        ship_country: shippingAddress.country || 'Bangladesh',
        value_a: order._id.toString(),
        value_b: req.user._id.toString(),
        value_c: '',
        value_d: ''
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      
      try {
        const apiResponse = await sslcz.init(data);
        
        if (apiResponse.status === 'SUCCESS') {
          // Update order with SSLCommerz data
          order.paymentInfo.transactionId = transactionId;
          order.paymentInfo.sslcommerz.sessionkey = apiResponse.sessionkey;
          order.paymentInfo.sslcommerz.GatewayPageURL = apiResponse.GatewayPageURL;
          await order.save();

          res.json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
              orderId: order._id,
              orderNumber: order.orderId,
              paymentUrl: apiResponse.GatewayPageURL,
              sessionkey: apiResponse.sessionkey
            }
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Failed to initialize payment',
            error: apiResponse
          });
        }
      } catch (error) {
        console.error('SSLCommerz initialization error:', error);
        res.status(500).json({
          success: false,
          message: 'Payment gateway error',
          error: error.message
        });
      }
    } else {
      // For cash on delivery
      res.json({
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderId,
          paymentMethod: 'cash_on_delivery'
        }
      });
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
});

// @route   POST /api/payment/success/:orderId
// @desc    Handle successful payment
// @access  Public
router.post('/success/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const paymentData = req.body;

    console.log('Payment success data:', paymentData);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    
    try {
      const validation = await sslcz.validate({
        val_id: paymentData.val_id
      });

      if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
        // Update order with payment information
        order.paymentInfo.status = 'completed';
        order.paymentInfo.paidAt = new Date();
        order.paymentInfo.sslcommerz = {
          ...order.paymentInfo.sslcommerz.toObject(),
          val_id: paymentData.val_id,
          bank_tran_id: paymentData.bank_tran_id,
          card_type: paymentData.card_type,
          card_no: paymentData.card_no,
          card_issuer: paymentData.card_issuer,
          card_brand: paymentData.card_brand,
          card_sub_brand: paymentData.card_sub_brand,
          card_issuer_country: paymentData.card_issuer_country,
          currency_type: paymentData.currency_type,
          currency_amount: parseFloat(paymentData.currency_amount),
          store_amount: parseFloat(paymentData.store_amount),
          verify_sign: paymentData.verify_sign,
          verify_key: paymentData.verify_key,
          risk_level: paymentData.risk_level,
          risk_title: paymentData.risk_title
        };
        order.orderStatus = 'confirmed';

        await order.save();

        res.json({
          success: true,
          message: 'Payment successful',
          data: {
            orderId: order._id,
            orderNumber: order.orderId,
            transactionId: paymentData.bank_tran_id
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment validation failed',
          error: validation
        });
      }
    } catch (validationError) {
      console.error('Payment validation error:', validationError);
      res.status(500).json({
        success: false,
        message: 'Payment validation error',
        error: validationError.message
      });
    }

  } catch (error) {
    console.error('Payment success handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment success',
      error: error.message
    });
  }
});

// @route   POST /api/payment/fail/:orderId
// @desc    Handle failed payment
// @access  Public
router.post('/fail/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const failData = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.paymentInfo.status = 'failed';
    order.orderStatus = 'cancelled';
    order.notes.adminNote = `Payment failed: ${failData.failedreason || 'Unknown reason'}`;

    await order.save();

    res.json({
      success: false,
      message: 'Payment failed',
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        reason: failData.failedreason
      }
    });

  } catch (error) {
    console.error('Payment fail handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message
    });
  }
});

// @route   POST /api/payment/cancel/:orderId
// @desc    Handle cancelled payment
// @access  Public
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.paymentInfo.status = 'cancelled';
    order.orderStatus = 'cancelled';
    order.notes.adminNote = 'Payment cancelled by user';

    await order.save();

    res.json({
      success: true,
      message: 'Payment cancelled',
      data: {
        orderId: order._id,
        orderNumber: order.orderId
      }
    });

  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment cancellation',
      error: error.message
    });
  }
});

// @route   POST /api/payment/ipn
// @desc    Handle IPN (Instant Payment Notification) from SSLCommerz
// @access  Public
router.post('/ipn', async (req, res) => {
  try {
    const ipnData = req.body;
    console.log('IPN received:', ipnData);

    // Find order by transaction ID
    const order = await Order.findOne({
      'paymentInfo.transactionId': ipnData.tran_id
    });

    if (!order) {
      console.log('Order not found for transaction:', ipnData.tran_id);
      return res.status(200).send('OK');
    }

    // Validate IPN with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    
    try {
      const validation = await sslcz.validate({
        val_id: ipnData.val_id
      });

      if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
        // Update order if not already updated
        if (order.paymentInfo.status !== 'completed') {
          order.paymentInfo.status = 'completed';
          order.paymentInfo.paidAt = new Date();
          order.orderStatus = 'confirmed';
          await order.save();
        }
      }

      res.status(200).send('OK');
    } catch (validationError) {
      console.error('IPN validation error:', validationError);
      res.status(200).send('OK');
    }

  } catch (error) {
    console.error('IPN handler error:', error);
    res.status(200).send('OK');
  }
});

// @route   GET /api/payment/order/:orderId
// @desc    Get order details for payment verification
// @access  Private
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details',
      error: error.message
    });
  }
});

// @route   POST /api/payment/success-redirect/:orderId
// @desc    Handle SSLCommerz success redirect (POST)
// @access  Public
router.post('/success-redirect/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const queryParams = req.query;
    const bodyParams = req.body;
    
    // Log the payment success
    console.log('Payment success redirect for order:', orderId);
    console.log('SSLCommerz query params:', queryParams);
    console.log('SSLCommerz body params:', bodyParams);
    
    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/payment/success/${orderId}?${new URLSearchParams({...queryParams, ...bodyParams}).toString()}`);
  } catch (error) {
    console.error('Success redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${req.params.orderId}`);
  }
});

// @route   GET /api/payment/success-redirect/:orderId
// @desc    Handle SSLCommerz success redirect
// @access  Public
router.get('/success-redirect/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const queryParams = req.query;
    
    // Log the payment success
    console.log('Payment success redirect for order:', orderId);
    console.log('SSLCommerz response:', queryParams);
    
    // Return HTML that redirects to React app with JavaScript
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Success - Redirecting...</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #f0f9ff; 
        }
        .spinner { 
          border: 4px solid #f3f3f3; 
          border-top: 4px solid #22c55e; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          animation: spin 1s linear infinite; 
          margin: 20px auto; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h2>Payment Successful!</h2>
      <div class="spinner"></div>
      <p>Redirecting you to the confirmation page...</p>
      <script>
        setTimeout(function() {
          window.location.href = '${process.env.FRONTEND_URL}/payment/success/${orderId}?${new URLSearchParams(queryParams).toString()}';
        }, 2000);
      </script>
    </body>
    </html>`;
    
    res.send(html);
  } catch (error) {
    console.error('Success redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${req.params.orderId}`);
  }
});

// @route   POST /api/payment/fail-redirect/:orderId
// @desc    Handle SSLCommerz fail redirect (POST)
// @access  Public
router.post('/fail-redirect/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const queryParams = req.query;
    const bodyParams = req.body;
    
    // Log the payment failure
    console.log('Payment fail redirect for order:', orderId);
    console.log('SSLCommerz query params:', queryParams);
    console.log('SSLCommerz body params:', bodyParams);
    
    // Redirect to frontend fail page
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${orderId}?${new URLSearchParams({...queryParams, ...bodyParams}).toString()}`);
  } catch (error) {
    console.error('Fail redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${req.params.orderId}`);
  }
});

// @route   GET /api/payment/fail-redirect/:orderId
// @desc    Handle SSLCommerz fail redirect
// @access  Public
router.get('/fail-redirect/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const queryParams = req.query;
    
    // Log the payment failure
    console.log('Payment fail redirect for order:', orderId);
    console.log('SSLCommerz response:', queryParams);
    
    // Return HTML that redirects to React app with JavaScript
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Failed - Redirecting...</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #fef2f2; 
        }
        .spinner { 
          border: 4px solid #f3f3f3; 
          border-top: 4px solid #ef4444; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          animation: spin 1s linear infinite; 
          margin: 20px auto; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h2>Payment Failed</h2>
      <div class="spinner"></div>
      <p>Redirecting you back...</p>
      <script>
        setTimeout(function() {
          window.location.href = '${process.env.FRONTEND_URL}/payment/fail/${orderId}?${new URLSearchParams(queryParams).toString()}';
        }, 2000);
      </script>
    </body>
    </html>`;
    
    res.send(html);
  } catch (error) {
    console.error('Fail redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${req.params.orderId}`);
  }
});

// @route   POST /api/payment/cancel-redirect/:orderId
// @desc    Handle SSLCommerz cancel redirect (POST)
// @access  Public
router.post('/cancel-redirect/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const queryParams = req.query;
    const bodyParams = req.body;
    
    // Log the payment cancellation
    console.log('Payment cancel redirect for order:', orderId);
    console.log('SSLCommerz query params:', queryParams);
    console.log('SSLCommerz body params:', bodyParams);
    
    // Redirect to frontend cancel page
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel/${orderId}?${new URLSearchParams({...queryParams, ...bodyParams}).toString()}`);
  } catch (error) {
    console.error('Cancel redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel/${req.params.orderId}`);
  }
});

// @route   GET /api/payment/cancel-redirect/:orderId
// @desc    Handle SSLCommerz cancel redirect
// @access  Public
router.get('/cancel-redirect/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const queryParams = req.query;
    
    // Log the payment cancellation
    console.log('Payment cancel redirect for order:', orderId);
    console.log('SSLCommerz response:', queryParams);
    
    // Return HTML that redirects to React app with JavaScript
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled - Redirecting...</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #fffbeb; 
        }
        .spinner { 
          border: 4px solid #f3f3f3; 
          border-top: 4px solid #f59e0b; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          animation: spin 1s linear infinite; 
          margin: 20px auto; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h2>Payment Cancelled</h2>
      <div class="spinner"></div>
      <p>Redirecting you back...</p>
      <script>
        setTimeout(function() {
          window.location.href = '${process.env.FRONTEND_URL}/payment/cancel/${orderId}?${new URLSearchParams(queryParams).toString()}';
        }, 2000);
      </script>
    </body>
    </html>`;
    
    res.send(html);
  } catch (error) {
    console.error('Cancel redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel/${req.params.orderId}`);
  }
});

module.exports = router;
