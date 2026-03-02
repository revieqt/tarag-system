import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {ThemedIcons} from '@/components/ThemedIcons';
import { calculateAge } from '@/utils/calculateAge';
import { formatDateToString } from '@/utils/formatDateToString';
import BackButton from '@/components/BackButton';
import ProfileImage from '@/components/ProfileImage';
import GradientBlobs from '@/components/GradientBlobs';
import { ExpBadge, ExpLevel, ExpProgress } from '@/components/ExpFeature';
import { useInternetConnection } from '@/utils/checkInternetConnection';


export default function ProfileScreen() {
  const { otherUserId } = useLocalSearchParams();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<String>('travels');
  const [otherUser, setOtherUser] = useState<any>(null);
  const isConnected = useInternetConnection();
  
  let user = session?.user;
  const isCurrentUser = !otherUserId;
  const displayUser = isCurrentUser ? user : otherUser;

  useEffect(() => {
    if (otherUserId) {
      // TODO: Fetch other user data from API
      // For now, placeholder
      console.log('Fetching user with ID:', otherUserId);
    }
  }, [otherUserId]);

  // Determine if tabs should be visible
  const showTravelInfo = isCurrentUser || displayUser?.visibilitySettings?.isTravelInfoPublic;
  const showAbout = isCurrentUser || displayUser?.visibilitySettings?.isPersonalInfoPublic;
  const isProfileLocked = !isCurrentUser && !displayUser?.visibilitySettings?.isProfilePublic;

  return (
    <ThemedView style={{flex: 1}}>
      <ThemedView style={styles.imageHeaderContainer} color='secondary'>
        <BackButton type='floating' color='white'/>
        <ProfileImage imagePath={displayUser?.profileImage}/>
      </ThemedView>

      <ScrollView style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
        <View style={{height: Dimensions.get('window').height /1.25, pointerEvents: isProfileLocked ? 'none' : 'box-none'}}>
          {isProfileLocked ? (
            <View style={styles.lockedProfileContainer}>
              <ThemedIcons name='lock-closed' size={48} color={primaryColor}/>
              <ThemedText type='subtitle' style={{marginTop: 16, textAlign: 'center'}}>
                This profile is private
              </ThemedText>
              <ThemedText style={{marginTop: 8, textAlign: 'center', opacity: 0.7}}>
                This user has made their profile private
              </ThemedText>
            </View>
          ) : (
            <>
              <ScrollView style={styles.tabsContainer}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContentContainer}
              >
                {showTravelInfo && (
                  <TouchableOpacity style={[styles.tabs, {backgroundColor: primaryColor}]}
                    onPress={() => setActiveTab('travels')}
                  >
                    <ThemedText>Travel Info</ThemedText>
                  </TouchableOpacity>
                )}
                {showAbout && (
                  <TouchableOpacity style={[styles.tabs, {backgroundColor: primaryColor}]}
                    onPress={() => setActiveTab('about')}
                  >
                    <ThemedText>About</ThemedText>
                  </TouchableOpacity>
                )}
                {isCurrentUser && isConnected && (
                  <TouchableOpacity style={[styles.tabs, {backgroundColor: primaryColor}]}
                    onPress={() => router.push('/account/settings-accountControl')}
                  >
                    <ThemedText>Edit Profile</ThemedText>
                  </TouchableOpacity>
                )}
              </ScrollView>
              <LinearGradient
                colors={['transparent', '#000']}
                style={styles.imageHeaderGradient}
              >
                <ThemedText type='title' style={{color: '#fff'}}>
                  {displayUser?.fname} {displayUser?.lname}
                </ThemedText>
                <ThemedText style={{color: '#fff9'}}>
                  @{displayUser?.username}
                </ThemedText>
                <ThemedText style={{color: '#fff9'}}>
                  {displayUser?.type[0].toUpperCase()}{displayUser?.type.slice(1)}
                </ThemedText>
                {displayUser?.bio && (
                  <ThemedText style={{color: '#fff9', marginTop: 8}}>
                    {displayUser?.bio}
                  </ThemedText>
                )}
              </LinearGradient>
            </>
          )}
          <ThemedView style={styles.headerBottom}/>
        </View>
        <ThemedView>

          <View style={activeTab==='travels' && showTravelInfo ? {flex: 1, opacity: 1, paddingHorizontal:16} : {flex: 0, height: 0, opacity: 0}}>
            <ThemedView style={styles.badgeContainer} color='primary'>
              <GradientBlobs/>
              <ExpBadge expPoints={displayUser?.expPoints}/>
              <View style={styles.progressContainer}>
                <ExpLevel expPoints={displayUser?.expPoints} />
                <ExpProgress expPoints={displayUser?.expPoints} />
              </View>
            </ThemedView>
            {/* <View style={styles.gridContainer}>
              <ThemedView color='primary' shadow style={[styles.gridChildContainer, styles.leftGridContainer]}>

              </ThemedView>
              <View style={[styles.gridChildContainer, {gap: '4%'}]}>
                <ThemedView color='primary' shadow style={styles.rightGridContainer}>
                </ThemedView>
                <ThemedView color='primary' shadow style={styles.rightGridContainer}>
                
                </ThemedView>
              </View>
            </View> */}
          </View>
          
          <View style={activeTab==='about' && showAbout ? {flex: 1, opacity: 1} : {flex: 0, height: 0, opacity: 0}}>
            <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Gender</ThemedText>
              <ThemedText>{displayUser?.gender[0].toUpperCase()}{displayUser?.gender.slice(1)}</ThemedText>
            </View>
            {/* <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Age</ThemedText>
              <ThemedText>{calculateAge(displayUser?.bdate)}</ThemedText>
            </View>
            <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Birthdate</ThemedText>
              <ThemedText>{formatDateToString(displayUser?.bdate)}</ThemedText>
            </View>
            {displayUser?.contactNumber && (
              <View style={styles.rowContainer}>
                <ThemedText type='subtitle'>Contact Number</ThemedText>
                <ThemedText>{displayUser?.contactNumber}</ThemedText>
              </View>
            )}
            <View style={styles.rowContainer}>
              <ThemedText type='subtitle'>Joined on</ThemedText>
              <ThemedText>{formatDateToString(displayUser?.createdOn)}</ThemedText>
            </View> */}
          </View>
        </ThemedView>
        
      </ScrollView>
      {user?.visibilitySettings.isProfilePublic === false && (
        <ThemedView style={styles.noteContainer} color='primary'>
          <ThemedText style={styles.note}>Your Profile is currently Private</ThemedText>
          <TouchableOpacity onPress={()=> router.push('/account/settings-accountControl')}>
            <ThemedText style={[styles.note, {textDecorationLine: 'underline'}]}>Change</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  imageHeaderContainer:{
    height: Dimensions.get('window').height /1.25,
  },
  profileImage: {
    width: '100%',
    height: Dimensions.get('window').height /1.25,
  },
  imageHeaderGradient:{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 70,
  },
  headerBottom:{
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 200,
  },
  tabsContainer:{
    flexDirection: 'row',
    maxHeight: 50,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 30,
    zIndex: 300,
  },
  tabsContentContainer:{
    paddingHorizontal: 10,
    gap: 7,
  },
  tabs:{
    paddingHorizontal: 12,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  badgeContainer:{
    width: '100%',
    padding: 10,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 12,
    justifyContent: 'center',
  },
  progressContainer:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 70,
    right: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  // gridContainer:{
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 16,
  // },
  // gridChildContainer:{
  //   width: Dimensions.get('window').width * 0.445,
  //   aspectRatio: 1,
  //   borderRadius: 12,
  // },
  // leftGridContainer:{
  //   padding: 14,
  //   overflow: 'hidden',
  //   borderWidth: 1,
  //   borderColor: '#ccc3'
  // },
  // rightGridContainer:{
  //   height: '48%',
  //   width: '100%',
  //   borderRadius: 12,
  //   overflow: 'hidden',
  //   borderWidth: 1,
  //   borderColor: '#ccc3'
  // },
  rowContainer:{
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc3',
    justifyContent: 'center',
    opacity: 0.7,
  },
  lockedProfileContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  noteContainer:{
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    padding:10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc3',
    justifyContent: 'space-between',
    flexDirection: 'row',
    zIndex: 10000,
  },
  note:{
    fontSize: 12,
    opacity: 0.7,
  }
});
