// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) return res.status(401).json({ message: "No token, authorization denied." });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Contains { id, username }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid." });
  }
};

module.exports = auth;