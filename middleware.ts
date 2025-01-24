import { withAuth } from 'next-auth/middleware';

// This function can be marked `async` if using `await` inside
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
    '/api/links/:path*',
    '/api/votes/:path*',
    '/api/comments/:path*',
  ],
};
