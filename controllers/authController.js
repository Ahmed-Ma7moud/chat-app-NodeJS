const User = require('../models/User')
const sanitize = require('../utils/sanitize')
exports.register = async (req , res , next) => {
    const {name , phone , password} = sanitize({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password
    });
    try {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
        const newUser = new User({ 
            name, 
            phone, 
            password 
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.login = async (req, res, next) => {
    const { phone, password } = sanitize({
        phone: req.body.phone,
        password: req.body.password
    });
    if (!phone || !password) {
        return res.status(400).json({ message: 'Phone number and password are required' });
    }
    try {
        const user = await User.findOne({ 
            phone, 
            password 
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }
        const token = user.generateAccessToken();
        res.status(200).json({ 
            message: 'Login successful', 
            user: { 
                id: user._id,
                name: user.name, 
                phone: user.phone 
            }, 
            token 
        });
    } catch (error) {
        console.log('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ 
            user: { 
                id: user._id,
                name: user.name, 
                phone: user.phone 
            } 
        });
    } catch (error) {
        console.log('Get user error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}