// ======================================================
// DEPRECATED: This file is replaced by the new system
// ======================================================
// 
// New Admin Panel: frontend/admin/index.html
// New Public Forms: frontend/public/form.html
// New Backend API: backend/
//
// Please use the new system for better functionality:
// - Multiple form management
// - Database storage (PostgreSQL)
// - Response tracking
// - Better UI/UX
//
// To use the new system:
// 1. Follow instructions in README.md
// 2. Set up PostgreSQL database
// 3. Run backend server: python backend/run.py
// 4. Open frontend/admin/index.html for admin panel
// ======================================================

const creatorOptions = {
    autoSaveEnabled: true
};

const defaultJson = {
    pages: [{
        name: "Name",
        elements: [{
            name: "FirstName",
            title: "Enter your first name:",
            type: "text"
        }, {
            name: "LastName",
            title: "Enter your last name:",
            type: "text"
        }]
    }]
};

const creator = new SurveyCreator.SurveyCreator(creatorOptions);
creator.text = window.localStorage.getItem("survey-json") || JSON.stringify(defaultJson);
creator.saveSurveyFunc = (saveNo, callback) => { 
    window.localStorage.setItem("survey-json", creator.text);
    callback(saveNo, true);
    
    // Display migration notice
    if (saveNo === 1) {
        alert("📢 MIGRATION NOTICE:\n\nThis is the old form builder that only saves to localStorage.\n\nFor a complete form management system with:\n✅ Database storage\n✅ Multiple forms\n✅ Response collection\n✅ Analytics\n\nPlease use the new system:\n1. Check README.md for setup\n2. Open frontend/admin/index.html");
    }
};

// creator.onUploadFile.add((_, options) => {
//     const formData = new FormData();
//     options.files.forEach(file => {
//         formData.append(file.name, file);
//     });
//     fetch("https://example.com/uploadFiles", {
//         method: "post",
//         body: formData
//     }).then(response => response.json())
//         .then(result => {
//             options.callback(
//                 "success",
//                 // A link to the uploaded file
//                 "https://example.com/files?name=" + result[options.files[0].name]
//             );
//         })
//         .catch(error => {
//             options.callback('error');
//         });
// });

document.addEventListener("DOMContentLoaded", function() {
    creator.render(document.getElementById("surveyCreator"));
});

// function saveSurveyJson(url, json, saveNo, callback) {
//   fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     body: JSON.stringify(json)
//   })
//   .then(response => {
//     if (response.ok) {
//       callback(saveNo, true);
//     } else {
//       callback(saveNo, false);
//     }
//   })
//   .catch(error => {
//     callback(saveNo, false);
//   });
// }