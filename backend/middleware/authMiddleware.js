const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if the header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
    }

    const token = authHeader.substring(7, authHeader.length); // Extract token
    if (!token) {
         return res.status(401).json({ message: 'No token found after Bearer, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = decoded.user; // Add user payload to request object
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
