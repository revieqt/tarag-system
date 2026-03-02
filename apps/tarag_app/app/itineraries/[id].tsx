import OptionsPopup from '@/components/OptionsPopup';
import { ThemedIcons } from '@/components/ThemedIcons';
import { ThemedText } from '@/components/ThemedText';
import BackButton from '@/components/BackButton';
import MapView, { MAP_TYPES, PROVIDER_DEFAULT } from 'react-native-maps';
import TaraMarker from '@/components/maps/TaraMarker';
import {
  useGetItinerary,
  useDeleteItinerary,
  useMarkItineraryAsDone,
  useCancelItinerary,
} from '@/hooks/useItinerary';
import { useMapType } from '@/hooks/useMapType';
import { useLocation } from '@/hooks/useLocation';
import { usePlaceWeather } from '@/hooks/useWeather';
import { useSession } from '@/context/SessionContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, Dimensions, Linking, ScrollView} from 'react-native';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateToString } from '@/utils/formatDateToString';
import ShareModal from '@/components/modals/ShareModal';
import LocationDisplay from '@/components/LocationDisplay';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import BottomSheet from '@/components/BottomSheet';
import { Location, Address } from '@/services/itineraryService';

interface LocationWithDate extends Location {
  date?: number | Date | string;
}

interface DateLocations {
  date: number | Date | string;
  locations: LocationWithDate[];
}


export default function ItineraryViewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  
  // Use React Query hooks
  const { data: itinerary, isLoading, error } = useGetItinerary(id || null);
  const deleteItineraryMutation = useDeleteItinerary();
  const markItineraryAsDoneMutation = useMarkItineraryAsDone();
  const cancelItineraryMutation = useCancelItinerary();
  
  const { mapType: currentMapType } = useMapType();
  const { latitude: userLat, longitude: userLng } = useLocation();
  const { session, updateSession } = useSession();
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDate | null>(null);
  const mapRef = useRef<MapView>(null);
  const secondaryColor = useThemeColor({}, 'secondary');
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const getAllLocations = () => {
    if (!itinerary?.locations) return [];
    const locations: any[] = [];
    itinerary.locations.forEach((day: any, dayIndex: number) => {
      if (Array.isArray(day.locations)) {
        day.locations.forEach((location: any, locIndex: number) => {
          if (location.latitude && location.longitude) {
            locations.push({
              ...location,
              dayIndex,
              locIndex,
              label: `${dayIndex + 1}.${locIndex + 1}`,
              date: day.date || undefined,
            });
          }
        });
      } else if (day.latitude && day.longitude) {
        locations.push({
          ...day,
          dayIndex: 0,
          locIndex: dayIndex,
          label: `${dayIndex + 1}`,
          date: undefined,
        });
      }
    });
    return locations;
  };

  // Map utility functions
  const getMapTypeEnum = (mapType: string) => {
    switch (mapType) {
      case 'satellite':
        return MAP_TYPES.SATELLITE;
      case 'hybrid':
        return MAP_TYPES.HYBRID;
      case 'terrain':
        return MAP_TYPES.TERRAIN;
      case 'standard':
      default:
        return MAP_TYPES.STANDARD;
    }
  };

  const handleMarkerPress = (location: LocationWithDate) => {
    setSelectedLocation(location);
  };

  const handleLocationClick = (location: LocationWithDate) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
    setSelectedLocation(location);
  };

  const formatMapDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    
    try {
      if (typeof dateValue === 'string') {
        return dateValue.slice(0, 10);
      }
      if (dateValue instanceof Date) {
        return dateValue.toISOString().slice(0, 10);
      }
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toISOString().slice(0, 10);
      }
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toISOString().slice(0, 10);
      }
      return 'Invalid Date';
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return 'Invalid Date';
    }
  };

  const renderDayLocations = (loc: any) => {
    return (
      <LocationDisplay
        content={loc.locations && Array.isArray(loc.locations) ? loc.locations.map((l: any, i: number) => (
          <TouchableOpacity 
            key={i} 
            style={{flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginBottom: 10}}
            onPress={() => handleLocationClick(l)}
            activeOpacity={0.7}
          >
            <View>
              <ThemedText>{l.locationName} </ThemedText>
              {l.address && (l.address.city || l.address.district || l.address.region) && (
                <ThemedText style={{opacity: .6, fontSize: 12}}>
                  {[ l.address.district,l.address.city, l.address.region].filter(Boolean).join(', ')}
                </ThemedText>
              )}
              <ThemedText style={{opacity: .5}}>{l.note ? `${l.note}` : ''}</ThemedText>
            </View>
          </TouchableOpacity>
        )) : []}
      />
    );
  };

  const allMapLocations: LocationWithDate[] = Array.isArray(itinerary?.locations)
    ? itinerary.locations
        .flatMap(item => {
          if (item && typeof item === 'object' && 'locations' in item && Array.isArray(item.locations)) {
            return item.locations.map((loc: any) => ({
              ...loc,
              date: item.date
            }));
          }
          if (item && typeof item === 'object' && 'latitude' in item && 'longitude' in item) {
            return [item];
          }
          return [];
        })
        .filter(
          (loc): loc is LocationWithDate =>
            !!loc &&
            typeof loc.latitude === 'number' &&
            typeof loc.longitude === 'number'
        )
    : [];

  const mapInitialRegion = allMapLocations.length > 0
    ? {
        latitude: allMapLocations[0].latitude,
        longitude: allMapLocations[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : userLat && userLng
    ? {
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 10.3157,
        longitude: 123.8854,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  // Handlers for actions
  const handleMarkAsCompleted = async () => {
    if (!itinerary?._id) return;

    Alert.alert(
      'Mark as Done',
      'Mark this itinerary as completed?',
      [
        { text: 'Cancel', onPress: () => null },
        {
          text: 'Done',
          onPress: async () => {
            try {
              await markItineraryAsDoneMutation.mutateAsync(itinerary._id);
              Alert.alert('Success', 'Itinerary marked as done');
              router.replace('/itineraries/itineraries');
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Failed to mark as done';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!itinerary?._id) return;

    Alert.alert(
      'Cancel Itinerary',
      'Are you sure you want to cancel this itinerary?',
      [
        { text: 'No', onPress: () => null },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelItineraryMutation.mutateAsync(itinerary._id);
              Alert.alert('Success', 'Itinerary cancelled');
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Failed to cancel itinerary';
              Alert.alert('Error', errorMsg);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!itinerary?._id) return;
    
    Alert.alert(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary? Doing so will remove the itinerary permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteItineraryMutation.mutateAsync(itinerary._id);
              // Navigate away immediately - don't show another alert
              router.replace('/itineraries/itineraries');
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Failed to delete itinerary';
              Alert.alert('Error', errorMsg);
            }
          }
        }
      ]
    );
  };

  const handleGoToUpdateForm = () => {
    if (!itinerary || typeof itinerary !== 'object') {
      Alert.alert('Error', 'No itinerary data to update.');
      return;
    }
    router.push({
      pathname: '/itineraries/itineraries-form',
      params: { itineraryData: JSON.stringify(itinerary) }
    });
  };

  const handleRepeatItinerary = () => {
    if (!itinerary || typeof itinerary !== 'object') {
      Alert.alert('Error', 'No itinerary data to repeat.');
      return;
    }
    
    // Create a copy of the itinerary without startDate and endDate, and set status to pending
    const itineraryToRepeat = {
      ...itinerary,
      startDate: undefined,
      endDate: undefined,
      status: 'pending'
    };
    
    router.push({
      pathname: '/itineraries/itineraries-form',
      params: { itineraryData: JSON.stringify(itineraryToRepeat) }
    });
  };

  const handleCreateGroupWithItinerary = async () => {
    // TODO: Implement group creation feature
    Alert.alert('Coming Soon', 'Group creation feature will be available soon');
  };

  const handleSearchLocation = async (location: Location) => {
    try {
      const searchQuery = encodeURIComponent(location.locationName);
      const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
      await Linking.openURL(googleSearchUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open search. Please try again.');
    }
  };

  const showFirstOptions =
    itinerary && (itinerary.status === 'active');

  // Component to display weather for selected location
  const SelectedLocationWeather = ({ selectedLocation, secondaryColor }: any) => {
    const { data: weatherData, isLoading } = usePlaceWeather(
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.address?.city
    );

    if (isLoading || !weatherData) return null;

    return (
      <View style={styles.weatherInfoContainer}>
        <View style={styles.weatherInfo}>
          <ThemedIcons name="thermometer" size={16} color="#B36B6B" />
          <ThemedText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.temperature !== null ? `${Math.round(weatherData.temperature)}°C` : 'N/A'}
          </ThemedText>
          <ThemedText style={{ color: '#fff', fontSize: 9 }}>Heat</ThemedText>
        </View>
        <View style={styles.weatherInfo}>
          <ThemedIcons name="cloud" size={16} color="#5A7D9A" />
          <ThemedText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.precipitation !== null ? `${weatherData.precipitation}mm` : 'N/A'}
          </ThemedText>
          <ThemedText style={{ color: '#fff', fontSize: 9 }}>Rain</ThemedText>
        </View>
        <View style={styles.weatherInfo}>
          <ThemedIcons name="water" size={16} color="#5A7D9A" />
          <ThemedText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.humidity !== null ? `${Math.round(weatherData.humidity)}%` : 'N/A'}
          </ThemedText>
          <ThemedText style={{ color: '#fff', fontSize: 9 }}>Humid</ThemedText>
        </View>
        <View style={styles.weatherInfo}>
          <ThemedIcons name="fan" size={16} color="#5A7D9A" />
          <ThemedText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
            {weatherData.windSpeed !== null ? `${Math.round(weatherData.windSpeed)}km/h` : 'N/A'}
          </ThemedText>
          <ThemedText style={{ color: '#fff', fontSize: 9 }}>Wind</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{flex: 1}}>
        <MapView 
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map} 
          initialRegion={mapInitialRegion}
          mapType={getMapTypeEnum(currentMapType)}
          showsUserLocation={true}
        >
          {allMapLocations.map((loc, idx) => {
            return (
              <TaraMarker
                key={`${loc.latitude},${loc.longitude},${idx}`}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                onPress={() => handleMarkerPress(loc)}
                type="dot"
                color="limegreen"
              />
            );
          })}
        </MapView>
      </View>
      <LinearGradient
        colors={['#000', 'transparent']}
        style={styles.headerGradient}
      >
        {(itinerary?.userID && itinerary?.userID === session?.user?.id) && (
          showFirstOptions ? (
            <OptionsPopup
              options={[
                <OptionsPopup
                  key="createGroupTrip"
                  style={[styles.createGroupTrip, { opacity: 0.5 }]}
                  disabled
                  options={[
                    <View key="header">
                      <ThemedText type='subtitle'>Create Group Trip</ThemedText>
                      <ThemedText>Create a group with this itinerary and invite your friends</ThemedText>
                    </View>,
                    <View style={{flex: 1}} key="form">
                      <TextField
                        placeholder="Enter Group Name"
                        value={groupName}
                        onChangeText={setGroupName}
                        onFocus={() => {}}
                        onBlur={() => {}}
                        isFocused={false}
                        autoCapitalize="words"
                      />
                      <Button
                        title={creatingGroup ? 'Creating...' : 'Create Group'}
                        type='primary'
                        onPress={handleCreateGroupWithItinerary}
                        disabled={creatingGroup}
                      />
                    </View>
                  ]}
                >
                  <ThemedIcons name="account-group" size={20}/>
                  <ThemedText>Create a Group with Itinerary</ThemedText>
                </OptionsPopup>,
                <TouchableOpacity 
                  style={styles.optionsChild}
                  onPress={() => setShowShare(true)}
                >
                  <ThemedIcons name="share" size={20} />
                  <ThemedText>Share Itinerary</ThemedText>
                </TouchableOpacity>,
                <TouchableOpacity style={styles.optionsChild} onPress={handleGoToUpdateForm}>
                  <ThemedIcons name="pencil" size={20} />
                  <ThemedText>Edit Itinerary</ThemedText>
                </TouchableOpacity>,
                <TouchableOpacity style={styles.optionsChild} onPress={handleMarkAsCompleted}>
                  <ThemedIcons name="check-circle" size={20} />
                  <ThemedText>Mark as Done</ThemedText>
                </TouchableOpacity>,
                <TouchableOpacity style={styles.optionsChild} onPress={handleCancel}>
                  <ThemedIcons name="minus-circle" size={20} />
                  <ThemedText>Cancel Itinerary</ThemedText>
                </TouchableOpacity>,
                <TouchableOpacity style={styles.optionsChild} onPress={handleDelete}>
                  <ThemedIcons name="delete" size={20} />
                  <ThemedText>Delete Itinerary</ThemedText>
                </TouchableOpacity>,
              ]}
              style={styles.options}
            >
              <ThemedIcons name="dots-vertical" size={20} color="#fff" />
            </OptionsPopup>
          ) : (
            <OptionsPopup
              options={[
                <TouchableOpacity style={styles.optionsChild} onPress={handleRepeatItinerary}>
                  <ThemedIcons name="history" size={20} />
                  <ThemedText>Repeat Itinerary</ThemedText>
                </TouchableOpacity>,
                <TouchableOpacity style={styles.optionsChild} onPress={handleDelete}>
                  <ThemedIcons name="delete" size={20} />
                  <ThemedText>Delete Itinerary</ThemedText>
                </TouchableOpacity>
              ]}
              style={styles.options}
            >
              <ThemedIcons name="dots-vertical" size={20} color="#fff" />
            </OptionsPopup>
          ))
        }
        

        <BackButton type="close-floating" color="#fff"/>
        <ThemedText type='subtitle' style={{ color: '#fff'}}>
          {itinerary?.title}
        </ThemedText>
        <View style={styles.detailsContainer}>
          <ThemedIcons name="calendar" size={13} color="#fff"/>
          <ThemedText style={{ color: '#fff', fontSize: 11 }}>
            {formatDateToString(itinerary?.startDate || "")} - {formatDateToString(itinerary?.endDate || "")}
          </ThemedText>
        </View>
        <View style={styles.detailsContainer}>
          <ThemedIcons name="tag" size={13} color="#fff"/>
          <ThemedText style={{ color: '#fff', fontSize: 11 }}>
            {itinerary?.type}
          </ThemedText>
        </View>
        <View style={styles.detailsContainer}>
          <ThemedIcons name="pencil" size={13} color="#fff"/>
          <ThemedText style={{ color: '#fff', fontSize: 11 }}>
            Created by {itinerary?.username}
          </ThemedText>
        </View>
      </LinearGradient>

      {selectedLocation ? (
        <LinearGradient
          colors={['transparent','#000']}
          style={styles.bottomGradient}
        >
      
            <TouchableOpacity onPress={() => setSelectedLocation(null)} style={styles.goBack}>
                <ThemedIcons name="arrow-left" size={20} color="#fff" />
                <ThemedText style={{color: '#fff', fontSize: 11}}>Back</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={{ color: '#fff'}}>
                {selectedLocation.locationName}
            </ThemedText>
            {selectedLocation.address && (selectedLocation.address.city || selectedLocation.address.district || selectedLocation.address.region || selectedLocation.address.country) && (
              <ThemedText style={{ color: '#fff', opacity: 0.7, marginBottom: 8, fontSize: 12 }}>
                {[ selectedLocation.address.district,selectedLocation.address.city, selectedLocation.address.region, selectedLocation.address.country].filter(Boolean).join(', ')}
              </ThemedText>
            )}

            <View style={styles.locationButtonsContainer}>
                <TouchableOpacity style={[styles.locationButtons, {backgroundColor: secondaryColor}]}
                onPress={() => []
                // handleGetDirection(selectedLocation)
            }>
                    <ThemedIcons name="directions" size={20} color="#fff" />
                    <ThemedText style={{color: '#fff', fontSize: 11}}>Get Directions</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.locationButtons}
                onPress={() => handleSearchLocation(selectedLocation)}>
                    <ThemedIcons name="magnify" size={20} color="#fff" />
                    <ThemedText style={{color: '#fff', fontSize: 11}}>Search</ThemedText>
                </TouchableOpacity>
            </View>

            <SelectedLocationWeather selectedLocation={selectedLocation} secondaryColor={secondaryColor} />
            
            {selectedLocation.note && (
            <ThemedText style={styles.locationNote}>
                {selectedLocation.note}
            </ThemedText>
            )}
            {/* <WeatherCard
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            locationName={selectedLocation.locationName}
            date={selectedLocation.date 
                ? formatDate(selectedLocation.date)
                : itinerary?.startDate 
                ? formatDate(itinerary.startDate)
                : undefined
            }
            />  */}
        </LinearGradient>
        ) : (
        itinerary && (
            <ThemedView style={styles.bottomSheet} color='primary'>
              <ScrollView>
                <ThemedText style={styles.description}>{itinerary.description}</ThemedText>
                {Array.isArray(itinerary.locations) && itinerary.locations.length > 0 && (
                    // Check if planDaily (has nested locations) or direct locations
                    (itinerary.locations[0] as any)?.locations ? (
                    // planDaily = true: locations have date and nested locations array
                    itinerary.locations.map((loc: any, idx: number) => (
                        <View key={idx}>
                        {loc.date && (
                            <>
                            <ThemedText type='subtitle' style={{fontSize: 15}}>Day {idx + 1} </ThemedText>
                            <ThemedText style={{marginBottom: 12, opacity: .5}}>({formatMapDate(loc.date)})</ThemedText>
                            </>
                        )}
                        {renderDayLocations(loc)}
                        </View>
                    ))
                    ) : (
                    // planDaily = false: locations are direct objects
                    <LocationDisplay
                        content={itinerary.locations.map((loc: any, i: number) => (
                        <TouchableOpacity 
                            key={i} 
                            style={{flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginBottom: 10}}
                            onPress={() => handleLocationClick(loc)}
                            activeOpacity={0.7}
                        >
                            <View>
                            <ThemedText>{loc.locationName} </ThemedText>
                            {loc.address && (loc.address.city || loc.address.district || loc.address.region) && (
                              <ThemedText style={{opacity: .6, fontSize: 12}}>
                                {[ loc.address.district,loc.address.city, loc.address.region].filter(Boolean).join(', ')}
                              </ThemedText>
                            )}
                            <ThemedText style={{opacity: .5}}>{loc.note ? `${loc.note}` : ''}</ThemedText>
                            </View>
                        </TouchableOpacity>
                        ))}
                    />
                    )
                )}
              </ScrollView>
            
            </ThemedView>
        )
        )}
      <ShareModal
        visible={showShare}
        link={itinerary ? `exp://tarag-v2.exp.app/itineraries/${itinerary._id}` : ''}
        onClose={() => setShowShare(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    borderRadius: 10,
    overflow: 'hidden',
  },
  options: {
    position: 'absolute',
    top: 0,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  optionsChild:{
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  createGroupTrip:{
    flexDirection: 'row',
    height: 20,
    gap: 10,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 50,
    gap: 3,
    zIndex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  goBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0008',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    opacity: .7
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginVertical: 5,
    paddingBottom: 10,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0008',
    paddingHorizontal: 10,
    paddingVertical: 7,    
    borderRadius: 20,
  },
  bottomSheet: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
  },
  description:{
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 10,
    marginBottom: 10,
  },
  weatherInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  weatherInfo: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0005',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 2,
  },
  locationNote: {
    zIndex: 100,
    color: '#fff',
    backgroundColor: '#0005',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
});
