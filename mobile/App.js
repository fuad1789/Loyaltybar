import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Welcome from "./screens/Welcome";
import Home from "./screens/Home";
import * as Updates from "expo-updates";

const ReloadButton = ({ onReload }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>Something went wrong</Text>
    <TouchableOpacity style={styles.reloadButton} onPress={onReload}>
      <Text style={styles.reloadButtonText}>Reload App</Text>
    </TouchableOpacity>
  </View>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleReload = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      // Reload the app
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error reloading app:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (hasError) {
    return <ReloadButton onReload={handleReload} />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return isLoggedIn ? <Home /> : <Welcome setIsLoggedIn={setIsLoggedIn} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#666",
  },
  reloadButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default App;
