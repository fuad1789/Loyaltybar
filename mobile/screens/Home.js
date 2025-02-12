import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import axios from "axios";
import io from "socket.io-client";
import { Audio } from "expo-av";
import homeBg from "../assets/HomeBg.jpg";
import biy from "../assets/moustache.png";
import doneimg from "../assets/doneimg.png";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

const API_URL = "https://loyaltybar-bl4z.onrender.com";

// Add a debug logging function
const debug = (message, data = null) => {
  const log = `[BerberApp] ${message}`;
  if (__DEV__) {
    if (data) {
      console.log(log, data);
    } else {
      console.log(log);
    }
  }
};

const socket = io(API_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

const Home = () => {
  const [userId, setUserId] = useState(null);
  const [shawedList, setShawedList] = useState([]);
  const [shawedCount, setShawedCount] = useState(0);
  const sound = useRef(new Audio.Sound());
  const [isCooldown, setIsCooldown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [loaded, fontError] = useFonts({
    PoetsenOne: require("../assets/font/PoetsenOne-Regular.ttf"),
    PlusJakartaSans: require("../assets/font/PlusJakartaSans-SemiBold.ttf"),
  });

  const fetchShawedCount = async (id) => {
    debug("Fetching shawed count for user:", id);
    try {
      const response = await axios.post(
        `${API_URL}/user/getShawedCount`,
        { userId: id },
        { timeout: 10000 }
      );
      debug("Received shawed count response:", response.data);
      setShawedCount(response.data.shwedCount);
      setError(null);
    } catch (err) {
      debug("Error in fetchShawedCount:", {
        code: err.code,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = "Veri yüklenirken bir hata oluştu.";
      if (err.code === "ECONNABORTED") {
        errorMessage = "Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.";
      } else if (err.response) {
        errorMessage = err.response.data.msg || "Sunucu hatası oluştu.";
      } else if (err.request) {
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      }
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (loaded || fontError) {
      debug("Fonts loaded:", { loaded, fontError });
      SplashScreen.hideAsync();
    }

    const initializeApp = async () => {
      debug("Initializing app");
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        debug("Retrieved stored userId:", storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchShawedCount(storedUserId);
        }
      } catch (err) {
        debug("Error in initializeApp:", err);
        console.error("Error initializing app:", err);
        setError("Uygulama başlatılırken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loaded, fontError]);

  useEffect(() => {
    const list = [];
    for (let i = 0; i < 10; i++) {
      if (i < shawedCount) {
        list.push(true);
      } else {
        list.push(false);
      }
    }
    setShawedList(list);
  }, [shawedCount]);

  useEffect(() => {
    if (userId) {
      debug("Setting up socket listeners for userId:", userId);

      socket.on("connect", () => {
        debug("Socket connected");
      });

      socket.on("connect_error", (err) => {
        debug("Socket connection error:", err);
        console.error("Socket connection error:", err);
      });

      socket.on("qrScanned", async (scannedUserId) => {
        debug("QR scanned event received:", scannedUserId);
        if (scannedUserId === userId) {
          await fetchShawedCount(scannedUserId);
          playSound();
        }
      });

      return () => {
        debug("Cleaning up socket listeners");
        socket.off("connect");
        socket.off("qrScanned");
        socket.off("connect_error");
      };
    }
  }, [userId]);

  const playSound = async () => {
    if (!isCooldown) {
      try {
        await sound.current.unloadAsync();
        await sound.current.loadAsync(require("../assets/decidemp3-14575.mp3"));
        await sound.current.playAsync();
        setIsCooldown(true);
        setTimeout(() => {
          setIsCooldown(false);
        }, 10000);
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    if (userId) {
      fetchShawedCount(userId);
    }
    setIsLoading(false);
  };

  if (!loaded && !fontError) {
    return null;
  }

  if (isLoading) {
    return (
      <ImageBackground source={homeBg} style={styles.container}>
        <ExpoStatusBar />
        <ActivityIndicator size="large" color="#76c7c0" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={homeBg} style={styles.container}>
        <ExpoStatusBar />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={homeBg} style={styles.container}>
      <ExpoStatusBar />
      <Text style={styles.homeTxt}>Her 10 traşda 10% indirim kazan</Text>
      {userId ? (
        <View>
          <QRCode value={userId} size={190} />
          <Text style={styles.qrCodeTxt}>QR kodu okut</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#76c7c0" />
      )}

      <Text style={styles.complatedTxt}>TAMAMLANMIŞ TRAŞLAR</Text>

      <View style={styles.progressBarCon}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${shawedCount * 10}%`,
            },
          ]}
        ></View>
      </View>
      <View style={styles.shawedCon}>
        {shawedList.map((e, index) => {
          return e ? (
            <View key={index} style={styles.shawedBox}>
              <Image style={styles.biyimg} source={doneimg} />
            </View>
          ) : (
            <View key={index} style={styles.shawedBox}>
              <Image style={styles.biyimg} source={biy} />
            </View>
          );
        })}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  homeTxt: {
    fontSize: 26,
    marginBottom: 40,
    fontFamily: "PoetsenOne",
    textAlign: "center",
  },
  qrCodeTxt: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: "PlusJakartaSans",
    textAlign: "center",
  },
  complatedTxt: {
    fontSize: 18,
    marginTop: 30,
    fontFamily: "PlusJakartaSans",
  },
  progressBarCon: {
    width: "90%",
    height: 30,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#76c7c0",
    borderRadius: 5,
  },
  shawedCon: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  shawedBox: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  biyimg: {
    width: 50,
    height: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    fontFamily: "PlusJakartaSans",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#76c7c0",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
  },
});

export default Home;
