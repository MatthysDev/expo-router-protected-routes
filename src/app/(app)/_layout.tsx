import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

/**
 * Le groupe "connecté" devient une barre d'onglets (Tabs).
 * Tout ce groupe reste protégé par le guard du _layout racine :
 * la déconnexion fait disparaître TOUS ces onglets d'un coup.
 */
export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#208AEF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="animation"
        options={{
          title: 'Animation',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="photo"
        options={{
          title: 'Photo',
          tabBarIcon: ({ color, size }) => <Ionicons name="image" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
