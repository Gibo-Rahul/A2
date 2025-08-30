import React from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const CartModal = ({ 
  showCart, 
  setShowCart, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  getTotalPrice, 
  setCurrentPage 
}) => {
  if (!showCart) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowCart(false)}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>YOUR CART</h3>
          <button className="close-btn" onClick={() => setShowCart(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} />
              <h5>Your cart is empty</h5>
              <p>Add some products to get started!</p>
              <button 
                className="continue-shopping-btn"
                onClick={() => {
                  setShowCart(false);
                  setCurrentPage('products');
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <h6>{item.name}</h6>
                      <div className="cart-item-price">₹{item.price}</div>
                    </div>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (18%):</span>
                  <span>₹{Math.round(getTotalPrice() * 0.18)}</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row total">
                  <strong>Total:</strong>
                  <strong>₹{getTotalPrice() + Math.round(getTotalPrice() * 0.18)}</strong>
                </div>
                <button className="checkout-btn">
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;