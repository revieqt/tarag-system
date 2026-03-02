import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';

export default function CreateRoomScreen() {

  return (
    <ThemedView style={{flex: 1}}>
      <GradientBlobs/>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          Create a new room
        </ThemedText>
        <ThemedText style={{ marginBottom: 20 }}>
          Enter the details for your new room.
        </ThemedText>
      </KeyboardAvoidingView>

      {/* <Button
        title={sending ? (is2FAMode ? 'Verifying...' : 'Verifying...') : (is2FAMode ? 'Verify Identity' : 'Verify Email')}
        onPress={handleVerification}
        type="primary"
        buttonStyle={styles.sendButton}
        disabled={sending || !code || code.length !== 6}
      /> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  sendButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  resendText: {
    opacity: 0.7,
    textDecorationLine: 'underline'
  },
  resendTextDisabled: {
    opacity: 0.3
  }
});