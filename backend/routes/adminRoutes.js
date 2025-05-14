// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for authentication

// All admin routes should be protected by authMiddleware
// and ideally, an additional role-checking middleware for 'admin' role.

// @route   GET api/admin/documents/all
// @desc    Get all document requests (for admin)
// @access  Private (Admin)
router.get('/documents/all', authMiddleware, adminController.getAllRequestsAdmin);

// @route   PUT api/admin/documents/:requestId/status
// @desc    Update a document request's status (for admin)
// @access  Private (Admin)
router.put('/documents/:requestId/status', authMiddleware, adminController.updateRequestStatusAdmin);

// @route   GET api/admin/reports/summary
// @desc    Get summary report data for admin
// @access  Private (Admin)
router.get('/reports/summary', authMiddleware, adminController.getReportSummary);

module.exports = router;
