const { Headers, Request, Response } = require('undici');
const { execSync } = require('child_process');

// Set up globals
if (!global.Headers) {
  global.Headers = Headers;
}
if (!global.Request) {
  global.Request = Request;
}
if (!global.Response) {
  global.Response = Response;
}

try {
  // Run the Next.js build with experimental-fetch flag
  execSync('NODE_OPTIONS="--experimental-fetch" next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--experimental-fetch',
    },
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
