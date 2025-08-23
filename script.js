const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const noAccountModal = document.getElementById('noAccountModal');
const modalOkBtn = document.getElementById('modalOkBtn');

// GitHub configuration - REPLACE THESE WITH YOUR VALUES
const GITHUB_USERNAME = 'zura-stpflo';
const REPO_NAME = 'Auth-DigitalNews';
const FILE_NAME = 'auth-username.json';
const GITHUB_TOKEN = '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';
const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_NAME}`;

// Toggle between login and register forms
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Modal OK button handler
modalOkBtn.addEventListener('click', () => {
    noAccountModal.style.display = 'none';
    container.classList.add('active'); // Switch to register form
});

// Handle registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    try {
        // Get existing users
        const response = await fetch(BASE_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let users = [];
        let sha = null;
        
        if (response.ok) {
            const data = await response.json();
            sha = data.sha;
            users = JSON.parse(atob(data.content));
        }

        // Check if username already exists
        if (users.some(user => user.username === username)) {
            registerMessage.textContent = 'Username already exists!';
            registerMessage.className = 'message error';
            return;
        }

        // Add new user
        users.push({ username, password });

        // Update file on GitHub
        const updateResponse = await fetch(BASE_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new user: ${username}`,
                content: btoa(JSON.stringify(users)),
                sha: sha
            })
        });

        if (updateResponse.ok) {
            registerMessage.textContent = 'Registration successful! Please login.';
            registerMessage.className = 'message success';
            registerForm.reset();
            container.classList.remove('active');
        } else {
            registerMessage.textContent = 'Registration failed. Please try again.';
            registerMessage.className = 'message error';
        }
    } catch (error) {
        console.error('Error:', error);
        registerMessage.textContent = 'An error occurred. Please try again.';
        registerMessage.className = 'message error';
    }
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Get users from GitHub
        const response = await fetch(BASE_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 404) {
            // File doesn't exist (no users registered yet)
            noAccountModal.style.display = 'flex';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        const users = JSON.parse(atob(data.content));

        // Check credentials
        const user = users.find(user => user.username === username && user.password === password);
        
        if (user) {
            // Store username in sessionStorage and redirect
            sessionStorage.setItem('username', username);
            window.location.href = '/dashboard';
        } else {
            noAccountModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error:', error);
        loginMessage.textContent = 'An error occurred. Please try again.';
        loginMessage.className = 'message error';
    }
});

// Check if user is already logged in
if (sessionStorage.getItem('username')) {
    window.location.href = '/dashboard';

}
