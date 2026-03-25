const API_URL = 'http://127.0.0.1:3000/api';

// App state
let currentUser = null;
let currentToken = localStorage.getItem('token');
let currentFilter = 'all';
let currentPage = 0;
const limit = 5;
let allFiles = [];

// Token refresh state
let isRefreshing = false;
let refreshSubscribers = [];

// DOM elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const uploadSection = document.getElementById('upload-section');
const filesSection = document.getElementById('files-section');
const logoutSection = document.getElementById('logout-section');
const filesList = document.getElementById('files-list');
const paginationDiv = document.getElementById('pagination');
const filterBtns = document.querySelectorAll('.filter-btn');

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', () => {
    if (currentToken) {
        console.log('🔑 Token found in localStorage');
        showAppInterface();
        loadAllFiles();
    }
});

// Auth tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${btn.dataset.tab}-form`).classList.add('active');
    });
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        currentPage = 0;
        displayCurrentPage();
    });
});

// Universal fetch with auto token refresh
async function fetchWithAuth(url, options = {}) {
    console.log('📡 Request to:', url);
    console.log('🔑 Token:', currentToken ? currentToken.substring(0, 20) + '...' : 'missing');

    const headers = {
        ...options.headers,
        ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
    };

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });

    console.log('📨 Response status:', response.status);

    if (response.status === 401 && !url.includes('/auth/')) {
        console.log('⚠️ Received 401, refreshing token...');

        const newToken = await refreshToken();
        if (newToken) {
            console.log('✅ Token refreshed, retrying request');
            currentToken = newToken;
            localStorage.setItem('token', currentToken);

            const newHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${currentToken}`
            };
            response = await fetch(url, {
                ...options,
                headers: newHeaders,
                credentials: 'include'
            });
            console.log('📨 Retried request status:', response.status);
        } else {
            console.log('❌ Token refresh failed, logging out');
            await logout();
            throw new Error('Session expired');
        }
    }

    return response;
}

async function refreshToken() {
    console.log('🔄 refreshToken() called');

    if (isRefreshing) {
        console.log('⏳ Already refreshing, adding to queue');
        return new Promise(resolve => {
            refreshSubscribers.push(resolve);
        });
    }

    isRefreshing = true;

    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        console.log('📨 /refresh response status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        console.log('✅ Token refreshed successfully');

        const newToken = data.data.accessToken;

        refreshSubscribers.forEach(cb => cb(newToken));
        refreshSubscribers = [];

        return newToken;
    } catch (err) {
        console.error('❌ Token refresh error:', err);
        refreshSubscribers = [];
        return null;
    } finally {
        isRefreshing = false;
    }
}

// Registration
document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
            alert('Registration successful! Please log in.');
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert('Error: ' + data.error.message);
        }
    } catch (err) {
        alert('Connection error');
    }
});

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
            currentToken = data.data.accessToken;
            currentUser = data.data.user;

            localStorage.setItem('token', currentToken);
            console.log('✅ Login successful, token saved');

            showAppInterface();
            loadAllFiles();
        } else {
            alert('Error: ' + data.error.message);
        }
    } catch (err) {
        alert('Connection error');
    }
});

// Logout
async function logout() {
    console.log('🚪 Logging out');

    try {
        // Clear client-side first
        localStorage.removeItem('token');
        currentToken = null;
        currentUser = null;

        // Hide interface
        uploadSection.classList.add('hidden');
        filesSection.classList.add('hidden');
        logoutSection.classList.add('hidden');
        document.querySelector('.auth-section').classList.remove('hidden');

        // Notify server
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        console.log('✅ Logout successful');
    } catch (err) {
        console.error('❌ Logout error:', err);
    }
}

document.getElementById('logout-btn').addEventListener('click', logout);

function showAppInterface() {
    uploadSection.classList.remove('hidden');
    filesSection.classList.remove('hidden');
    logoutSection.classList.remove('hidden');
    document.querySelector('.auth-section').classList.add('hidden');
}

// File upload
document.getElementById('upload-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files[0]) {
        alert('Please select a file');
        return;
    }

    const storageType = document.querySelector('input[name="storage"]:checked').value;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const progress = document.getElementById('upload-progress');
    progress.classList.remove('hidden');

    try {
        const res = await fetchWithAuth(`${API_URL}/files?storage=${storageType}`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        progress.classList.add('hidden');

        if (data.success) {
            fileInput.value = '';
            loadAllFiles();
        } else {
            alert('Error: ' + data.error.message);
        }
    } catch (err) {
        progress.classList.add('hidden');
        alert('Upload error');
    }
});

// Load all files from server
async function loadAllFiles() {
    try {
        const res = await fetchWithAuth(`${API_URL}/files?limit=1000&offset=0`);

        const data = await res.json();
        if (data.success) {
            allFiles = data.files;
            displayCurrentPage();
        } else {
            filesList.innerHTML = 'Error loading file list';
        }
    } catch (err) {
        filesList.innerHTML = 'Connection error';
    }
}

// Display current page with filter
function displayCurrentPage() {
    let filteredFiles = allFiles;
    if (currentFilter === 'local') {
        filteredFiles = allFiles.filter(f => f.storageType === 'localStorage');
    } else if (currentFilter === 's3') {
        filteredFiles = allFiles.filter(f => f.storageType === 's3Storage');
    }

    const start = currentPage * limit;
    const end = start + limit;
    const pageFiles = filteredFiles.slice(start, end);

    displayFiles(pageFiles);
    displayPagination(filteredFiles.length);
}

function displayFiles(files) {
    if (files.length === 0) {
        filesList.innerHTML = '<p class="empty-message">No files yet</p>';
        return;
    }

    let html = '<div class="files-grid">';
    files.forEach(file => {
        const type = file.storageType === 's3Storage' ? 's3' : 'local';
        const icon = type === 'local' ? '📁' : '☁️';
        const typeLabel = type === 'local' ? 'Local' : 'Cloud';

        html += `
            <div class="file-card" data-uuid="${file.uuid}">
                <div class="file-icon">${icon}</div>
                <div class="file-details">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
                        <span class="file-type-badge">${typeLabel}</span>
                        <span class="file-date">${new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="view-btn" onclick="viewFile('${file.uuid}')" title="View">👁️</button>
                    <button class="download-btn" onclick="downloadFile('${file.uuid}', '${file.name}')" title="Download">⬇️</button>
                    <button class="delete-btn" onclick="deleteFile('${file.uuid}')" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    filesList.innerHTML = html;
}

function displayPagination(totalFiltered) {
    const totalPages = Math.ceil(totalFiltered / limit);
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    const startRecord = currentPage * limit + 1;
    const endRecord = Math.min((currentPage + 1) * limit, totalFiltered);
    html += `<div class="pagination-info">📄 ${startRecord}-${endRecord} of ${totalFiltered}</div>`;

    html += '<div class="pagination-controls">';

    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(0)" title="First page">⏮️</button>`;
    }

    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">◀ Prev</button>`;
    }

    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    if (startPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(0)">1</button>`;
        if (startPage > 1) html += '<span class="page-dots">...</span>';
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active" disabled>${i + 1}</button>`;
        } else {
            html += `<button class="page-btn" onclick="goToPage(${i})">${i + 1}</button>`;
        }
    }

    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) html += '<span class="page-dots">...</span>';
        html += `<button class="page-btn" onclick="goToPage(${totalPages - 1})">${totalPages}</button>`;
    }

    if (currentPage < totalPages - 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Next ▶</button>`;
    }

    if (currentPage < totalPages - 1) {
        html += `<button class="page-btn" onclick="goToPage(${totalPages - 1})" title="Last page">⏭️</button>`;
    }

    html += '</div>';
    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayCurrentPage();
}

// Global functions with fetchWithAuth
window.viewFile = async (uuid) => {
    try {
        const res = await fetchWithAuth(`${API_URL}/files/${uuid}`, {
            method: 'GET'
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (err) {
        console.error('View error:', err);
        alert('Could not open file');
    }
};

window.downloadFile = async (uuid, name) => {
    try {
        const res = await fetchWithAuth(`${API_URL}/files/${uuid}/download`, {
            method: 'GET'
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download error:', err);
        alert('Could not download file');
    }
};

window.deleteFile = async (uuid) => {
    if (!confirm('Delete file?')) return;

    try {
        const res = await fetchWithAuth(`${API_URL}/files/${uuid}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (data.success) {
            loadAllFiles();
        } else {
            alert('Error: ' + data.error.message);
        }
    } catch (err) {
        alert('Delete error');
    }
};