import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function AnimationScreen() {
  const [actif, setActif] = useState(false);
  const progress = useSharedValue(0);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.6]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
    borderRadius: interpolate(progress.value, [0, 1], [16, 80]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#208AEF', '#dc2626']),
  }));

  function toggle() {
    const next = !actif;
    setActif(next);
    progress.value = next ? withSpring(1, { damping: 8 }) : withTiming(0, { duration: 400 });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Reanimated : la valeur partagée anime échelle, rotation, arrondi et
        couleur en même temps — le tout sur le thread natif.
      </Text>

      <View style={styles.stage}>
        <Animated.View style={[styles.box, boxStyle]} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={toggle}>
        <Text style={styles.buttonText}>{actif ? 'Réinitialiser' : 'Animer'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff', gap: 16 },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  stage: { height: 220, alignItems: 'center', justifyContent: 'center' },
  box: { width: 100, height: 100 },
  button: { backgroundColor: '#208AEF', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 14, minWidth: 220, alignItems: 'center' },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
