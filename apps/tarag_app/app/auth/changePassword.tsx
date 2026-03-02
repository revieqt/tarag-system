import Button from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import GradientBlobs from '@/components/GradientBlobs';
import BackButton from '@/components/BackButton';
import PasswordField from '@/components/PasswordField';
import { useSession } from '@/context/SessionContext';
import { updatePassword } from '@/services/authService';
import ProcessModal from '@/components/modals/ProcessModal';

export default function ChangePasswordScreen() {
  const { session } = useSession();
  const [errorMsg, setErrorMsg] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!session?.user?.id || !session.accessToken) {
      setErrorMsg('You need to be logged in to change your password');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      
      await updatePassword({
        userId: session.user.id,
        oldPassword,
        newPassword,
        confirmPassword,
        accessToken: session.accessToken
      });

      setShowAlert(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemedView style={{flex: 1}}>
      <GradientBlobs/>
      <KeyboardAvoidingView
        style={{padding: 16}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />
        <ThemedText type='title'>
          Change Password
        </ThemedText>

        {errorMsg ? (
          <ThemedText style={{ color: 'red', marginBottom: 20 }}>{errorMsg}</ThemedText>
        ) : <ThemedText style={{ marginBottom: 20 }}>Enter a minimum of 6 characters</ThemedText>}

        <PasswordField
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
        />
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
      </KeyboardAvoidingView>

      <Button
        title={isLoading ? 'Updating...' : 'Update Password'}
        onPress={handleUpdatePassword}
        type="primary"
        buttonStyle={styles.updateButton}
        disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
      />

      <ProcessModal
        visible={ showAlert }
        success={showAlert}
        successMessage="Password updated successfully!"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  updateButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
});