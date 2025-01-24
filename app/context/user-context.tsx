'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AuthForm from '../components/auth/AuthForm';
import LoadingScreen from '../components/ui/LoadingScreen';
import { AVATAR_OPTIONS } from '../constants/avatars';
import { User } from '../types/user';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  showAuthForm: () => void;
  hideAuthForm: () => void;
  isAuthFormVisible: boolean;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'votemoi_user';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthFormVisible, setIsAuthFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarsLoaded, setAvatarsLoaded] = useState(false);

  // Preload avatars
  useEffect(() => {
    const preloadAvatars = async () => {
      try {
        await Promise.all(
          AVATAR_OPTIONS.map(
            (url) =>
              new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
              })
          )
        );
      } catch (error) {
        console.error('Failed to preload some avatars:', error);
      } finally {
        setAvatarsLoaded(true);
      }
    };

    preloadAvatars();
  }, []);

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = useCallback((newUser: User | null) => {
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUser(newUser);
  }, []);

  const showAuthForm = useCallback(() => {
    setIsAuthFormVisible(true);
  }, []);

  const hideAuthForm = useCallback(() => {
    setIsAuthFormVisible(false);
  }, []);

  const handleAuthSuccess = useCallback(
    (authenticatedUser: User) => {
      handleSetUser(authenticatedUser);
      hideAuthForm();
    },
    [handleSetUser, hideAuthForm]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  // Show loading screen until avatars are loaded
  if (!avatarsLoaded) {
    return <LoadingScreen onLoadingComplete={() => setAvatarsLoaded(true)} />;
  }

  // Don't render anything until we've checked localStorage
  if (isLoading) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: handleSetUser,
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
