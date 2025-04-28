# AI Cloud Photo Storage 

A full-stack Cloud Photo Storage application built with Flask and AWS S3.
Users can upload images via a clean frontend interface, store them securely on AWS S3, and view them dynamically through a gallery page.
Uploaded images are automatically analyzed using AWS Rekognition to detect objects and scenes.

---

## 🚀 Features

- 📤 Upload photos directly from the Home or Upload page
- 🖼️ View all uploaded images dynamically in the Gallery page
- ☁️ Images are securely stored in an AWS S3 bucket
- 🧠 Automatic image analysis using AWS Rekognition (detects objects and labels)
- 🔥 Full-stack app served by Flask (no Live Server needed)
- 🌎 Prepares for EC2 deployment and public hosting

---

## 🛠 Technologies Used

- Python (Flask framework)
- HTML / CSS / JavaScript (frontend)
- AWS S3 (cloud storage for uploaded images)
- AWS Rekognition (AI-based image labeling and object detection)
- AWS EC2 (for deployment - optional)
- Flask-CORS (to handle cross-origin requests between frontend and backend)

---


## ⚙️ How It Works

1. User selects or drags an image into the upload box
2. Image is uploaded to an AWS S3 bucket with public-read access
3. Immediately after upload, AWS Rekognition analyzes the image for labels
4. Labels like "Dog", "Person", "Beach", etc. are detected and returned
5. Images are displayed dynamically in the Gallery page
6. Frontend and backend are served together by Flask

---

## 💻 How to Run Locally

1. Clone the repo:
   git clone https://github.com/ashahmir12/AI_Cloud_Photo_Storage_CPSC_454.git
   cd AI_Cloud_Photo_Storage_CPSC_454

2. Install required dependencies:
   pip install flask flask-cors boto3

3. Set up your AWS credentials:
   - Use AWS CLI (aws configure)
   - Or set up environment variables
   - Or manually configure using boto3 session
   Important: Your user must have S3 and Rekognition permissions!

4. Run the Flask server:
   python server.py

5. Open your browser and visit:
   - Home: http://localhost:5000/
   - Upload: http://localhost:5000/upload
   - Gallery: http://localhost:5000/gallery

---
