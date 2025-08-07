const API_BASE_URL = 'https://aminh.digifact.vn/api';

let currentForm = null;
let surveyCreator = null;
let authToken = null;
let currentUser = null;

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

// Kiểm tra authentication
function checkAuthentication() {
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        redirectToLogin();
        return;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        
        // Verify token with server
        fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Token valid, proceed with app initialization
                currentUser = result.data.user;
                initializeApp();
            } else {
                // Token invalid
                clearAuthData();
                redirectToLogin();
            }
        })
        .catch(error => {
            console.error('Auth verification error:', error);
            clearAuthData();
            redirectToLogin();
        });
    } catch (error) {
        clearAuthData();
        redirectToLogin();
    }
}

// Initialize app after successful authentication
function initializeApp() {
    loadForms();
    initSurveyCreator();
    setupUserInterface();
}

// Setup user interface elements
function setupUserInterface() {
    // Add user info and logout button to the interface
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info mb-3 p-3 bg-light rounded';
        userInfo.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <i class="fas fa-user-circle me-2 fs-4 text-primary"></i>
                <div>
                    <div class="fw-bold">${currentUser.username}</div>
                    <small class="text-muted">${currentUser.email}</small>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" onclick="changePassword()">
                    <i class="fas fa-key me-1"></i>Đổi MK
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="logout()">
                    <i class="fas fa-sign-out-alt me-1"></i>Đăng xuất
                </button>
            </div>
        `;
        sidebar.insertBefore(userInfo, sidebar.firstChild);
    }
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        // Call logout API
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(() => {
            clearAuthData();
            redirectToLogin();
        })
        .catch(() => {
            // Even if API call fails, clear local data and redirect
            clearAuthData();
            redirectToLogin();
        });
    }
}

// Get authentication headers for API calls
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
}

// Handle API errors (including authentication errors)
function handleApiError(response) {
    if (response.status === 401) {
        // Unauthorized - token expired or invalid
        clearAuthData();
        redirectToLogin();
        return true;
    }
    return false;
}

// Khởi tạo Survey Creator
function initSurveyCreator() {
    const creatorOptions = {
        autoSaveEnabled: false,
        showLogicTab: true,
        showTranslationTab: true
    };
    
    surveyCreator = new SurveyCreator.SurveyCreator(creatorOptions);
}

// Load danh sách forms
async function loadForms() {
    try {
        const response = await fetch(`${API_BASE_URL}/forms/`, {
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            displayForms(result.data.forms);
        } else {
            showAlert('Error loading forms: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Hiển thị danh sách forms
function displayForms(forms) {
    const formsList = document.getElementById('formsList');
    formsList.innerHTML = '';
    
    forms.forEach(form => {
        const formItem = document.createElement('div');
        formItem.className = 'form-item';
        formItem.innerHTML = `
            <h6>${form.name}</h6>
            <p class="text-muted small mb-2">${form.description || 'No description'}</p>
            <p class="text-muted small mb-2">Responses: ${form.response_count}</p>
            <p class="text-muted small mb-3">Created: ${new Date(form.created_at).toLocaleDateString()}</p>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" onclick="editForm(${form.id})">Edit</button>
                <button class="btn btn-sm btn-info" onclick="viewFormResponses(${form.id})">Responses</button>
                <button class="btn btn-sm btn-success" onclick="toggleFormStatus(${form.id}, ${!form.is_active})">${form.is_active ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteForm(${form.id})">Delete</button>
            </div>
        `;
        formsList.appendChild(formItem);
    });
}

// Hiển thị modal tạo form
function showCreateForm() {
    const modal = new bootstrap.Modal(document.getElementById('createFormModal'));
    modal.show();
}

// Tạo form mới
async function createForm() {
    const name = document.getElementById('formName').value;
    const description = document.getElementById('formDescription').value;
    
    if (!name) {
        showAlert('Form name is required', 'warning');
        return;
    }
    
    const defaultJson = {
        title: name,
        pages: [{
            name: "page1",
            elements: [{
                type: "text",
                name: "question1",
                title: "Sample Question"
            }]
        }]
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/forms/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: name,
                description: description,
                json_content: defaultJson
            })
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('createFormModal')).hide();
            document.getElementById('createFormForm').reset();
            showAlert('Form created successfully!', 'success');
            loadForms();
            editForm(result.data.id);
        } else {
            showAlert('Error creating form: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Edit form
async function editForm(formId) {
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            currentForm = result.data;
            showFormEditor();
            
            // Load form into creator
            surveyCreator.text = JSON.stringify(currentForm.json_content);
            surveyCreator.render(document.getElementById('surveyCreator'));
            
            document.getElementById('currentFormTitle').textContent = currentForm.name;
            document.getElementById('currentFormDesc').textContent = currentForm.description;
        } else {
            showAlert('Error loading form: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Hiển thị form editor
function showFormEditor() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('formEditor').style.display = 'block';
    document.getElementById('responseViewer').style.display = 'none';
}

// Lưu form hiện tại
async function saveCurrentForm() {
    if (!currentForm) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${currentForm.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                json_content: surveyCreator.JSON
            })
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Form saved successfully!', 'success');
            currentForm = result.data;
            loadForms();
        } else {
            showAlert('Error saving form: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Preview form
function previewForm() {
    if (!surveyCreator) return;
    
    const survey = new Survey.Model(surveyCreator.JSON);
    const previewDiv = document.getElementById('surveyPreview');
    previewDiv.innerHTML = '';
    
    survey.render(previewDiv);
    
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

// View responses
function viewResponses() {
    if (currentForm) {
        viewFormResponses(currentForm.id);
    }
}

// View form responses
async function viewFormResponses(formId, page = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/responses/form/${formId}?page=${page}`, {
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            displayResponses(result.data, formId);
            document.getElementById('responseFormTitle').textContent = `Responses for: ${result.data.form_info.name}`;
        } else {
            showAlert('Error loading responses: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Alias for pagination buttons
function loadFormResponses(formId, page) {
    viewFormResponses(formId, page);
}

// Display responses
function displayResponses(data, formId) {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('formEditor').style.display = 'none';
    document.getElementById('responseViewer').style.display = 'block';
    
    const table = document.getElementById('responsesTable');
    table.innerHTML = '';
    
    if (data.responses.length === 0) {
        table.innerHTML = '<p class="text-center">No responses yet.</p>';
        return;
    }
    
    // Create table
    const tableHtml = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Submitted At</th>
                        <th>IP Address</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.responses.map(response => `
                        <tr>
                            <td>${response.id}</td>
                            <td>${new Date(response.submitted_at).toLocaleString()}</td>
                            <td>${response.ip_address || 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="viewResponseDetail(${response.id})">View</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteResponse(${response.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="mt-3 d-flex justify-content-between align-items-center">
            <div>
                <strong>Total Responses: ${data.pagination.total}</strong>
                <span class="text-muted ms-2">
                    (Showing ${data.responses.length} of ${data.pagination.total} - Page ${data.pagination.page}/${data.pagination.pages})
                </span>
            </div>
            <div>
                ${data.pagination.has_prev ? `<button class="btn btn-sm btn-outline-primary me-2" onclick="loadFormResponses(${formId}, ${data.pagination.page - 1})">Previous</button>` : ''}
                ${data.pagination.has_next ? `<button class="btn btn-sm btn-outline-primary" onclick="loadFormResponses(${formId}, ${data.pagination.page + 1})">Next</button>` : ''}
            </div>
        </div>
    `;
    
    table.innerHTML = tableHtml;
}

// Back to editor
function backToEditor() {
    if (currentForm) {
        showFormEditor();
    } else {
        document.getElementById('responseViewer').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'block';
    }
}

// Export responses
async function exportResponses() {
    if (!currentForm) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/responses/form/${currentForm.id}/export`, {
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            // Download JSON file
            const dataStr = JSON.stringify(result.data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentForm.name}_responses_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showAlert('Data exported successfully!', 'success');
        } else {
            showAlert('Error exporting data: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Copy form public link
function copyFormLink() {
    if (!currentForm) return;
    
    const publicUrl = `${window.location.origin}/../public/form.html?id=${currentForm.id}`;
    
    navigator.clipboard.writeText(publicUrl).then(() => {
        showAlert('Public form link copied to clipboard!', 'success');
    }).catch(err => {
        showAlert('Error copying link: ' + err.message, 'danger');
    });
}

// Toggle form status
async function toggleFormStatus(formId, isActive) {
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                is_active: isActive
            })
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(`Form ${isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
            loadForms();
        } else {
            showAlert('Error updating form: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Delete form
async function deleteForm(formId) {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Form deleted successfully!', 'success');
            loadForms();
            
            // If this was the current form, reset the view
            if (currentForm && currentForm.id === formId) {
                currentForm = null;
                document.getElementById('formEditor').style.display = 'none';
                document.getElementById('responseViewer').style.display = 'none';
                document.getElementById('welcomeScreen').style.display = 'block';
            }
        } else {
            showAlert('Error deleting form: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// View response detail
async function viewResponseDetail(responseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/responses/${responseId}`, {
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        const result = await response.json();
        
        if (result.success) {
            alert('Response Data:\n' + JSON.stringify(result.data.response_data, null, 2));
        } else {
            showAlert('Error loading response: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Delete response
async function deleteResponse(responseId) {
    if (!confirm('Are you sure you want to delete this response?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/responses/${responseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (handleApiError(response)) return;
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Response deleted successfully!', 'success');
            if (currentForm) {
                viewFormResponses(currentForm.id);
            }
        } else {
            showAlert('Error deleting response: ' + result.error, 'danger');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'danger');
    }
}

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Change password function
function changePassword() {
    const currentPassword = prompt('Nhập mật khẩu hiện tại:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):');
    if (!newPassword || newPassword.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
    }
    
    const confirmPassword = prompt('Xác nhận mật khẩu mới:');
    if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
    }
    
    // Call change password API
    fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        })
    })
    .then(response => {
        if (handleApiError(response)) return;
        return response.json();
    })
    .then(result => {
        if (result && result.success) {
            showAlert('Đổi mật khẩu thành công!', 'success');
        } else {
            showAlert(result ? result.error : 'Lỗi đổi mật khẩu', 'danger');
        }
    })
    .catch(error => {
        showAlert('Lỗi: ' + error.message, 'danger');
    });
}

