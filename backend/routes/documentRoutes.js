// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer'); // Keep multer here if student payment upload is here
const path = require('path');
const fs = require('fs');

// --- Multer Configuration for Slip Uploads (Student's Payment) ---
const slipUploadDir = path.join(__dirname, '..', 'uploads', 'slips');
if (!fs.existsSync(slipUploadDir)) {
    fs.mkdirSync(slipUploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, slipUploadDir); },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user.id : 'unknown_user';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `slip-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
};
const uploadSlip = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: fileFilter });

// --- Student Routes (Protected) ---
router.post('/request', authMiddleware, documentController.createRequest);
router.get('/user', authMiddleware, documentController.getUserRequests);
router.post(
    '/:requestId/payment', // This is a document-specific action by a student
    authMiddleware,
    uploadSlip.single('paymentSlipFile'),
    documentController.submitPayment
);

// --------------------------------------------------------------------
// REMOVE Admin-specific routes from here. They are now in adminRoutes.js
// e.g., /admin/all, /admin/:requestId/status, /admin/reports/summary
// --------------------------------------------------------------------

module.exports = router;
