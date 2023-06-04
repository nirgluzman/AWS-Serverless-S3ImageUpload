import Responses from '../common/API_Responses.js';
import S3 from '../common/S3.js';

import Jimp from 'jimp'; // image processing library

export const handler = async (event) => {
  console.log('event', event);

  const { Records } = event;

  try {
    const promArray = Records.map((record) => {
      const bucket = record.s3.bucket.name;
      const file = record.s3.object.key;
      const width = 300;
      const height = 300;
      return resizeImage({ bucket, file, width, height });
    });

    await Promise.all(promArray);

    return Responses._200({ message: 'image resize succeeded' });
  } catch (error) {
    console.error(error);
    return Responses._400({
      message: error.message || 'failed to resize image',
    });
  }
};

const resizeImage = async ({ bucket, file, width, height }) => {
  /*****************************
  // OPTION-1 - using Jimp.read() with a URL pointing to the image file.
  const jimpImage = await Jimp.read(
    `https://${bucket}.s3.${process.env.REGION}.amazonaws.com/${file}`
  );
  *****************************/

  // OPTION-2 - using Jimp.read() with a Buffer representing the image data.
  // get the image object from S3
  const imageObject = await S3.get(bucket, file);

  // convert the image object to a buffer, https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
  const byteArray = await imageObject.Body.transformToByteArray();
  const bufferData = Buffer.from(byteArray);

  // create a Jimp image object from the buffer
  const jimpImage = await Jimp.read(bufferData);

  const mime = jimpImage.getMIME();

  console.log('successfully converted S3 object to Jimp image:', jimpImage);
  console.log('mime', mime);

  // scale the image to the largest size that fits inside the given width and height
  const resizedImageBuffer = await jimpImage
    .scaleToFit(width, height)
    .getBufferAsync(mime);

  const shortFileName = file.split('/')[1];
  const newFileName = `resized/${width}x${height}/${shortFileName}`;

  await S3.write(bucket, newFileName, resizedImageBuffer, mime);

  return newFileName;
};
