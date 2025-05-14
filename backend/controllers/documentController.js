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
    const { requestId } = req.params; // Get requestId from URL parameter
    // In a real scenario with multer, req.file would contain slip info
    // const paymentSlipFile = req.file;
    const { paymentSlipFilename } = req.body; // For demo, assume filename is sent in body

    // if (!paymentSlipFile) {
    //     return res.status(400).json({ message: 'Payment slip file is required.' });
    // }
    if (!paymentSlipFilename) {
        return res.status(400).json({ message: 'Payment slip filename is required for demo.' });
    }

    try {
        // Verify the request belongs to the user (optional, but good practice)
        // const request = await DocumentRequest.findByIdAndUser(requestId, userId);
        // if (!request) {
        //     return res.status(404).json({ message: 'Request not found or does not belong to user.' });
        // }

        const updatedRequest = await DocumentRequest.updatePaymentStatusAndSlip(
            requestId,
            'pending_verification', // New payment status
            // paymentSlipFile.path // Path where multer saved the file
            `uploads/slips/${paymentSlipFilename}` // Simulated path
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Request not found for updating payment.' });
        }

        res.json({ message: 'Payment submitted successfully. Awaiting verification.', request: updatedRequest });
    } catch (err) {
        console.error('Error submitting payment:', err);
        res.status(500).send('Server error');
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
