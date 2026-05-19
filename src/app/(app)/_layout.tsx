import { Stack } from 'expo-router';

// La Stack du groupe "connecté". Tout ce qui est ici n'est atteignable
// que si le guard du _layout racine vaut true (utilisateur connecté).
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
