import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

/**
 * Clé sous laquelle on stocke la "session" dans le coffre-fort sécurisé du téléphone.
 * Sur un vrai projet ce serait un JWT / token d'API — ici une simple valeur suffit
 * pour la démo : ce qui compte c'est "il y a une session" ou "il n'y en a pas".
 */
const SESSION_KEY = 'session';

type AuthContextValue = {
  /** true = utilisateur connecté, false = déconnecté */
  isLoggedIn: boolean;
  /** true tant qu'on lit la session stockée au démarrage (on affiche le splash) */
  isLoading: boolean;
  /** Stocke la session de façon persistante et passe l'app en "connecté" */
  signIn: () => Promise<void>;
  /** Efface la session stockée et repasse l'app en "déconnecté" */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook pour lire l'état d'auth depuis n'importe quel écran.
 * Lève une erreur si on l'utilise hors du <SessionProvider> : ça aide les élèves
 * à comprendre où le Context doit être monté.
 */
export function useSession(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error('useSession doit être utilisé à l’intérieur de <SessionProvider>');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage : on regarde si une session a été persistée lors d'une session précédente.
  // C'est ÇA qui permet de rester connecté après avoir fermé l'app.
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        setIsLoggedIn(stored !== null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function signIn() {
    await SecureStore.setItemAsync(SESSION_KEY, 'true');
    setIsLoggedIn(true);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
