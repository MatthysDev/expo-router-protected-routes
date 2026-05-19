import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/ctx/auth';

export default function HomeScreen() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>🔒 GROUPE (app)</Text>
      <Text style={styles.title}>Bienvenue 👋</Text>
      <Text style={styles.subtitle}>
        Vous êtes dans la stack protégée. Si vous vous déconnectez, le guard
        repasse à false et Expo Router vous renvoie automatiquement vers le
        login — sans aucun code de navigation ici.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={signOut}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff', gap: 12 },
  badge: { fontSize: 13, fontWeight: '700', color: '#15803d', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  button: { backgroundColor: '#dc2626', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 14, minWidth: 240, alignItems: 'center' },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
