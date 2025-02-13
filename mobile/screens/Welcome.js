import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import welcomeImg from "../assets/Welcome.jpg";
import welcomeTex from "../assets/wolcometex.png";
import barbarMenImg from "../assets/BarbarMen.png";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Login from "./Login"; // Düzgün idxal

const Welcome = ({ setIsLoggedIn }) => {
  const [welcomeScreen, setWelcomeScreen] = useState(true);
  const [loginScreen, setLoginScreen] = useState(false);

  const [loaded, error] = useFonts({
    PlusJakartaSans: require("../assets/font/PlusJakartaSans-SemiBold.ttf"),
    PortLligatSlab: require("../assets/font/PortLligatSlab-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (loginScreen) {
    return (
      <Login
        setLoginScreen={setLoginScreen}
        setWelcomeScreen={setWelcomeScreen}
        setIsLoggedIn={setIsLoggedIn}
        
      />
    );
  }

  return (
    welcomeScreen && (
      <ImageBackground source={welcomeImg} style={styles.login}>
        <View style={styles.top}>
          <Image source={welcomeTex} style={styles.WelcomeTex} />
          <Image source={barbarMenImg} style={styles.barbarMenImg} />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.startTex}>
            salam
          </Text>
          <TouchableOpacity
            onPress={() => {
              setWelcomeScreen(false);
              setLoginScreen(true);
            }}
          >
            <Text style={styles.startBtn}>KAYIT OL</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    )
  );
};

const styles = StyleSheet.create({
  login: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  top: {
    width: "100%",
    height: "78%",
  },
  bottom: {
    width: "100%",
    height: "22%",
    backgroundColor: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
  WelcomeTex: {
    width: Dimensions.get("screen").width,
    height: 150,
    marginTop: 20,
    objectFit: "contain",
  },
  barbarMenImg: {
    width: Dimensions.get("screen").width,
    flex: 1,
    objectFit: "contain",
  },
  startTex: {
    color: "white",
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
    textAlign: "center",
  },
  startBtn: {
    backgroundColor: "yellow",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: "PortLligatSlab",
    fontSize: 25,
  },
});

export default Welcome;
