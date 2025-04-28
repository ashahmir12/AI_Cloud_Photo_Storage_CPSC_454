// Get upload box
const uploadBox = document.querySelector('.upload-box');

// Create file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.multiple = true;

// When click box, trigger file input
uploadBox.addEventListener('click', () => {
  fileInput.click();
});

// When file selected
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

// Function to handle uploaded files
function handleFiles(files) {
  // Clear prev previews
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = document.getElementById('image-preview');
  const removeButton = document.getElementById('remove-image');
  const uploadButton = document.getElementById('upload-button');
  
  [...files].forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert('Only images are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Display image preview
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = 'block';
      uploadButton.style.display = 'inline-block'; 

      // Store file in  global variable for uploading later
      window.selectedFile = file;

      // Add Remove Image button 
      removeButton.addEventListener('click', () => {
        imagePreviewContainer.style.display = 'none';
        uploadButton.style.display = 'none';
        fileInput.value = ''; 
        window.selectedFile = null; 
      });
    };
    reader.readAsDataURL(file);
  });
}

// Handle file upload (send file to S3)
const uploadButton = document.getElementById('upload-button');
uploadButton.addEventListener('click', () => {
  if (!window.selectedFile) {
    alert('No image selected!');
    return;
  }

  // Upload logic (send file to server)
  uploadImageToServer(window.selectedFile);
});

function uploadImageToServer(file) {
  const formData = new FormData();
  formData.append('file', file);

  // API call to upload file; Idk about this, will prob change
  fetch('/upload-image', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert('File uploaded successfully!');
      //Redirect to gallery or handle after upload
    })
    .catch((error) => {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    });
}


