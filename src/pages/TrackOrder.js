import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBox, FaTruck, FaCheckCircle, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowLeft, FaSync } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './TrackOrder.css';

const TrackOrder = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  // Load all orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
    setAllOrders(savedOrders);
    
    // Pre-fill email if user is authenticated
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  // Real-time clock update
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Auto-refresh order status
  useEffect(() => {
    if (autoRefresh && orderData) {
      intervalRef.current = setInterval(() => {
        handleRefreshOrder();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, orderData]);

  // Generate timeline based on order status and date
  const generateOrderTimeline = (order) => {
    const orderDate = new Date(order.date);
    const now = currentTime;
    const timeline = [
      {
        status: 'Order Placed',
        date: orderDate.toISOString().split('T')[0],
        time: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        icon: FaCheckCircle,
        description: 'Your order has been successfully placed',
        actualDateTime: orderDate,
        isRealtime: false
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
      description: 'We have received your order and confirmed payment',
      actualDateTime: confirmedDate,
      isRealtime: false
    });

    // Add Processing (next day)
    const processingDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Processing',
      date: processingDate.toISOString().split('T')[0],
      time: '09:00 AM',
      completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status),
      icon: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? FaCheckCircle : FaClock,
      description: 'Your order is being prepared for shipment',
      actualDateTime: processingDate,
      isRealtime: !['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && now >= processingDate
    });

    // Add Shipped (2 days after order)
    const shippedDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Shipped',
      date: shippedDate.toISOString().split('T')[0],
      time: '02:30 PM',
      completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status),
      icon: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? FaTruck : FaClock,
      description: 'Your order has been shipped via Express Delivery',
      actualDateTime: shippedDate,
      isRealtime: !['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && now >= shippedDate
    });

    // Add Out for Delivery (4 days after order)
    const outForDeliveryDate = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Out for Delivery',
      date: outForDeliveryDate.toISOString().split('T')[0],
      time: '08:00 AM',
      completed: ['Out for Delivery', 'Delivered'].includes(order.status),
      icon: ['Out for Delivery', 'Delivered'].includes(order.status) ? FaTruck : FaClock,
      description: 'Your order is out for delivery',
      actualDateTime: outForDeliveryDate,
      isRealtime: !['Out for Delivery', 'Delivered'].includes(order.status) && now >= outForDeliveryDate
    });

    // Add Delivered (5 days after order)
    const deliveredDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    timeline.push({
      status: 'Delivered',
      date: deliveredDate.toISOString().split('T')[0],
      time: 'Expected by 6:00 PM',
      completed: order.status === 'Delivered',
      icon: FaBox,
      description: order.status === 'Delivered' ? 'Your order has been delivered' : 'Your order will be delivered to your address',
      actualDateTime: deliveredDate,
      isRealtime: order.status !== 'Delivered' && now >= deliveredDate
    });

    return timeline;
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);

    // Simulate API call
    setTimeout(() => {
      const order = allOrders.find(o => o.id === orderId);
      
      if (order) {
        // For demo purposes, we'll accept any email that matches the user's email or any email if not authenticated
        const userEmail = isAuthenticated ? user.email.toLowerCase() : email.toLowerCase();
        
        if (isAuthenticated && user.email.toLowerCase() === email.toLowerCase()) {
          // User is tracking their own order
          const enrichedOrder = {
            ...order,
            trackingNumber: `TRK${order.id.slice(-9)}`,
            customerName: user.name || 'Customer',
            customerEmail: user.email,
            customerPhone: user.phone || '+1 234-567-8900',
            estimatedDelivery: new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            timeline: generateOrderTimeline(order),
            currentStatus: getCurrentStatusMessage(order.status)
          };
          setOrderData(enrichedOrder);
          setError('');
        } else if (!isAuthenticated) {
          // For non-authenticated users, just check if order exists
          const enrichedOrder = {
            ...order,
            trackingNumber: `TRK${order.id.slice(-9)}`,
            customerName: 'Customer',
            customerEmail: email,
            customerPhone: '+1 234-567-8900',
            estimatedDelivery: new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            timeline: generateOrderTimeline(order),
            currentStatus: getCurrentStatusMessage(order.status)
          };
          setOrderData(enrichedOrder);
          setError('');
        } else {
          setError('This order is not associated with your account. Please check your order ID and email address.');
          setOrderData(null);
        }
      } else {
        setError('Order not found. Please check your order ID and try again.');
        setOrderData(null);
      }
      setLoading(false);
    }, 1500);
  };

  const handleRefreshOrder = () => {
    if (orderId && orderData) {
      setLoading(true);
      setTimeout(() => {
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
          const enrichedOrder = {
            ...orderData,
            timeline: generateOrderTimeline(order),
            currentStatus: getCurrentStatusMessage(order.status)
          };
          setOrderData(enrichedOrder);
          setLastRefreshTime(new Date());
        }
        setLoading(false);
      }, 500);
    }
  };

  const getTimeUntilNextStatus = (timeline) => {
    const nextStatus = timeline.find(step => !step.completed && step.actualDateTime > currentTime);
    if (!nextStatus) return null;

    const diff = nextStatus.actualDateTime - currentTime;
    if (diff <= 0) return 'Expected soon';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  };

  const isCurrentTime = (dateTime) => {
    const now = currentTime;
    const itemTime = new Date(dateTime);
    const diff = Math.abs(now - itemTime);
    return diff < 60000; // Within 1 minute
  };

  return (
    <div className="track-order">
      <div className="track-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <FaArrowLeft /> Back to Home
        </button>
        <h1>Track Your Order</h1>
        <p>Enter your order ID and email to track your shipment</p>
      </div>

      <div className="track-form-container">
        <form onSubmit={handleTrackOrder} className="track-form">
          <div className="form-group">
            <label htmlFor="orderId">Order ID</label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., ORD-2024-001"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <button type="submit" className="track-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Tracking...
              </>
            ) : (
              <>
                <FaSearch /> Track Order
              </>
            )}
          </button>
        </form>

        {error && searched && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {orderData && (
        <div className="order-tracking-details">
          <div className="refresh-controls">
            <div className="auto-refresh-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span>Auto-refresh (30s)</span>
            </div>
            <button className="refresh-btn" onClick={handleRefreshOrder} disabled={loading}>
              <FaSync className={loading ? 'spinning' : ''} /> Refresh Now
            </button>
            {lastRefreshTime && (
              <span className="last-refresh">
                Last updated: {formatDateTime(lastRefreshTime)}
              </span>
            )}
          </div>

          <div className="current-time-display">
            <h3>Current Time: {formatDateTime(currentTime)}</h3>
          </div>
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-info-grid">
              <div className="info-item">
                <span className="label">Order Number:</span>
                <span className="value">{orderData.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Order Date:</span>
                <span className="value">{formatDate(orderData.orderDate)}</span>
              </div>
              <div className="info-item">
                <span className="label">Tracking Number:</span>
                <span className="value">{orderData.trackingNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Estimated Delivery:</span>
                <span className="value">{formatDate(orderData.estimatedDelivery)}</span>
              </div>
            </div>
            
            <div className="current-status" style={{ borderLeftColor: getStatusColor(orderData.status) }}>
              <h3>Current Status</h3>
              <p className="status-text">{orderData.currentStatus}</p>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(orderData.status) }}>
                {orderData.status.toUpperCase()}
              </span>
              {getTimeUntilNextStatus(orderData.timeline) && (
                <div className="next-status-countdown">
                  <FaClock /> Next status in: {getTimeUntilNextStatus(orderData.timeline)}
                </div>
              )}
            </div>
          </div>

          <div className="tracking-timeline">
            <h2>Order Timeline</h2>
            <div className="timeline">
              {orderData.timeline.map((step, index) => (
                <div key={index} className={`timeline-item ${step.completed ? 'completed' : 'pending'} ${step.isRealtime ? 'realtime' : ''} ${isCurrentTime(step.actualDateTime) ? 'current-time' : ''}`}>
                  <div className="timeline-icon">
                    <step.icon />
                    {step.isRealtime && <div className="pulse-dot"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>
                        {step.status}
                        {isCurrentTime(step.actualDateTime) && <span className="live-indicator">LIVE</span>}
                      </h4>
                      <span className="timeline-date">
                        {step.isRealtime ? (
                          <span className="realtime-time">
                            {formatDateTime(step.actualDateTime)}
                          </span>
                        ) : (
                          <span>{formatDate(step.date)} at {step.time}</span>
                        )}
                      </span>
                    </div>
                    <p className="timeline-description">{step.description}</p>
                    {step.isRealtime && !step.completed && (
                      <div className="countdown-timer">
                        <FaClock /> Expected in: {getTimeUntilNextStatus([step])}
                      </div>
                    )}
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
              {orderData.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
