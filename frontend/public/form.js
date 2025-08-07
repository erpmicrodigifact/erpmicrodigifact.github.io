const API_BASE_URL = 'http://aminh.digifact.vn:5000/api';

let currentFormData = null;
let survey = null;

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    
    if (!formId) {
        showError('No form ID provided in URL');
        return;
    }
    
    loadForm(formId);
});

// Load form data
async function loadForm(formId) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/forms/${formId}/publish`);
        const result = await response.json();
        
        if (result.success) {
            currentFormData = result.data;
            displayForm();
        } else {
            showError('Form not found or inactive');
        }
    } catch (error) {
        showError('Error loading form: ' + error.message);
    }
}

// Display form
function displayForm() {
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
    // Show form container
    document.getElementById('formContainer').style.display = 'block';
    
    // Set form info
    document.getElementById('formTitle').textContent = currentFormData.name;
    document.getElementById('formDescription').textContent = currentFormData.description || '';
    
    // Create and render survey
    survey = new Survey.Model(currentFormData.json_content);
    
    // Configure survey
    survey.onComplete.add(function (sender) {
        submitResponse(sender.data);
    });
    
    // Add some styling
    survey.css = {
        navigationButton: "btn btn-primary",
        navigation: {
            complete: "btn btn-success",
            prev: "btn btn-outline-secondary",
            next: "btn btn-primary",
            start: "btn btn-primary"
        }
    };
    
    // Render survey
    survey.render(document.getElementById('surveyElement'));
}

// Submit response
async function submitResponse(responseData) {
    try {
        // Show loading on submit button
        const completeButton = document.querySelector('.sv_complete_btn');
        if (completeButton) {
            completeButton.disabled = true;
            completeButton.textContent = 'Submitting...';
        }
        
        const response = await fetch(`${API_BASE_URL}/responses/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                form_id: currentFormData.id,
                response_data: responseData
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess();
        } else {
            showError('Error submitting response: ' + result.error);
            // Re-enable submit button
            if (completeButton) {
                completeButton.disabled = false;
                completeButton.textContent = 'Complete';
            }
        }
    } catch (error) {
        showError('Error submitting response: ' + error.message);
        // Re-enable submit button
        const completeButton = document.querySelector('.sv_complete_btn');
        if (completeButton) {
            completeButton.disabled = false;
            completeButton.textContent = 'Complete';
        }
    }
}

// Show loading state
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('success').style.display = 'none';
    document.getElementById('formContainer').style.display = 'none';
}

// Show error state
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('success').style.display = 'none';
    document.getElementById('formContainer').style.display = 'none';
    
    // Update error message if needed
    const errorDiv = document.getElementById('error');
    if (message) {
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
        `;
    }
}

// Show success state
function showSuccess() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('success').style.display = 'block';
    document.getElementById('formContainer').style.display = 'none';
}
