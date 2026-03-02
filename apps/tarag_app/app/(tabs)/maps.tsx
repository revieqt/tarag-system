import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRoute } from '@/context/RouteContext';
import ActiveRouteMap from '../maps/maps-activeRoute';

export default function MapsScreen() {
  const { activeRoute } = useRoute();
  return (
   <ThemedView style={{flex: 1}}>
      {activeRoute && <ActiveRouteMap/>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  
});
