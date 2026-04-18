import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaTruck, FaHome, FaShoppingCart } from 'react-icons/fa';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the order details using an order ID from the URL or location state
    // For now, we'll use the order data from location state or localStorage
    const orderFromState = location.state?.order;
    
    if (orderFromState) {
      setOrder(orderFromState);
      setLoading(false);
    } else {
      // Fallback to localStorage if page is refreshed
      const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
      if (savedOrders.length > 0) {
        setOrder(savedOrders[savedOrders.length - 1]); // Get the most recent order
      }
      setLoading(false);
    }
  }, [location.state]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order details. Please check your order history or contact support.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate functions for order summary
  const calculateShipping = () => {
    return order.items && order.items.length > 0 ? 7.00 : 0.00;
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return subtotal * 0.18; // 18% GST
  };

  const calculateSubtotal = () => {
    if (!order.items) return '0.00';
    return order.items.reduce((total, item) => 
      total + (item.price * (item.quantity || 1)), 0).toFixed(2);
  };

  const calculateTotalWithTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const shipping = calculateShipping();
    const tax = calculateTax();
    return (subtotal + shipping + tax).toFixed(2);
  };

  return (
    <div className="order-confirmation">
      <div className="confirmation-header">
        <div className="success-message">
          <FaCheckCircle className="success-icon" />
          <h1>Thank you for your order!</h1>
        </div>
        <p className="order-number">Order #{order.id}</p>
        <p className="confirmation-message">
          We've received your order and it's being processed. You'll receive a confirmation email shortly.
        </p>
      </div>

      <div className="order-details">
        <div className="order-summary">
          <h2><FaShoppingBag /> Order Summary</h2>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  {/* <img 
                    src={item.image} 
                    alt={item.name} 
                    className="product-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  /> */}
                  <img src={item.image} alt={item.name} />
                  {/* <span className="quantity">{item.quantity}</span> */}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">₹{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                  {item.color && (
                    <p className="item-color">Color: <span className="color-name">{item.color}</span></p>
                  )}
                  {item.originalImage && (
                    <div className="original-image-preview">
                      <p className="original-text">Original:</p>
                      <img 
                        src={item.originalImage} 
                        alt={`Original ${item.name}`} 
                        className="original-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = item.image || '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>{order.items ? order.items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0} item{order.items && order.items.reduce((acc, item) => acc + (item.quantity || 1), 0) !== 1 ? 's' : ''}</span>
              <span>₹{order.subtotal || calculateSubtotal()}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>₹{order.shipping || calculateShipping().toFixed(2)}</span>
            </div>
            {/* <div className="total-row">
              <span>Total (tax excl.)</span>
              <span>₹{(parseFloat(order.subtotal || calculateSubtotal()) + parseFloat(order.shipping || calculateShipping())).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Total (tax incl.)</span>
              <span>₹{order.total || calculateTotalWithTax()}</span>
            </div> */}
            <div className="total-row tax-row">
              <span>Taxes</span>
              <span>₹{order.tax || calculateTax().toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total</span>
              <span>₹{order.total || calculateTotalWithTax()}</span>
            </div>
          </div>
        </div>

        <div className="order-info">
          <div className="info-card">
            <h3><FaMapMarkerAlt /> Shipping Address</h3>
            <p>{order.shippingAddress}</p>
          </div>
          
          <div className="info-card">
            <h3><FaCreditCard /> Payment Method</h3>
            <p>
              {order.paymentMethod === 'credit-card' ? 'Credit Card' : 
               order.paymentMethod === 'paypal' ? 'PayPal' : 
               'Cash on Delivery'}
            </p>
            {order.paymentMethod === 'credit-card' && (
              <p className="card-info">
                **** **** **** {order.cardNumber ? order.cardNumber.slice(-4) : '****'}
              </p>
            )}
          </div>
          
          <div className="info-card">
            <h3><FaTruck /> Delivery Status</h3>
            <div className="status-timeline">
              <div className="status-step active">
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Order Placed</p>
                  <small>{formatDate(order.date)}</small>
                </div>
              </div>
              <div className="status-step">
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Processing</p>
                  <small>Estimated: {formatDate(new Date().toISOString())}</small>
                </div>
              </div>
              <div className="status-step">
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Shipped</p>
                  <small>Not yet shipped</small>
                </div>
              </div>
              <div className="status-step">
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Delivered</p>
                  <small>Estimated: {formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString())}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button onClick={handleContinueShopping} className="btn-primary">
          <FaShoppingCart /> Continue Shopping
        </button>
        <button onClick={() => navigate('/')} className="btn-secondary">
          <FaHome /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
