const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/dashboard', verifyToken, statsController.getDashboardStats);
router.get('/historical', verifyToken, statsController.getHistoricalStats);

module.exports = router;
