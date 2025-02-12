import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import WelcomeImg from "../assets/loginBackground.jpg";
import Barbarmen2 from "../assets/Barbarmen2.png";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import qranimation from "../assets/qranimation.json";
import LottieView from "lottie-react-native";
import QRScan from "./QRScan"; // QR kod tarama sayfası


const Login = ({
  setLoginScreen,
  setWelcomeScreen,
  setIsLoggedIn,
  
}) => {
  const [loaded, error] = useFonts({
    PlusJakartaSans: require("../assets/font/PlusJakartaSans-SemiBold.ttf"),
    PortLligatSlab: require("../assets/font/PortLligatSlab-Regular.ttf"),
  });
  const [qrScreen, setQRScreen] = useState(false); // QR tarama ekranına geçiş kontrolü

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  useEffect(() => {
    const backAction = () => {
      setLoginScreen(false);
      setWelcomeScreen(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  // Eğer qrScreen true ise QR tarama sayfasını göster
  if (qrScreen) {
    return (
      <QRScan
        
        setQRScreen={setQRScreen}
        setIsLoggedIn={setIsLoggedIn}
      />
    );
  }

  return (
    <ImageBackground style={styles.container} source={WelcomeImg}>
      <View style={styles.imageCon}>
        <Image source={Barbarmen2} style={styles.barbarimg} />
      </View>
      <View style={styles.loginBox}>
        <Text style={styles.firstText}>Hoş geldiniz 👋</Text>
        <Text style={styles.infoText}>
          Hesabınıza erişmek için lütfen QR kodu okutun
        </Text>
        <LottieView
          source={qranimation}
          autoPlay
          loop
          style={styles.qranimation}
        />
        <TouchableOpacity
          style={styles.qrBtn}
          onPress={() => setQRScreen(true)}
        >
          <Text style={styles.qrText}>QR kodu skan edin</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, display: "flex", justifyContent: "flex-end" },
  loginBox: {
    width: Dimensions.get("screen").width,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 15,
  },
  imageCon: {
    width: Dimensions.get("screen").width,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barbarimg: {
    width: Dimensions.get("screen").width - 40,
    height: Dimensions.get("screen").width - 40,
    resizeMode: "contain",
  },
  firstText: { fontSize: 24, fontFamily: "PlusJakartaSans", marginBottom: 10 },
  infoText: { fontSize: 17, fontFamily: "PortLligatSlab" },
  qranimation: {
    width: Dimensions.get("screen").width - 30,
    height: 250,
    marginHorizontal: "auto",
  },
  qrBtn: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  qrText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});

export default Login;
