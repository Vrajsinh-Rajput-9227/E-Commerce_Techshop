// In Home.js
import React, { useState, useEffect } from 'react';
import Carousel from '../component/Carousel';
import ProductList from '../component/ProductList';
import CategorySection from '../component/CategorySection';
import RandomBanner from '../component/RandomBanner';
import Newsletter from '../component/Newsletter'; // Add this import
import Testimonials from '../component/Testimonials';
import './Home.css';
import productManager from '../utils/productManager';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Get products from product manager
    const allProducts = productManager.getAllProducts();
    setProducts(allProducts);
  }, []);

  return (
    <div className="home">
      <Carousel />
      
      <div className="container">
        <CategorySection 
          title="Top Laptops" 
          products={products} 
          category="Laptops" 
        />
        
        <RandomBanner />
        
        <CategorySection 
          title="Latest Smartphones" 
          products={products} 
          category="Smartphones" 
        />
        
        <RandomBanner />
        
        <ProductList />

        <Testimonials />

        {/* Add the Newsletter component here */}
        <Newsletter />
      </div>
    </div>
  );
}

export default Home;