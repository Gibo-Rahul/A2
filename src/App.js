import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import CartModal from './components/CartModal';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import { mockProducts } from './data/products';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter and sort products
  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return b.featured - a.featured;
    }
  });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentCarouselIndex={currentCarouselIndex}
            setCurrentCarouselIndex={setCurrentCarouselIndex}
            setCurrentPage={setCurrentPage}
            setSelectedProduct={setSelectedProduct}
            addToCart={addToCart}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case 'products':
        return (
          <ProductsPage
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortedProducts={sortedProducts}
            setSelectedProduct={setSelectedProduct}
            setCurrentPage={setCurrentPage}
            addToCart={addToCart}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailPage
            selectedProduct={selectedProduct}
            setCurrentPage={setCurrentPage}
            addToCart={addToCart}
          />
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        getTotalItems={getTotalItems}
        setShowCart={setShowCart}
      />

      <main className="main-content">
        {renderCurrentPage()}
      </main>

      <CartModal
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        setCurrentPage={setCurrentPage}
      />

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>THE STOLED STORE</h4>
              <p>Express your passion for gaming and technology with our unique collection of apparel and accessories.</p>
            </div>
            <div className="footer-section">
              <h5>Quick Links</h5>
              <ul>
                <li><a href="#" onClick={() => setCurrentPage('home')}>Home</a></li>
                <li><a href="#" onClick={() => setCurrentPage('products')}>Products</a></li>
                <li><a href="#" onClick={() => setShowCart(true)}>Cart</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h5>Categories</h5>
              <ul>
                <li><a href="#" onClick={() => { setSelectedCategory('clothing'); setCurrentPage('products'); }}>Clothing</a></li>
                <li><a href="#" onClick={() => { setSelectedCategory('accessories'); setCurrentPage('products'); }}>Accessories</a></li>
                <li><a href="#" onClick={() => { setSelectedCategory('footwear'); setCurrentPage('products'); }}>Footwear</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h5>Connect</h5>
              <ul>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 The Stoled Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;