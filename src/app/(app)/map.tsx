import { CityMap } from '@/components/CityMap';

// La route reste unique. Metro choisit automatiquement CityMap.web.tsx sur
// le web (pas de carte native) et CityMap.tsx sur iOS / Android.
export default function MapScreen() {
  return <CityMap />;
}
