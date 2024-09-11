const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getMonthlyPayments } = require('../controllers/statisticsController');
const router = express.Router();

// Protected route to get monthly payments
router.get('/', authMiddleware, getMonthlyPayments);

module.exports = router;