const express = require('express')
const router = express.Router();
const {authenticate} = require('../middlewares/authMiddleware')
const {getMessages} = require('../controllers/messageController')

router.use(authenticate);
router.get('/:conversationID' , getMessages);
module.exports = router