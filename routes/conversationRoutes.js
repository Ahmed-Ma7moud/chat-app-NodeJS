const express = require('express');
const router = express.Router();
const {createConversation, getConversations} = require('../controllers/conversationController');
const {authenticate} = require('../middlewares/authMiddleware');
const {createConversationValidator} = require('../middlewares/validationMiddleware');
router.use(authenticate);
router.post('/', createConversationValidator, createConversation);

router.get('/', getConversations);
module.exports = router
