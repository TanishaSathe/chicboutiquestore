// User Authentication System
let users = [];
let currentUser = null;

// Initialize with sample admin user
function initializeAuth() {
    const adminUser = {
        id: 1,
        name: 'Admin',
        email: 'admin@chicboutique.com',
        password: 'admin123',
        phone: '+91 98765 43210',
        isAdmin: true,
        createdAt: new Date().toISOString()
    };
    
    // Check if admin exists
    if (!users.find(u => u.email === adminUser.email)) {
        users.push(adminUser);
        console.log('Admin user created:', adminUser.email);
    }
}

// User Registration
function registerUser(userData) {
    const { name, email, password, phone } = userData;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In production, this should be hashed
        phone,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsersToStorage();
    
    return { success: true, user: newUser };
}

// User Login
function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveCurrentUserToStorage();
        return { success: true, user };
    }
    
    return { success: false, message: 'Invalid email or password' };
}

// User Logout
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
}

// Get Current User
function getCurrentUser() {
    if (!currentUser) {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    }
    return currentUser;
}

// Save users to localStorage
function saveUsersToStorage() {
    localStorage.setItem('noireUsers', JSON.stringify(users));
}

// Load users from localStorage
function loadUsersFromStorage() {
    const stored = localStorage.getItem('noireUsers');
    if (stored) {
        users = JSON.parse(stored);
    }
}

// Save current user to localStorage
function saveCurrentUserToStorage() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const user = getCurrentUser();
    if (user) {
        // Update navigation
        const navMenu = document.querySelector('.nav-menu');
        const userSection = document.createElement('li');
        userSection.className = 'nav-item user-section';
        userSection.innerHTML = `
            <a href="#account" class="nav-link">
                <i class="fas fa-user"></i> ${user.name}
            </a>
            <button class="logout-btn" onclick="logoutUser()">Logout</button>
        `;
        
        // Remove existing user section if any
        const existingUserSection = document.querySelector('.user-section');
        if (existingUserSection) {
            existingUserSection.remove();
        }
        
        navMenu.appendChild(userSection);
        
        // Update cart to show user info
        showNotification(`Welcome back, ${user.name}!`);
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userSection = document.querySelector('.user-section');
    if (userSection) {
        userSection.remove();
    }
    showNotification('You have been logged out');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', function() {
    loadUsersFromStorage();
    initializeAuth();
    
    const user = getCurrentUser();
    if (user) {
        updateUIForLoggedInUser();
    }
});

// Export functions for global access
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
