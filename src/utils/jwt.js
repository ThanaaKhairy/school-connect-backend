const jwt = require('jsonwebtoken');


const generateToken = (userId, email, name, role) => {
  return jwt.sign(
    { user_id: userId, email, name, role },  
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };