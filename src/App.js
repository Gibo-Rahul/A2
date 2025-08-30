import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import CartModal from './components/CartModal';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import { mockProducts } from './data/products';
import { productsAPI, cartAPI, ordersAPI, mockFallback } from './services/api';
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
  
  // New states for backend integration
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAPIConnected, setIsAPIConnected] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Initialize app - check API connection and load data
  useEffect(() => {
    initializeApp();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, searchTerm]);

  // Load cart on app start
  useEffect(() => {
    loadCart();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Check if API is available
      const apiHealthy = await mockFallback.checkAPIAndFallback(
        () => productsAPI.getFeaturedProducts(),
        { products: mockProducts.filter(p => p.featured) }
      );
      
      setIsAPIConnected(!mockFallback.isUsingMockData);
      
      if (apiHealthy.status === 'success') {
        setFeaturedProducts(apiHealthy.data.products);
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError('Failed to load application data');
      // Fallback to mock data
      setFeaturedProducts(mockProducts.filter(p => p.featured));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        category: selectedCategory,
        sortBy,
        search: searchTerm,
        page: 1,
        limit: 50
      };
      
      const response = await mockFallback.checkAPIAndFallback(
        () => productsAPI.getProducts(params),
        { products: filterAndSortMockProducts() }
      );
      
      if (response.status === 'success') {
        setProducts(response.data.products);
      }
      
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products');
      // Fallback to mock data
      setProducts(filterAndSortMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!isAPIConnected) {
      return; // Keep using frontend cart state for mock data
    }
    
    try {
      const response = await cartAPI.getCart();
      if (response.status === 'success') {
        setCart(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Keep existing cart state
    }
  };

  const filterAndSortMockProducts = () => {
    let filtered = mockProducts.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
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
  };

  const addToCart = async (product) => {
    try {
      if (isAPIConnected) {
        // Use backend API
        const response = await cartAPI.addToCart(product.id, 1);
        if (response.status === 'success') {
          await loadCart(); // Reload cart from backend
          setError(null);
        }
      } else {
        // Use frontend state (mock data mode)
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
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setError('Failed to add item to cart');
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      if (isAPIConnected) {
        // Use backend API
        if (newQuantity <= 0) {
          await cartAPI.removeFromCart(id);
        } else {
          await cartAPI.updateCartItem(id, newQuantity);
        }
        await loadCart(); // Reload cart from backend
      } else {
        // Use frontend state (mock data mode)
        if (newQuantity <= 0) {
          removeFromCart(id);
        } else {
          setCart(prevCart =>
            prevCart.map(item =>
              item.id === id ? { ...item, quantity: newQuantity } : item
            )
          );
        }
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      setError('Failed to update cart item');
    }
  };

  const removeFromCart = async (id) => {
    try {
      if (isAPIConnected) {
        // Use backend API
        await cartAPI.removeFromCart(id);
        await loadCart(); // Reload cart from backend
      } else {
        // Use frontend state (mock data mode)
        setCart(prevCart => prevCart.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setError('Failed to remove item from cart');
    }
  };

  const handleCheckout = async () => {
    try {
      if (isAPIConnected) {
        // Use backend API
        const response = await ordersAPI.checkout();
        if (response.status === 'success') {
          setCart([]); // Clear cart
          setShowCart(false);
          alert(`Order placed successfully! Order number: ${response.data.order.orderNumber}`);
        }
      } else {
        // Mock checkout for demo
        setCart([]);
        setShowCart(false);
        alert('Order placed successfully! (Demo mode - using mock data)');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError('Failed to process checkout');
      alert('Failed to process checkout. Please try again.');
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Use products from API or fallback to filtered mock data
  const sortedProducts = isAPIConnected ? products : filterAndSortMockProducts();
  const displayFeaturedProducts = isAPIConnected ? featuredProducts : mockProducts.filter(p => p.featured);

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
            featuredProducts={displayFeaturedProducts}
            loading={loading}
            error={error}
            isAPIConnected={isAPIConnected}
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
            loading={loading}
            error={error}
            isAPIConnected={isAPIConnected}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailPage
            selectedProduct={selectedProduct}
            setCurrentPage={setCurrentPage}
            addToCart={addToCart}
            isAPIConnected={isAPIConnected}
          />
        );
      default:
        return (
          <HomePage
            currentCarouselIndex={currentCarouselIndex}
            setCurrentCarouselIndex={setCurrentCarouselIndex}
            setCurrentPage={setCurrentPage}
            setSelectedProduct={setSelectedProduct}
            addToCart={addToCart}
            setSelectedCategory={setSelectedCategory}
            featuredProducts={displayFeaturedProducts}
            loading={loading}
            error={error}
            isAPIConnected={isAPIConnected}
          />
        );
    }
  };

  return (
    <div className="App">
      {/* API Status Indicator */}
      {!loading && (
        <div className={`api-status ${isAPIConnected ? 'connected' : 'disconnected'}`}>
          {isAPIConnected ? '🟢 Connected to API' : '🟡 Using Demo Mode'}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

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
        handleCheckout={handleCheckout}
        isAPIConnected={isAPIConnected}
      />

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>THE SOULED STORE</h4>
              <p>Express your passion for gaming and technology with our unique collection of apparel and accessories.</p>
              {!isAPIConnected && (
                <p className="demo-notice">Currently running in demo mode with sample data.</p>
              )}
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
            <p>&copy; 2025 The Souled Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;