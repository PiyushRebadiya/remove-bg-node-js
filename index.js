var express = require('express');
var sharp = require('sharp');
var fs = require('fs').promises;
var multer = require('multer');
var { removeBackground } = require('@imgly/background-removal-node');
var path = require('path');

var app = express();
var port = 3000;

// Configure multer for file uploads
var upload = multer({ dest: 'uploads/' });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { constants } = require('fs');

async function retryUnlink(filePath, retries = 15) {
  try {
    // Ensure the file is accessible and writable
    await fs.access(filePath, constants.W_OK);

    // Attempt to unlink the file
    await fs.unlink(filePath ,{ force: true });
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (err) {
    if (err.code === 'EPERM') {
      if (retries > 0) {
        console.warn(`EPERM error encountered. Retrying in 1 second... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 1 second
        return retryUnlink(filePath, retries - 1);
      } else {
        console.error(`Failed to delete file after multiple retries: ${filePath}`);
        throw err;
      }
    } else if (err.code === 'ENOENT') {
      console.warn(`File not found, might be already deleted: ${filePath}`);
    } else {
      console.error(`Error deleting file: ${filePath}, error: ${err.message}`);
      throw err;
    }
  }
}

app.post('/remove-background', upload.single('image'), function (req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log('req.file :>> ', req.file);

  var inputImagePath = req.file.path;
  console.log('inputImagePath :>> ', inputImagePath);
  var tempImagePath = path.join('uploads', 'temp.png');
  const imageURL = `${req.file.originalname.split('.')[0]}_BGRemoved_${Date.now()}.png`;
  var outputImagePath = path.join('uploads', imageURL);

  sharp(inputImagePath)
    .ensureAlpha() // Ensure the image has an alpha channel
    .toFormat('png') // Convert to PNG format for consistent processing
    .toFile(tempImagePath)
    .then(function () {
      return removeBackground(tempImagePath);
    })
    .then(function (result) {
      return result.arrayBuffer();
    })
    .then(function (blobBuffer) {
      var buffer = Buffer.from(blobBuffer);

      return sharp(buffer)
        .resize(800)
        .toFile(outputImagePath);
    })
    .then(function () {
      res.status(200).send({
        success: true,
        message: 'Background removed and image processed successfully!',
        src: `http://localhost:3000/uploads/${imageURL}`
      });

      // Clean up the temporary files after sending the response
      setTimeout(function () {
        Promise.all([
          retryUnlink(tempImagePath),
          retryUnlink(inputImagePath)
        ]).catch(cleanupError => {
          console.error('Error cleaning up files:', cleanupError);
        });
      }, 1000);
    })
    .catch(function (error) {
      console.error('Error processing image:', error);
      res.status(500).send('Error processing image.');
    });
});

const dummy = async () => {
  await fs.unlink('uploads/0092ec04faa851ca5e530919de44ee20', { force: true });
};
dummy();
app.listen(port, function () {
  console.log('Server running at http://localhost:' + port);
});
