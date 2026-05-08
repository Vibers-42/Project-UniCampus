/** @file aiChatbot.routes.js */
const { Router } = require('express');
const ctrl = require('./aiChatbot.controller');
const { validateAsk } = require('./aiChatbot.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.post('/ask', validateAsk, validate, ctrl.ask);
router.get('/history', ctrl.getHistory);
router.delete('/history', ctrl.deleteHistory);

module.exports = router;
