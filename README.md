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
- **Android** : Google Maps exige **obligatoirement** une clé API Google Maps.
  Sans elle, **l'app crashe** dès qu'on ouvre l'onglet Carte (ce n'est pas
  juste une carte grise — le `GoogleMaps.View` natif ne s'initialise pas).
- La recherche de ville utilise `Location.geocodeAsync` (forward geocoding) ;
  sur Android la permission de localisation est demandée au premier appel.

### Obtenir et configurer la clé Google Maps API (Android)

**1. Créer un projet Google Cloud + activer l'API**

- Aller sur la [Google Cloud Console](https://console.cloud.google.com/apis).
- Créer un nouveau projet (ou en sélectionner un existant).
- Dans **APIs & Services → Library**, chercher **Maps SDK for Android** et
  cliquer sur **Enable**.

**2. Récupérer l'empreinte SHA-1 de l'app**

Google restreint les clés API à un couple `package name + SHA-1` pour éviter
les abus. Pour un build de développement local :

```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

Copier la ligne `SHA1:` (format `XX:XX:XX:...`).

> Pour une app publiée sur le Play Store, utiliser à la place la SHA-1 trouvée
> dans **Google Play Console → (votre app) → Release → Setup → App integrity
> → App Signing**.

**3. Créer la clé API**

- Dans la [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials),
  cliquer **Create Credentials → API key**.
- Une clé est générée. Cliquer **Edit API key** pour la restreindre :
  - **Application restrictions** → choisir **Android apps**.
  - **Add an item** :
    - **Package name** : `com.matthysdev.exporouterprotectedroutes`
      (ou ton propre `android.package` défini dans `app.json`).
    - **SHA-1 certificate fingerprint** : la valeur copiée à l'étape 2.
  - **API restrictions** → restreindre à **Maps SDK for Android**.
- Cliquer **Save**.

**4. Ajouter la clé dans `app.json`**

```json
{
  "expo": {
    "android": {
      "package": "com.matthysdev.exporouterprotectedroutes",
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy...VOTRE_CLE_ICI..."
        }
      }
    }
  }
}
```

> ⚠️ Ne **jamais** committer la clé dans un repo public. Pour ce projet
> pédagogique, on la met directement dans `app.json` pour aller vite ; en
> production, passer par `app.config.js` + variable d'env (par ex.
> `process.env.GOOGLE_MAPS_API_KEY`).

**5. Rebuild le dev client**

Un simple reload Metro ne suffit pas (changement natif) :

```bash
npx expo run:android
```

**6. Vérifier**

Lancer l'app, se connecter, ouvrir l'onglet **Carte** : Paris s'affiche avec
un marqueur. Si la carte reste grise ou si l'app crashe :

- Vérifier que **Maps SDK for Android** est bien activé dans le projet Google
  Cloud sélectionné (et non un autre projet du même compte).
- Vérifier que le `package name` et la `SHA-1` dans les restrictions de la
  clé correspondent **exactement** à ceux du build courant.
- Regarder les logs natifs : `npx expo run:android` puis filtrer
  `adb logcat | grep -i "google\|maps\|api"` — Google y journalise les
  erreurs d'authentification de clé.

## Idées d'exercices pour les élèves

- Ajouter un écran `register` dans `(auth)` et naviguer entre `login` et
  `register` (navigation **interne** à une stack non protégée).
- Ajouter un second onglet/écran dans `(app)` et observer que tout le groupe
  est protégé d'un coup.
- Exiger Face ID **à chaque relance** (re-prompt au démarrage dans `auth.tsx`
  au lieu de faire confiance à la session stockée).
- Remplacer le `guard` booléen par un rôle (`user` / `admin`) et protéger une
  route admin.
