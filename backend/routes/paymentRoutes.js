const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Import the upload middleware
const { getPayments } = require('../controllers/paymentController');
const { createPayment } = require('../controllers/paymentController');
const { editPayment } = require('../controllers/paymentController');
const { deletePayment } = require('../controllers/paymentController');
const router = express.Router();

// Protected route to get payments
router.get('/', authMiddleware, getPayments);

// Protected route to create a new payment
router.post('/', authMiddleware, upload.single('proof'), createPayment); // Use multer to handle file uploads

// Edit payment
router.put('/:id', editPayment);

// Delete payment
router.delete('/:id', deletePayment);

module.exports = router;