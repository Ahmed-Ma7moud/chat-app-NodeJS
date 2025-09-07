const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.authenticate = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        //check token version
        const isValid = await User.findOne({_id: decoded.id, tokenVersion: decoded.tokenVersion});
        if(!isValid) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
}
