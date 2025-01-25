const { execSync } = require('child_process');
const { Headers, Request, Response } = require('undici');

// Set up globals
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

try {
  // First generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Then run Next.js build with experimental fetch
  console.log('Running Next.js build...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--experimental-fetch'
    }
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
