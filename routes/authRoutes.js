const express = require('express');
const router = express.Router();
const {register , login, me} = require('../controllers/authController');
const {authenticate} = require('../middlewares/authMiddleware');
const {loginValidator, registerValidator} = require('../middlewares/validationMiddleware');

router.post('/register', registerValidator , register);
router.post('/login', loginValidator , login);
router.get('/me', authenticate, me);

module.exports = router;
