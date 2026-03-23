const API_URL = 'http://127.0.0.1:3000/api';

// Состояние приложения
let currentUser = null;
let currentToken = localStorage.getItem('token');
let currentFilter = 'all';
let currentPage = 0;
const limit = 5;
let allFiles = [];

// Флаг для обновления токена
let isRefreshing = false;
let refreshSubscribers = [];

// Элементы DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const uploadSection = document.getElementById('upload-section');
const filesSection = document.getElementById('files-section');
const logoutSection = document.getElementById('logout-section');
const filesList = document.getElementById('files-list');
const paginationDiv = document.getElementById('pagination');
const filterBtns = document.querySelectorAll('.filter-btn');

// При загрузке страницы проверяем сессию
document.addEventListener('DOMContentLoaded', () => {
    if (currentToken) {
        console.log('🔑 Токен найден в localStorage');
        showAppInterface();
        loadAllFiles();
    }
});

// Переключение вкладок авторизации
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${btn.dataset.tab}-form`).classList.add('active');
    });
});

// Переключение фильтров
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        currentPage = 0;
        displayCurrentPage();
    });
});

// Универсальная функция для запросов с автоматическим обновлением токена
async function fetchWithAuth(url, options = {}) {
    console.log('📡 Запрос к:', url);
    console.log('🔑 Токен:', currentToken ? currentToken.substring(0, 20) + '...' : 'отсутствует');
    
    const headers = {
        ...options.headers,
        ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
    };
    
    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });

    console.log('📨 Статус ответа:', response.status);

    // Если токен истёк (401) и мы не на странице логина
    if (response.status === 401 && !url.includes('/auth/')) {
        console.log('⚠️ Получен 401, пробуем обновить токен...');
        
        const newToken = await refreshToken();
        if (newToken) {
            console.log('✅ Токен обновлён, повторяем запрос');
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
            console.log('📨 Повторный запрос, статус:', response.status);
        } else {
            console.log('❌ Не удалось обновить токен, выполняем logout');
            await logout();
            throw new Error('Сессия истекла');
        }
    }
    
    return response;
}

// Функция обновления токена
async function refreshToken() {
    console.log('🔄 refreshToken() вызван');
    
    if (isRefreshing) {
        console.log('⏳ Уже обновляем токен, добавляем в очередь');
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
        
        console.log('📨 Ответ от /refresh, статус:', response.status);
        
        if (!response.ok) {
            throw new Error('Не удалось обновить токен');
        }
        
        const data = await response.json();
        console.log('✅ Токен успешно обновлён');
        
        const newToken = data.data.accessToken;
        
        refreshSubscribers.forEach(cb => cb(newToken));
        refreshSubscribers = [];
        
        return newToken;
    } catch (err) {
        console.error('❌ Ошибка обновления токена:', err);
        refreshSubscribers = [];
        return null;
    } finally {
        isRefreshing = false;
    }
}

// Регистрация
document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (!email || !password) {
        alert('Заполните все поля');
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
            alert('Регистрация успешна! Теперь войдите.');
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        alert('Ошибка соединения');
    }
});

// Вход
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Заполните все поля');
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
            console.log('✅ Успешный вход, токен сохранён');
            
            showAppInterface();
            loadAllFiles();
        } else {
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        alert('Ошибка соединения');
    }
});

// Выход
async function logout() {
    console.log('🚪 Выход из системы');
    
    try {
        // Сначала очищаем на клиенте
        localStorage.removeItem('token');
        currentToken = null;
        currentUser = null;
        
        // Прячем интерфейс
        uploadSection.classList.add('hidden');
        filesSection.classList.add('hidden');
        logoutSection.classList.add('hidden');
        document.querySelector('.auth-section').classList.remove('hidden');
        
        // Потом отправляем запрос на сервер
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        console.log('✅ Выход выполнен успешно');
    } catch (err) {
        console.error('❌ Ошибка при выходе:', err);
    }
}

document.getElementById('logout-btn').addEventListener('click', logout);

function showAppInterface() {
    uploadSection.classList.remove('hidden');
    filesSection.classList.remove('hidden');
    logoutSection.classList.remove('hidden');
    document.querySelector('.auth-section').classList.add('hidden');
}

// Загрузка файла
document.getElementById('upload-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files[0]) {
        alert('Выберите файл');
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
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        progress.classList.add('hidden');
        alert('Ошибка загрузки');
    }
});

// Загрузка всех файлов
async function loadAllFiles() {
    try {
        const res = await fetchWithAuth(`${API_URL}/files?limit=1000&offset=0`);
        
        const data = await res.json();
        if (data.success) {
            allFiles = data.files;
            displayCurrentPage();
        } else {
            filesList.innerHTML = 'Ошибка загрузки списка';
        }
    } catch (err) {
        filesList.innerHTML = 'Ошибка соединения';
    }
}

// Отображение текущей страницы
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
        filesList.innerHTML = '<p class="empty-message">Файлов пока нет</p>';
        return;
    }

    let html = '<div class="files-grid">';
    files.forEach(file => {
        const type = file.storageType === 's3Storage' ? 's3' : 'local';
        const icon = type === 'local' ? '📁' : '☁️';
        const typeLabel = type === 'local' ? 'Локальный' : 'Облачный';
        
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
                    <button class="view-btn" onclick="viewFile('${file.uuid}')" title="Просмотр">👁️</button>
                    <button class="download-btn" onclick="downloadFile('${file.uuid}', '${file.name}')" title="Скачать">⬇️</button>
                    <button class="delete-btn" onclick="deleteFile('${file.uuid}')" title="Удалить">🗑️</button>
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
    html += `<div class="pagination-info">📄 ${startRecord}-${endRecord} из ${totalFiltered}</div>`;
    
    html += '<div class="pagination-controls">';
    
    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(0)" title="Первая страница">⏮️</button>`;
    }
    
    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">◀ Пред.</button>`;
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
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">След. ▶</button>`;
    }
    
    if (currentPage < totalPages - 1) {
        html += `<button class="page-btn" onclick="goToPage(${totalPages - 1})" title="Последняя страница">⏭️</button>`;
    }
    
    html += '</div>';
    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayCurrentPage();
}

// Глобальные функции с использованием fetchWithAuth
window.viewFile = async (uuid) => {
    try {
        const res = await fetchWithAuth(`${API_URL}/files/${uuid}`, {
            method: 'GET'
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (err) {
        console.error('Ошибка просмотра файла:', err);
        alert('Не удалось открыть файл');
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
        console.error('Ошибка скачивания файла:', err);
        alert('Не удалось скачать файл');
    }
};

window.deleteFile = async (uuid) => {
    if (!confirm('Удалить файл?')) return;
    
    try {
        const res = await fetchWithAuth(`${API_URL}/files/${uuid}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (data.success) {
            loadAllFiles();
        } else {
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        alert('Ошибка удаления');
    }
};