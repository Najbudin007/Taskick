// Handle login and registration
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Check if we're on the register page
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
});

function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple validation
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    // Check if user exists in local storage
    const users = JSON.parse(localStorage.getItem('taskick_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store current user in session
        localStorage.setItem('taskick_current_user', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password');
    }
}

function handleRegister() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Simple validation
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('taskick_users')) || [];
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        settings: {
            language: 'en',
            dateFormat: 'mm/dd/yyyy, --:-- --',
            reminderPreference: 'email',
            notifications: ['completed', 'incomplete', 'voice', 'push']
        },
        theme: 'light',
        autoDarkMode: false,
        humorLevel: 50
    };

    // Add user to local storage
    users.push(newUser);
    localStorage.setItem('taskick_users', JSON.stringify(users));

    // Set as current user
    localStorage.setItem('taskick_current_user', JSON.stringify(newUser));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}