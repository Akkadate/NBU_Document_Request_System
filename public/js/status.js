document.addEventListener('DOMContentLoaded', () => {
    const statusTableBody = document.getElementById('statusTableBody');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    // SIMULATE fetching requests for the logged-in user
    // In a real app, this would be an API call.
    const allRequests = JSON.parse(localStorage.getItem('documentRequests')) || [];
    const userRequests = allRequests.filter(req => req.studentId === loggedInUser.studentId);

    if (userRequests.length === 0) {
        if (noRequestsMessage) noRequestsMessage.style.display = 'block';
        if (statusTableBody.parentElement) statusTableBody.parentElement.style.display = 'none'; // Hide table
    } else {
        if (noRequestsMessage) noRequestsMessage.style.display = 'none';
        if (statusTableBody) {
            statusTableBody.innerHTML = ''; // Clear previous entries
            userRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)); // Sort by newest first

            userRequests.forEach(request => {
                const row = statusTableBody.insertRow();
                row.insertCell().textContent = request.id;
                row.insertCell().textContent = request.documentTypeName;
                row.insertCell().textContent = new Date(request.requestDate).toLocaleDateString();

                // Translate status
                let statusText = request.status;
                const statusKey = `status_${request.status.toLowerCase().replace(/\s+/g, '_')}`;
                if (window.translations && window.translations[statusKey]) {
                    statusText = window.translations[statusKey];
                } else {
                    // Basic fallback capitalization if no translation
                    statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ');
                }
                row.insertCell().textContent = statusText;
            });
        }
    }
});
