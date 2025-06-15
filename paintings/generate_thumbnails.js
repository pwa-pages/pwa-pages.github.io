const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'src/assets'); // only process images here
const thumbnailDir = path.join(imagesDir, 'thumbnails');
const thumbnailWidth = 200;

function isImage(file) {
  return /\.(jpe?g|png|webp)$/i.test(file);
}

function processImage(filePath, outputDir) {
  const filename = path.basename(filePath);
  const outputPath = path.join(outputDir, filename);

  return sharp(filePath)
    .resize({ width: thumbnailWidth })
    .toFile(outputPath)
    .then(() => console.log(`✔ Created: ${outputPath}`))
    .catch(err => console.error(`✖ Failed: ${filePath}`, err));
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

