import React, { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";
import qrScannerAnimation from "../assets/qrScannerAnimation.json";
import successAnimation from "../assets/sucsess.json";
import cancelAnimation from "../assets/cancel.json";
import Confetti from "react-confetti";
import QrScanner from "qr-scanner";
import axios from "axios";

function QrVideo() {
  const videoRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState(""); // Mesaj durumu
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isCooldown, setIsCooldown] = useState(false);
  const [sucsessMessage, setSucsessMessage] = useState("");
  const [cancellMessage, setCancellMessage] = useState("");

  useEffect(() => {
    const startScanner = () => {
      if (videoRef.current && isScanning) {
        const qrScannerInstance = new QrScanner(
          videoRef.current,
          (result) => {
            if (isScanning && validateQRResult(result.data)) {
              handleScan(result);
            }
          },
          {
            highlightScanRegion: false,
            highlightCodeOutline: false,
          }
        );

        qrScannerInstance.start();
        qrScannerRef.current = qrScannerInstance;
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();
        startScanner();
      })
      .catch((err) => {
        console.error("Webcam erişimi hatası: ", err);
        setMessage("Webcam-Zugriffsfehler.");
        setShowCancel(true);
      });

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
      }
    };
  }, [isScanning]);

  const validateQRResult = (result) => {
    return result && result.length > 5;
  };

  const handleScan = async (result) => {
    console.log(`QR-Code erkannt: ${result.data}`);
    setIsScanning(false);

    axios
      .post(
        "https://loyaltybar-bl4z.onrender.com/buisness/updateUserShavedCount",
        {
          userId: result.data,
          currentTime: new Date().toISOString(),
          buisnessId: localStorage.getItem("isLoggedIn").toString(),
        }
      )
      .then((response) => {
        if (response.data.status === "OK") {
          if (response.data.user.shavedCount === 0) {
            setSucsessMessage(
              "Sie haben 10 Rasuren erreicht und einen Rabatt gewonnen!"
            );
            setShowConfetti(true);
          } else {
            setSucsessMessage("QR-Code erfolgreich gescannt!");
            setMessage("QR-Code erfolgreich gescannt!");
            setShowSuccess(true);
          }

          // Socket.IO ile sunucuya mesaj gönder
          const socket = io("https://loyaltybar-bl4z.onrender.com");
          socket.emit("qrScanned", result.data); // Tarama verilerini iletin
        } else {
          setMessage(response.data.msg || "Ein Fehler ist aufgetreten.");
          setShowCancel(true);
        }

        if (response.data.status === "OK") {
          setIsCooldown(true);
          setTimeout(() => {
            setIsCooldown(false);
          }, 10000);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
        setCancellMessage(error.response.data.msg);
        setMessage(error.response?.data?.msg || "API-Anfrage fehlgeschlagen.");
        setShowCancel(true);
      });

    setTimeout(
      () => {
        setShowSuccess(false);
        setShowCancel(false);
        setShowConfetti(false);
        setIsScanning(true);
      },
      showConfetti ? 7000 : 5000
    );
  };

  return (
    <div className="container-2">
      <div className="left">
        <h1>QR-Code scannen</h1>
        <Lottie
          animationData={qrScannerAnimation}
          loop={true}
          className="ani"
        />
      </div>
      <div className="right">
        <div className="video-container">
          <video ref={videoRef} width="100%" height="100%" className="video" />
          {showSuccess && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                backgroundColor: "white",
                width: "100%",
                height: "100%",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 40,
              }}
            >
              <Lottie
                animationData={successAnimation}
                loop={false}
                className="success-animation"
              />
              <h1>{sucsessMessage}</h1>
            </div>
          )}
          {showCancel && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                backgroundColor: "white",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 40,
              }}
            >
              <Lottie
                animationData={cancelAnimation}
                loop={false}
                className="success-animation"
              />
              <h1>{cancellMessage}</h1>
            </div>
          )}
          {showConfetti && (
            <div className="confeti">
              <Confetti width={window.innerWidth} height={window.innerHeight} />
              <h1>
                Herzlichen Glückwunsch zu Ihrem 10. Haarschnitt, Sie haben einen
                Rabatt gewonnen
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QrVideo;
