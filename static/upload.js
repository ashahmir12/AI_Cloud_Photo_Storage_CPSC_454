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
  if (!files || files.length === 0) return; // Prevents crash if no file is passed

  if (files.length > 1) {
    alert('Only one image can be uploaded at a time!');
    return;
  }

  const file = files[0];
  if (!file.type || !file.type.startsWith('image/')) {
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

    removeButton.style.display = 'inline-block';
    uploadButton.style.display = 'inline-block';

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

  // Upload image and show labels
  uploadImageToServer(window.selectedFile);
});

// Upload image to Flask backend with userId
function uploadImageToServer(file) {
  const formData = new FormData();
  formData.append('file', file);

  // Pass userId so backend can attach to DynamoDB
  formData.append('userId', 'demo-user-123'); // Change this as needed

  fetch('http://localhost:5000/upload-image', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    alert('File uploaded successfully!');

    // Show Rekognition labels from server
    if (data.tags && data.tags.length > 0) {
      const labelText = data.tags.join(', ');
      alert('Detected labels: ' + labelText);
    }
  })
  .catch(error => {
    console.error('Error uploading file:', error);
    alert('Error uploading file');
  });
}
