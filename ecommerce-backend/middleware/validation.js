// ====================================
// middleware/validation.js
// ====================================

const Joi = require('joi');

// Product validation schemas
const productQuerySchema = Joi.object({
  category: Joi.string().valid('all', 'clothing', 'accessories', 'footwear').default('all'),
  sortBy: Joi.string().valid('featured', 'price-low', 'price-high', 'rating').default('featured'),
  search: Joi.string().allow('').default(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20)
});

// Cart item validation
const cartItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).max(99).required()
});

const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(99).required()
});

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace the original data with validated data
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

module.exports = {
  validate,
  productQuerySchema,
  cartItemSchema,
  updateCartSchema
};