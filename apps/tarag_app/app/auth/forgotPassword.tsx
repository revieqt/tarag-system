import Button from '@/components/Button';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { resetPassword, sendEmailVerificationCode } from '@/services/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import { CustomAlert } from '@/components/Alert';
import ProcessModal from '@/components/modals/ProcessModal';

const RESEND_COOLDOWN = 180; // seconds

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [ success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (cooldown > 0) return;

    try {
      setSending(true);
      const { code, id } = await sendEmailVerificationCode(email);
      setSentCode(code);
      setUserId(id);
      setEmailSent(true);
      setCooldown(RESEND_COOLDOWN);
      setShowAlert(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to send verification code.');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = () => {
    if (verificationCode === sentCode) {
      setCodeVerified(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid verification code.');
    }
  };

  const handleResetPassword = async () => {
    console.log('Starting password reset. Current state:', {
      userId,
      email,
      hasPassword: !!newPassword,
      hasConfirm: !!confirmPassword,
      isVerified: codeVerified
    });

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      await resetPassword(email, newPassword);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrorMsg(error.message || 'Failed to reset password.');
    }
    return;
  };

  const renderContent = () => {
    if (!emailSent) {
      return (
        <>
          <ThemedText style={{ marginBottom: 20 }}>
            Enter your email address and we'll send you a verification code.
          </ThemedText>
          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{opacity: (sending || cooldown > 0) ? 0.5 : 1 }}
            onFocus={() => {
              if (sending || cooldown > 0) return false;
            }}
          />
        </>
      );
    }

    if (!codeVerified) {
      return (
        <>
          <ThemedText style={{ marginBottom: 20 }}>
            Enter the verification code sent to {email}
          </ThemedText>
          <View style={{ marginBottom: 20 }}>
            <TextField
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
            />
          </View>
        </>
      );
    }

    return (
      <>
        <ThemedText style={{ marginBottom: 20 }}>
          Enter your new password
        </ThemedText>
        <PasswordField
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordField
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </>
    );
  };

  const getButtonConfig = () => {
    if (!emailSent) {
      return {
        title: sending
          ? 'Sending...'
          : cooldown > 0
            ? `Resend Code (${cooldown}s)`
            : 'Send Code',
        onPress: handleSendCode,
        disabled: sending || cooldown > 0
      };
    }

    if (!codeVerified) {
      return {
        title: 'Verify Code',
        onPress: verifyCode,
        disabled: !verificationCode
      };
    }

    return {
      title: 'Reset Password',
      onPress: handleResetPassword,
      disabled: !newPassword || !confirmPassword
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <ThemedView style={{flex: 1}}>
      <GradientBlobs/>
      <KeyboardAvoidingView
        style={{padding: 16}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          Forgot Password
        </ThemedText>

        {errorMsg ? (
          <ThemedText style={{ marginBottom: 10, color: 'red' }}>{errorMsg}</ThemedText>
        ) : null}

        {renderContent()}
      </KeyboardAvoidingView>

      <Button
        title={buttonConfig.title}
        onPress={buttonConfig.onPress}
        type="primary"
        buttonStyle={styles.sendButton}
        disabled={buttonConfig.disabled}
      />

      <CustomAlert
        visible={showAlert}
        title="Code Sent!"
        message="Please check your inbox for the verification code."
        icon='check'
        fadeAfter={5000}
        onClose={() => setShowAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => setShowAlert(false) }
        ]}
      />

      <ProcessModal
        visible={ success }
        success={success}
        successMessage="Password reset successfully!"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sendButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
});