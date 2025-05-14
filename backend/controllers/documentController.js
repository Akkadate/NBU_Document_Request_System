const DocumentRequest = require('../models/DocumentRequest');
// For file uploads, you'd use something like 'multer'
// const multer = require('multer');
// const path = require('path');

// --- Student Actions ---
exports.createRequest = async (req, res) => {
    const userId = req.user.id; // From authMiddleware
    const {
        documentType, // This might be the key e.g., "transcript"
        quantity,
        deliveryMethod,
        pickupType, // Renamed from pickupOption for clarity
        postalAddress,
        totalCost,
        documentCost,
        shippingCost
    } = req.body;

    // Validation
    if (!documentType || !quantity || !deliveryMethod || !totalCost) {
        return res.status(400).json({ message: 'Missing required fields for document request.' });
    }

    // IMPORTANT: Map `documentType` (e.g., "transcript") to `doc_type_id` (integer PK)
    // This requires querying your `DocumentTypes` table or having a predefined map.
    // For this example, let's assume you have a mapping or `documentType` is the ID.
    // This is a simplification. In a real app, ensure robust mapping.
    let docTypeIdToUse;
    // Example pseudo-mapping (replace with actual DB lookup or config map)
    const docTypeMapping = {
        "transcript": 1,
        "cert_student": 2,
        "cert_expected_grad": 3,
        // ... add all from your APP_CONFIG.DOCUMENT_TYPES, mapping to their DB IDs
    };
    docTypeIdToUse = docTypeMapping[documentType];
    if (!docTypeIdToUse) {
         // Try to parse if it's already an ID string
        const parsedId = parseInt(documentType);
        if (isNaN(parsedId)) {
            return res.status(400).json({ message: 'Invalid document type provided or mapping not found.' });
        }
        docTypeIdToUse = parsedId; // Assume it was already an ID if mapping fails
    }


    try {
        const newRequest = await DocumentRequest.create({
            userId,
            docTypeId: docTypeIdToUse,
            quantity: parseInt(quantity),
            deliveryMethod,
            pickupOption: pickupType, // Use the renamed variable
            postalAddress,
            documentCost: parseFloat(documentCost),
            shippingCost: parseFloat(shippingCost),
            totalCost: parseFloat(totalCost),
            paymentStatus: 'pending_payment',
            documentStatus: 'pending_payment_confirmation', // Or a more suitable initial status
            paymentSlipFilename: null // Initially no slip
        });
        res.status(201).json({ message: 'Document request created successfully. Proceed to payment.', request: newRequest });
    } catch (err) {
        console.error('Error creating document request:', err);
        res.status(500).send('Server error');
    }
};

exports.getUserRequests = async (req, res) => {
    const userId = req.user.id; // From authMiddleware
    try {
        const requests = await DocumentRequest.findByUserId(userId);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching user requests:', err);
        res.status(500).send('Server error');
    }
};

// --- Payment Related (Simplified - No actual file upload here) ---
exports.submitPayment = async (req, res) => {
    const userId = req.user.id;
    const { requestId } = req.params;
    const paymentSlipFile = req.file; // multer stores uploaded file info here

    if (!paymentSlipFile) {
        return res.status(400).json({ message: 'Payment slip file is required.' });
    }

    // Path to store in DB, relative to a base path or accessible URL if serving files
    // For now, just store the filename or path relative to 'uploads'
    const paymentSlipPath = `slips/${paymentSlipFile.filename}`;

    try {
        // Optional: Verify the request belongs to the user and is in a payable state
        // const request = await DocumentRequest.findByIdAndUserAndStatus(requestId, userId, 'pending_payment');
        // if (!request) {
        //     // If file was uploaded but request is not valid, you might want to delete the uploaded file
        //     fs.unlinkSync(paymentSlipFile.path); // Requires const fs = require('fs');
        //     return res.status(404).json({ message: 'Request not found, not payable, or does not belong to user.' });
        // }

        const updatedRequest = await DocumentRequest.updatePaymentStatusAndSlip(
            requestId,
            'pending_verification', // New payment status
            paymentSlipPath         // Actual file path/reference
        );

        if (!updatedRequest) {
            // If DB update fails, consider deleting the uploaded file
            // fs.unlinkSync(paymentSlipFile.path);
            return res.status(404).json({ message: 'Request not found for updating payment.' });
        }

        res.json({ message: 'Payment submitted successfully. Awaiting verification.', request: updatedRequest });
    } catch (err) {
        console.error('Error submitting payment:', err);
        // If an error occurs after file upload, you might want to delete the uploaded file
        if (paymentSlipFile && paymentSlipFile.path) {
            try {
                const fs = require('fs'); // ensure fs is required at the top of the file
                fs.unlinkSync(paymentSlipFile.path);
                console.log('Rolled back uploaded file due to error:', paymentSlipFile.path);
            } catch (unlinkErr) {
                console.error('Error deleting uploaded file during error handling:', unlinkErr);
            }
        }
        if (err.message.includes('Invalid file type')) { // From multer fileFilter
             return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server error during payment submission');
    }
};


// --- Admin Actions ---
exports.getAllRequestsAdmin = async (req, res) => {
    // Add role check from req.user if you have roles
    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
    try {
        const requests = await DocumentRequest.findAll();
        res.json(requests);
    } catch (err) {
        console.error('Error fetching all requests (admin):', err);
        res.status(500).send('Server error');
    }
};

exports.updateRequestStatusAdmin = async (req, res) => {
    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
    const { requestId } = req.params;
    const { newStatus, adminNotes } = req.body;

    if (!newStatus) {
        return res.status(400).json({ message: 'New status is required.' });
    }

    try {
        const updatedRequest = await DocumentRequest.updateStatus(requestId, newStatus, adminNotes);
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Request not found for status update.' });
        }
        res.json({ message: 'Request status updated successfully.', request: updatedRequest });
    } catch (err) {
        console.error('Error updating request status (admin):', err);
        res.status(500).send('Server error');
    }
};
