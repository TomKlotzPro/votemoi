import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = {
  favicon: [16, 32],
  apple: [180],
  android: [192, 512],
  ogImage: [1200]
};

async function generateIcons() {
  const inputSvg = fs.readFileSync(join(__dirname, '../public/icon.svg'));
  
  // Generate PNG favicons
  for (const size of sizes.favicon) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, `../public/favicon-${size}x${size}.png`));
  }

  // Generate apple-touch-icon
  for (const size of sizes.apple) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '../public/apple-touch-icon.png'));
  }

  // Generate android chrome icons
  for (const size of sizes.android) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, `../public/android-chrome-${size}x${size}.png`));
  }

  // Generate OG image with different aspect ratio
  const [width] = sizes.ogImage;
  const height = Math.floor(width * (630 / 1200)); // OG image aspect ratio
  await sharp(inputSvg)
    .resize(width, height, { fit: 'contain', background: { r: 30, g: 30, b: 56 } })
    .png()
    .toFile(join(__dirname, '../public/og-image.png'));

  // For favicon.ico, we'll just copy the 32x32 PNG since most modern browsers prefer PNG anyway
  fs.copyFileSync(
    join(__dirname, '../public/favicon-32x32.png'),
    join(__dirname, '../public/favicon.ico')
  );

  console.log(' All icons generated successfully!');
}

generateIcons().catch(console.error);
