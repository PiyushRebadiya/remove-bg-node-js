import fs from 'fs';
import FormData from 'form-data';
const fetch = (await import('node-fetch')).default;

async function removeBg(imagePath, apiKey) {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', fs.createReadStream(imagePath));

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
    });

    if (response.ok) {
        return await response.buffer(); // Use `response.buffer()` for node.js
    } else {
        console.log('response 123123123:>> ', response.status);
        throw new Error(`${response.status}: ${response.statusText}`);
    }
}

async function processImage() {
    try {
        const apiKey = 'QFBjyYExexz8R9M6HZS5QzeH'; // Replace with your API key
        const inputImagePath = './images/input.jpg'; // Path to your input image
        const outputImagePath = './images/no-bg.png'; // Path to save the output image

        const rbgResultData = await removeBg(inputImagePath, apiKey);
       await fs.writeFileSync(outputImagePath, rbgResultData);
        console.log('Background removed successfully:', outputImagePath);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
processImage();
