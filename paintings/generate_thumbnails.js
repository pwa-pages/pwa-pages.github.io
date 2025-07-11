const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'src/assets');
const thumbnailDir = path.join(imagesDir, 'gen');
const thumbnailWidth = 200;

function isImage(file) {
  return /\.(jpe?g|png|webp)$/i.test(file);
}

function processImage(filePath, outputDir) {
  const filename = path.basename(filePath);
  const name = path.parse(filename).name;
  const ext = path.extname(filename);

  const outputPath = path.join(outputDir, filename);
  const bgOutputPath = path.join(outputDir, `${name}_bg${ext}`);
  const resizedOutputPath = path.join(outputDir, `${name}_r${ext}`);

  // Create resized thumbnail
  const createThumbnail = sharp(filePath)
    .resize({ width: thumbnailWidth })
    .toFile(outputPath)
    .then(() => console.log(`✔ Thumbnail created: ${outputPath}`))
    .catch(err => console.error(`✖ Failed to create thumbnail: ${filePath}`, err));

  // Create center-cropped "_bg" version
  const createBg = sharp(filePath)
    .metadata()
    .then(metadata => {
      const cropWidth = Math.floor(metadata.width * 0.9);
      const cropHeight = Math.floor(metadata.height * 0.9);
      const left = Math.floor((metadata.width - cropWidth) / 2);
      const top = Math.floor((metadata.height - cropHeight) / 2);

      return sharp(filePath)
        .extract({ width: cropWidth, height: cropHeight, left, top })
        .resize({ height: 1000 })
        .toFile(bgOutputPath);
    })
    .then(() => console.log(`✔ Cropped and resized _bg image created: ${bgOutputPath}`))
    .catch(err => console.error(`✖ Failed to create _bg image: ${filePath}`, err));

  // Create resized image with max dimension = 1000px
  const createResized = sharp(filePath)
    .metadata()
    .then(metadata => {
      const maxDim = Math.max(metadata.width, metadata.height);
      const resizeOptions =
        metadata.width >= metadata.height
          ? { width: 1000 }
          : { height: 1000 };

      return sharp(filePath)
        .resize(resizeOptions)
        .toFile(resizedOutputPath);
    })
    .then(() => console.log(`✔ Resized _r image created: ${resizedOutputPath}`))
    .catch(err => console.error(`✖ Failed to create _r image: ${filePath}`, err));

  return Promise.all([createThumbnail, createBg, createResized]);
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(entry => {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      if (entry === 'thumbnails') return;
      walkDir(fullPath);
    } else if (isImage(fullPath)) {
      const relPath = path.relative(imagesDir, path.dirname(fullPath));
      const outputSubdir = path.join(thumbnailDir, relPath);
      fs.mkdirSync(outputSubdir, { recursive: true });
      processImage(fullPath, outputSubdir);
    }
  });
}

if (!fs.existsSync(imagesDir)) {
  console.error(`❌ Directory not found: ${imagesDir}`);
  process.exit(1);
}

walkDir(imagesDir);

