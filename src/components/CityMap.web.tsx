import { StyleSheet, Text, View } from 'react-native';

export function CityMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Carte indisponible sur le web</Text>
      <Text style={styles.text}>
        expo-maps ne fonctionne que sur iOS / Android (development build).
        Lancez la carte avec `npx expo run:ios` ou `npx expo run:android`.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10, backgroundColor: '#fff' },
  emoji: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  text: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
});
