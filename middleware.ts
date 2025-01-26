import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function middleware(req) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/votes/:path*',
  ],
};
