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


    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const paymentSlipFile = document.getElementById('paymentSlip').files[0];

            if (!paymentSlipFile) {
                 if(paymentMessageDiv) {
                    paymentMessageDiv.textContent = window.translations?.['please_upload_slip'] || 'กรุณาแนบสลิปการชำระเงิน';
                    paymentMessageDiv.style.color = 'red';
                 }
                return;
            }

            // SIMULATE SLIP UPLOAD AND SAVING REQUEST
            // In a real app, upload the file to a server (e.g., using FormData and fetch API)
            // Then, update the request status on the backend.

            currentRequestData.status = 'pending_verification'; // Update status
            currentRequestData.paymentSlipFilename = paymentSlipFile.name; // Store filename for demo

            let allRequests = JSON.parse(localStorage.getItem('documentRequests')) || [];
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (loggedInUser) {
                currentRequestData.studentId = loggedInUser.studentId; // Associate request with user
            }

            allRequests.push(currentRequestData);
            localStorage.setItem('documentRequests', JSON.stringify(allRequests));
            localStorage.removeItem('currentDocumentRequest'); // Clear temporary request

            if(paymentMessageDiv) {
                paymentMessageDiv.textContent = window.translations?.['payment_submitted_success'] || 'ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว! เจ้าหน้าที่จะตรวจสอบและแจ้งสถานะให้ทราบ';
                paymentMessageDiv.style.color = 'green';
            }

            setTimeout(() => {
                window.location.href = 'status.html'; // Redirect to status page
            }, 3000);
        });
    }
});
