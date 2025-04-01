// Handle theme switching
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('taskick_current_user'));
    
    if (currentUser) {
        // Apply saved theme
        document.body.classList.add(currentUser.theme || 'light');
        
        // Check for auto dark mode
        if (currentUser.autoDarkMode) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.remove(currentUser.theme);
                document.body.classList.add('dark');
            }
        }
    }
});

// Save theme preference
function saveThemePreference(theme, autoDarkMode) {
    const currentUser = JSON.parse(localStorage.getItem('taskick_current_user'));
    if (currentUser) {
        currentUser.theme = theme;
        currentUser.autoDarkMode = autoDarkMode;
        
        // Update user in local storage
        localStorage.setItem('taskick_current_user', JSON.stringify(currentUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('taskick_users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('taskick_users', JSON.stringify(users));
        }
    }
}