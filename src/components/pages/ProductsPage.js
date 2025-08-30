import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../ProductCard';
import { categories } from '../../data/products';

const ProductsPage = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  sortedProducts,
  setSelectedProduct,
  setCurrentPage,
  addToCart
}) => (
  <div className="container">
    <div className="products-header">
      <h2 className="page-title">ALL PRODUCTS</h2>
      
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Search size={16} className="search-icon" />
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.name}</option>
          ))}
        </select>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>

    <div className="products-grid">
      {sortedProducts.map(product => (
        <ProductCard 
          key={product.id} 
          product={product}
          setSelectedProduct={setSelectedProduct}
          setCurrentPage={setCurrentPage}
          addToCart={addToCart}
        />
      ))}
    </div>

    {sortedProducts.length === 0 && (
      <div className="no-products">
        <h4>No products found</h4>
        <p>Try adjusting your filters or search terms</p>
      </div>
    )}
  </div>
);

export default ProductsPage;