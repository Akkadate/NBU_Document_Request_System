// ... (ส่วนอื่น ๆ เช่น language switcher, populate dropdowns เหมือนเดิม) ...

document.addEventListener('DOMContentLoaded', () => {
    // ... (โค้ดโหลด config, ภาษา) ...

    // User info display / logout
    const userInfoDiv = document.getElementById('user-info');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const authToken = localStorage.getItem('authToken');

    if (loggedInUser && authToken && userInfoDiv) {
        userInfoDiv.innerHTML = `
            <span data-translate="welcome_user">ยินดีต้อนรับ, ${loggedInUser.fullName} (${loggedInUser.studentId})</span> |
            <button id="logoutButton" class="btn btn-secondary btn-sm" data-translate="logout_button">ออกจากระบบ</button>
        `;
        // Translate after inserting
        if (window.applyTranslations) window.applyTranslations(); // if applyTranslations is global

        document.getElementById('logoutButton').addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('authToken');
            // Potentially call a /api/auth/logout endpoint on backend if you implement server-side token invalidation
            window.location.href = 'login.html';
        });
    } else if (document.body.id !== 'login-page' && document.body.id !== 'register-page' && (!loggedInUser || !authToken)) {
        // If not on login/register page and not logged in (no token or user info), redirect to login
        // Check if the current page requires authentication before redirecting
        const authRequiredPages = ['dashboard-page', 'request-doc-page', 'payment-page', 'status-page'];
        if (authRequiredPages.includes(document.body.id)) {
            window.location.href = 'login.html';
        }
    }
     // Ensure translations are applied if not already done by this point
     if (window.fetchTranslations && !window.translationsLoaded) { // Add a flag to prevent multiple loads
        const currentLang = localStorage.getItem('language') || 'th';
        window.fetchTranslations(currentLang).then(() => { window.translationsLoaded = true; });
    }
});

// Make sure applyTranslations can be called if needed after dynamic content update
// Consider making fetchTranslations and applyTranslations globally accessible or part of a shared module
// For simplicity, if they are in the global scope from main.js loading:
// window.applyTranslations = applyTranslations;
// window.fetchTranslations = fetchTranslations;

    function applyTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                // Handle placeholders like {price}
                let translatedText = translations[key];
                const placeholders = element.dataset;
                for (const placeholderKey in placeholders) {
                    if (placeholderKey !== 'translate') { // exclude data-translate itself
                        const regex = new RegExp(`{${placeholderKey}}`, 'g');
                        translatedText = translatedText.replace(regex, placeholders[placeholderKey]);
                    }
                }
                // Check if it's an input placeholder
                if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                    element.placeholder = translatedText;
                } else if (element.tagName === 'OPTION' && element.value === "") { // For default select option
                     element.textContent = translatedText;
                }
                else {
                    element.innerHTML = translatedText; // Use innerHTML to support simple HTML in translations
                }
            }
        });
        // Update page title if a specific element for it exists
        const pageTitleElement = document.querySelector('title');
        if (pageTitleElement && translations[`${document.body.id}_page_title`]) {
            pageTitleElement.textContent = `${translations[`${document.body.id}_page_title`]} - ${translations['university_name']}`;
        } else if (pageTitleElement && translations['system_name']) {
            pageTitleElement.textContent = `${translations['system_name']} - ${translations['university_name']}`;
        }

        // Update faculty dropdown options
        populateFacultyDropdown();
        // Update document type dropdown options
        populateDocumentTypeDropdown();

        // Update active language button
        document.querySelectorAll('.language-switcher button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            }
        });
    }

    window.changeLanguage = function(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);
        fetchTranslations(lang);
    }

    // Populate faculty dropdown
    function populateFacultyDropdown() {
        const facultySelect = document.getElementById('faculty');
        if (facultySelect) {
            const currentFacultyValue = facultySelect.value; // Preserve selected value if any
            facultySelect.innerHTML = `<option value="" data-translate="select_faculty"></option>`; // Default option
            APP_CONFIG.FACULTIES.forEach(faculty => {
                const option = document.createElement('option');
                option.value = faculty.id;
                // The text will be set by the translation logic using the faculty.name_key if you add it to your JSON
                // For now, directly use name based on current language
                option.textContent = faculty[`name_${currentLang}`] || faculty.name_en;
                facultySelect.appendChild(option);
            });
            if (currentFacultyValue) facultySelect.value = currentFacultyValue;
            // Re-apply translation for the default option
            const defaultOpt = facultySelect.querySelector('option[value=""]');
            if (defaultOpt && translations[defaultOpt.dataset.translate]) {
                defaultOpt.textContent = translations[defaultOpt.dataset.translate];
            }
        }
    }

    // Populate document type dropdown
    function populateDocumentTypeDropdown() {
        const docTypeSelect = document.getElementById('documentType');
        if (docTypeSelect) {
            const currentDocTypeValue = docTypeSelect.value;
            docTypeSelect.innerHTML = `<option value="" data-translate="select_document_type"></option>`; // Default option
            APP_CONFIG.DOCUMENT_TYPES.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.dataset.price = doc.price; // Store price for calculations
                option.textContent = translations[doc.name_key] || doc.name_key.replace('doc_', '').replace('_', ' ').toUpperCase(); // Fallback text
                docTypeSelect.appendChild(option);
            });
            if (currentDocTypeValue) docTypeSelect.value = currentDocTypeValue;

             const defaultOpt = docTypeSelect.querySelector('option[value=""]');
            if (defaultOpt && translations[defaultOpt.dataset.translate]) {
                defaultOpt.textContent = translations[defaultOpt.dataset.translate];
            }
        }
    }


    // Initialize language and translations
    fetchTranslations(currentLang);

    // Add language switcher buttons dynamically if a container exists
    const langSwitcherContainer = document.querySelector('.language-switcher');
    if (langSwitcherContainer) {
        const langLabel = document.createElement('span');
        langLabel.setAttribute('data-translate', 'language_switcher');
        langLabel.textContent = 'ภาษา: '; // Default text before translation
        langSwitcherContainer.appendChild(langLabel);

        ['th', 'en', 'zh'].forEach(lang => {
            const button = document.createElement('button');
            button.dataset.lang = lang;
            button.setAttribute('data-translate', `lang_${lang}`);
            button.textContent = lang.toUpperCase(); // Default text
            button.onclick = () => changeLanguage(lang);
            langSwitcherContainer.appendChild(button);
        });
    }

    // User info display / logout
    const userInfoDiv = document.getElementById('user-info');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Simulate session

    if (loggedInUser && userInfoDiv) {
        userInfoDiv.innerHTML = `
            <span data-translate="welcome_user">ยินดีต้อนรับ, ${loggedInUser.fullName} (${loggedInUser.studentId})</span> |
            <button id="logoutButton" class="btn btn-secondary btn-sm" data-translate="logout_button">ออกจากระบบ</button>
        `;
        document.getElementById('logoutButton').addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    } else if (document.body.id !== 'login-page' && document.body.id !== 'register-page' && !loggedInUser) {
        // If not on login/register page and not logged in, redirect to login
        // window.location.href = 'login.html';
    }
});
