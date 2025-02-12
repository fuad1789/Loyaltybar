import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QRScan = ({ setQRScreen, setIsLoggedIn }) => {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      const response = await axios.post(
        "https://loyaltybar-bl4z.onrender.com/user/userLogin",
        {
          userId: data,
        },
        {
          timeout: 15000, // Increased timeout
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Handle all status codes to prevent crashes
          },
        }
      );

      if (!response.data || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      await AsyncStorage.setItem("userId", response.data.user.userId);
      console.log("Login successful:", response.data.user.userId);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("API Error:", error);
      let errorMessage = "Lütfen size verilen kartvizitdeki QR kodu okutun";

      if (!error.response) {
        // Network error
        errorMessage =
          "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.";
      } else if (error.response.status === 404) {
        errorMessage = "Geçersiz QR kod";
      } else if (error.response.status >= 500) {
        errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.";
      }

      Alert.alert(
        "Hata",
        errorMessage,
        [{ text: "Tamam", onPress: () => setScanned(false) }],
        { cancelable: false }
      );
    } finally {
      setLoading(false);
      if (!scanned) {
        setQRScreen(false);
      }
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerText}>Kamera izni isteniyor...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerText}>Kamera izni reddedildi</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.centerText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.centerText}>Lütfen QR kodu tarayın</Text>
          <View style={styles.markerContainer}>
            <View style={styles.marker} />
          </View>
          <Text style={styles.centerText}>QR kodu çerçeve içine alın</Text>
        </View>
      </CameraView>
    </View>
  );
};

const { width } = Dimensions.get("window");
const MARKER_SIZE = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    padding: 20,
  },
  centerText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    padding: 20,
  },
  markerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    borderColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QRScan;
