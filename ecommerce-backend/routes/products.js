// ====================================
// PRODUCTS API ROUTES
// ====================================

const express = require('express');
const { supabase } = require('../config/database');
const { validate, productQuerySchema } = require('../middleware/validation');

const router = express.Router();

// ====================================
// GET /api/products - Get all products with filtering
// ====================================
router.get('/', validate(productQuerySchema, 'query'), async (req, res) => {
  try {
    const { category, sortBy, search, page, limit } = req.query;
    
    // Build query
    let query = supabase.from('products').select('*');
    
    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Apply search filter
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default: // featured
        query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data: products, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Get total count for pagination info
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq(category !== 'all' ? 'category' : 'id', category !== 'all' ? category : undefined);
    
    res.json({
      status: 'success',
      data: {
        products: products || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// GET /api/products/featured - Get featured products
// ====================================
router.get('/featured', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (error) {
      throw error;
    }
    
    res.json({
      status: 'success',
      data: {
        products: products || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// GET /api/products/categories - Get all categories
// ====================================
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      throw error;
    }
    
    // Extract unique categories
    const uniqueCategories = [...new Set(categories.map(item => item.category))];
    
    const categoryList = [
      { name: 'All', value: 'all' },
      ...uniqueCategories.map(cat => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: cat
      }))
    ];
    
    res.json({
      status: 'success',
      data: {
        categories: categoryList
      }
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// GET /api/products/:id - Get single product by ID
// ====================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      throw error;
    }
    
    res.json({
      status: 'success',
      data: {
        product
      }
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// GET /api/products/search/:query - Search products
// ====================================
router.get('/search/:query', async (req, res) => {
  try {
    const { query: searchQuery } = req.params;
    const { category = 'all', sortBy = 'featured' } = req.query;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    let query = supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    
    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('featured', { ascending: false });
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({
      status: 'success',
      data: {
        products: products || [],
        searchQuery,
        totalResults: products ? products.length : 0
      }
    });
    
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;