document.addEventListener('DOMContentLoaded', async () => {
    const statusTableBody = document.getElementById('statusTableBody');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    // const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Not needed directly if using token
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    try {
        const response = await fetch(`${APP_CONFIG.API_BASE_URL}/documents/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) { // Unauthorized
                localStorage.removeItem('authToken');
                localStorage.removeItem('loggedInUser');
                window.location.href = 'login.html';
            }
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to fetch document statuses.');
        }

        const userRequests = await response.json();

        if (userRequests.length === 0) {
            if (noRequestsMessage) noRequestsMessage.style.display = 'block';
            if (statusTableBody?.parentElement) statusTableBody.parentElement.style.display = 'none';
        } else {
            if (noRequestsMessage) noRequestsMessage.style.display = 'none';
            if (statusTableBody) {
                statusTableBody.innerHTML = ''; // Clear
                // userRequests already sorted by backend if implemented

                userRequests.forEach(request => {
                    const row = statusTableBody.insertRow();
                    row.insertCell().textContent = request.request_id; // from backend
                    // type_name_key is from joined DocumentTypes table
                    const docNameKey = request.type_name_key || `doc_id_${request.doc_type_id}`;
                    row.insertCell().textContent = window.translations?.[docNameKey] || docNameKey.replace('doc_', '').replace('_', ' ').toUpperCase();

                    row.insertCell().textContent = new Date(request.request_date).toLocaleDateString();

                    let statusText = request.document_status;
                    const statusKey = `status_${statusText.toLowerCase().replace(/\s+/g, '_')}`;
                    if (window.translations && window.translations[statusKey]) {
                        statusText = window.translations[statusKey];
                    } else {
                        statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1).replace(/_/g, ' ');
                    }
                    row.insertCell().textContent = statusText;
                });
            }
        }
    } catch (error) {
        console.error('Error fetching statuses:', error);
        if (noRequestsMessage) {
            noRequestsMessage.textContent = error.message;
            noRequestsMessage.style.display = 'block';
            noRequestsMessage.style.color = 'red';
        }
         if (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('unauthorized')) {
                window.location.href = 'login.html'; // Redirect if auth error
        }
    }
});
