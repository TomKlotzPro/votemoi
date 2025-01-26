import { copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copy the 32x32 PNG to favicon.ico
const sourceFile = join(__dirname, '../public/favicon-32x32.png');
const targetFile = join(__dirname, '../public/favicon.ico');

copyFileSync(sourceFile, targetFile);
console.log('favicon.ico generated successfully');
