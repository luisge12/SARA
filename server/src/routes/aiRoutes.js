const express = require('express');
const router = express.Router();
const { handleAiChat, handleAudioTranscribe, handleGenerateClinicalReason } = require('../controllers/aiController');

// Route: POST /api/ai/chat
router.post('/chat', handleAiChat);

// Route: POST /api/ai/transcribe
router.post('/transcribe', handleAudioTranscribe);

// Route: POST /api/ai/clinical-reason (Gran Motivo de Consulta Asistido)
router.post('/clinical-reason', handleGenerateClinicalReason);

module.exports = router;

