const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIco() {
  const inputPath = path.join(__dirname, 'resources', 'icon.png');
  const icoPath = path.join(__dirname, 'resources', 'icon.ico');
  
  // Create 256x256 PNG
  const png256Path = path.join(__dirname, 'resources', 'icon-256.png');
  await sharp(inputPath)
    .resize(256, 256)
    .toFile(png256Path);
  
  // Copy as ICO (electron-builder handles PNG in ICO format)
  fs.copyFileSync(png256Path, icoPath);
  
  // Clean up temp file
  fs.unlinkSync(png256Path);
  
  console.log('ICO created at:', icoPath);
}

createIco().catch(console.error);
