// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
import { S3Client } from '@aws-sdk/client-s3';
const s3Client = new S3Client({ region: process.env.REGION });

import Responses from '../common/API_Responses.js';
import * as fileType from 'file-type';

const allowedMimeTypes = ['image/jpeg', 'image/png'];

export const handler = async (event) => {
  console.log('event', event);

  try {
    const { body } = event;

    if (!body || !body.image || !body.mime) {
      return Responses._400({ message: 'incorrect body on request' });
    }

    if (allowedMimeTypes.includes(body.mime) === false) {
      return Responses._400({ message: 'incorrect mime type' });
    }

    let imageData = body.image;
    if (imageData.substr(0, 7) === 'base64,') {
      imageData = imageData.substr(7, imageData.length);
    }

    const buffer = Buffer.from(imageData, 'base64');
    const fileInfo = await fileType.fromBuffer(buffer);
    const detectedExt = fileInfo.ext;
    const detectedMime = fileInfo.mime;

    if (detectedMime !== body.mime) {
      return Responses._400({ message: 'mime types mismatch' });
    }
  } catch (error) {
    // error handling
    console.error(error);
    return Responses._500({ message: err.message });
  }
};
