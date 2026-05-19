import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/ctx/auth';

export default function LoginScreen() {
  const { signIn } = useSession();
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setBusy(true);
    try {
      // Le web n'a pas de capteur biométrique : on connecte directement
      // pour que la démo de redirection marche aussi dans le navigateur.
      if (Platform.OS === 'web') {
        await signIn();
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biométrie indisponible',
          "Aucune Face ID / empreinte configurée sur cet appareil. " +
            "Sur simulateur iOS : Features → Face ID → Enrolled.",
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Connexion à l’application',
        cancelLabel: 'Annuler',
        // false = autorise le code de l'appareil en secours si la biométrie échoue
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Succès → on persiste la session. Le guard du _layout racine bascule
        // et Expo Router redirige TOUT SEUL vers le groupe (app).
        await signIn();
      } else {
        Alert.alert('Échec', "L’authentification n’a pas abouti.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>🔓 GROUPE (auth)</Text>
      <Text style={styles.title}>Vous n’êtes pas connecté</Text>
      <Text style={styles.subtitle}>
        Cet écran appartient à la stack non protégée. Connectez-vous pour être
        redirigé automatiquement vers la zone protégée.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleLogin}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter avec Face ID</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    gap: 12,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    minWidth: 240,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
