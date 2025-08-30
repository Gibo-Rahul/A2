import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';

const ProductDetailPage = ({ selectedProduct, setCurrentPage, addToCart }) => {
  if (!selectedProduct) return null;

  return (
    <div className="container">
      <button 
        className="back-btn"
        onClick={() => setCurrentPage('products')}
      >
        ← Back to Products
      </button>
      
      <div className="product-detail">
        <div className="product-detail-image">
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name}
            className="detail-image"
          />
        </div>
        
        <div className="product-detail-info">
          <h1 className="detail-title">{selectedProduct.name}</h1>
          
          <div className="rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.floor(selectedProduct.rating) ? 'star-filled' : 'star-empty'}
                fill={i < Math.floor(selectedProduct.rating) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="rating-text">({selectedProduct.rating}) Rating</span>
          </div>

          <div className="price-section-detail">
            <span className="current-price-detail">₹{selectedProduct.price}</span>
            {selectedProduct.originalPrice > selectedProduct.price && (
              <span className="original-price-detail">₹{selectedProduct.originalPrice}</span>
            )}
          </div>

          <p className="product-description-detail">{selectedProduct.description}</p>

          <div className="product-options">
            <div className="option-group">
              <label>Size:</label>
              <div className="size-options">
                {selectedProduct.sizes?.map(size => (
                  <button key={size} className="size-btn">{size}</button>
                ))}
              </div>
            </div>
            
            <div className="option-group">
              <label>Color:</label>
              <div className="color-options">
                {selectedProduct.colors?.map(color => (
                  <button key={color} className="color-btn" title={color}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="stock-status">
            <span className={`stock-badge-detail ${selectedProduct.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {selectedProduct.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>

          <button
            className={`add-to-cart-btn-detail ${!selectedProduct.inStock ? 'disabled' : ''}`}
            disabled={!selectedProduct.inStock}
            onClick={() => addToCart(selectedProduct)}
          >
            <ShoppingCart size={20} />
            <span>{selectedProduct.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;