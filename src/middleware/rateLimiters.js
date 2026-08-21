const rateLimit = require('express-rate-limit');


// ==================== FORGOT PASSWORD ====================
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: 'Too many password reset requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== VERIFY RESET CODE ====================
const verifyResetCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, 
  message: { message: 'Too many verification attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== RESET PASSWORD ====================
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});


module.exports = {
  forgotPasswordLimiter,
  verifyResetCodeLimiter,
  resetPasswordLimiter,
  
};