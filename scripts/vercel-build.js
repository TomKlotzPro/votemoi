import { execSync } from 'child_process';

// Set up globals before anything else
// global.Headers = Headers;
// global.Request = Request;
// global.Response = Response;

console.log('Setting up global Request, Headers, and Response...');

try {
  // First generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Then run Next.js build with experimental fetch and globals
  console.log('Running Next.js build...');
  execSync(
    'NODE_OPTIONS="--experimental-fetch -r ./scripts/setup-globals.cjs" npx next build',
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--experimental-fetch -r ./scripts/setup-globals.cjs',
      },
    }
  );
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
