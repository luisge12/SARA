const express = require('express');
const router = express.Router();
const { handleAiChat, handleAudioTranscribe } = require('../controllers/aiController');

// Route: POST /api/ai/chat
router.post('/chat', handleAiChat);

// Route: POST /api/ai/transcribe
router.post('/transcribe', handleAudioTranscribe);

module.exports = router;
