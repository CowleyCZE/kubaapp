const express = require('express');
const router = express.Router();
const textController = require('../controllers/textController');

// Route for processing text with Gemini AI
router.post('/process-text', textController.processText);

// Routes pro práci s tématy
router.get('/topics', textController.getAllTopics);
router.get('/topics/search', textController.searchTopics);
router.get('/topics/:topicId/texts', textController.getTextsByTopic);

module.exports = router;
