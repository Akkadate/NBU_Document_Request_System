// backend/controllers/adminController.js
const DocumentRequest = require('../models/DocumentRequest'); // Assuming model has the necessary functions

// --- Admin: Document Request Management ---
exports.getAllRequestsAdmin = async (req, res) => {
    // Implement role check here if you have roles:
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ message: 'Access Denied: Admin role required.' });
    // }
    try {
        const requests = await DocumentRequest.findAll(); // This function should be in DocumentRequest model
        res.json(requests);
    } catch (err) {
        console.error('Error fetching all requests (admin):', err);
        res.status(500).send('Server error while fetching all requests');
    }
};

exports.updateRequestStatusAdmin = async (req, res) => {
    // if (req.user.role !== 'admin') { ... }
    const { requestId } = req.params;
    const { newStatus, adminNotes } = req.body;

    if (!newStatus) {
        return res.status(400).json({ message: 'New status is required.' });
    }

    try {
        const updatedRequest = await DocumentRequest.updateStatus(requestId, newStatus, adminNotes); // In DocumentRequest model
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Request not found for status update.' });
        }
        res.json({ message: 'Request status updated successfully.', request: updatedRequest });
    } catch (err) {
        console.error('Error updating request status (admin):', err);
        res.status(500).send('Server error while updating request status');
    }
};

// --- Admin: Reporting ---
exports.getReportSummary = async (req, res) => {
    // if (req.user.role !== 'admin') { ... }
    try {
        const statusCounts = await DocumentRequest.countByStatus(); // In DocumentRequest model
        const typeCounts = await DocumentRequest.countByType();   // In DocumentRequest model

        res.json({
            message: "Report summary fetched successfully.",
            summary: {
                statusCounts,
                typeCounts,
            }
        });
    } catch (err) {
        console.error('Error fetching report summary:', err);
        res.status(500).send('Server error while fetching report summary');
    }
};

// You can add more admin-specific controller functions here,
// for example, managing users, faculties, document types if needed.
