const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createRealIco() {
  const inputPath = path.join(__dirname, 'resources', 'icon.png');
  const outputPath = path.join(__dirname, 'resources', 'icon.ico');
  
  // Create PNG buffers at different sizes
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];
  
  for (const size of sizes) {
    const buffer = await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer });
  }
  
  // ICO file format
  const headerSize = 6;
  const dirEntrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);      // Reserved
  header.writeUInt16LE(1, 2);      // Type: ICO
  header.writeUInt16LE(sizes.length, 4); // Number of images
  
  const dirEntries = [];
  let imageDataOffset = headerSize + (dirEntrySize * sizes.length);
  
  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size === 256 ? 0 : size, 0);  // Width
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // Height
    entry.writeUInt8(0, 2);                          // Color palette
    entry.writeUInt8(0, 3);                          // Reserved
    entry.writeUInt16LE(1, 4);                       // Color planes
    entry.writeUInt16LE(32, 6);                      // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8);           // Image size
    entry.writeUInt32LE(imageDataOffset, 12);        // Image offset
    dirEntries.push(entry);
    imageDataOffset += buffer.length;
  }
  
  // Combine all parts
  const icoFile = Buffer.concat([
    header,
    ...dirEntries,
    ...pngBuffers.map(b => b.buffer)
  ]);
  
  fs.writeFileSync(outputPath, icoFile);
  console.log('Real ICO created at:', outputPath);
  console.log('Size:', icoFile.length, 'bytes');
}

createRealIco().catch(console.error);
