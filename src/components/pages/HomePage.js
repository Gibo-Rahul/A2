import React from 'react';
import HeroCarousel from '../HeroCarousel';
import ProductCard from '../ProductCard';
import { mockProducts } from '../../data/products';

const HomePage = ({ 
  currentCarouselIndex, 
  setCurrentCarouselIndex, 
  setCurrentPage, 
  setSelectedProduct, 
  addToCart, 
  setSelectedCategory 
}) => (
  <div>
    <HeroCarousel 
      currentCarouselIndex={currentCarouselIndex}
      setCurrentCarouselIndex={setCurrentCarouselIndex}
      setCurrentPage={setCurrentPage}
    />
    
    <div className="container">
      <section className="section">
        <h2 className="section-title">FEATURED PRODUCTS</h2>
        <div className="products-grid">
          {mockProducts.filter(p => p.featured).map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              setSelectedProduct={setSelectedProduct}
              setCurrentPage={setCurrentPage}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">SHOP BY CATEGORY</h2>
        <div className="categories-grid">
          <div 
            className="category-card" 
            onClick={() => { 
              setSelectedCategory('clothing'); 
              setCurrentPage('products'); 
            }}
          >
            <div className="category-content">
              <div className="category-icon">👕</div>
              <h4>CLOTHING</h4>
              <p>T-shirts, Hoodies & More</p>
            </div>
          </div>
          <div 
            className="category-card" 
            onClick={() => { 
              setSelectedCategory('accessories'); 
              setCurrentPage('products'); 
            }}
          >
            <div className="category-content">
              <div className="category-icon">🎒</div>
              <h4>ACCESSORIES</h4>
              <p>Mugs, Bags & More</p>
            </div>
          </div>
          <div 
            className="category-card" 
            onClick={() => { 
              setSelectedCategory('footwear'); 
              setCurrentPage('products'); 
            }}
          >
            <div className="category-content">
              <div className="category-icon">👟</div>
              <h4>FOOTWEAR</h4>
              <p>Sneakers & Shoes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default HomePage;