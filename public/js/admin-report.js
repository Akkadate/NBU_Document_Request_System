document.addEventListener('DOMContentLoaded', async () => {
    const reportMessageDiv = document.getElementById('reportMessage');
    const statusSummaryTableContainer = document.getElementById('statusSummaryTableContainer');
    const typeSummaryTableContainer = document.getElementById('typeSummaryTableContainer');
    // const statusChartCtx = document.getElementById('statusChart')?.getContext('2d');
    // const typeChartCtx = document.getElementById('typeChart')?.getContext('2d');

    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!authToken) {
        showMessage(reportMessageDiv, 'Unauthorized. Redirecting to login...', true);
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return;
    }

    const userInfoDiv = document.getElementById('user-info');
     if (loggedInUser && userInfoDiv) {
         userInfoDiv.innerHTML = `
             <span>Admin: ${loggedInUser.fullName} (${loggedInUser.studentId})</span> |
             <button id="adminLogoutButtonReport" class="btn btn-secondary btn-sm">ออกจากระบบ</button>
         `;
         document.getElementById('adminLogoutButtonReport').addEventListener('click', () => {
             localStorage.removeItem('loggedInUser');
             localStorage.removeItem('authToken');
             window.location.href = 'login.html';
         });
     }


    async function fetchReportData() {
        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/reports/summary`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                     localStorage.removeItem('authToken');
                     localStorage.removeItem('loggedInUser');
                     throw new Error('Authentication failed. Please log in again.');
                }
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch report data.');
            }
            const data = await response.json();
            if (data.summary) {
                renderStatusSummary(data.summary.statusCounts);
                renderTypeSummary(data.summary.typeCounts);
                // if (statusChartCtx) renderStatusChart(data.summary.statusCounts, statusChartCtx);
                // if (typeChartCtx) renderTypeChart(data.summary.typeCounts, typeChartCtx);
            } else {
                showMessage(reportMessageDiv, 'No summary data received.', false);
            }
        } catch (error) {
            showMessage(reportMessageDiv, error.message, true);
            console.error('Error fetching report data:', error);
            if (error.message.toLowerCase().includes('authentication failed')) {
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
             }
        }
    }

    function renderStatusSummary(statusCounts) {
        if (!statusSummaryTableContainer || !statusCounts || statusCounts.length === 0) {
             if(statusSummaryTableContainer) statusSummaryTableContainer.innerHTML = '<p>No status data available.</p>';
             return;
        }
        let tableHTML = '<table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>';
        statusCounts.forEach(item => {
            const statusText = translateKey(`status_${item.document_status}`) || item.document_status.replace(/_/g, ' ');
            tableHTML += `<tr><td>${statusText}</td><td>${item.count}</td></tr>`;
        });
        tableHTML += '</tbody></table>';
        statusSummaryTableContainer.innerHTML = tableHTML;
    }

    function renderTypeSummary(typeCounts) {
        if (!typeSummaryTableContainer || !typeCounts || typeCounts.length === 0) {
             if(typeSummaryTableContainer) typeSummaryTableContainer.innerHTML = '<p>No document type data available.</p>';
             return;
         }
        let tableHTML = '<table><thead><tr><th>Document Type</th><th>Count</th></tr></thead><tbody>';
        typeCounts.forEach(item => {
            const typeText = translateKey(item.type_name_key) || item.type_name_key.replace('doc_', '').replace(/_/g, ' ');
            tableHTML += `<tr><td>${typeText}</td><td>${item.count}</td></tr>`;
        });
        tableHTML += '</tbody></table>';
        typeSummaryTableContainer.innerHTML = tableHTML;
    }

    /*
    function renderStatusChart(statusCounts, ctx) {
        // Example using Chart.js - User would need to include Chart.js library
        const labels = statusCounts.map(item => translateKey(`status_${item.document_status}`) || item.document_status);
        const data = statusCounts.map(item => parseInt(item.count));
        new Chart(ctx, {
            type: 'bar', // or 'pie'
            data: {
                labels: labels,
                datasets: [{
                    label: 'Requests by Status',
                    data: data,
                    backgroundColor: ['#004A99', '#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#343a40'],
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    // Similarly for renderTypeChart
    */

    function showMessage(div, text, isError = true) {
         if (!div) return;
         div.textContent = text;
         div.style.color = isError ? 'red' : 'green';
         div.style.display = 'block';
    }

    function translateKey(key) {
        return window.translations && window.translations[key] ? window.translations[key] : null;
    }

    fetchReportData();

     // Similar to admin.js, ensure translations are loaded.
     if (typeof window.fetchTranslations === 'function' && !window.translationsLoadedForAdminReport) {
          const lang = localStorage.getItem('language') || 'th';
          window.fetchTranslations(lang).then(() => {
              window.translationsLoadedForAdminReport = true;
              fetchReportData(); // Re-fetch or re-render with new translations
          });
     }
});
