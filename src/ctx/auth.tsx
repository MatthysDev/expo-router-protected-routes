import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

const KEY = 'session';

type Auth = {
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | undefined>(undefined);

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useSession hors <SessionProvider>');
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((v) => setIsLoggedIn(v !== null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async () => {
    await SecureStore.setItemAsync(KEY, 'true');
    setIsLoggedIn(true);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(KEY);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
