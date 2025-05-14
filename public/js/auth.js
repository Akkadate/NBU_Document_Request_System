document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessageDiv = document.getElementById('loginMessage');
    const registerMessageDiv = document.getElementById('registerMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentId = this.studentId.value;
            const password = this.password.value;

            // SIMULATE API CALL for login
            // In a real app, this would be an API call to the backend.
            // For now, we check against users stored in localStorage.
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.studentId === studentId && u.password === password); // Plain text password for demo ONLY

            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify(user)); // Simulate session
                if (loginMessageDiv) loginMessageDiv.textContent = '';
                window.location.href = 'index.html';
            } else {
                if (loginMessageDiv) {
                     // Get translated message
                    const key = 'login_failed'; // Add this key to your locale files
                    const msg = window.translations && window.translations[key] ? window.translations[key] : 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง';
                    loginMessageDiv.textContent = msg;
                    loginMessageDiv.style.color = 'red';
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentId = this.studentId.value;
            const password = this.password.value;
            const confirmPassword = this.confirmPassword.value;
            const fullName = this.fullName.value;
            const email = this.email.value;
            const phone = this.phone.value;
            const faculty = this.faculty.value;

            if (password !== confirmPassword) {
                if (registerMessageDiv){
                    const key = 'password_mismatch'; // Add this key to your locale files
                    const msg = window.translations && window.translations[key] ? window.translations[key] : 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
                    registerMessageDiv.textContent = msg;
                    registerMessageDiv.style.color = 'red';
                }
                return;
            }

            // SIMULATE API CALL for registration
            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.studentId === studentId)) {
                 if (registerMessageDiv){
                    const key = 'student_id_exists'; // Add this key to your locale files
                    const msg = window.translations && window.translations[key] ? window.translations[key] : 'รหัสนักศึกษานี้มีในระบบแล้ว';
                    registerMessageDiv.textContent = msg;
                    registerMessageDiv.style.color = 'red';
                 }
                return;
            }

            const newUser = { studentId, password, fullName, email, phone, faculty }; // Store password in plain text for demo ONLY. NEVER DO THIS IN PRODUCTION.
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            if (registerMessageDiv){
                const key = 'registration_successful'; // Add this key to your locale files
                const msg = window.translations && window.translations[key] ? window.translations[key] : 'ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ';
                registerMessageDiv.textContent = msg;
                registerMessageDiv.style.color = 'green';
            }
            // Optionally redirect to login page after a short delay
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        });
    }
});
