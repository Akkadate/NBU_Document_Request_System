const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');

// --- Student Routes (Protected) ---

// @route   POST api/documents/request
// @desc    Create a new document request
// @access  Private (Student)
router.post('/request', authMiddleware, documentController.createRequest);

// @route   GET api/documents/user
// @desc    Get all document requests for the logged-in user
// @access  Private (Student)
router.get('/user', authMiddleware, documentController.getUserRequests);

// @route   POST api/documents/:requestId/payment
// @desc    Submit payment slip for a request (Simplified: no actual file upload)
// @access  Private (Student)
router.post('/:requestId/payment', authMiddleware, documentController.submitPayment);


// --- Admin Routes (Protected - you might want a separate adminMiddleware for role checks) ---

// @route   GET api/documents/admin/all
// @desc    Get all document requests (for admin)
// @access  Private (Admin - ideally with role check in middleware or controller)
router.get('/admin/all', authMiddleware, documentController.getAllRequestsAdmin); // Assuming admin also uses authMiddleware

// @route   PUT api/documents/admin/:requestId/status
// @desc    Update a document request's status (for admin)
// @access  Private (Admin)
router.put('/admin/:requestId/status', authMiddleware, documentController.updateRequestStatusAdmin);

module.exports = router;
