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
    (app)/                # GROUPE PROTÉGÉ (connecté) — barre d'onglets
      _layout.tsx         # <Tabs> : 4 onglets, tout le groupe est protégé
      index.tsx           # Accueil + bouton "Se déconnecter"
      map.tsx             # Carte (expo-maps) + recherche de ville
      animation.tsx       # Animation Reanimated (échelle/rotation/couleur)
      photo.tsx           # Sélection photo + copie locale persistante
  components/
    CityMap.tsx           # Carte native (iOS Apple / Android Google)
    CityMap.web.tsx       # Fallback web (expo-maps n'a pas de web)
```

## La zone connectée (onglets)

Une fois connecté, le groupe `(app)` devient une **barre d'onglets**. Tout le
groupe reste protégé : la déconnexion fait disparaître les 4 onglets d'un coup.

| Onglet | Ce qu'il montre | Libs |
|---|---|---|
| **Accueil** | Bouton de déconnexion (retour auto au login) | — |
| **Carte** | Carte + champ "chercher une ville" (geocoding → recentrage + marqueur) | `expo-maps`, `expo-location` |
| **Animation** | Une valeur partagée anime échelle, rotation, arrondi et couleur | `react-native-reanimated` |
| **Photo** | Choisir une photo, copiée dans le dossier local de l'app, rechargée au prochain lancement | `expo-image-picker`, `expo-file-system` |

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

## ⚠️ La carte (expo-maps)

- `expo-maps` ne marche **pas dans Expo Go** ni sur le web → development build.
- **iOS** : Apple Maps fonctionne sur simulateur **sans clé API**.
- **Android** : Google Maps exige une **clé API Google Maps** à mettre dans
  `app.json` → `android.config.googleMaps.apiKey`. Sans elle, l'onglet Carte
  reste gris sur Android (les autres onglets fonctionnent).
- La recherche de ville utilise `Location.geocodeAsync` (forward geocoding) ;
  sur Android la permission de localisation est demandée au premier appel.

## Idées d'exercices pour les élèves

- Ajouter un écran `register` dans `(auth)` et naviguer entre `login` et
  `register` (navigation **interne** à une stack non protégée).
- Ajouter un second onglet/écran dans `(app)` et observer que tout le groupe
  est protégé d'un coup.
- Exiger Face ID **à chaque relance** (re-prompt au démarrage dans `auth.tsx`
  au lieu de faire confiance à la session stockée).
- Remplacer le `guard` booléen par un rôle (`user` / `admin`) et protéger une
  route admin.
