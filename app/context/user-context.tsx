'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AuthForm from '../components/auth/AuthForm';
import { User } from '../types/user';
import { getCurrentSession } from '@/app/actions/users';
import { FormattedUser } from '@/app/types/user';

type UserContextType = {
  user: (FormattedUser & { sessionId: string }) | null;
  setUser: (user: (FormattedUser & { sessionId: string }) | null) => void;
  showAuthForm: () => void;
  hideAuthForm: () => void;
  isAuthFormVisible: boolean;
  isLoading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'votemoi_user';
const SESSION_STORAGE_KEY = 'votemoi_session';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setInternalUser] = useState<(FormattedUser & { sessionId: string }) | null>(null);
  const [isAuthFormVisible, setIsAuthFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session) {
          setInternalUser({
            ...session.user,
            sessionId: session.id,
            links: [],
            votes: [],
            comments: [],
          });
        } else {
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
          
          if (storedUser && storedSession) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const parsedSession = JSON.parse(storedSession);
              
              // Check if session is expired
              if (new Date(parsedSession.expiresAt) > new Date()) {
                setInternalUser(parsedUser);
              } else {
                // Clear expired session
                handleSetUser(null);
              }
            } catch (error) {
              console.error('Failed to parse stored user/session:', error);
              handleSetUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleSetUser = useCallback((newUser: (FormattedUser & { sessionId: string }) | null, sessionId?: string) => {
    if (newUser && sessionId) {
      const session = {
        id: sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      // Store user and session in localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      // Clear storage
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setInternalUser(newUser);
  }, []);

  const setUser = useCallback((newUser: (FormattedUser & { sessionId: string }) | null) => {
    if (newUser) {
      handleSetUser(newUser);
    } else {
      handleSetUser(null);
      // Clear session cookie
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Trigger a page refresh to clear all user-specific states
      window.location.reload();
    }
  }, [handleSetUser]);

  const showAuthForm = useCallback(() => {
    setIsAuthFormVisible(true);
  }, []);

  const hideAuthForm = useCallback(() => {
    setIsAuthFormVisible(false);
  }, []);

  const handleAuthSuccess = useCallback(
    (authenticatedUser: (FormattedUser & { sessionId: string }) & { sessionId: string }) => {
      handleSetUser(authenticatedUser, authenticatedUser.sessionId);
      hideAuthForm();
    },
    [handleSetUser, hideAuthForm]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  if (isLoading) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        showAuthForm,
        hideAuthForm,
        isAuthFormVisible,
        isLoading,
        logout,
      }}
    >
      {children}
      {isAuthFormVisible && (
        <AuthForm onSuccess={handleAuthSuccess} onClose={hideAuthForm} />
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
