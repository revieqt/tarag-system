import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import { useSession, useEmailVerification, useEmailCodeVerification } from '@/context/SessionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import Wave from '@/components/Wave';

const RESEND_COOLDOWN = 180;

export default function VerifyEmailScreen() {
  const { email, is2FA, accessToken, refreshToken, userData } = useLocalSearchParams<{ 
    email: string; 
    is2FA: string;
    accessToken: string;
    refreshToken: string;
    userData: string;
  }>();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const accentColor = useThemeColor({}, 'accent');
  const { updateSession } = useSession();
  const is2FAMode = is2FA === 'true';

  const { sendCode, loading: sendingCode, error: sendError } = useEmailVerification();
  const { verify, loading: verifyingCode, error: verifyError } = useEmailCodeVerification();

  const sendVerificationCode = async () => {
    try {
      setErrorMsg('');
      await sendCode(email);
      setCooldown(RESEND_COOLDOWN);
    } catch (error: any) {
      setErrorMsg(sendError || error.message);
    }
  };

  useEffect(() => {
    // Send verification code when component mounts
    sendVerificationCode();
  }, [email]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerification = async () => {
    if (!code) return;
    
    try {
      setErrorMsg('');
      
      // Use the verify hook to verify the email code
      await verify(email, code, '');
      
      if (is2FAMode) {
        // Handle 2FA verification
        // Parse and save user data from login result
        if (userData && accessToken && refreshToken) {
          const parsedUser = JSON.parse(userData);
          const sessionData = {
            id: parsedUser._id,
            fname: parsedUser.fname,
            lname: parsedUser.lname,
            username: parsedUser.username,
            email: parsedUser.email,
            bdate: new Date(parsedUser.bdate),
            gender: parsedUser.gender,
            contactNumber: parsedUser.contactNumber,
            profileImage: parsedUser.profileImage,
            likes: parsedUser.likes || [],
            isProUser: parsedUser.isProUser,
            bio: parsedUser.bio || '',
            status: parsedUser.status,
            type: parsedUser.type,
            expPoints: parsedUser.expPoints,
            createdOn: new Date(parsedUser.createdOn),
            isFirstLogin: parsedUser.isFirstLogin,
            safetyState: parsedUser.safetyState,
            visibilitySettings: parsedUser.visibilitySettings,
            securitySettings: parsedUser.securitySettings,
            taraBuddySettings: parsedUser.taraBuddySettings,
          };
          
          await updateSession({
            user: sessionData,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
          
          if (parsedUser.isFirstLogin) {
            router.replace('/account/firstLogin' as any);
          } else {
            router.replace('/(tabs)/home' as any);
          }
        } else {
          router.replace('/(tabs)/home' as any);
        }
      } else {
        // Handle account email verification
        router.replace('/account/firstLogin' as any);
      }
    } catch (error: any) {
      setErrorMsg(verifyError || error.message);
    }
  };

  return (
    <ThemedView style={{flex: 1}} color='primary'>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          {is2FAMode ? 'Two-Factor Authentication' : 'Verify Email'}
        </ThemedText>
        <ThemedText style={{ marginBottom: 20 }}>
          {is2FAMode 
            ? `We've sent a verification code to ${email}` 
            : `We've sent a code to ${email}`}
        </ThemedText>

        <TextField
          placeholder="Enter verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />

        {errorMsg ? (
          <ThemedText style={{ color: 'red', marginTop: 10 }}>{errorMsg}</ThemedText>
        ) : null}

        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={sendVerificationCode}
            disabled={cooldown > 0 || sendingCode}
          >
            <ThemedText style={[
              styles.resendText,
              (cooldown > 0 || sendingCode) && styles.resendTextDisabled
            ]}>
              {sendingCode ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Button
        title={verifyingCode ? (is2FAMode ? 'Verifying...' : 'Verifying...') : (is2FAMode ? 'Verify Identity' : 'Verify Email')}
        onPress={handleVerification}
        type="primary"
        buttonStyle={styles.sendButton}
        disabled={verifyingCode || !code || code.length !== 6}
      />

      <Wave style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: .7}} color={accentColor} height={70}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  sendButton: {
    position: 'absolute',
    bottom: 80,
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