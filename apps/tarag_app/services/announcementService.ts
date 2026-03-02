import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@/constants/Config';

export interface Announcement {
  _id: string;
  title: string;
  image: string;
  altDesc: string;
  isExternal: boolean;
  linkPath: string;
}

const ANNOUNCEMENTS_STORAGE_KEY = 'announcements_checked_date';
const ANNOUNCEMENTS_INDEX_KEY = 'announcements_current_index';
const ANNOUNCEMENTS_CACHE_KEY = 'announcements_cache';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function fetchTodaysAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/announcements/today`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    const announcements = data.data || [];
    
    if (announcements.length > 0) {
      await AsyncStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(announcements));
    }
    
    return announcements;
  } catch (error) {
    const cached = await AsyncStorage.getItem(ANNOUNCEMENTS_CACHE_KEY);
    if (cached) {
        console.log('[Announcements] 📦 Using cached announcements');
        return JSON.parse(cached);
    }
    return [];
  }
}

export async function hasCheckedAnnouncementsToday(): Promise<boolean> {
  try {
    const storedDate = await AsyncStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    const today = getTodayDateString();
    const hasChecked = storedDate === today;
    return hasChecked;
  } catch (error) {
    return false;
  }
}

export async function markAnnouncementsAsCheckedToday(): Promise<void> {
    const today = getTodayDateString();
    await AsyncStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, today);
    await AsyncStorage.setItem(ANNOUNCEMENTS_INDEX_KEY, '0');
}

export async function getCurrentAnnouncementIndex(): Promise<number> {
  try {
    const index = await AsyncStorage.getItem(ANNOUNCEMENTS_INDEX_KEY);
    const currentIndex = index ? parseInt(index, 10) : 0;
    return currentIndex;
  } catch (error) {
    return 0;
  }
}

export async function incrementAnnouncementIndex(): Promise<void> {
    const currentIndex = await getCurrentAnnouncementIndex();
    const newIndex = currentIndex + 1;
    await AsyncStorage.setItem(ANNOUNCEMENTS_INDEX_KEY, String(newIndex));
}

/**
 * Get announcements to display for today
 * Automatically fetches and manages the display queue
 */
// export async function getTodaysAnnouncementsToDisplay(): Promise<Announcement[]> {
//   try {
//     console.log('[Announcements] 🚀 Starting getTodaysAnnouncementsToDisplay');
    
//     // Check if already viewed today
//     const alreadyChecked = await hasCheckedAnnouncementsToday();
//     if (alreadyChecked) {
//       console.log('[Announcements] ⏭️ User already checked announcements today, skipping');
//       return [];
//     }

//     // Fetch announcements from backend
//     const announcements = await fetchTodaysAnnouncements();
//     console.log(`[Announcements] 📋 Received ${announcements.length} announcements from backend`);
    
//     // If at least 1 announcement, display them
//     if (announcements.length > 0) {
//       console.log('[Announcements] ✅ Announcements found, will display them');
//       return announcements;
//     }

//     // If none found
//     console.log('[Announcements] ℹ️ No announcements available');
//     await markAnnouncementsAsCheckedToday();
//     return [];

//   } catch (error) {
//     console.error('[Announcements] ❌ Error in getTodaysAnnouncementsToDisplay:', error);
//     return [];
//   }
// }

//FUNCTION TO DISPLAY EVERY TIME APP LOADS
export async function getTodaysAnnouncementsToDisplay(): Promise<Announcement[]> {
  try {
    const announcements = await fetchTodaysAnnouncements();

    if (announcements.length > 0) {
      await AsyncStorage.setItem(ANNOUNCEMENTS_INDEX_KEY, "0");
      return announcements;
    }

    return [];

  } catch (error) {
    return [];
  }
}

export async function getNextAnnouncement(announcements: Announcement[]): Promise<Announcement | null> {
  try {
    if (announcements.length === 0) {return null;}
    const currentIndex = await getCurrentAnnouncementIndex();

    if (currentIndex >= announcements.length) {
      await markAnnouncementsAsCheckedToday();
      return null;
    }
    const announcement = announcements[currentIndex];
    return announcement;
  } catch (error) {
    return null;
  }
}

export async function handleNextAnnouncement(announcements: Announcement[]): Promise<Announcement | null> {
    try {
        await incrementAnnouncementIndex();
        return getNextAnnouncement(announcements);
    } catch (error) {
        return null;
    }
}

export async function resetAnnouncementsStorage(): Promise<void> {
    await AsyncStorage.removeItem(ANNOUNCEMENTS_STORAGE_KEY);
    await AsyncStorage.removeItem(ANNOUNCEMENTS_INDEX_KEY);
    await AsyncStorage.removeItem(ANNOUNCEMENTS_CACHE_KEY);
}
