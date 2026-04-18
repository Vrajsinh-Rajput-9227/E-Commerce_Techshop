import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Notification from '../component/Notification';
import './TrackOrder.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showPartialCancelModal, setShowPartialCancelModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // Load order data on component mount
  useEffect(() => {
    const loadOrderData = () => {
      const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
      const order = savedOrders.find(o => o.id === orderId);
      
      if (order) {
        // Enrich order data with additional details
        const enrichedOrder = {
          ...order,
          trackingNumber: `TRK${order.id.slice(-9)}`,
          customerName: user?.name || 'Customer',
          customerEmail: user?.email || 'customer@example.com',
          customerPhone: user?.phone || '+1 234-567-8900',
          estimatedDelivery: new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          timeline: generateOrderTimeline(order),
          currentStatus: getCurrentStatusMessage(order.status),
          shippingAddress: user?.address || '123 Main St, City, State 12345'
        };
        setOrderData(enrichedOrder);
        setError('');
      } else {
        setError('Order not found. Please check your order ID and try again.');
        setOrderData(null);
      }
      setLoading(false);
    };

    loadOrderData();
  }, [orderId, user]);

  // Check if order can be cancelled
  const canCancelOrder = (order) => {
    return order && ['Processing'].includes(order.status);
  };

  // Toggle product selection for partial cancellation
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Calculate refund for selected products
  const calculatePartialRefund = () => {
    if (!orderData?.items) return 0;
    return orderData.items
      .filter(item => selectedProducts.has(item.id || item.name))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle partial order cancellation
  const handlePartialCancelOrder = () => {
    // If only one product, cancel it directly without showing selection modal
    if (orderData?.items?.length === 1) {
      const singleProduct = orderData.items[0];
      const refundAmount = singleProduct.price * singleProduct.quantity;
      
      if (window.confirm(`Are you sure you want to cancel "${singleProduct.name}" with a refund of ₹${refundAmount.toLocaleString()}? This action cannot be undone.`)) {
        try {
          const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
          const updatedOrders = savedOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                items: [],
                total: 0,
                status: 'Cancelled',
                cancelledAt: new Date().toISOString(),
                cancellationReason: 'Customer requested cancellation',
                cancelledProducts: [singleProduct]
              };
            }
            return order;
          });
          
          localStorage.setItem('bookings', JSON.stringify(updatedOrders));
          
          // Update the current order data
          const updatedOrder = updatedOrders.find(order => order.id === orderId);
          setOrderData({
            ...updatedOrder,
            currentStatus: 'Your order has been cancelled',
            timeline: generateOrderTimeline(updatedOrder)
          });
          
          // Show single product cancellation notification
          setNotification({
            message: `"${singleProduct.name}" cancelled successfully! Your refund of ₹${refundAmount.toLocaleString()} will be processed within 24 hours.`,
            type: 'success'
          });
        } catch (error) {
          console.error('Error cancelling product:', error);
          setNotification({
            message: 'Failed to cancel product. Please try again.',
            type: 'error'
          });
        }
      }
      return;
    }

    // For multiple products, show selection modal
    if (selectedProducts.size === 0) {
      setNotification({
        message: 'Please select at least one product to cancel.',
        type: 'error'
      });
      return;
    }

    const refundAmount = calculatePartialRefund();
    
    if (window.confirm(`Are you sure you want to cancel ${selectedProducts.size} product(s) with a refund of ₹${refundAmount.toLocaleString()}? This action cannot be undone.`)) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updatedOrders = savedOrders.map(order => {
          if (order.id === orderId) {
            const remainingItems = order.items.filter(item => !selectedProducts.has(item.id || item.name));
            const newTotal = remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            return {
              ...order,
              items: remainingItems,
              total: newTotal,
              status: remainingItems.length === 0 ? 'Cancelled' : 'Partially Cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationReason: 'Partial cancellation - Customer requested cancellation of selected products',
              cancelledProducts: order.items.filter(item => selectedProducts.has(item.id || item.name))
            };
          }
          return order;
        });
        
        localStorage.setItem('bookings', JSON.stringify(updatedOrders));
        
        // Update the current order data
        const updatedOrder = updatedOrders.find(order => order.id === orderId);
        const remainingItems = updatedOrder.items;
        
        setOrderData({
          ...updatedOrder,
          currentStatus: remainingItems.length === 0 ? 'Your order has been cancelled' : 'Some products from your order have been cancelled',
          timeline: generateOrderTimeline(updatedOrder)
        });
        
        setShowPartialCancelModal(false);
        setSelectedProducts(new Set());
        
        // Show partial refund notification
        const message = remainingItems.length === 0 
          ? `Order #${orderId} cancelled successfully! Your refund of ₹${refundAmount.toLocaleString()} will be processed within 24 hours.`
          : `${selectedProducts.size} product(s) cancelled successfully! Your refund of ₹${refundAmount.toLocaleString()} will be processed within 24 hours.`;
        
        setNotification({
          message,
          type: 'success'
        });
      } catch (error) {
        console.error('Error cancelling products:', error);
        setNotification({
          message: 'Failed to cancel products. Please try again.',
          type: 'error'
        });
      }
    }
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    setCancelling(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updatedOrders = savedOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'Cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationReason: 'Customer requested cancellation'
            };
          }
          return order;
        });
        
        localStorage.setItem('bookings', JSON.stringify(updatedOrders));
        
        // Update the current order data
        setOrderData(prev => ({
          ...prev,
          status: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Customer requested cancellation',
          currentStatus: 'Your order has been cancelled',
          timeline: generateOrderTimeline({ ...prev, status: 'Cancelled' })
        }));
        
        setShowCancelModal(false);
        setCancelling(false);
        
        // Show refund notification
        setNotification({
          message: `Order cancelled successfully! Your refund of ₹${orderData.total?.toLocaleString()} will be processed within 24 hours.`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
        setCancelling(false);
      }
    }, 1500);
  };

  // Generate timeline based on order status and date
  const generateOrderTimeline = (order) => {
    const orderDate = new Date(order.date);
    const timeline = [
      {
        status: 'Order Placed',
        date: orderDate.toISOString().split('T')[0],
        time: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        icon: FaCheckCircle,
        description: 'Your order has been successfully placed'
      }
    ];

    // Add Order Confirmed (1 hour after order placed)
    const confirmedDate = new Date(orderDate.getTime() + 60 * 60 * 1000);
    timeline.push({
      status: 'Order Confirmed',
      date: confirmedDate.toISOString().split('T')[0],
      time: confirmedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      icon: FaCheckCircle,
      description: 'We have received your order and confirmed payment'
    });

    // If order is cancelled, add cancellation step and return
    if (order.status === 'Cancelled') {
      const cancelledDate = order.cancelledAt ? new Date(order.cancelledAt) : new Date();
      timeline.push({
        status: 'Order Cancelled',
        date: cancelledDate.toISOString().split('T')[0],
        time: cancelledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        icon: FaTimes,
        description: order.cancellationReason || 'Order was cancelled by customer request'
      });
      return timeline;
    }

    // Add Processing (next day)
    const processingDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Processing',
      date: processingDate.toISOString().split('T')[0],
      time: '09:00 AM',
      completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status),
      icon: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? FaCheckCircle : FaClock,
      description: 'Your order is being prepared for shipment'
    });

    // Add Shipped (2 days after order)
    const shippedDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Shipped',
      date: shippedDate.toISOString().split('T')[0],
      time: '02:30 PM',
      completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status),
      icon: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? FaTruck : FaClock,
      description: 'Your order has been shipped via Express Delivery'
    });

    // Add Out for Delivery (4 days after order)
    const outForDeliveryDate = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Out for Delivery',
      date: outForDeliveryDate.toISOString().split('T')[0],
      time: '08:00 AM',
      completed: ['Out for Delivery', 'Delivered'].includes(order.status),
      icon: ['Out for Delivery', 'Delivered'].includes(order.status) ? FaTruck : FaClock,
      description: 'Your order is out for delivery'
    });

    // Add Delivered (5 days after order)
    const deliveredDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Delivered',
      date: deliveredDate.toISOString().split('T')[0],
      time: 'Expected by 6:00 PM',
      completed: order.status === 'Delivered',
      icon: FaBox,
      description: order.status === 'Delivered' ? 'Your order has been delivered' : 'Your order will be delivered to your address'
    });

    return timeline;
  };

  const getCurrentStatusMessage = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'Your order is being processed and prepared for shipment';
      case 'shipped':
        return 'Your order has been shipped and is on its way';
      case 'out for delivery':
        return 'Your order is out for delivery and will arrive today';
      case 'delivered':
        return 'Your order has been successfully delivered';
      case 'cancelled':
        return 'Your order has been cancelled as per your request';
      default:
        return 'Your order is being processed';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#10b981';
      case 'shipped':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'out for delivery':
        return '#8b5cf6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="track-order">
        <div className="track-header">
          <button onClick={() => navigate('/account')} className="back-btn">
            <FaArrowLeft /> Back to Account
          </button>
          <h1>Loading Order Details...</h1>
        </div>
        <div className="loading-section">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-order">
        <div className="track-header">
          <button onClick={() => navigate('/account')} className="back-btn">
            <FaArrowLeft /> Back to Account
          </button>
          <h1>Order Not Found</h1>
        </div>
        <div className="error-message">
          {error}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/account" className="track-btn">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="track-order">
      <div className="track-header">
        <button onClick={() => navigate('/account')} className="back-btn">
          <FaArrowLeft /> Back to Account
        </button>
        <h1>Order Details</h1>
        <p>View complete information about your order</p>
      </div>

      {orderData && (
        <div className="order-tracking-details">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-info-grid">
              <div className="info-item">
                <span className="label">Order Number:</span>
                <span className="value">{orderData.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Order Date:</span>
                <span className="value">{formatDate(orderData.date)}</span>
              </div>
              <div className="info-item">
                <span className="label">Tracking Number:</span>
                <span className="value">{orderData.trackingNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Estimated Delivery:</span>
                <span className="value">{formatDate(orderData.estimatedDelivery)}</span>
              </div>
              <div className="info-item">
                <span className="label">Total Amount:</span>
                <span className="value">₹{orderData.total?.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="current-status" style={{ borderLeftColor: getStatusColor(orderData.status) }}>
              <h3>Current Status</h3>
              <p className="status-text">{orderData.currentStatus}</p>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(orderData.status) }}>
                {orderData.status.toUpperCase()}
              </span>
            </div>
            
            {canCancelOrder(orderData) && (
              <div className="order-actions">
                <button 
                  className="cancel-order-btn"
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginRight: '10px'
                  }}
                >
                  <FaTimes /> Cancel Order
                </button>
                <button 
                  className="partial-cancel-btn"
                  onClick={() => {
                    // If only one product, cancel it directly
                    if (orderData?.items?.length === 1) {
                      handlePartialCancelOrder();
                    } else {
                      setShowPartialCancelModal(true);
                    }
                  }}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginRight: '10px'
                  }}
                >
                  <FaTimes /> {orderData?.items?.length === 1 ? 'Cancel Product' : 'Cancel Products'}
                </button>
                <Link 
                  to={`/order-slip/${orderId}`}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginTop: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaBox /> View Order Slip
                </Link>
              </div>
            )}

            {!canCancelOrder(orderData) && (
              <div className="order-actions">
                <Link 
                  to={`/order-slip/${orderId}`}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginTop: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaBox /> View Order Slip
                </Link>
              </div>
            )}
          </div>

          <div className="tracking-timeline">
            <h2>Order Timeline</h2>
            <div className="timeline">
              {orderData.timeline.map((step, index) => (
                <div key={index} className={`timeline-item ${step.completed ? 'completed' : 'pending'}`}>
                  <div className="timeline-icon">
                    <step.icon />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{step.status}</h4>
                      <span className="timeline-date">
                        {formatDate(step.date)} at {step.time}
                      </span>
                    </div>
                    <p className="timeline-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-details-section">
            <h2>Order Details</h2>
            <div className="customer-info">
              <h3><FaEnvelope /> Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{orderData.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{orderData.customerEmail}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{orderData.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="shipping-info">
              <h3><FaMapMarkerAlt /> Shipping Address</h3>
              <p>{orderData.shippingAddress}</p>
            </div>

            <div className="order-items">
              <h3>Items Ordered</h3>
              {orderData.items && orderData.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="order-total">
                <h3>Order Total: ₹{orderData.total?.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#ef4444' }}>
                <FaExclamationTriangle style={{ marginRight: '10px' }} />
                Cancel Order
              </h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ marginBottom: '15px' }}>
                Are you sure you want to cancel your order <strong>#{orderId}</strong>?
              </p>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Once cancelled, this action cannot be undone. You may need to place a new order if you still want these items.
              </p>
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Refund Information:</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  If you've already paid, your refund will be processed within 5-7 business days to your original payment method.
                </p>
              </div>
            </div>
            
            <div className="modal-actions" style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                Keep Order
              </button>
              <button 
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {cancelling ? (
                  <>
                    <div className="spinner" style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FaTimes /> Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Partial Cancel Modal */}
      {showPartialCancelModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#f59e0b' }}>
                <FaTimes style={{ marginRight: '10px' }} />
                Select Products to Cancel
              </h3>
              <button 
                onClick={() => {
                  setShowPartialCancelModal(false);
                  setSelectedProducts(new Set());
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ marginBottom: '15px' }}>
                Select the products you want to cancel from your order:
              </p>
              
              <div className="product-selection-list">
                {orderData?.items?.map((item, index) => (
                  <div key={index} className={`product-item ${selectedProducts.has(item.id || item.name) ? 'selected' : ''}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedProducts.has(item.id || item.name) ? '#fef3c7' : 'white'
                  }} onClick={() => toggleProductSelection(item.id || item.name)}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(item.id || item.name)}
                      onChange={() => toggleProductSelection(item.id || item.name)}
                      style={{
                        marginRight: '12px',
                        cursor: 'pointer'
                      }}
                    />
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginRight: '12px'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{item.name}</h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        Quantity: {item.quantity} × ₹{item.price?.toFixed(2)} = ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedProducts.size > 0 && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Refund Summary:</h4>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Products to cancel: {selectedProducts.size}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                    Refund amount: ₹{calculatePartialRefund().toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    Refund will be processed within 24 hours to your original payment method.
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-actions" style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button 
                onClick={() => {
                  setShowPartialCancelModal(false);
                  setSelectedProducts(new Set());
                }}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Keep Products
              </button>
              <button 
                onClick={handlePartialCancelOrder}
                disabled={selectedProducts.size === 0}
                style={{
                  backgroundColor: selectedProducts.size === 0 ? '#d1d5db' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: selectedProducts.size === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaTimes /> Cancel Selected Products
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default OrderDetail;
