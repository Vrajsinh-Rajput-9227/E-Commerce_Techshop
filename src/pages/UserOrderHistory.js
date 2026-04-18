// src/pages/UserOrderHistory.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import Notification from '../component/Notification';
import './UserOrderHistory.css';

function UserOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadData = () => {
      // Load orders
      const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
      setOrders(savedOrders);
      
      setIsLoading(false);
    };

    loadData();

    // Listen for updates
    const handleOrdersUpdate = () => {
      const updatedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
      setOrders(updatedOrders);
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
    };
  }, []);

  // Order status helper
  const getOrderStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'processing':
        return <FaClock className="status-icon processing" />;
      case 'cancelled':
        return <FaTimes className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon pending" />;
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return ['Processing'].includes(status);
  };

  // Handle order cancellation from user order history page
  const handleCancelOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
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
        setOrders(updatedOrders);
        
        // Show refund notification
        setNotification({
          message: `Order cancelled successfully! Your refund of ₹${order?.total?.toLocaleString() || '0'} will be processed within 24 hours.`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error cancelling order:', error);
        setNotification({
          message: 'Failed to cancel order. Please try again.',
          type: 'error'
        });
      }
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle expanded state for order items
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="user-order-history">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-order-history">
      <div className="page-header">
        <h1>My Order History</h1>
        <p className="page-description">View and track all your orders in one place</p>
      </div>
      
      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="o-order-item">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">{formatDate(order.date)}</p>
                  <p className="order-items-count">{order.items?.length || 0} items</p>
                </div>
                <div className="order-info">
                  <div className="order-status">
                    {getOrderStatusIcon(order.status)}
                    <span className={`status-text ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="order-total">₹{order.total?.toLocaleString()}</p>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="order-items-preview">
                  {(expandedOrders.has(order.id) ? order.items : order.items.slice(0, 3)).map((item, index) => (
                    <div key={index} className="order-item-preview">
                      <img 
                        src={item.image || `https://picsum.photos/seed/product${index}/50/50.jpg`} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div 
                      className="more-items clickable"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      {expandedOrders.has(order.id) ? `Show less` : `+${order.items.length - 3} more`}
                    </div>
                  )}
                </div>
              )}
              <div className="order-actions">
                <button 
                  className="view-order-btn"
                  onClick={() => window.location.href = `/order/${order.id}`}
                >
                  View Details
                </button>
                <button 
                  className="view-order-btn"
                  onClick={() => window.location.href = `/order-slip/${order.id}`}
                  style={{
                    marginLeft: '5px'
                  }}
                >
                  View Slip
                </button>
                <button 
                  className="track-order-btn"
                  onClick={() => window.location.href = `/track-order?order=${order.id}`}
                >
                  Track Order
                </button>
                {canCancelOrder(order.status) && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-orders">
          <FaBox className="empty-icon" />
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Start shopping to see your order history here.</p>
          <Link to="/products" className="shop-now-btn">
            Shop Now
          </Link>
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
}

export default UserOrderHistory;
