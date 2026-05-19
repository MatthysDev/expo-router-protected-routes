import { AppleMaps, GoogleMaps } from 'expo-maps';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Coords = { latitude: number; longitude: number };

const PARIS: Coords = { latitude: 48.8566, longitude: 2.3522 };

export function CityMap() {
  const [query, setQuery] = useState('');
  const [center, setCenter] = useState<Coords>(PARIS);
  const [label, setLabel] = useState('Paris');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchCity() {
    const ville = query.trim();
    if (!ville) return;

    setLoading(true);
    setError(null);
    try {
      // Sur Android le geocoding exige la permission de localisation.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée.');
        return;
      }

      const results = await Location.geocodeAsync(ville);
      if (results.length === 0) {
        setError(`Ville introuvable : "${ville}"`);
        return;
      }

      const { latitude, longitude } = results[0];
      setCenter({ latitude, longitude });
      setLabel(ville);
    } catch {
      setError('Erreur pendant la recherche.');
    } finally {
      setLoading(false);
    }
  }

  const cameraPosition = { coordinates: center, zoom: 11 };
  const markers = [{ id: 'ville', coordinates: center, title: label }];
  // On force le re-centrage en remontant la carte quand le centre change.
  const mapKey = `${center.latitude},${center.longitude}`;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Chercher une ville (ex : Lyon)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchCity}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={searchCity}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>OK</Text>
          )}
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.mapWrapper}>
        {Platform.OS === 'ios' ? (
          <AppleMaps.View
            key={mapKey}
            style={StyleSheet.absoluteFill}
            cameraPosition={cameraPosition}
            markers={markers}
          />
        ) : (
          <GoogleMaps.View
            key={mapKey}
            style={StyleSheet.absoluteFill}
            cameraPosition={cameraPosition}
            markers={markers}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 56,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  mapWrapper: { flex: 1, overflow: 'hidden' },
});
