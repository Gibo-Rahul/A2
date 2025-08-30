import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ product, setSelectedProduct, setCurrentPage, addToCart }) => (
  <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
    <div className="product-image-container">
      <img 
        src={product.image} 
        alt={product.name}
        className="product-image"
        onClick={() => {
          setSelectedProduct(product);
          setCurrentPage('product-detail');
        }}
      />
      {product.originalPrice > product.price && (
        <div className="discount-badge">
          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
        </div>
      )}
      {!product.inStock && (
        <div className="stock-badge">OUT OF STOCK</div>
      )}
    </div>
    
    <div className="product-info">
      <h3 className="product-title">{product.name}</h3>
      
      <div className="rating">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
            fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
          />
        ))}
        <span className="rating-text">({product.rating})</span>
      </div>
      
      <div className="price-section">
        <span className="current-price">₹{product.price}</span>
        {product.originalPrice > product.price && (
          <span className="original-price">₹{product.originalPrice}</span>
        )}
      </div>
      
      <button
        className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
        disabled={!product.inStock}
        onClick={() => product.inStock && addToCart(product)}
      >
        <ShoppingCart size={16} />
        <span>{product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}</span>
      </button>
    </div>
  </div>
);

export default ProductCard;