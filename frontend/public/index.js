// API URL
const API_URL = 'http://aminh.digifact.vn:5000/api';

// Load danh sách forms khi trang load
document.addEventListener('DOMContentLoaded', function() {
    loadForms();
});

async function loadForms() {
    try {
        const response = await fetch(`${API_URL}/forms/?public=true`);
        const data = await response.json();
        
        document.getElementById('loading').style.display = 'none';
        
        if (data.success && data.data.forms.length > 0) {
            displayForms(data.data.forms);
        } else {
            document.getElementById('no-forms').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading forms:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('no-forms').style.display = 'block';
    }
}

function displayForms(forms) {
    const container = document.getElementById('forms-container');
    container.innerHTML = '';
    
    // Chỉ hiển thị forms active
    const activeForms = forms.filter(form => form.is_active);
    
    if (activeForms.length === 0) {
        document.getElementById('no-forms').style.display = 'block';
        return;
    }
    
    activeForms.forEach(form => {
        const formCard = createFormCard(form);
        container.appendChild(formCard);
    });
    
    document.getElementById('forms-container').style.display = 'flex';
}

function createFormCard(form) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    // Tính số câu hỏi từ form JSON
    const questionCount = countQuestions(form.json_content);
    
    // Format ngày tạo
    const createdDate = new Date(form.created_at).toLocaleDateString('vi-VN');
    
    col.innerHTML = `
        <div class="form-card" onclick="openForm(${form.id})">
            <div class="form-title">
                <i class="fas fa-file-alt"></i>
                ${escapeHtml(form.name)}
            </div>
            <div class="form-description">
                ${escapeHtml(form.description || 'Không có mô tả')}
            </div>
            <div class="form-meta">
                <div>
                    <small><i class="fas fa-calendar"></i> ${createdDate}</small><br>
                    <small><i class="fas fa-question-circle"></i> ${questionCount} câu hỏi</small>
                </div>
                <div>
                    <span class="response-count">
                        <i class="fas fa-chart-bar"></i> ${form.response_count || 0} phản hồi
                    </span>
                </div>
            </div>
            <div class="text-center mt-3">
                <button class="btn btn-start">
                    <i class="fas fa-play"></i> Bắt đầu điền
                </button>
            </div>
        </div>
    `;
    
    return col;
}

function countQuestions(jsonContent) {
    try {
        if (!jsonContent || !jsonContent.pages) return 0;
        
        let count = 0;
        jsonContent.pages.forEach(page => {
            if (page.elements) {
                count += page.elements.length;
            }
        });
        return count;
    } catch (error) {
        return 0;
    }
}

function openForm(formId) {
    // Chuyển đến trang điền form với ID cụ thể
    window.location.href = `form.html?id=${formId}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Thêm hiệu ứng loading cho cards
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('forms-container').style.display = 'none';
    document.getElementById('no-forms').style.display = 'none';
}
