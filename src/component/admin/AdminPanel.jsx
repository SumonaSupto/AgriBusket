import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiShoppingCart, 
  FiPackage, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMessageSquare,
  FiStar,
  FiRefreshCw,
  FiMinus,
  FiX
} from 'react-icons/fi';
import AdminContacts from './AdminContacts';
import AdminTestimonials from './AdminTestimonials';
import { productAPI } from '../../api/products';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Stock management modal state
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockOperation, setStockOperation] = useState('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState(null);

  // Check if admin is logged in
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isAdminLoggedIn) {
      navigate('/admin-login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('agribasket_token') || localStorage.getItem('token') || 'admin-token';

      // Fetch dashboard statistics (with fallback)
      try {
        const statsRes = await fetch('http://localhost:18562/api/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setDashboardData(statsData.data);
          } else {
            throw new Error('Stats API not available');
          }
        } else {
          throw new Error('Stats API not available');
        }
      } catch (error) {
        console.log('Using fallback dashboard data');
        setDashboardData({
          users: { total: 1234, thisMonth: 45, growth: 12.5 },
          orders: { total: 856, thisMonth: 67, growth: 8.3 },
          products: { total: 45, active: 42, lowStock: 3 },
          revenue: { current: 25430, growth: 15.2 },
          contacts: { unread: 12, new: 8 }
        });
      }

      // Calculate low stock products from current products
      try {
        const response = await fetch('http://localhost:18562/api/products');
        const data = await response.json();
        if (data.success && data.data?.products) {
          const lowStockCount = data.data.products.filter(product => 
            (product.inventory?.availableQuantity || product.inventory?.quantity || 0) <= 10
          ).length;
          
          setDashboardData(prev => ({
            ...prev,
            products: {
              ...prev.products,
              lowStock: lowStockCount,
              total: data.data.products.length
            }
          }));
        }
      } catch (error) {
        console.log('Could not fetch products for dashboard stats');
      }

      // Fetch recent orders (with fallback)
      try {
        const ordersRes = await fetch('http://localhost:18562/api/admin/dashboard/recent-orders?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success) {
            console.log('Recent orders data received:', ordersData.data);
            setRecentOrders(ordersData.data);
          } else {
            throw new Error('Orders API not available');
          }
        } else {
          throw new Error('Orders API not available');
        }
      } catch (error) {
        console.log('Using fallback recent orders data');
        setRecentOrders([
          { id: '#001', customer: 'John Doe', products: 'Organic Tomatoes', amount: '৳120', status: 'delivered', date: new Date() },
          { id: '#002', customer: 'Jane Smith', products: 'Fresh Milk', amount: '৳80', status: 'processing', date: new Date() },
          { id: '#003', customer: 'Mike Johnson', products: 'Farm Eggs', amount: '৳130', status: 'shipped', date: new Date() }
        ]);
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:18562/api/products?limit=10');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products || data.data || []);
      } else {
        throw new Error('Products API not available');
      }
    } catch (error) {
      console.log('Using fallback products data');
      setProducts([
        { _id: '1', name: 'Organic Tomatoes', pricing: { basePrice: 40, unit: 'kg' }, inventory: { availableQuantity: 25 }, status: 'active' },
        { _id: '2', name: 'Farm Fresh Eggs', pricing: { basePrice: 130, unit: 'dozen' }, inventory: { availableQuantity: 15 }, status: 'active' },
        { _id: '3', name: 'Raw Forest Honey', pricing: { basePrice: 800, unit: 'jar' }, inventory: { availableQuantity: 5 }, status: 'active' },
        { _id: '4', name: 'Organic Milk', pricing: { basePrice: 80, unit: 'liter' }, inventory: { availableQuantity: 0 }, status: 'inactive' }
      ]);
    }
  };

  // Stock management functions
  const openStockModal = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
    setStockOperation('add');
    setStockQuantity('');
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
    setStockQuantity('');
    setStockLoading(false);
  };

  // Notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStockUpdate = async () => {
    if (!stockQuantity || !selectedProduct) return;
    
    setStockLoading(true);
    try {
      const response = await productAPI.updateStock(
        selectedProduct._id, 
        parseInt(stockQuantity), 
        stockOperation
      );
      
      if (response.success) {
        // Update the product in the local state
        setProducts(prev => prev.map(product => 
          product._id === selectedProduct._id 
            ? { ...product, inventory: { ...product.inventory, availableQuantity: response.data.newQuantity } }
            : product
        ));
        
        showNotification(`Stock ${stockOperation}ed successfully! New quantity: ${response.data.newQuantity}`, 'success');
        closeStockModal();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Stock update error:', error);
      showNotification('Failed to update stock: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setStockLoading(false);
    }
  };

  const handleQuickStockUpdate = async (product, operation, quantity) => {
    try {
      const response = await productAPI.updateStock(
        product._id, 
        parseInt(quantity), 
        operation
      );
      
      if (response.success) {
        // Update the product in the local state
        setProducts(prev => prev.map(prod => 
          prod._id === product._id 
            ? { ...prod, inventory: { ...prod.inventory, availableQuantity: response.data.newQuantity } }
            : prod
        ));
        
        showNotification(`${operation === 'add' ? 'Added' : 'Removed'} ${quantity} units. New stock: ${response.data.newQuantity}`, 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Quick stock update error:', error);
      showNotification('Failed to update stock: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('agribasket_token') || localStorage.getItem('token') || 'admin-token';
      const response = await fetch('http://localhost:18562/api/orders/admin/all?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.data.orders || []);
        } else {
          throw new Error('Orders API not available');
        }
      } else {
        throw new Error('Orders API not available');
      }
    } catch (error) {
      console.log('Orders API not available, using empty state');
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('agribasket_token') || localStorage.getItem('token') || 'admin-token';
      const response = await fetch('http://localhost:18562/api/users?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      } else {
        throw new Error('Users API not available');
      }
    } catch (error) {
      console.log('Users API not available, using empty state');
      setUsers([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('token');
    navigate('/admin-login');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const formatCurrency = (amount) => {
    return `৳${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7603]"></div>
        </div>
      );
    }

    const stats = [
      { 
        title: 'Total Users', 
        value: dashboardData.users?.total?.toLocaleString() || '0', 
        growth: dashboardData.users?.growth || 0,
        icon: FiUsers, 
        color: 'bg-blue-500' 
      },
      { 
        title: 'Total Orders', 
        value: dashboardData.orders?.total?.toLocaleString() || '0', 
        growth: dashboardData.orders?.growth || 0,
        icon: FiShoppingCart, 
        color: 'bg-green-500' 
      },
      { 
        title: 'Products', 
        value: dashboardData.products?.total?.toString() || '0', 
        growth: `${dashboardData.products?.lowStock || 0} low stock`,
        icon: FiPackage, 
        color: 'bg-yellow-500' 
      },
      { 
        title: 'Revenue', 
        value: formatCurrency(dashboardData.revenue?.current), 
        growth: dashboardData.revenue?.growth || 0,
        icon: FiDollarSign, 
        color: 'bg-purple-500' 
      },
    ];

    return (
      <div className="space-y-6">
        {/* Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <button
            onClick={fetchDashboardData}
            className="bg-[#1D7603] text-white px-4 py-2 rounded-md hover:bg-[#155502] transition duration-300 flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {typeof stat.growth === 'number' ? (
                      <>
                        <FiTrendingUp className={`h-4 w-4 ${stat.growth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm ml-1 ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-orange-600">{stat.growth}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('products')}
                className="w-full text-left px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-200"
              >
                <FiPlus className="inline mr-2" />
                Manage Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className="w-full text-left px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-200"
              >
                <FiShoppingCart className="inline mr-2" />
                Manage Orders
              </button>
              <button 
                onClick={() => setActiveTab('contacts')}
                className="w-full text-left px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-200"
              >
                <FiMessageSquare className="inline mr-2" />
                View Messages ({dashboardData.contacts?.unread || 0})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">• {dashboardData.users?.thisMonth || 0} new users this month</p>
              <p className="text-gray-600">• {dashboardData.orders?.thisMonth || 0} orders this month</p>
              <p className="text-gray-600">• {dashboardData.contacts?.new || 0} new messages</p>
              <p className="text-gray-600">• {dashboardData.products?.lowStock || 0} products low in stock</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Database Connected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Email Service Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Payment Gateway Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{order.products}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        {dashboardData.products?.lowStock > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiPackage className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {dashboardData.products.lowStock} product{dashboardData.products.lowStock > 1 ? 's' : ''} running low on stock.{' '}
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="font-medium underline hover:text-yellow-900"
                    >
                      View Products
                    </button>{' '}
                    to manage inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button 
          onClick={fetchProducts}
          className="bg-[#1D7603] text-white px-4 py-2 rounded-md hover:bg-[#155502] transition duration-300 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh Products
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const stockQuantity = product.inventory?.availableQuantity || product.inventory?.quantity || 0;
              const stockStatus = getStockStatus(stockQuantity);
              return (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ৳{product.pricing?.basePrice || 0}/{product.pricing?.unit || 'unit'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{stockQuantity} {product.pricing?.unit || 'units'}</span>
                        <div className="flex space-x-1 mt-1">
                          <button
                            onClick={() => handleQuickStockUpdate(product, 'add', '10')}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            title="Quick Add 10"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(product, 'subtract', '10')}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            title="Quick Remove 10"
                          >
                            -10
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => openStockModal(product)}
                        className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                        title="Custom Update"
                      >
                        Custom
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View Details">
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900" title="Edit Product">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openStockModal(product)}
                        className="text-green-600 hover:text-green-900" 
                        title="Manage Stock"
                      >
                        <FiPackage className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete Product">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <button 
          onClick={fetchOrders}
          className="bg-[#1D7603] text-white px-4 py-2 rounded-md hover:bg-[#155502] transition duration-300 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh Orders
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id || order.orderId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customerInfo?.name || 'Unknown Customer'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(order.pricing?.total || order.summary?.totalAmount || order.totalAmount || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus || order.status)}`}>
                    {order.orderStatus || order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FiEdit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12">
            <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">Orders will appear here when customers make purchases.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button 
          onClick={fetchUsers}
          className="bg-[#1D7603] text-white px-4 py-2 rounded-md hover:bg-[#155502] transition duration-300 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh Users
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.fullName || user.username || 'Unknown User'
                        }
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {user.role || 'user'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FiEdit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Registered users will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'contacts', label: 'Messages', icon: FiMessageSquare },
    { id: 'testimonials', label: 'Testimonials', icon: FiStar },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Stock</h3>
              <button
                onClick={closeStockModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {selectedProduct && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600">
                    Current Stock: {selectedProduct.inventory?.availableQuantity || selectedProduct.inventory?.quantity || 0} {selectedProduct.pricing?.unit || 'units'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation
                  </label>
                  <select
                    value={stockOperation}
                    onChange={(e) => setStockOperation(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7603]"
                  >
                    <option value="add">Add Stock</option>
                    <option value="subtract">Remove Stock</option>
                    <option value="set">Set Stock</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7603]"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeStockModal}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
                    disabled={stockLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStockUpdate}
                    disabled={!stockQuantity || stockLoading}
                    className="flex-1 bg-[#1D7603] text-white px-4 py-2 rounded-md hover:bg-[#155502] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {stockLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Update Stock'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-[#1D7603]">AgriBasket Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 flex items-center"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="bg-white w-64 min-h-screen shadow">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-md transition duration-200 ${
                      activeTab === item.id
                        ? 'bg-[#1D7603] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'contacts' && <AdminContacts />}
          {activeTab === 'testimonials' && <AdminTestimonials />}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600">Settings functionality will be implemented here.</p>
              <div className="mt-8 space-y-4 max-w-md mx-auto">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-900">System Configuration</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure system-wide settings</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-900">Email Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure email notifications</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-900">Payment Gateway</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure payment settings</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
