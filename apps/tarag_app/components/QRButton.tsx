import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ThemedText } from './ThemedText';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ThemedIcons from './ThemedIcons';
import { useSession } from '@/context/SessionContext';
import { useThemeColor } from '@/hooks/useThemeColor';

const QRButton: React.FC = () => {
  const { session } = useSession();
  const primaryColor = useThemeColor({}, 'primary');
  return (
    <TouchableOpacity
    style={[styles.wrapper, { backgroundColor: primaryColor }]}
    onPress={() => router.push('/safety/safety')}
    >
      <ThemedIcons name="qrcode-scan" size={25} color="#ccc" />
    
    </TouchableOpacity>
  );
};

export default QRButton;


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 50,
    marginBottom: 4,
  },
});