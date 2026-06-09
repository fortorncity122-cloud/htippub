document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const contentDiv = document.getElementById('detailContent');

    if (!id) {
        contentDiv.innerHTML = '<p class="error">No Application Number provided.</p>';
        return;
    }

    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const record = data.find(r => r['Application Number'] === id);

        if (record) {
            renderDetail(record);
        } else {
            contentDiv.innerHTML = '<p class="error">Record not found.</p>';
        }
    } catch (error) {
        contentDiv.innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    }

    function renderDetail(record) {
        const logoHtml = record.logo && record.logo !== "" 
            ? `<img src="${record.logo}" alt="Trademark Logo" style="width: 200px; height: 200px; object-fit: contain; background: white; padding: 8px; border: 1px solid var(--border-light); border-radius: 8px;">` 
            : `<div style="width: 200px; height: 200px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border-light); color: var(--text-muted);">No Logo</div>`;

        let classesHtml = '';
        if (record.Classes && Array.isArray(record.Classes)) {
            record.Classes.forEach(cls => {
                if(cls.class_no) {
                    classesHtml += `
                    <div class="class-box">
                        <strong>Class ${cls.class_no}</strong><br>
                        ${cls.classes_type || '<span style="color: var(--text-muted);">No description available.</span>'}
                    </div>`;
                }
            });
        } else if (record['Class']) {
             classesHtml = `
                <div class="class-box">
                    <strong>Class(es): ${record['Class']}</strong><br>
                    <span style="color: var(--text-muted);">Description not available in old format.</span>
                </div>`;
        }

        const applicantHtml = record.Applicant && record.Applicant.name
            ? `${record.Applicant.name}<br><small style="color: var(--text-muted);">${record.Applicant.address || ''}</small>` 
            : (record['Applicant Name'] || 'N/A');

        const repHtml = record.Representative && record.Representative.name
            ? `${record.Representative.name}<br><small style="color: var(--text-muted);">${record.Representative.address || ''}</small>` 
            : 'N/A';
            
        const markName = record['Mark:'] || record['Trademark Name'] || 'N/A';
        const statusValue = record['Status:'] || record['Status'] || 'Unknown';

        contentDiv.innerHTML = `
            <div class="detail-header">
                ${logoHtml}
                <div>
                    <h2>${markName}</h2>
                    <p style="margin-bottom: 4px;"><strong>App Number:</strong> ${record['Application Number']}</p>
                    <p><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">${statusValue}</span></p>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Application Type:</div>
                <div class="detail-value">${record['Application Type:'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Filing Date:</div>
                <div class="detail-value">${record['Filing Date:'] || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Registration Number:</div>
                <div class="detail-value">${record['Registration Number:'] || 'N/A'}</div>
            </div>
            
            <hr class="divider">

            <h3>Entities</h3>
            <div class="detail-row">
                <div class="detail-label">Applicant:</div>
                <div class="detail-value">${applicantHtml}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Representative:</div>
                <div class="detail-value">${repHtml}</div>
            </div>

            <hr class="divider">
            
            <h3>Classes</h3>
            ${classesHtml || '<p style="color: var(--text-muted);">No class data found.</p>'}
        `;
    }

    // FIXED: LOGOUT FUNCTIONALITY FOR DETAIL PAGE using localStorage
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isAuth');
            window.location.href = 'login.html';
        });
    }
});