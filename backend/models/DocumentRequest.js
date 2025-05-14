const pool = require('../config/db');

const DocumentRequest = {
    async create(requestData) {
        const {
            userId, docTypeId, quantity, deliveryMethod, pickupOption,
            postalAddress, documentCost, shippingCost, totalCost,
            paymentStatus, documentStatus, paymentSlipFilename // Added paymentSlipFilename
        } = requestData;

        // สมมติว่า docTypeId มาเป็น string id จาก frontend เช่น 'transcript'
        // คุณต้องมี logic การ map string id นี้ไปเป็น doc_type_id (integer) ที่อยู่ใน DB
        // หรือปรับ schema ให้ DocumentTypes.doc_type_id เป็น VARCHAR(50) และเก็บ 'transcript' โดยตรง
        // เพื่อความง่าย สมมติว่า docTypeId ที่ส่งมาคือ Integer ID ที่ถูกต้องแล้ว
        const actualDocTypeId = parseInt(docTypeId); // Or fetch from DB based on a key

        const query = `
            INSERT INTO DocumentRequests
            (user_id, doc_type_id, quantity, delivery_method, pickup_option, postal_address,
            document_cost, shipping_cost, total_cost, payment_status, document_status, payment_slip_path, request_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            RETURNING request_id, user_id, request_date, total_cost, document_status;
        `;
        const values = [
            userId, actualDocTypeId, quantity, deliveryMethod, pickupOption,
            postalAddress, documentCost, shippingCost, totalCost,
            paymentStatus, documentStatus, paymentSlipFilename // Use paymentSlipFilename for payment_slip_path
        ];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error creating document request:', error);
            throw error;
        }
    },

    async findByUserId(userId) {
        const query = `
            SELECT dr.request_id, dt.type_name_key, dr.quantity, dr.request_date, dr.document_status, dr.total_cost
            FROM DocumentRequests dr
            JOIN DocumentTypes dt ON dr.doc_type_id = dt.doc_type_id -- Assuming you have DocumentTypes table
            WHERE dr.user_id = $1
            ORDER BY dr.request_date DESC;
        `;
        // If you don't have a DocumentTypes table or prefer not to join for simplicity in this example:
        // const query = `SELECT request_id, doc_type_id, quantity, request_date, document_status, total_cost
        //                FROM DocumentRequests WHERE user_id = $1 ORDER BY request_date DESC;`;
        try {
            const { rows } = await pool.query(query, [userId]);
            return rows;
        } catch (error) {
            console.error('Error finding requests by user ID:', error);
            throw error;
        }
    },

    // --- Admin functions ---
    async findAll() {
        const query = `
            SELECT dr.*, u.student_id, u.full_name, dt.type_name_key
            FROM DocumentRequests dr
            JOIN Users u ON dr.user_id = u.user_id
            JOIN DocumentTypes dt ON dr.doc_type_id = dt.doc_type_id
            ORDER BY dr.request_date DESC;
        `;
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error finding all requests (admin):', error);
            throw error;
        }
    },

    async updateStatus(requestId, newStatus, adminNotes = null) {
        const query = `
            UPDATE DocumentRequests
            SET document_status = $1, admin_notes = $2, updated_at = NOW()
            WHERE request_id = $3
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [newStatus, adminNotes, requestId]);
            return rows[0];
        } catch (error) {
            console.error('Error updating request status (admin):', error);
            throw error;
        }
    },

    async updatePaymentStatusAndSlip(requestId, paymentStatus, paymentSlipPath) {
         const query = `
            UPDATE DocumentRequests
            SET payment_status = $1, payment_slip_path = $2, updated_at = NOW()
            WHERE request_id = $3
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [paymentStatus, paymentSlipPath, requestId]);
            return rows[0];
        } catch (error) {
            console.error('Error updating payment status and slip:', error);
            throw error;
        }
    }
};

module.exports = DocumentRequest;
