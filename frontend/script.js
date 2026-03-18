const API_URL = 'http://127.0.0.1:3000/api';

// Состояние приложения
let currentUser = null;
let currentToken = localStorage.getItem('token');
let currentFilter = 'all'; // 'all', 'local', 's3'
let currentPage = 0;
const limit = 5;           // сколько файлов показывать на одной странице
let allFiles = [];         // полный список файлов (без фильтрации)

// Элементы DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const uploadSection = document.getElementById('upload-section');
const filesSection = document.getElementById('files-section');
const logoutSection = document.getElementById('logout-section');
const filesList = document.getElementById('files-list');
const paginationDiv = document.getElementById('pagination');
const filterBtns = document.querySelectorAll('.filter-btn');

// Проверяем, есть ли уже активная сессия
if (currentToken) {
    showAppInterface();
    loadAllFiles(); // загружаем все файлы
}

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
        displayCurrentPage(); // отображаем текущую страницу с учётом фильтра
    });
});

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
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (data.success) {
            currentToken = data.data.token;
            currentUser = data.data.user;
            
            localStorage.setItem('token', currentToken);
            
            showAppInterface();
            loadAllFiles(); // загружаем все файлы
        } else {
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        alert('Ошибка соединения');
    }
});

// Выход
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    currentToken = null;
    currentUser = null;
    
    uploadSection.classList.add('hidden');
    filesSection.classList.add('hidden');
    logoutSection.classList.add('hidden');
    document.querySelector('.auth-section').classList.remove('hidden');
});

function showAppInterface() {
    uploadSection.classList.remove('hidden');
    filesSection.classList.remove('hidden');
    logoutSection.classList.remove('hidden');
    document.querySelector('.auth-section').classList.add('hidden');
}

// Загрузка файла (с выбором хранилища)
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
        const res = await fetch(`${API_URL}/files?storage=${storageType}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });
        
        const data = await res.json();
        progress.classList.add('hidden');
        
        if (data.success) {
            fileInput.value = '';
            loadAllFiles(); // перезагружаем весь список
        } else {
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        progress.classList.add('hidden');
        alert('Ошибка загрузки');
    }
});

// Загрузка всех файлов с сервера (без пагинации)
async function loadAllFiles() {
    try {
        // Запрашиваем все файлы, установив большой limit
        const res = await fetch(`${API_URL}/files?limit=1000&offset=0`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await res.json();
        if (data.success) {
            allFiles = data.files;          // сохраняем все файлы
            displayCurrentPage();            // отображаем первую страницу с текущим фильтром
            updatePaginationInfo();          // обновляем информацию о пагинации (общее количество)
        } else {
            filesList.innerHTML = 'Ошибка загрузки списка';
        }
    } catch (err) {
        filesList.innerHTML = 'Ошибка соединения';
    }
}

// Отображение текущей страницы с учётом фильтра
function displayCurrentPage() {
    // Фильтруем файлы в зависимости от currentFilter
    let filteredFiles = allFiles;
    if (currentFilter === 'local') {
        filteredFiles = allFiles.filter(f => f.storageType === 'localStorage');
    } else if (currentFilter === 's3') {
        filteredFiles = allFiles.filter(f => f.storageType === 's3Storage');
    }
    
    // Вычисляем начало и конец страницы
    const start = currentPage * limit;
    const end = start + limit;
    const pageFiles = filteredFiles.slice(start, end);
    
    // Отображаем файлы
    displayFiles(pageFiles);
    
    // Отображаем пагинацию для отфильтрованного списка
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
    
    // Информация о записях
    const startRecord = currentPage * limit + 1;
    const endRecord = Math.min((currentPage + 1) * limit, totalFiltered);
    html += `<div class="pagination-info">📄 ${startRecord}-${endRecord} из ${totalFiltered}</div>`;
    
    html += '<div class="pagination-controls">';
    
    // Первая страница
    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(0)" title="Первая страница">⏮️</button>`;
    }
    
    // Предыдущая
    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">◀ Пред.</button>`;
    }
    
    // Номера страниц (до 5 вокруг текущей)
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
    
    // Следующая
    if (currentPage < totalPages - 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">След. ▶</button>`;
    }
    
    // Последняя
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

function updatePaginationInfo() {
    // Вызывается при изменении allFiles (загрузка/удаление)
    // Просто перерисовываем текущую страницу
    displayCurrentPage();
}

// Глобальные функции
window.viewFile = (uuid) => {
    window.open(`${API_URL}/files/${uuid}`, '_blank');
};

window.downloadFile = (uuid, name) => {
    const a = document.createElement('a');
    a.href = `${API_URL}/files/${uuid}/download`;
    a.setAttribute('download', name);
    a.click();
};

window.deleteFile = async (uuid) => {
    if (!confirm('Удалить файл?')) return;
    
    try {
        const res = await fetch(`${API_URL}/files/${uuid}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await res.json();
        if (data.success) {
            loadAllFiles(); // перезагружаем весь список
        } else {
            alert('Ошибка: ' + data.error.message);
        }
    } catch (err) {
        alert('Ошибка удаления');
    }
};