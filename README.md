# Expo Router — Routes protégées & redirection automatique 🔐

Projet **pédagogique** pour montrer aux élèves comment fonctionne la redirection
entre une zone **connectée** et une zone **non connectée** avec **Expo Router v5**
(SDK 55), une session **persistée** (`expo-secure-store`) et un déverrouillage
**Face ID / empreinte** (`expo-local-authentication`).

## L'idée en une phrase

Deux groupes de routes, deux Stacks. Un `guard` booléen décide lequel est
accessible. Quand le `guard` change (login / logout), **Expo Router redirige
tout seul** — il n'y a *aucun* `router.replace()` écrit à la main.

## Structure des routes

```
src/
  ctx/
    auth.tsx              # Context : isLoggedIn, isLoading, signIn(), signOut()
  app/
    _layout.tsx           # ⭐ Le cœur : <Stack.Protected guard={...}>
    (auth)/               # GROUPE NON PROTÉGÉ (déconnecté)
      _layout.tsx
      login.tsx           # Bouton "Se connecter avec Face ID"
    (app)/                # GROUPE PROTÉGÉ (connecté)
      _layout.tsx
      index.tsx           # Écran d'accueil + bouton "Se déconnecter"
```

## Le mécanisme à montrer (src/app/_layout.tsx)

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Protected guard={isLoggedIn}>
    <Stack.Screen name="(app)" />     {/* visible seulement si connecté */}
  </Stack.Protected>

  <Stack.Protected guard={!isLoggedIn}>
    <Stack.Screen name="(auth)" />    {/* visible seulement si déconnecté */}
  </Stack.Protected>
</Stack>
```

`<Stack.Protected>` surveille son `guard`. Dès qu'il bascule, le groupe devenu
inaccessible est retiré et l'utilisateur est redirigé vers le groupe accessible.

## Le flux complet

1. **Lancement** : on lit la session dans le coffre sécurisé (`SecureStore`).
   Le splash reste affiché pendant ce temps (`isLoading`).
2. **Connexion** : `login.tsx` appelle `LocalAuthentication.authenticateAsync()`
   (Face ID). En cas de succès → la session est persistée → `guard` bascule →
   **redirection auto vers `(app)`**.
3. **Déconnexion** : on efface la session → `guard` rebascule →
   **redirection auto vers `(auth)/login`**.
4. **Relance de l'app** : la session est toujours dans `SecureStore`, donc on
   reste connecté sans repasser par Face ID.

## Démarrer

```bash
npm install
npx expo start
```

## ⚠️ Important : Face ID ne marche pas dans Expo Go

Le message de permission `NSFaceIDUsageDescription` vient du config plugin :
il faut donc un **development build**, pas Expo Go.

- **iOS (development build)** : `npx expo run:ios`
- **Simulateur iOS** : Face ID fonctionne si vous l'activez via
  *Features → Face ID → Enrolled* (puis *Matching/Non-Matching Face* pour
  simuler un succès/échec).
- **Android** : `npx expo run:android`, biométrie simulée via l'émulateur.
- **Web** (`npx expo start --web`) : pas de capteur biométrique → la connexion
  se fait directement, ce qui permet quand même de **démontrer la redirection**.

## Idées d'exercices pour les élèves

- Ajouter un écran `register` dans `(auth)` et naviguer entre `login` et
  `register` (navigation **interne** à une stack non protégée).
- Ajouter un second onglet/écran dans `(app)` et observer que tout le groupe
  est protégé d'un coup.
- Exiger Face ID **à chaque relance** (re-prompt au démarrage dans `auth.tsx`
  au lieu de faire confiance à la session stockée).
- Remplacer le `guard` booléen par un rôle (`user` / `admin`) et protéger une
  route admin.
