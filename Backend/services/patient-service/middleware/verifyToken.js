// middleware/verifyToken.js
import jwt from 'jsonwebtoken';

// HARDCODE THE SAME SECRET - Must match server.js exactly
const JWT_SECRET = 'mysecretkey123';

export default (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        console.log('🔐 Verifying token...');
        console.log('🔑 Using JWT_SECRET:', JWT_SECRET);
        console.log('🎫 Token:', token ? token.substring(0, 30) + '...' : 'MISSING');

        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided',
                hint: 'Add Authorization: Bearer <token> header'
            });
        }

        // Verify token using THE SAME hardcoded secret
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified for userId:', decoded.userId);
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ Token verification failed:', err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                message: 'Token has expired',
                expiredAt: err.expiredAt
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                message: 'Invalid token',
                error: err.message,
                expected_secret: JWT_SECRET
            });
        }
        return res.status(403).json({ 
            message: 'Invalid or expired token', 
            error: err.message 
        });
    }
};