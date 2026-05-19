import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { SessionProvider, useSession } from '@/ctx/auth';

// On empêche le splash de disparaître tant qu'on n'a pas lu la session stockée,
// sinon l'élève verrait l'écran de login clignoter une fraction de seconde.
SplashScreen.preventAutoHideAsync();

/**
 * LE CŒUR DE LA DÉMO.
 *
 * Deux groupes de routes, chacun avec sa propre Stack :
 *   - (app)  : accessible UNIQUEMENT si connecté    → guard={isLoggedIn}
 *   - (auth) : accessible UNIQUEMENT si déconnecté   → guard={!isLoggedIn}
 *
 * <Stack.Protected> surveille son `guard`. Dès qu'il change (login / logout),
 * Expo Router REDIRIGE automatiquement vers le groupe désormais accessible.
 * Aucun router.replace() manuel : c'est ça qu'on montre aux élèves.
 */
function RootNavigator() {
  const { isLoggedIn, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Tant qu'on lit la session, on ne rend rien : le splash reste affiché.
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // Le Provider doit envelopper le navigateur pour que useSession() y ait accès.
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}
