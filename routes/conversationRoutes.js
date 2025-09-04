const express = require('express');
const router = express.Router();
const {createConversation, getConversations , getConversation} = require('../controllers/conversationController');
const {authenticate} = require('../middlewares/authMiddleware');
const {createConversationValidator} = require('../middlewares/validationMiddleware');

router.use(authenticate);

router.post('/', createConversationValidator, createConversation);
router.get('/', getConversations);
router.get('/:id', getConversation);

module.exports = router;
