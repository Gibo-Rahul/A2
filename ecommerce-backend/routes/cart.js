// ====================================
// CART API ROUTES
// ====================================

const express = require('express');
const { supabase } = require('../config/database');
const { validate, cartItemSchema, updateCartSchema } = require('../middleware/validation');

const router = express.Router();

// Helper function to get or create user
const getOrCreateUser = async (sessionId) => {
  try {
    // First, try to find existing user with this session
    let { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('session_id', sessionId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create new one
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ session_id: sessionId })
        .select('id')
        .single();
      
      if (createError) {
        throw createError;
      }
      
      user = newUser;
    } else if (error) {
      throw error;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
};

// ====================================
// GET /api/cart - Get user's cart items
// ====================================
router.get('/', async (req, res) => {
  try {
    const userId = await getOrCreateUser(req.sessionId);
    
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          original_price,
          image_url,
          in_stock,
          colors,
          sizes
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Format cart items for frontend
    const formattedCart = cartItems.map(item => ({
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      originalPrice: item.products.original_price,
      image: item.products.image_url,
      inStock: item.products.in_stock,
      colors: item.products.colors,
      sizes: item.products.sizes,
      quantity: item.quantity,
      cartItemId: item.id
    }));
    
    // Calculate totals
    const subtotal = formattedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.18;
    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount;
    
    res.json({
      status: 'success',
      data: {
        items: formattedCart,
        summary: {
          subtotal,
          taxAmount,
          total,
          itemCount: formattedCart.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cart items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// POST /api/cart - Add item to cart
// ====================================
router.post('/', validate(cartItemSchema), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = await getOrCreateUser(req.sessionId);
    
    // First, check if product exists and is in stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, in_stock, price')
      .eq('id', productId)
      .single();
    
    if (productError) {
      if (productError.code === 'PGRST116') {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      throw productError;
    }
    
    if (!product.in_stock) {
      return res.status(400).json({
        status: 'error',
        message: 'Product is out of stock'
      });
    }
    
    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    
    let cartItem;
    
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      cartItem = updatedItem;
    } else {
      // Create new cart item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity
        })
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      cartItem = newItem;
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Item added to cart successfully',
      data: {
        cartItem: {
          id: cartItem.id,
          productId: cartItem.product_id,
          quantity: cartItem.quantity
        }
      }
    });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// PUT /api/cart/:productId - Update cart item quantity
// ====================================
router.put('/:productId', validate(updateCartSchema), async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = await getOrCreateUser(req.sessionId);
    
    if (isNaN(parseInt(productId))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }
    
    if (quantity === 0) {
      // Remove item from cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', parseInt(productId));
      
      if (error) {
        throw error;
      }
      
      return res.json({
        status: 'success',
        message: 'Item removed from cart'
      });
    }
    
    // Update quantity
    const { data: updatedItem, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', parseInt(productId))
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          status: 'error',
          message: 'Cart item not found'
        });
      }
      throw error;
    }
    
    res.json({
      status: 'success',
      message: 'Cart item updated successfully',
      data: {
        cartItem: {
          id: updatedItem.id,
          productId: updatedItem.product_id,
          quantity: updatedItem.quantity
        }
      }
    });
    
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// DELETE /api/cart/:productId - Remove item from cart
// ====================================
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = await getOrCreateUser(req.sessionId);
    
    if (isNaN(parseInt(productId))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', parseInt(productId));
    
    if (error) {
      throw error;
    }
    
    res.json({
      status: 'success',
      message: 'Item removed from cart successfully'
    });
    
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// DELETE /api/cart - Clear entire cart
// ====================================
router.delete('/', async (req, res) => {
  try {
    const userId = await getOrCreateUser(req.sessionId);
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    res.json({
      status: 'success',
      message: 'Cart cleared successfully'
    });
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;