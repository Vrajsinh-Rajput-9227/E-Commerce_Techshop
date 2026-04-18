import Product1 from '../assets/e_products/samsung_book4.webp';
import Product2 from '../assets/e_products/samsung_s25_ultra_5g.webp';
import Product3 from '../assets/e_products/p_3.jpeg';
import Product4 from '../assets/e_products/boAt Stone Bluetooth Speaker.jpg';
import Product5 from '../assets/e_products/smartwatch.webp';
import Product6 from '../assets/e_products/canon camera.webp';
import Product7 from '../assets/e_products/boat 425 bluetooth.webp';
import Product8 from '../assets/e_products/product8.jpg';
import Product9 from '../assets/e_products/product9.jpg';
import Product10 from '../assets/e_products/product10.jpg';
import Product11 from '../assets/e_products/product11.jpg';
import Product12 from '../assets/e_products/product12.jpg';
import Product13 from '../assets/e_products/product13.jpg';
import Product14 from '../assets/e_products/product14.jpg';
import Product15 from '../assets/e_products/product15.jpg';

// Import additional product images
import Product1_1 from '../assets/e_products/product1_1.jpg';
import Product1_2 from '../assets/e_products/product1_2.jpg';
import Product1_3 from '../assets/e_products/product1_3.jpg';
import Product1_4 from '../assets/e_products/product1_4.jpg';

import Product2_1 from '../assets/e_products/samsung_s25_ultra_5g_img2.jpg';
import Product2_2 from '../assets/e_products/samsung_s25_ultra_5g_img3.jpg';
import Product2_3 from '../assets/e_products/samsung_s25_ultra_5g_img4.jpg';
import Product2_4 from '../assets/e_products/samsung_s25_ultra_5g_img5.jpg';

// Default sample products
const defaultProducts = [
  {
    id: 1,
    name: 'Samsung Galaxy Book 4 Ultra 16GB 1TB SSD Windows 11 Home 6GB Graphics Laptop',
    price: 90000,
    originalPrice: 117000,
    discount: 23,
    rating: 4.5,
    reviews: 128,
    image: Product1,
    tags: ['NEW', 'HOT'],
    description: 'Powerful premium laptop with Intel Core Ultra processor, dedicated graphics, and high-speed SSD.',
    additionalImages: [Product1_1, Product1_2, Product1_3, Product1_4],
    color: ['Mystic Black','red'],
    category: 'Laptops',
    brand: 'Samsung',
    model: 'Galaxy Book 4 Ultra',
    material: 'Aluminum',
    dimensions: '35.5 x 25.1 x 1.7 cm',
    weight: '1.8 kg',
    warranty: '2 Years',
    sku: 'SAM-BOOK4-ULTRA',
    releaseDate: '2023-11-15',
    manufacturer: 'Samsung Electronics',
    origin: 'South Korea',
    asin: 'B0C1234567'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S25 Ultra 5G',
    price: 165000,
    originalPrice: 215000,
    discount: 23,
    rating: 4.8,
    reviews: 256,
    image: Product2,
    tags: ['NEW', 'HOT'],
    description: 'Flagship 5G smartphone with advanced camera system, AMOLED display, and long-lasting battery.',
    additionalImages: [Product2_1, Product2_2, Product2_3, Product2_4],
    color: ['Mystic Black','red'],
    category: 'Smartphones',
    brand: 'Samsung',
    model: 'Galaxy S25 Ultra',
    material: 'Gorilla Glass & Aluminum',
    dimensions: '16.3 x 7.8 x 0.8 cm',
    weight: '228 g',
    warranty: '1 Year',
    sku: 'SAM-S25-ULTRA',
    releaseDate: '2024-01-20',
    manufacturer: 'Samsung Electronics',
    origin: 'South Korea',
    asin: 'B0D1234567'
  }
];

class ProductManager {
  constructor() {
    this.storageKey = 'adminProducts';
    this.initializeProducts();
  }

  initializeProducts() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      // Initialize with default products if no products exist
      localStorage.setItem(this.storageKey, JSON.stringify(defaultProducts));
    }
  }

  getAllProducts() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : defaultProducts;
  }

  getProductById(id) {
    const products = this.getAllProducts();
    return products.find(product => product.id === parseInt(id));
  }

  addProduct(product) {
    const products = this.getAllProducts();
    const newProduct = {
      ...product,
      id: Date.now(),
      reviews: parseInt(product.reviews) || 0,
      rating: parseFloat(product.rating) || 0,
      discount: parseInt(product.discount) || 0,
      tags: product.tags || ['NEW']
    };
    products.push(newProduct);
    localStorage.setItem(this.storageKey, JSON.stringify(products));
    return newProduct;
  }

  updateProduct(id, updatedProduct) {
    const products = this.getAllProducts();
    const index = products.findIndex(product => product.id === parseInt(id));
    if (index !== -1) {
      products[index] = { ...updatedProduct, id: parseInt(id) };
      localStorage.setItem(this.storageKey, JSON.stringify(products));
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const products = this.getAllProducts();
    const filteredProducts = products.filter(product => product.id !== parseInt(id));
    localStorage.setItem(this.storageKey, JSON.stringify(filteredProducts));
    return filteredProducts;
  }

  getProductsByCategory(category) {
    const products = this.getAllProducts();
    return category === 'all' ? products : products.filter(product => product.category === category);
  }

  getTrendingProducts(count = 4) {
    const products = this.getAllProducts();
    return [...products]
      .sort((a, b) => {
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;
        return b.reviews - a.reviews;
      })
      .slice(0, count);
  }

  searchProducts(query) {
    const products = this.getAllProducts();
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  getFilteredProducts(filters = {}) {
    let products = this.getAllProducts();

    if (filters.category && filters.category !== 'all') {
      products = products.filter(product => product.category === filters.category);
    }

    if (filters.brand && filters.brand !== 'all') {
      products = products.filter(product => product.brand === filters.brand);
    }

    if (filters.minPrice) {
      products = products.filter(product => product.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      products = products.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    if (filters.rating) {
      products = products.filter(product => product.rating >= parseFloat(filters.rating));
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    return products;
  }
}

// Create singleton instance
const productManager = new ProductManager();

export default productManager;
