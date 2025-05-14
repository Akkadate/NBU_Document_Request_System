document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessageDiv = document.getElementById('loginMessage');
    const registerMessageDiv = document.getElementById('registerMessage');

    // Helper to display messages
    function showMessage(div, text, isError = true) {
        if (div) {
            div.textContent = text;
            div.style.color = isError ? 'red' : 'green';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const studentId = this.studentId.value;
            const password = this.password.value;

            try {
                const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId, password })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('loggedInUser', JSON.stringify(data.user)); // Store user details
                showMessage(loginMessageDiv, 'Login successful! Redirecting...', false);
                window.location.href = 'index.html';

            } catch (error) {
                showMessage(loginMessageDiv, error.message);
                console.error('Login error:', error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const studentId = this.studentId.value;
            const password = this.password.value;
            const confirmPassword = this.confirmPassword.value;
            const fullName = this.fullName.value;
            const email = this.email.value;
            const phone = this.phone.value;
            const faculty = this.faculty.value; // This is the ID like "eng", "sci"

            if (password !== confirmPassword) {
                showMessage(registerMessageDiv, window.translations?.['password_mismatch'] || 'Passwords do not match.');
                return;
            }

            try {
                const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId, password, fullName, email, phone, faculty })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                showMessage(registerMessageDiv, data.message || 'Registration successful! Please log in.', false);
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);

            } catch (error) {
                showMessage(registerMessageDiv, error.message);
                console.error('Registration error:', error);
            }
        });
    }
});
