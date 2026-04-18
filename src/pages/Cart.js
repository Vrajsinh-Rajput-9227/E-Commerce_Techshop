// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  }, []);

  const updateCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    updateCart(updatedCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 7.00 : 0.00;
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateTotal());
    return subtotal * 0.18; // 18% GST
  };

  const calculateTotalWithTax = () => {
    const subtotal = parseFloat(calculateTotal());
    const shipping = calculateShipping();
    const tax = calculateTax();
    return (subtotal + shipping + tax).toFixed(2);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/payment', message: 'Please login to proceed with checkout' } });
    } else {
      navigate('/payment');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <Link to="/" className="continue-shopping">
          <FaArrowLeft /> Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart size={64} className="empty-cart-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price.toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-item"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} item{cartItems.reduce((acc, item) => acc + item.quantity, 0) !== 1 ? 's' : ''}</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{calculateShipping().toFixed(2)}</span>
            </div>
            {/* <div className="summary-row">
              <span>Total (tax excl.)</span>
              <span>₹{(parseFloat(calculateTotal()) + calculateShipping()).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Total (tax incl.)</span>
              <span>₹{calculateTotalWithTax()}</span>
            </div> */}
            <div className="summary-row tax-row">
              <span>Taxes</span>
              <span>₹{calculateTax().toFixed(2)}</span>
            </div>
            <div className="summary-row total grand-total">
              <span>Grand Total</span>
              <span>₹{calculateTotalWithTax()}</span>
            </div>
            <button onClick={handleCheckout} className="checkout-btn">
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;