import sharp from 'sharp';
import fs from 'fs';
import { removeBackground } from "@imgly/background-removal-node";

async function removeBackgroundFeature() {
  try {
    const inputImagePath = './images/8.jpg';
    const tempImagePath = './temp.png';
    const outputImagePath = './output.png';

    // Convert the input image to RGBA format to ensure 4-channel support
    await sharp(inputImagePath)
      .ensureAlpha() // Adds an alpha channel if it doesn't exist
      .toFile(tempImagePath);

    // Remove the background
    const result = await removeBackground(tempImagePath);

    // Convert the Blob to a buffer
    const blobBuffer = await result.arrayBuffer();
    const buffer = Buffer.from(blobBuffer);

    // Process the image directly from the buffer
    await sharp(buffer)
      .resize(800)
      .toFile(outputImagePath);

    console.log('Background removed and image processed successfully!');
    fs.unlinkSync(tempImagePath); // Clean up the temporary file
  } catch (error) {
    console.error('Error removing background:', error);
  }
}

removeBackgroundFeature();
