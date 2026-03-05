// QRScan.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import BackButton from '@/components/BackButton';
import { ThemedText } from '@/components/ThemedText';

export default function QRScan({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera access needed</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleScanned = ({ nativeEvent }: any) => {
    if (scanned) return;
    setScanned(true);

    Vibration.vibrate(200);
    const { data } = nativeEvent;
    console.log('QR scanned:', data);

    if (data.startsWith('tarag://join/')) {
      const groupId = data.split('/').pop();
      navigation.navigate('GroupJoin', { groupId });
    }

    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <View style={styles.container}>
        <BackButton type='floating' color='white'/>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanned}
      />

      {/* Scan overlay */}
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <ThemedText style={styles.text}>Align QR within frame</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 12,
  },
  text: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
});