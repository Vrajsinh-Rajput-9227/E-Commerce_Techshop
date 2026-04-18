import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const addToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success feedback
    const button = document.getElementById(`product-card-add-to-cart-${product.id}`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<FaShoppingCart /> Added!';
      button.style.backgroundColor = '#52c41a';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    }
  };
  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.id}`} state={{ product }}>
          <img 
            src={product.image || (product.images && product.images[0])} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        </Link>
      </div>
      <div className="product-details">
        <h3 className="product-title">
          <Link to={`/product/${product.id}`} state={{ product }}>{product.name}</Link>
        </h3>
        <div className="product-price">
          ₹{product.price?.toLocaleString('en-IN') || 'N/A'}
          {product.originalPrice && (
            <span className="original-price">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`star ${i < Math.floor(product.rating || 0) ? 'filled' : ''}`}
            >
              ★
            </span>
          ))}
          <span className="rating-count">({product.reviews || 0})</span>
        </div>
        <button 
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
          id={`product-card-add-to-cart-${product.id}`}
        >
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
