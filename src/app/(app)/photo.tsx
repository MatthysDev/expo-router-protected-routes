import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// On range toujours la photo sous le même nom dans le dossier persistant
// de l'app. Ce dossier survit aux redémarrages → la photo reste là.
const SAVED = () => new File(Paths.document, 'profile.jpg');

export default function PhotoScreen() {
  const [uri, setUri] = useState<string | null>(null);

  // Au montage : si une photo a déjà été enregistrée, on l'affiche.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const saved = SAVED();
    if (saved.exists) {
      setUri(`${saved.uri}?t=${Date.now()}`);
    }
  }, []);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled) return;

    const pickedUri = result.assets[0].uri;

    // Sur le web on ne fait pas de copie fichier : on affiche directement.
    if (Platform.OS === 'web') {
      setUri(pickedUri);
      return;
    }

    // Copie de l'image choisie dans le stockage local de l'app.
    const dest = SAVED();
    if (dest.exists) dest.delete();
    new File(pickedUri).copy(dest);

    // Le ?t= force <Image> à recharger (sinon il garde l'ancienne en cache).
    setUri(`${dest.uri}?t=${Date.now()}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Choisissez une photo : elle est copiée dans le stockage local de
        l’app et rechargée automatiquement au prochain lancement.
      </Text>

      <View style={styles.preview}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholder}>Aucune photo</Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={pickImage}>
        <Text style={styles.buttonText}>Choisir une photo</Text>
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
    gap: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  preview: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { color: '#999', fontSize: 15 },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
