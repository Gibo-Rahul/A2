// ====================================
// ORDERS API ROUTES
// ====================================

const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// Helper function to get or create user
const getOrCreateUser = async (sessionId) => {
  try {
    let { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('session_id', sessionId)
      .single();
    
    if (error && error.code === 'PGRST116') {
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
// POST /api/orders/checkout - Process checkout
// ====================================
router.post('/checkout', async (req, res) => {
  try {
    const userId = await getOrCreateUser(req.sessionId);
    
    // Get current cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          in_stock
        )
      `)
      .eq('user_id', userId);
    
    if (cartError) {
      throw cartError;
    }
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cart is empty'
      });
    }
    
    // Check if all items are still in stock
    const outOfStockItems = cartItems.filter(item => !item.products.in_stock);
    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Some items in your cart are out of stock',
        data: {
          outOfStockItems: outOfStockItems.map(item => ({
            id: item.products.id,
            name: item.products.name
          }))
        }
      });
    }
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.18;
    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount;
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        session_id: req.sessionId,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        status: 'completed'
      })
      .select()
      .single();
    
    if (orderError) {
      throw orderError;
    }
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.products.id,
      product_name: item.products.name,
      product_price: item.products.price,
      quantity: item.quantity
    }));
    
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (orderItemsError) {
      throw orderItemsError;
    }
    
    // Clear cart after successful order
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (clearCartError) {
      console.error('Warning: Failed to clear cart after order:', clearCartError);
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully!',
      data: {
        order: {
          id: order.id,
          orderNumber: `TSS-${order.id.toString().padStart(6, '0')}`,
          subtotal,
          taxAmount,
          total,
          status: order.status,
          createdAt: order.created_at,
          items: cartItems.map(item => ({
            name: item.products.name,
            price: item.products.price,
            quantity: item.quantity,
            total: item.products.price * item.quantity
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process checkout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// GET /api/orders - Get user's order history
// ====================================
router.get('/', async (req, res) => {
  try {
    const userId = await getOrCreateUser(req.sessionId);
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_price,
          quantity
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: `TSS-${order.id.toString().padStart(6, '0')}`,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      total: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items.map(item => ({
        name: item.product_name,
        price: item.product_price,
        quantity: item.quantity,
        total: item.product_price * item.quantity
      })),
      itemCount: order.order_items.reduce((sum, item) => sum + item.quantity, 0)
    }));
    
    res.json({
      status: 'success',
      data: {
        orders: formattedOrders
      }
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// GET /api/orders/:id - Get specific order details
// ====================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await getOrCreateUser(req.sessionId);
    
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order ID'
      });
    }
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_price,
          quantity
        )
      `)
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }
      throw error;
    }
    
    const formattedOrder = {
      id: order.id,
      orderNumber: `TSS-${order.id.toString().padStart(6, '0')}`,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      total: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items.map(item => ({
        name: item.product_name,
        price: item.product_price,
        quantity: item.quantity,
        total: item.product_price * item.quantity
      })),
      itemCount: order.order_items.reduce((sum, item) => sum + item.quantity, 0)
    };
    
    res.json({
      status: 'success',
      data: {
        order: formattedOrder
      }
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;