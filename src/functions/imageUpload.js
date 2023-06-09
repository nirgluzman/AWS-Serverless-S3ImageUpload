import Responses from '../common/API_Responses.js';
import S3 from '../common/S3.js';

import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuid } from 'uuid';

const allowedMimeTypes = ['image/jpeg', 'image/png'];

export const handler = async (event) => {
  console.log('event', event);

  try {
    const body = JSON.parse(event.body);

    if (!body || !body.image || !body.mime) {
      return Responses._400({ message: 'incorrect body' });
    }

    if (allowedMimeTypes.includes(body.mime) === false) {
      return Responses._400({ message: 'incorrect mime type' });
    }

    let imageData = body.image;
    if (imageData.substr(0, 7) === 'base64,') {
      imageData = imageData.substr(7, imageData.length);
    }

    const buffer = Buffer.from(imageData, 'base64'); // method to create a new buffer filled with the specified string, array, or buffer.
    const fileInfo = await fileTypeFromBuffer(buffer);
    const detectedExt = fileInfo.ext;
    const detectedMime = fileInfo.mime;

    if (detectedMime !== body.mime) {
      return Responses._400({ message: 'mime type mismatch' });
    }

    const name = uuid();
    const key = `uploads/${name}.${detectedExt}`;

    console.log(
      `writing image to bucket ${process.env.IMAGE_UPLOAD_BUCKET} with key ${key}`
    );

    await S3.write(process.env.IMAGE_UPLOAD_BUCKET, key, buffer, body.mime);

    // const url = `https://${process.env.IMAGE_UPLOAD_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${key}`;

    const url = await S3.getPreSignedURL(
      process.env.IMAGE_UPLOAD_BUCKET,
      key,
      30
    );

    return Responses._200({
      message: 'image uploaded',
      imageURL: url,
    });
  } catch (error) {
    // error handling
    console.error(error);
    return Responses._500({ message: err.message || 'failed to upload image' });
  }
};
