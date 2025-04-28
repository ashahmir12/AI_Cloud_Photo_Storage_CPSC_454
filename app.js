import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { v4 as uuid } from 'uuid';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const REGION = 'us-west-1';
const s3 = new S3Client({ region: REGION });
const ddb = new DynamoDBClient({ region: REGION });
const rek = new RekognitionClient({ region: REGION });

const BUCKET = 'my-photo-demo-bucket';
const TABLE  = 'Photos';

app.post('/upload', upload.single('photo'), async (req, res) => {
  const userId   = req.body.userId;
  const folder   = req.body.folder || 'root';
  const imageId  = uuid();
  const key      = `${userId}/${imageId}`;
  const now      = new Date().toISOString();

  // 1) Upload to S3
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key:    key,
    Body:   req.file.buffer,
    ContentType: req.file.mimetype,
  }));

  // 2) Write initial metadata to DynamoDB
  await ddb.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      UserID:     { S: userId },
      ImageID:    { S: imageId },
      FileName:   { S: req.file.originalname },
      ImageURL:   { S: `s3://${BUCKET}/${key}` },
      UploadDate: { S: now },
      Visibility: { S: 'private' },
      FolderName: { S: folder },
      Tags:       { L: [] },
    }
  }));

  // 3) Call Rekognition to get AI tags
  const labelsResp = await rek.send(new DetectLabelsCommand({
    Image: { S3Object: { Bucket: BUCKET, Name: key } },
    MaxLabels: 20,
    MinConfidence: 75,
  }));
  const tagNames = labelsResp.Labels.map(l => ({ S: l.Name }));

  // 4) Update DynamoDB with tags
  await ddb.send(new UpdateItemCommand({
    TableName: TABLE,
    Key:       { UserID: { S: userId }, ImageID: { S: imageId } },
    UpdateExpression: 'SET Tags = :t',
    ExpressionAttributeValues: { ':t': { L: tagNames } }
  }));

  res.json({ imageId, url: `https://${BUCKET}.s3.amazonaws.com/${key}`, tags: tagNames.map(x=>x.S) });
});

app.listen(3000, ()=> console.log('Listening on port 3000'));