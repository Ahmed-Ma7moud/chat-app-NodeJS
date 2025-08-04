const express = require('express');
const router = express.Router();
const {createConversation, getConversations} = require('../controllers/conversationController');
const {authenticate} = require('../middlewares/authMiddleware');

router.use(authenticate);
router.post('/', createConversation);

router.get('/', getConversations);
module.exports = router
