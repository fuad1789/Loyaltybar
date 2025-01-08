import React, { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";
import qrScannerAnimation from "../assets/qrScannerAnimation.json";
import successAnimation from "../assets/sucsess.json";
import cancelAnimation from "../assets/cancel.json";
import Confetti from "react-confetti";
import QrScanner from "qr-scanner";
import axios from "axios";
import Biyik from "../assets/biyik";
import Completed from "../assets/coplated";

function QrVideo() {
  const videoRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);
  const [sucsessMessage, setSucsessMessage] = useState("");
  const [cancellMessage, setCancellMessage] = useState("");
  const [shavedCount, setShavedCount] = useState(0);

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
        setCancellMessage("Webcam-Zugriffsfehler.");
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
      .post("http://localhost:3000/buisness/updateUserShavedCount", {
        userId: result.data,
        currentTime: new Date().toISOString(),
        buisnessId: localStorage.getItem("isLoggedIn").toString(),
      })
      .then((response) => {
        if (response.data.status === "OK") {
          console.log(response.data.user.shavedCount);
          setShavedCount(10 - response.data.user.shavedCount);

          if (response.data.user.shavedCount === 0) {
            setShowConfetti(true);
          } else {
            setShowSuccess(true);
          }

          // Socket.IO ile sunucuya mesaj gönder
          const socket = io("http://localhost:3000");
          socket.emit("qrScanned", result.data); // Tarama verilerini iletin
        } else {
          setCancellMessage(response.data.msg || "Ein Fehler ist aufgetreten.");
          setShowCancel(true);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
        setCancellMessage(error.response.data.msg);
        setShowCancel(true);
      });

    setTimeout(() => {
      setShowSuccess(false);
      setShowCancel(false);
      setShowConfetti(false);
      setIsScanning(true);
    }, 12000);
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
              <div style={{ textAlign: "center" }}>
                <h2
                  style={{
                    marginBottom: "20px",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                >
                  Abgeschlossene Rasuren
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    maxWidth: "300px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "10px",
                    }}
                  >
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        style={{
                          borderRadius: "50%",
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "2px solid #ddd",
                          margin: "auto",
                          transition: "all 0.3s ease",
                          transform: `scale(${
                            index < 10 - shavedCount ? "1.1" : "1"
                          })`,
                          boxShadow:
                            index < 10 - shavedCount
                              ? "0 4px 8px rgba(0,0,0,0.2)"
                              : "none",
                          animation:
                            index < 10 - shavedCount
                              ? "pulse 2s infinite"
                              : "none",
                        }}
                      >
                        {index < 10 - shavedCount ? (
                          <Completed />
                        ) : (
                          index >= 10 - shavedCount && <Biyik />
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "10px",
                    }}
                  >
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index + 5}
                        style={{
                          borderRadius: "50%",
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "2px solid #ddd",
                          margin: "auto",
                          transition: "all 0.3s ease",
                          transform: `scale(${
                            index + 5 < 10 - shavedCount ? "1.1" : "1"
                          })`,
                          boxShadow:
                            index + 5 < 10 - shavedCount
                              ? "0 4px 8px rgba(0,0,0,0.2)"
                              : "none",
                          animation:
                            index + 5 < 10 - shavedCount
                              ? "pulse 2s infinite"
                              : "none",
                        }}
                      >
                        {index + 5 < 10 - shavedCount ? (
                          <Completed />
                        ) : (
                          index + 5 >= 10 - shavedCount && <Biyik />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <h3
                  style={{
                    marginTop: "25px",
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#2E7D32",
                  }}
                >
                  Noch {shavedCount} Rasuren übrig!
                </h3>
              </div>
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
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1.1);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </div>
  );
}

export default QrVideo;
