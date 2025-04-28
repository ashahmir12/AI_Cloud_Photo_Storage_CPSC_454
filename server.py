from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import boto3
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests (frontend and backend on different ports during development)

# AWS S3 Configuration
AWS_REGION = 'us-west-1'
BUCKET_NAME = 'ai-cloud-photo-storage'

# Initialize boto3 S3 client
s3 = boto3.client('s3', region_name=AWS_REGION)

# Home Page Route
@app.route('/')
def home():
    return render_template('index.html')

# Upload Page Route
@app.route('/upload')
def upload_page():
    return render_template('upload.html')

# Gallery Page Route
@app.route('/gallery')
def gallery_page():
    return render_template('gallery.html')

# Upload Image Endpoint
@app.route('/upload-image', methods=['POST'])
def upload_image():
    """
    Handle image upload from the frontend and store it in the S3 bucket (with public read access).
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Upload with public-read ACL so it can be viewed in browser
        s3.upload_fileobj(
            file,
            BUCKET_NAME,
            file.filename,
            ExtraArgs={'ACL': 'public-read'}  # ✅ Make uploaded files publicly readable
        )
        return jsonify({'message': 'File uploaded successfully!'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to upload: {str(e)}'}), 500

# List Images Endpoint for Gallery
@app.route('/list-images', methods=['GET'])
def list_images():
    """
    List all image URLs stored in the S3 bucket for displaying in the gallery.
    """
    try:
        objects = s3.list_objects_v2(Bucket=BUCKET_NAME)
        if 'Contents' not in objects:
            return jsonify([])  # No images found

        files = []
        for obj in objects['Contents']:
            file_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{obj['Key']}"
            files.append(file_url)

        return jsonify(files)
    except Exception as e:
        return jsonify({'error': f'Failed to list images: {str(e)}'}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
