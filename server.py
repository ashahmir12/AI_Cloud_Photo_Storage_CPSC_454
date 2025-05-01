from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import boto3
import os
import uuid
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests (frontend and backend on different ports during development)

# AWS Configuration
AWS_REGION = 'us-west-1'
BUCKET_NAME = 'ai-cloud-photo-storage'
DDB_TABLE = 'ImageMetadata'

# Initialize boto3 clients
s3 = boto3.client('s3', region_name=AWS_REGION)
rekognition = boto3.client('rekognition', region_name=AWS_REGION)
dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)

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
    Handle image upload from the frontend and store it in the S3 bucket (with public read access),
    then analyze the image using AWS Rekognition and store metadata in DynamoDB.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    user_id = request.form.get('userId', 'demo-user')  # fallback user if none provided

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Generate metadata
        image_id = str(uuid.uuid4())
        filename = file.filename
        upload_time = datetime.utcnow().isoformat()
        s3_key = f"{user_id}/{image_id}"

        # Upload with public-read ACL so it can be viewed in browser
        s3.upload_fileobj(
            file,
            BUCKET_NAME,
            s3_key,
            ExtraArgs={'ACL': 'public-read'}
        )

        # Public URL for uploaded image
        image_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"

        # Run Rekognition on the uploaded image
        rekognition_response = rekognition.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': BUCKET_NAME,
                    'Name': s3_key
                }
            },
            MaxLabels=10,
            MinConfidence=75
        )

        # Extract label names
        tags = [label['Name'] for label in rekognition_response['Labels']]
        print("Detected tags:", tags)  # Print detected labels to debug

        # Write metadata to DynamoDB
        dynamodb.put_item(
            TableName=DDB_TABLE,
            Item={
                'ImageID':    {'S': image_id},
                'UserID':     {'S': user_id},
                'FileName':   {'S': filename},
                'ImageURL':   {'S': image_url},
                'UploadDate': {'S': upload_time},
                'Tags':       {'L': [{'S': tag} for tag in tags]}
            }
        )
        print("✅ DynamoDB insert successful for:", image_id)

        return jsonify({'message': 'File uploaded and analyzed successfully!', 'tags': tags}), 200

    except Exception as e:
        print("❌ Error:", e)
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
