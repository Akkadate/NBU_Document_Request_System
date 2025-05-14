document.addEventListener('DOMContentLoaded', async () => {
    const requestsTableBody = document.getElementById('requestsTableBody');
    const noAdminRequestsMessage = document.getElementById('noAdminRequestsMessage');
    const adminMessageDiv = document.getElementById('adminMessage');
    const statusFilter = document.getElementById('statusFilter');
    const searchStudentIdInput = document.getElementById('searchStudentId');
    const applyFilterBtn = document.getElementById('applyFilterBtn');

    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // For displaying admin name

    if (!authToken) {
        showMessage(adminMessageDiv, 'Unauthorized. Redirecting to login...', true);
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return;
    }

     // Display admin user info (simplified)
     const userInfoDiv = document.getElementById('user-info');
     if (loggedInUser && userInfoDiv) {
         userInfoDiv.innerHTML = `
             <span>Admin: ${loggedInUser.fullName} (${loggedInUser.studentId})</span> |
             <button id="adminLogoutButton" class="btn btn-secondary btn-sm">ออกจากระบบ</button>
         `;
         document.getElementById('adminLogoutButton').addEventListener('click', () => {
             localStorage.removeItem('loggedInUser');
             localStorage.removeItem('authToken');
             window.location.href = 'login.html';
         });
     }


    let allRequestsCache = []; // Cache all requests to filter on client-side

    async function fetchAllRequests() {
        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/documents/admin/all`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                     localStorage.removeItem('authToken');
                     localStorage.removeItem('loggedInUser');
                     throw new Error('Authentication failed. Please log in again.');
                }
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch requests.');
            }
            allRequestsCache = await response.json();
            renderTable(allRequestsCache);
        } catch (error) {
            showMessage(adminMessageDiv, error.message, true);
            console.error('Error fetching requests:', error);
             if (error.message.toLowerCase().includes('authentication failed')) {
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
             }
        }
    }

    function renderTable(requests) {
        if (!requestsTableBody) return;
        requestsTableBody.innerHTML = ''; // Clear table

        if (requests.length === 0) {
            if (noAdminRequestsMessage) noAdminRequestsMessage.style.display = 'block';
            return;
        }
        if (noAdminRequestsMessage) noAdminRequestsMessage.style.display = 'none';

        requests.forEach(req => {
            const row = requestsTableBody.insertRow();
            row.insertCell().textContent = req.request_id;
            row.insertCell().textContent = req.student_id; // from JOIN with Users table
            row.insertCell().textContent = req.full_name;  // from JOIN with Users table
            row.insertCell().textContent = translateKey(req.type_name_key) || req.type_name_key; // from JOIN with DocumentTypes

            row.insertCell().textContent = new Date(req.request_date).toLocaleDateString();
            row.insertCell().textContent = req.total_cost ? parseFloat(req.total_cost).toFixed(2) : 'N/A';
            row.insertCell().textContent = translateKey(`status_${req.payment_status}`) || req.payment_status;
            row.insertCell().textContent = translateKey(`status_${req.document_status}`) || req.document_status;

            // Payment Slip Link
            const slipCell = row.insertCell();
            if (req.payment_slip_path) {
                // IMPORTANT: This assumes 'uploads' is served statically by your backend or you have a route for it.
                // If backend is at localhost:3000, link would be localhost:3000/uploads/slips/filename.jpg
                // For now, just display path. For actual link, adjust base URL.
                // const slipUrl = `${APP_CONFIG.API_BASE_URL.replace('/api', '')}/${req.payment_slip_path}`; // Example
                const slipLink = document.createElement('a');
                slipLink.href = `#view-slip-${req.request_id}`; // Placeholder action
                // slipLink.href = slipUrl; // If serving files directly
                // slipLink.target = "_blank";
                slipLink.textContent = req.payment_slip_path.split('/').pop(); // Show filename
                slipLink.classList.add('slip-link');
                slipLink.onclick = (e) => {
                    e.preventDefault();
                    // In a real app, if not serving directly, fetch the image via API (if protected)
                    // Or, if your backend serves the `uploads` folder statically:
                    const backendBaseUrl = APP_CONFIG.API_BASE_URL.substring(0, APP_CONFIG.API_BASE_URL.lastIndexOf('/api'));
                    const actualSlipUrl = `${backendBaseUrl}/uploads/${req.payment_slip_path}`;
                    window.open(actualSlipUrl, '_blank');
                    // alert(`Viewing slip: ${req.payment_slip_path}`);
                };
                slipCell.appendChild(slipLink);
            } else {
                slipCell.textContent = 'N/A';
            }

            // Actions: Change Status
            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions');
            const statusSelect = document.createElement('select');
            statusSelect.id = `statusSelect-${req.request_id}`;
            const statuses = [
                { value: "pending_payment_confirmation", key: "status_pending_payment_confirmation" },
                { value: "pending_verification", key: "status_pending_verification" },
                { value: "processing", key: "status_processing" },
                { value: "ready_for_pickup", key: "status_ready_for_pickup" },
                { value: "shipped", key: "status_shipped" },
                { value: "completed", key: "status_completed" },
                { value: "rejected_payment", key: "status_rejected_payment" },
                { value: "rejected", key: "status_rejected" }
            ];
            statuses.forEach(s => {
                const option = document.createElement('option');
                option.value = s.value;
                option.textContent = translateKey(s.key) || s.value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                if (s.value === req.document_status) {
                    option.selected = true;
                }
                statusSelect.appendChild(option);
            });
            actionsCell.appendChild(statusSelect);

            const updateBtn = document.createElement('button');
            updateBtn.textContent = translateKey('update_status_btn') || 'Update';
            updateBtn.classList.add('btn', 'btn-sm');
            updateBtn.onclick = () => updateRequestStatus(req.request_id, statusSelect.value);
            actionsCell.appendChild(updateBtn);
        });
    }

    async function updateRequestStatus(requestId, newStatus) {
        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/documents/admin/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ newStatus: newStatus })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status.');
            }
            showMessage(adminMessageDiv, `Request ID ${requestId} status updated to ${newStatus}.`, false);
            fetchAllRequests(); // Refresh the table
        } catch (error) {
            showMessage(adminMessageDiv, error.message, true);
            console.error('Error updating status:', error);
        }
    }

    function showMessage(div, text, isError = true) {
        if (!div) return;
        div.textContent = text;
        div.style.color = isError ? 'red' : 'green';
        div.style.display = 'block';
        setTimeout(() => { div.style.display = 'none'; }, 5000);
    }

    function translateKey(key) {
        return window.translations && window.translations[key] ? window.translations[key] : null;
    }

    // Initial load
    fetchAllRequests();

    // Filter logic
     if (applyFilterBtn) {
         applyFilterBtn.addEventListener('click', () => {
             const statusValue = statusFilter.value;
             const studentIdSearch = searchStudentIdInput.value.trim().toLowerCase();

             let filteredRequests = allRequestsCache;

             if (statusValue) {
                 filteredRequests = filteredRequests.filter(req => req.document_status === statusValue);
             }
             if (studentIdSearch) {
                 filteredRequests = filteredRequests.filter(req => req.student_id.toLowerCase().includes(studentIdSearch));
             }
             renderTable(filteredRequests);
         });
     }

     // Make sure translations are loaded by main.js (you might need to adjust main.js to ensure this)
     // For example, by making fetchTranslations a global function or using an event system.
     // Or call it here if main.js doesn't handle it for this page.
     if (typeof window.fetchTranslations === 'function' && !window.translationsLoadedForAdmin) {
          const lang = localStorage.getItem('language') || 'th';
          window.fetchTranslations(lang).then(() => {
              window.translationsLoadedForAdmin = true;
              fetchAllRequests(); // Re-render with translations if needed, or ensure keys are translated during render
              // You might need to update filter dropdown texts too
              document.querySelectorAll('#statusFilter option').forEach(opt => {
                 if (opt.dataset.translate) {
                     opt.textContent = translateKey(opt.dataset.translate) || opt.textContent;
                 }
              });
          });
     }
});
