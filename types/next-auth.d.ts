import { DefaultSession } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      avatarUrl: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    avatarUrl: string;
    name?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    avatarUrl: string;
  }
}

// Add this to ensure the authorize callback knows about avatarUrl
declare module 'next-auth/providers/credentials' {
  interface CredentialsConfig {
    authorize: (credentials: Record<string, unknown>) => Promise<{
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      avatarUrl: string;
    } | null>;
  }
}
