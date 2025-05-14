const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Configuration for Slip Uploads ---
const slipUploadDir = path.join(__dirname, '..', 'uploads', 'slips');

// Ensure upload directory exists
if (!fs.existsSync(slipUploadDir)) {
    fs.mkdirSync(slipUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, slipUploadDir);
    },
    filename: function (req, file, cb) {
        // requestId will be part of the path or body, ensure it's available if needed for filename
        // For simplicity, use user ID and timestamp to make filename unique
        const userId = req.user ? req.user.id : 'unknown_user';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `slip-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
};

const uploadSlip = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});


// --- Student Routes (Protected) ---
// ... (các route khác giữ nguyên) ...
router.post('/request', authMiddleware, documentController.createRequest);
router.get('/user', authMiddleware, documentController.getUserRequests);


// @route   POST api/documents/:requestId/payment
// @desc    Submit payment slip for a request (NOW WITH ACTUAL FILE UPLOAD)
// @access  Private (Student)
router.post(
    '/:requestId/payment',
    authMiddleware,
    uploadSlip.single('paymentSlipFile'), // 'paymentSlipFile' must match the FormData key from frontend
    documentController.submitPayment
);


// --- Admin Routes ---
// ... (các route admin giữ nguyên) ...
router.get('/admin/all', authMiddleware, documentController.getAllRequestsAdmin);
router.put('/admin/:requestId/status', authMiddleware, documentController.updateRequestStatusAdmin);


module.exports = router;
