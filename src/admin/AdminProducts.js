import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiSave, FiX, FiUpload, FiImage } from 'react-icons/fi';
import './AdminProducts.css';
import productManager from '../utils/productManager';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    description: '',
    color: '',
    model: '',
    material: '',
    dimensions: '',
    weight: '',
    warranty: '',
    sku: '',
    releaseDate: '',
    manufacturer: '',
    origin: '',
    asin: '',
    discount: '',
    rating: '',
    reviews: '',
    image: '',
    additionalImages: [],
    tags: []
  });

  const categories = ['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories'];
  const brands = ['Samsung', 'Apple', 'HP', 'Dell', 'Canon', 'boAt', 'Sony', 'LG', 'Xiaomi', 'OnePlus', 'POCO', 'realme', 'ASUS'];

  useEffect(() => {
    // Load products from the product manager
    const loadProducts = () => {
      const allProducts = productManager.getAllProducts();
      setProducts(allProducts);
    };

    loadProducts();
    
    // Listen for storage changes to update products in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'adminProducts') {
        loadProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every 2 seconds as a fallback
    const interval = setInterval(loadProducts, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let filtered = [...products];
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [];
      
      // Process each file
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result);
          
          // Update form data when all images are processed
          if (newImages.length === files.length) {
            setFormData(prev => {
              const updatedAdditionalImages = [...(prev.additionalImages || []), ...newImages];
              
              // Set the first image as the main product image if no main image exists
              const mainImage = prev.image || (newImages.length > 0 ? newImages[0] : '');
              
              return {
                ...prev,
                image: mainImage,
                additionalImages: updatedAdditionalImages
              };
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newAdditionalImages = prev.additionalImages.filter((_, i) => i !== index);
      
      // If removing the first image and it's the main image, update the main image
      let newMainImage = prev.image;
      if (prev.image === prev.additionalImages[index] && newAdditionalImages.length > 0) {
        newMainImage = newAdditionalImages[0];
      } else if (prev.image === prev.additionalImages[index] && newAdditionalImages.length === 0) {
        newMainImage = '';
      }
      
      return {
        ...prev,
        image: newMainImage,
        additionalImages: newAdditionalImages
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Update existing product
      productManager.updateProduct(editingProduct.id, formData);
    } else {
      // Add new product
      productManager.addProduct(formData);
    }
    
    // Trigger a storage event to update other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminProducts',
      newValue: JSON.stringify(productManager.getAllProducts())
    }));
    
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddForm(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      productManager.deleteProduct(productId);
      
      // Trigger a storage event to update other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'adminProducts',
        newValue: JSON.stringify(productManager.getAllProducts())
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: '',
      brand: '',
      description: '',
      color: '',
      model: '',
      material: '',
      dimensions: '',
      weight: '',
      warranty: '',
      sku: '',
      releaseDate: '',
      manufacturer: '',
      origin: '',
      asin: '',
      discount: '',
      rating: '',
      reviews: '',
      image: '',
      additionalImages: [],
      tags: []
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1>Product Management</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add New Product
        </button>
      </div>

      <div className="products-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Brand *</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="e.g., 35.5 x 25.1 x 1.7 cm"
                  />
                </div>
                
                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.8 kg"
                  />
                </div>
                
                <div className="form-group">
                  <label>Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 Years"
                  />
                </div>
                
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Release Date</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>ASIN</label>
                  <input
                    type="text"
                    name="asin"
                    value={formData.asin}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Reviews Count</label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Product Images</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      id="product-images"
                    />
                    <label htmlFor="product-images" className="upload-label">
                      <FiUpload />
                      <span>Upload Multiple Images</span>
                    </label>
                    {formData.additionalImages && formData.additionalImages.length > 0 && (
                      <div className="image-previews">
                        {formData.additionalImages.map((img, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={img} alt={`Product preview ${index + 1}`} />
                            <button 
                              type="button" 
                              className="remove-image-btn"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FiSave /> {editingProduct ? 'Update' : 'Save'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="product-image-cell">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="no-image">
                        <FiImage />
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="product-name-cell">
                    <div className="name">{product.name}</div>
                    <div className="sku">SKU: {product.sku || 'N/A'}</div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <div className="price-cell">
                    <div className="current-price">₹{product.price?.toLocaleString()}</div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="original-price">₹{product.originalPrice.toLocaleString()}</div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="stock-status in-stock">In Stock</span>
                </td>
                <td>
                  <div className="rating-cell">
                    <span className="rating">⭐ {product.rating || 0}</span>
                    <span className="reviews">({product.reviews || 0})</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(product.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <FiFilter />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
