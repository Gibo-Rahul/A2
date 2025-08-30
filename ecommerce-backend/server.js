// ====================================
// E-COMMERCE BACKEND SERVER
// ====================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { sessionMiddleware } = require('./middleware/sessionMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ====================================
// SECURITY MIDDLEWARE
// ====================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management middleware
app.use(sessionMiddleware);

// ====================================
// ROUTES
// ====================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'E-commerce Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to The Souled Store API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      health: '/api/health'
    }
  });
});

// ====================================
// ERROR HANDLING MIDDLEWARE
// ====================================

app.use(notFound);
app.use(errorHandler);

// ====================================
// SERVER STARTUP
// ====================================

app.listen(PORT, () => {
  console.log(`
🚀 E-commerce Backend Server Running!
🌐 Server: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/api/health
🛍️ API Base: http://localhost:${PORT}/api
📝 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});