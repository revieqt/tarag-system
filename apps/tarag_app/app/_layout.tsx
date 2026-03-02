import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/context/SessionContext';
import { View } from 'react-native';
import { RouteProvider } from '@/context/RouteContext';
// import { AlertsProvider } from '@/context/AlertsContext';
import mobileAds from 'react-native-google-mobile-ads';
import * as SplashScreen from 'expo-splash-screen';
import AnnouncementModal from '@/components/modals/AnnouncementModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { configureLocationService } from "@/services/locationService";
import {
  getTodaysAnnouncementsToDisplay,
  getNextAnnouncement,
  handleNextAnnouncement,
  Announcement,
} from '@/services/announcementService';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log('AdMob initialized'));
  }, []);

  // useEffect(() => {
  //   configureLocationService();
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <RouteProvider>
            {/* <AlertsProvider> */}
              <AppContent />
            {/* </AlertsProvider> */}
          </RouteProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const backgroundColor = useThemeColor({}, 'primary');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const loadAnnouncements = async () => {
      const announcementsList = await getTodaysAnnouncementsToDisplay();
      if (announcementsList.length > 0) {
        setAnnouncements(announcementsList);
        const firstAnnouncement = await getNextAnnouncement(announcementsList);
        
        if (firstAnnouncement) {
          setCurrentAnnouncement(firstAnnouncement);
          setIsModalVisible(true);
        }
      }
    };
    loadAnnouncements();
  }, []);

  const handleAnnouncementModalClose = async () => {
    setIsModalVisible(false);
    const nextAnnouncement = await handleNextAnnouncement(announcements);
    if (nextAnnouncement) {
      setCurrentAnnouncement(nextAnnouncement);
      setTimeout(() => {
        setIsModalVisible(true);
      }, 100);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'bottom']}>
        <Stack 
          screenOptions={{ headerShown: false }}
          initialRouteName={"index"}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="document-view" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgotPassword" />
          <Stack.Screen name="auth/verifyEmail" />
          <Stack.Screen name="auth/changePassword" />
          <Stack.Screen name="account/firstLogin" />
          <Stack.Screen name="account/profile" />
          <Stack.Screen name="account/settings-accountControl" />
          <Stack.Screen name="routes/routes" />
          <Stack.Screen name="routes/routes-create" />
          <Stack.Screen name="itineraries/itineraries" />
          <Stack.Screen name="itineraries/itineraries-form" />
          <Stack.Screen name="itineraries/[id]" />
          <Stack.Screen name="safety/safety" />
          <Stack.Screen name="rooms/rooms" />
          <Stack.Screen name="rooms/rooms-create" />
          <Stack.Screen name="qr/qr-scan" />
          <Stack.Screen name="+not-found" />
        </Stack>
        
      </SafeAreaView>
      <AnnouncementModal
        visible={isModalVisible}
        announcement={currentAnnouncement}
        onClose={handleAnnouncementModalClose}
      />
    </View>
  );
}