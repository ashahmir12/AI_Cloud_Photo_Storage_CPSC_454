const uploadBox = document.getElementById('upload-box');

// Create file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';

// Create remove button
const removeButton = document.createElement('button');
removeButton.textContent = 'Remove Image';
removeButton.classList.add('remove-button'); 
removeButton.style.display = 'none'; 

// Create upload button
const uploadButton = document.createElement('button');
uploadButton.textContent = 'Upload Image';
uploadButton.classList.add('upload-button'); 
uploadButton.style.display = 'none'; 

// When click upload box, trigger file input
uploadBox.addEventListener('click', () => {
  fileInput.click();
});

// When files selected
fileInput.addEventListener('change', (event) => {
  handleFiles(event.target.files);
});

// Drag & Drop
uploadBox.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadBox.classList.remove('dragover');
  handleFiles(event.dataTransfer.files);
});

// Function for uploaded file
function handleFiles(files) {
  if (files.length > 1) {
    alert('Only one image can be uploaded at a time!');
    return;
  }

  const file = files[0];
  if (!file.type.startsWith('image/')) {
    alert('Only images are allowed!');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    
    uploadBox.innerHTML = '';

    // Image preview
    const img = document.createElement('img');
    img.src = e.target.result;
    img.classList.add('preview-image'); 
    uploadBox.appendChild(img);

    // Show remove button and upload button
    uploadBox.appendChild(removeButton);
    uploadBox.appendChild(uploadButton);

    // Show remove button
    removeButton.style.display = 'inline-block';
    uploadButton.style.display = 'inline-block';

    // Store selected file for upload
    window.selectedFile = file;
  };
  reader.readAsDataURL(file);
}

// Remove image and reset when remove button is clicked
removeButton.addEventListener('click', () => {
  uploadBox.innerHTML = ''; 
  uploadBox.appendChild(removeButton); 
  uploadBox.appendChild(uploadButton); 
  fileInput.value = ''; 
  removeButton.style.display = 'none'; 
  uploadButton.style.display = 'none'; 
  window.selectedFile = null; 
});

// When upload button is clicked
uploadButton.addEventListener('click', () => {
  if (!window.selectedFile) {
    alert('No image selected!');
    return;
  }

  // Function to upload image
  uploadImageToServer(window.selectedFile);
});

// Function to upload image to S3
function uploadImageToServer(file) {
  const formData = new FormData();
  formData.append('file', file);

  // API call to upload image
  fetch('http://localhost:5000/upload-image', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    alert('File uploaded successfully!');
    
  })
  .catch(error => {
    console.error('Error uploading file:', error);
    alert('Error uploading file');
  });
}

// Added section for Home Page Upload (index.html)
// Select file input and upload button from index.html
const homeFileInput = document.getElementById('file-input');
const homeUploadButton = document.getElementById('upload-button');

// When upload button is clicked (index.html)
if (homeFileInput && homeUploadButton) {
  homeUploadButton.addEventListener('click', () => {
    const file = homeFileInput.files[0];
    if (!file) {
      alert('Please select an image first!');
      return;
    }
    uploadImageToServer(file);
  });
}