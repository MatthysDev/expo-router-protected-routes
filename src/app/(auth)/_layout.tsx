import { Stack } from 'expo-router';

// La Stack du groupe "déconnecté". Une seule route pour la démo : login.
// Tu peux en ajouter (register, mot-de-passe-oublié...) pour montrer la
// navigation interne d'une stack non protégée.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
