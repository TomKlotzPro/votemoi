// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable no-undef */
import { generateAvatar } from '@/app/constants/avatars';
import { AuthOptions, Session } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
  }

  interface Session {
    user: User & {
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.name) {
          throw new Error('Name is required');
        }

        // Create a user with the provided name and a generated avatar
        const user: User = {
          id: credentials.name.toLowerCase(),
          name: credentials.name,
          avatarUrl: generateAvatar(credentials.name),
          email: null,
          image: null,
        };

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }): Promise<Session> {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name || null,
          avatarUrl: token.avatarUrl,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
/* eslint-enable no-undef */
