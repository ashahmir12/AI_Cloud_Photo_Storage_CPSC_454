import json
import boto3
import os
import uuid
from datetime import datetime

rekognition_client = boto3.client('rekognition')
dynamodb_client = boto3.client('dynamodb')

DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE') # change to name of dynamoDB

def detect_labels(photo, bucket):
    response = rekognition_client.detect_labels(Image={'S3Object': {'Bucket': bucket, 'Name': photo}}, MaxLabels=10)
    labels = [label['Name'] for label in response['Labels']]  # Storing labels as a list of strings
    return labels

def detect_text(photo, bucket):
    response = rekognition_client.detect_text(Image={'S3Object': {'Bucket': bucket, 'Name': photo}})
    detected_text = [text['DetectedText'] for text in response['TextDetections']]
    return detected_text if detected_text else None

def detect_faces(photo, bucket):
    response = rekognition_client.detect_faces(Image={'S3Object': {'Bucket': bucket, 'Name': photo}}, Attributes=['ALL'])
    return len(response['FaceDetails']) if response['FaceDetails'] else 0

def store_labels(image_name, bucket, labels, user_id):
    image_id = str(uuid.uuid4())  # Generate unique image ID
    image_url = f"https://s3.amazonaws.com/{bucket}/{image_name}" # Create Public URL
    upload_date = datetime.now(datetime.timezone.utc).isoformat()  # Store ISO format timestamp
    detected_text = detect_text(image_name, bucket)
    face_count = detect_faces(image_name, bucket)

    dynamodb_client.put_item(
        TableName=DYNAMODB_TABLE,
        Item={
            'image_id': {'S': image_id},
            'user_id': {'S': user_id},
            'image_name': {'S': image_name},
            'bucket': {'S': bucket},
            'image_url': {'S': image_url},
            'upload_date': {'S': upload_date},
            'labels': {'SS': labels},
            'detected_text': {'S': json.dumps(detected_text) if detected_text else {'NULL': True}},
            'face_count': {'N': str(face_count)}
        }
    )

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        image_name = record['s3']['object']['key']
        user_id = record.get('user_id', 'unknown_user')  # Extract from event or default
        
        labels = detect_labels(image_name, bucket)
        store_labels(image_name, bucket, labels, user_id)

    return {
        'statusCode': 200,
        'body': json.dumps('Labels and metadata detected and stored successfully!')
    }
