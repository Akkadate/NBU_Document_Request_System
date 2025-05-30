document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_CONFIG === 'undefined') {
        console.error("APP_CONFIG is not loaded.");
        return;
    }

    const paymentForm = document.getElementById('paymentForm');
    const paymentTotalAmountSpan = document.getElementById('paymentTotalAmount');
    const bankAccountInfoSpan = document.getElementById('bankAccountInfo');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const paymentMessageDiv = document.getElementById('paymentMessage');

    const currentRequestData = JSON.parse(localStorage.getItem('currentDocumentRequest'));

    if (!currentRequestData) {
        if(paymentMessageDiv) paymentMessageDiv.textContent = window.translations?.['no_pending_payment'] || 'ไม่พบรายการที่รอการชำระเงิน';
        if(paymentForm) paymentForm.style.display = 'none';
        if(document.getElementById('paymentDetails')) document.getElementById('paymentDetails').style.display = 'none';
        return;
    }

    if (paymentTotalAmountSpan) paymentTotalAmountSpan.textContent = currentRequestData.totalCost.toFixed(2);
    if (bankAccountInfoSpan) bankAccountInfoSpan.textContent = APP_CONFIG.PAYMENT_INFO.BANK_ACCOUNT;
    if (qrCodeImage) qrCodeImage.src = APP_CONFIG.PAYMENT_INFO.QR_CODE_IMAGE_URL;


    // ... (ส่วน UI แสดงข้อมูลเหมือนเดิม) ...

// ... (ส่วน UI แสดงข้อมูลเหมือนเดิม) ...

if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const paymentSlipFileInput = document.getElementById('paymentSlip');
        const paymentSlipFile = paymentSlipFileInput.files[0];
        const authToken = localStorage.getItem('authToken');

        if (!currentRequestData || !currentRequestData.request_id) { // Ensure currentRequestData is from localStorage and has request_id
            showMessage(paymentMessageDiv, 'No active request for payment.', true);
            return;
        }
        if (!paymentSlipFile) {
            showMessage(paymentMessageDiv, window.translations?.['please_upload_slip'] || 'Please upload payment slip.', true);
            return;
        }
        if (!authToken) {
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        const formData = new FormData();
        formData.append('paymentSlipFile', paymentSlipFile); // Key 'paymentSlipFile' must match multer's .single() argument

        // You can append other data if your backend expects it with multipart/form-data
        // formData.append('someOtherField', 'someValue');

        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/documents/${currentRequestData.request_id}/payment`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data' // DON'T set Content-Type manually when using FormData with fetch. The browser will do it correctly.
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            const data = await response.json(); // Try to parse JSON, even if it's an error response
            if (!response.ok) {
                throw new Error(data.message || `Payment submission failed. Status: ${response.status}`);
            }

            showMessage(paymentMessageDiv, data.message || 'Payment submitted successfully!', false);
            localStorage.removeItem('currentDocumentRequest');

            setTimeout(() => {
                window.location.href = 'status.html';
            }, 3000);

        } catch (error) {
            showMessage(paymentMessageDiv, error.message, true);
            console.error("Payment submission error:", error);
            if (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('unauthorized')) {
                window.location.href = 'login.html';
            }
        }
    });
}
// ... (showMessage function) ...
    function showMessage(div, text, isError = true) { // Helper for this page
        if (div) {
            div.textContent = text;
            div.style.color = isError ? 'red' : 'green';
        }
    }
});
