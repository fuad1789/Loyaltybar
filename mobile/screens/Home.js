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
import { Audio } from "expo-av";
import homeBg from "../assets/HomeBg.jpg";
import biy from "../assets/moustache.png";
import doneimg from "../assets/doneimg.png";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import NetInfo from "@react-native-community/netinfo";

const API_URL = "https://loyaltybar-bl4z.onrender.com";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor for better error handling
api.interceptors.request.use(async (config) => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    return Promise.reject(new Error("İnternet bağlantısı yok"));
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Bağlantı zaman aşımına uğradı"));
    }
    if (!error.response) {
      return Promise.reject(new Error("Sunucuya bağlanılamadı"));
    }
    return Promise.reject(error);
  }
);

// Enhanced debug logging function that works in both dev and production
const debug = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const log = `[BerberApp ${timestamp}] ${message}`;

  if (__DEV__ || message.toLowerCase().includes("error")) {
    console.log("----------------------------------------");
    console.log(log);
    if (data) console.log("Data:", JSON.stringify(data, null, 2));
    console.log("----------------------------------------");
  }
};

const Home = () => {
  const [userId, setUserId] = useState(null);
  const [shawedList, setShawedList] = useState([]);
  const [shawedCount, setShawedCount] = useState(0);
  const sound = useRef(new Audio.Sound());
  const [isCooldown, setIsCooldown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const MAX_CONNECTION_RETRIES = 3;
  const retryTimeoutRef = useRef(null);

  const [loaded, fontError] = useFonts({
    PoetsenOne: require("../assets/font/PoetsenOne-Regular.ttf"),
    PlusJakartaSans: require("../assets/font/PlusJakartaSans-SemiBold.ttf"),
  });

  const fetchShawedCount = async (id) => {
    debug("Fetching shawed count - START", { userId: id });
    try {
      const response = await api.post("/user/getShawedCount", { userId: id });

      if (!response.data || typeof response.data.shwedCount !== "number") {
        throw new Error("Geçersiz sunucu yanıtı");
      }

      debug("Shawed count fetch - SUCCESS", {
        userId: id,
        count: response.data.shwedCount,
      });
      setShawedCount(response.data.shwedCount);
      setError(null);
      setConnectionAttempts(0);
      setInitializing(false);
    } catch (err) {
      debug("Shawed count fetch - ERROR", {
        userId: id,
        error: err.message,
      });

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      if (connectionAttempts < MAX_CONNECTION_RETRIES) {
        setConnectionAttempts((prev) => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          fetchShawedCount(id);
        }, 2000);
      } else {
        setError(err.message || "Sunucuya bağlanamadı. Lütfen tekrar deneyin.");
        setInitializing(false);
      }
    }
  };

  // Clean up function to clear timeouts
  const cleanup = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    if (loaded || fontError) {
      debug("Font loading status", {
        loaded,
        fontError: fontError ? fontError.toString() : null,
      });
      SplashScreen.hideAsync().catch((err) =>
        debug("Error hiding splash screen", { error: err.message })
      );
    }

    const initializeApp = async () => {
      debug("App initialization - START");
      try {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error("İnternet bağlantınızı kontrol edin");
        }

        const storedUserId = await AsyncStorage.getItem("userId");
        debug("User ID retrieval - SUCCESS", { storedUserId });
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchShawedCount(storedUserId);
        } else {
          debug("No stored userId found");
          setError("Kullanıcı bilgisi bulunamadı.");
        }
      } catch (err) {
        debug("App initialization - ERROR", {
          errorMessage: err.message,
          stack: err.stack,
        });
        setError(err.message || "Uygulama başlatılırken bir hata oluştu.");
      } finally {
        setIsLoading(false);
        setInitializing(false);
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

  // Network connectivity monitoring
  useEffect(() => {
    let isFirstConnect = true;
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        if (!isFirstConnect && userId) {
          // Don't retry on first connection, only on reconnection
          handleRetry();
        }
        isFirstConnect = false;
      }
    });

    return () => {
      unsubscribe();
      cleanup();
    };
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
        debug("Sound playback error", {
          errorMessage: error.message,
          stack: error.stack,
        });
      }
    }
  };

  const handleRetry = () => {
    debug("Retry attempt initiated", { userId });
    setIsLoading(true);
    setError(null);
    setConnectionAttempts(0);
    if (userId) {
      fetchShawedCount(userId).finally(() => {
        setIsLoading(false);
        debug("Retry attempt completed", { userId });
      });
    } else {
      setIsLoading(false);
      debug("Retry failed - No userId found");
    }
  };

  if (!loaded && !fontError) {
    return (
      <ImageBackground source={homeBg} style={styles.container}>
        <ExpoStatusBar />
        <ActivityIndicator size="large" color="#76c7c0" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </ImageBackground>
    );
  }

  if (initializing) {
    return (
      <ImageBackground source={homeBg} style={styles.container}>
        <ExpoStatusBar />
        <ActivityIndicator size="large" color="#76c7c0" />
        <Text style={styles.loadingText}>Bağlantı kuruluyor...</Text>
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

  if (!isConnected) {
    return (
      <ImageBackground source={homeBg} style={styles.container}>
        <ExpoStatusBar />
        <Text style={styles.errorText}>İnternet bağlantınızı kontrol edin</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            NetInfo.fetch().then((state) => setIsConnected(state.isConnected))
          }
        >
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
