// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

// Create S3 service object
const s3Client = new S3Client({ region: process.env.REGION });

const S3 = {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
  get(bucket, fileName) {
    const input = {
      Bucket: bucket,
      Key: fileName,
    };
    const command = new GetObjectCommand(input);
    return s3Client.send(command);
  },

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html
  write(bucket, fileName, data, ContentType) {
    const input = {
      // PutObjectRequest
      Bucket: bucket,
      Key: fileName,
      Body: Buffer.isBuffer(data) ? data : JSON.stringify(data),
      ContentType,
    };
    const command = new PutObjectCommand(input);
    return s3Client.send(command);
  },
};

export default S3;
