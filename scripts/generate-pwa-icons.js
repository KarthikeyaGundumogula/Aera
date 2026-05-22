import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  try {
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.resolve('public/icon-192.png'));
    console.log('Successfully generated public/icon-192.png');

    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.resolve('public/icon-512.png'));
    console.log('Successfully generated public/icon-512.png');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generate();
