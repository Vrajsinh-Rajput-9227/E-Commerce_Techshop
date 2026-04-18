import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaHeart, FaArrowLeft, FaInfoCircle, FaBoxOpen, FaUser } from 'react-icons/fa';
import RelatedProducts from '../component/RelatedProducts';
import productManager from '../utils/productManager';
import './ProductDetail.css';

// Color mapping function
const getColorHex = (colorName) => {
  const colorMap = {
    'black': '#000000',
    'white': '#ffffff',
    'off white': '#f8f8f8',
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'brown': '#964b00',
    'gray': '#808080',
    'grey': '#808080',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
    'navy': '#000080',
    'teal': '#008080',
    'maroon': '#800000',
    'lime': '#00ff00',
    'aqua': '#00ffff',
    'fuchsia': '#ff00ff',
    'olive': '#808000',
    'mystic': '#1a1a1a',
    'mystic black': '#1a1a1a',
    'phantom black': '#0f0f0f',
    'bold black': '#000000',
    'awesome iceblue': '#87ceeb',
    'cool blue': '#4682b4',
    'onyx black': '#0d0d0d',
    'black infinity': '#000000',
    'mica silver': '#c0c0c0',
    'graphite black': '#2f2f2f',
    'carbon black': '#1c1c1c'
  };
  
  const lowerColorName = colorName.toLowerCase();
  return colorMap[lowerColorName] || '#cccccc'; // Default gray if color not found
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('specifications');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(2);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    name: ''
  });
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'John Doe',
      rating: 4.5,
      date: '2023-12-15',
      comment: 'Great product! Very satisfied with my purchase. The quality is excellent and it works perfectly.',
      verified: true
    },
    {
      id: 2,
      user: 'Jane Smith',
      rating: 5,
      date: '2023-12-10',
      comment: 'Excellent quality and fast delivery! Would definitely recommend to others.',
      verified: true
    },
    {
      id: 3,
      user: 'Alex Johnson',
      rating: 4,
      date: '2023-12-05',
      comment: 'Good product, but the color is slightly different than shown in the pictures.',
      verified: false
    }
  ]);

  useEffect(() => {
    // Get all products from product manager
    const allProducts = productManager.getAllProducts();
    
    // Find product using ID from URL
    const productId = parseInt(id);
    const foundProduct = allProducts.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
      setLoading(false);
      
      // Set default color - handle both array and single color
      if (foundProduct.color) {
        const colors = Array.isArray(foundProduct.color) ? foundProduct.color : [foundProduct.color];
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }
      }
      
      // Check if product is in wishlist
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.some(item => item.id === foundProduct.id));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      color: selectedColor || product.color || 'Default'
    };

    // Get existing cart or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already in cart
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      existingCart.push(cartItem);
    }

    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // const handleBuyNow = () => {
  const handleBuyNow = async () => {
  try {
    // First add to cart
    handleAddToCart();
    
    // Then navigate to payment page
    navigate('/payment');
  } catch (error) {
    console.error('Error in Buy Now:', error);
    // Show error message to user
    alert('Failed to proceed to payment. Please try again.');
  }
};

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    return stars;
  };

  const handleWriteReview = () => {
    setShowReviewForm(true);
  };

  const handleLoadMore = () => {
    setVisibleReviews(prev => Math.min(prev + 2, reviews.length));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const review = {
      id: reviews.length + 1,
      user: newReview.name || 'Anonymous',
      rating: Number(newReview.rating),
      date: new Date().toISOString().split('T')[0],
      comment: newReview.comment,
      verified: false
    };
    
    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, comment: '', name: '' });
    setShowReviewForm(false);
    setVisibleReviews(1); // Show the newly added review
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
    } else {
      // Add to wishlist
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        discount: product.discount || 0
      };
      
      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
    }
    
    // Dispatch event to update wishlist count in header
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <div>Product not found</div>
        <button onClick={() => navigate('/')} className="back-button">
          <FaArrowLeft /> Back to Home
        </button>
      </div>
    );
  }

  const allImages = product.additionalImages && product.additionalImages.length > 0 
    ? [product.image, ...product.additionalImages.filter(img => img !== product.image)]
    : [product.image];
  const toggleShowAllImages = () => {
    setShowAllImages(!showAllImages);
  };
  const displayedImages = showAllImages ? allImages : allImages.slice(0, 4);

  // Sample specifications data
  const specifications = {
    'Product Information': [
      { name: 'Brand', value: product.brand || 'Generic' },
      { name: 'Model', value: product.model || 'N/A' },
      { name: 'Color', value: selectedColor || product.color || 'As shown in picture' },
      { name: 'Material', value: product.material || 'High-quality materials' },
      { name: 'Dimensions', value: product.dimensions || 'N/A' },
      { name: 'Weight', value: product.weight || 'N/A' },
    ],
    'Additional Details': [
      { name: 'Warranty', value: product.warranty || '1 Year Manufacturer Warranty' },
      { name: 'SKU', value: product.sku || 'N/A' },
      { name: 'Release Date', value: product.releaseDate || 'N/A' },
      { name: 'Manufacturer', value: product.manufacturer || 'Generic' },
      { name: 'Country of Origin', value: product.origin || 'Varies' },
      { name: 'ASIN', value: product.asin || 'N/A' },
    ]
  };

  return (
    <>
    {showSuccess && (
  <div className="success-popup-container">
    <div className="success-popup-content">
      <div className="success-icon">✓</div>
      <div className="success-text-wrapper">
        <p className="success-title">Added to Cart!</p>
        <p className="success-subtitle">{product.name} is now in your basket.</p>
      </div>
    </div>
  </div>
    )}

    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="thumbnail-container">
            {displayedImages.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
            {allImages.length > 4 && (
              <button 
                className="view-more-btn"
                onClick={toggleShowAllImages}
                aria-label={showAllImages ? 'Show less images' : `Show ${allImages.length - 4} more images`}
              >
                {showAllImages ? '▲ Show Less' : `+${allImages.length - 4} More`}
              </button>
            )}
          </div>
          <div className="main-image">
            <img src={allImages[selectedImage]} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.rating)}
              <span className="rating-text">{product.rating.toFixed(1)}</span>
            </div>
            <span className="reviews">({reviews.length} reviews)</span>
            <span className="stock-status">In Stock</span>
          </div>

          <div className="price-container">
            <span className="current-price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
            )}
            {/* {product.discount > 0 && (
              <span className="discount-badge">-{product.discount}%</span>
            )} */}
          </div>

          <p className="product-description">
            {product.description || 'No description available for this product.'}
          </p>

          {/* Color Selection */}
          {product.color && (
            <div className="color-selector">
              <label>Color:</label>
              <div className="color-options">
                {Array.isArray(product.color) ? (
                  product.color.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      aria-label={`Select ${color} color`}
                    >
                      <span 
                        className="color-swatch" 
                        style={{ 
                          backgroundColor: getColorHex(color),
                          border: getColorHex(color) === '#ffffff' || getColorHex(color) === '#f0f0f0' ? '1px solid #ddd' : 'none'
                        }}
                      />
                      <span className="color-name">{color}</span>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    className="color-option selected"
                    disabled
                  >
                    <span 
                      className="color-swatch" 
                      style={{ 
                        backgroundColor: getColorHex(product.color),
                        border: getColorHex(product.color) === '#ffffff' || getColorHex(product.color) === '#f0f0f0' ? '1px solid #ddd' : 'none'
                      }}
                    />
                    <span className="color-name">{product.color}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button type="button" onClick={decrementQuantity} aria-label="Decrease quantity">-</button>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={handleQuantityChange}
                aria-label="Quantity"
              />
              <button type="button" onClick={incrementQuantity} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button type="button" className="add-to-cart" onClick={handleAddToCart}>
              <FaShoppingCart className="icon" /> Add to Cart
            </button>
            <button type="button" className="buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button 
              type="button" 
              className={`wishlist ${isInWishlist ? 'in-wishlist' : ''}`}
              onClick={toggleWishlist}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FaHeart className="icon" /> {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">Brand:</span>
              <span className="meta-value">{product.brand || 'Generic'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Model:</span>
              <span className="meta-value">{product.model || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Warranty:</span>
              <span className="meta-value">{product.warranty || '1 Year'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="specifications-section">
        <h2 className="section-title">Product Details</h2>
        
        <div className="specs-tabs">
          <button 
            type="button"
            className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            <FaInfoCircle className="tab-icon" /> Specifications
          </button>
          <button 
            type="button"
            className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            <FaBoxOpen className="tab-icon" /> Additional Information
          </button>
        </div>

        <div className="specs-content">
          <table className="specs-table">
            <tbody>
              {activeTab === 'specifications' ? (
                specifications['Product Information'].map((spec, index) => (
                  <tr key={index} className="spec-row">
                    <td className="spec-name">{spec.name}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))
              ) : (
                specifications['Additional Details'].map((spec, index) => (
                  <tr key={index} className="spec-row">
                    <td className="spec-name">{spec.name}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title">Customer Reviews</h2>
        
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-big">{product.rating.toFixed(1)}</span>
            <div className="stars">
              {renderStars(product.rating)}
              <span className="reviews-count">({reviews.length} reviews)</span>
            </div>
          </div>
          
          <button 
            type="button"
            className="write-review-btn"
            onClick={handleWriteReview}
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="review-form-container">
            <h3>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label htmlFor="reviewer-name">Your Name:</label>
                <input
                  id="reviewer-name"
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Rating:</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                      onClick={() => handleRatingChange(star)}
                    >
                      {star <= newReview.rating ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="review-comment">Your Review:</label>
                <textarea
                  id="review-comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Share your experience with this product"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-review-btn">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="reviews-list">
          {reviews.slice(0, visibleReviews).map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="product-user-avatar">
                  <FaUser />
                </div>
                <div className="user-info">
                  <div className="user-name-container">
                    <span className="user-name">{review.user}</span>
                    {review.verified && <span className="verified-badge">Verified Purchase</span>}
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      i < review.rating ? 
                        <FaStar key={i} className="star filled" /> : 
                        <FaRegStar key={i} className="star" />
                    ))}
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
        
        {visibleReviews < reviews.length && (
          <button 
            type="button"
            className="load-more-reviews"
            onClick={handleLoadMore}
          >
            Load More Reviews
          </button>
        )}
      </div>
      
      <RelatedProducts currentProduct={product} />
      
      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <div className="success-content">
            <span>✓</span>
            <p>Product added to cart successfully!</p>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default ProductDetail;