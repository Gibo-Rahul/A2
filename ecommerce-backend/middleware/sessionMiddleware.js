// ====================================
// middleware/sessionMiddleware.js
// ====================================

const { v4: uuidv4 } = require('uuid');

const sessionMiddleware = (req, res, next) => {
  // Get session ID from header or generate new one
  let sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    sessionId = uuidv4();
    // Send the session ID back to client
    res.setHeader('X-Session-ID', sessionId);
  }
  
  // Attach session ID to request
  req.sessionId = sessionId;
  
  next();
};

module.exports = { sessionMiddleware };
