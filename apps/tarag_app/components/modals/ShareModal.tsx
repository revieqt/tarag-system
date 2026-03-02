import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import ThemedIcons from "../ThemedIcons";
import { ThemedText } from "../ThemedText";
import GradientBlobs from "../GradientBlobs";
import { ThemedView } from "../ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ShareModalProps {
  visible: boolean;
  link: string;
  onClose: () => void;
}

export default function ShareModal({
  visible,
  link,
  onClose,
}: ShareModalProps) {
  const customMessage = `Hey! Join me using this link:\n${link}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(link);
    Alert.alert("Copied!", "Link copied to clipboard.");
  };

  // 🔵 Universal Share (recommended)
  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: customMessage,
        url: link, // iOS mainly
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 🔵 Facebook Web Fallback
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      link
    )}`;

    Linking.openURL(facebookUrl);
  };

  // 🔵 Messenger Deep Link (may not always prefill message)
  const handleMessengerShare = () => {
    const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(
      link
    )}&app_id=YOUR_FACEBOOK_APP_ID`;

    Linking.openURL(messengerUrl).catch(() => {
      Alert.alert("Messenger not installed");
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
            <GradientBlobs/>
          <ThemedText type="subtitle" style={{marginBottom: 20}}>Share Link</ThemedText>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode value={link} size={200} />
          </View>

          {/* Clickable Link */}
          <TouchableOpacity onPress={handleCopy} style={[styles.copyLink, {backgroundColor: useThemeColor({}, 'primary')}]} activeOpacity={0.7}>
            <ThemedText style={{textAlign: "center"}}>{link}</ThemedText>
            <ThemedText style={{opacity: 0.5, fontSize: 11}}>Tap to copy</ThemedText>
          </TouchableOpacity>

          <ThemedText>or share to</ThemedText>

          <View style={styles.iconRow}>
            <TouchableOpacity
                style={[styles.icons, {backgroundColor: '#1877F2'}]}
                onPress={handleFacebookShare}
            >
                <ThemedIcons name="facebook" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.icons, {backgroundColor: '#0084FF'}]}
                onPress={handleMessengerShare}
            >
                <ThemedIcons name="facebook-messenger" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.icons, {backgroundColor: 'gray'}]}
                onPress={handleNativeShare}
            >
                <ThemedIcons name="dots-horizontal" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedIcons name="close" size={30}/>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  qrContainer: {
    marginBottom: 20,
  },
  copyLink: {
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 10,
    borderRadius: 8,
  },
  iconRow:{
    flexDirection: "row",
    gap: 10,
    marginVertical: 20,
  },
  icons:{
    width: 55,
    aspectRatio: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  }
});