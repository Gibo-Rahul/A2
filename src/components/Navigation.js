import React from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

const Navigation = ({ 
  currentPage, 
  setCurrentPage, 
  showMobileMenu, 
  setShowMobileMenu, 
  getTotalItems, 
  setShowCart 
}) => (
  <nav className="navbar">
    <div className="nav-container">
      <div className="nav-brand" onClick={() => setCurrentPage('home')}>
        THE SOULED STORE
      </div>
      
      <div className={`nav-menu ${showMobileMenu ? 'active' : ''}`}>
        <div 
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => {
            setCurrentPage('home');
            setShowMobileMenu(false);
          }}
        >
          HOME
        </div>
        <div 
          className={`nav-item ${currentPage === 'products' ? 'active' : ''}`}
          onClick={() => {
            setCurrentPage('products');
            setShowMobileMenu(false);
          }}
        >
          PRODUCTS
        </div>
      </div>

      <div className="nav-actions">
        <div className="cart-btn" onClick={() => setShowCart(true)}>
          <ShoppingCart size={20} />
          {getTotalItems() > 0 && (
            <span className="cart-badge">{getTotalItems()}</span>
          )}
        </div>
        <div className="user-btn">
          <User size={20} />
        </div>
        <div 
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>
    </div>
  </nav>
);

export default Navigation;