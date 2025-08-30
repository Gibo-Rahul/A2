// ====================================
// FRONTEND API SERVICE
// ====================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get or generate session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('ecommerce_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ecommerce_session_id', sessionId);
  }
  return sessionId;
};

// API call wrapper with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const sessionId = getSessionId();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Update session ID if server provides new one
    const newSessionId = response.headers.get('X-Session-ID');
    if (newSessionId && newSessionId !== sessionId) {
      localStorage.setItem('ecommerce_session_id', newSessionId);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// ====================================
// PRODUCTS API
// ====================================

export const productsAPI = {
  // Get all products with filtering
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/products?${queryParams}` : '/products';
    return apiCall(endpoint);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiCall('/products/featured');
  },

  // Get single product by ID
  getProduct: async (id) => {
    return apiCall(`/products/${id}`);
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/products/search/${query}?${queryParams}` : `/products/search/${query}`;
    return apiCall(endpoint);
  },

  // Get categories
  getCategories: async () => {
    return apiCall('/products/categories');
  }
};

// ====================================
// CART API
// ====================================

export const cartAPI = {
  // Get cart items
  getCart: async () => {
    return apiCall('/cart');
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    return apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    return apiCall(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    return apiCall(`/cart/${productId}`, {
      method: 'DELETE'
    });
  },

  // Clear entire cart
  clearCart: async () => {
    return apiCall('/cart', {
      method: 'DELETE'
    });
  }
};

// ====================================
// ORDERS API
// ====================================

export const ordersAPI = {
  // Process checkout
  checkout: async () => {
    return apiCall('/orders/checkout', {
      method: 'POST'
    });
  },

  // Get order history
  getOrders: async () => {
    return apiCall('/orders');
  },

  // Get specific order
  getOrder: async (id) => {
    return apiCall(`/orders/${id}`);
  }
};

// ====================================
// UTILITY FUNCTIONS
// ====================================

export const apiUtils = {
  // Format error message for display
  formatError: (error) => {
    if (error.details && Array.isArray(error.details)) {
      return error.details.map(d => d.message).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  },

  // Check if API is available
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get session ID
  getSessionId
};

// ====================================
// MOCK DATA FALLBACK
// ====================================

// Fallback to mock data if API is not available
export const mockFallback = {
  isUsingMockData: false,
  
  async checkAPIAndFallback(apiCall, mockData) {
    try {
      const isHealthy = await apiUtils.healthCheck();
      if (!isHealthy) {
        console.warn('API not available, using mock data');
        this.isUsingMockData = true;
        return { status: 'success', data: mockData };
      }
      return await apiCall();
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error.message);
      this.isUsingMockData = true;
      return { status: 'success', data: mockData };
    }
  }
};