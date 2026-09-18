const express = require('express');
const router = express.Router();
const { handleAiChat, handleAudioTranscribe, handleGenerateClinicalReason } = require('../controllers/aiController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route: POST /api/ai/chat (Protegida con autenticación)
router.post('/chat', verifyToken, handleAiChat);

// Route: POST /api/ai/transcribe (Transcripción de voz protegida)
router.post('/transcribe', verifyToken, handleAudioTranscribe);

// Route: POST /api/ai/clinical-reason (Gran Motivo de Consulta Asistido)
router.post('/clinical-reason', verifyToken, handleGenerateClinicalReason);

module.exports = router;


