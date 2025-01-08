import React from "react";
import Lottie from "lottie-react";
import successAnimation from "../assets/sucsess.json";

function SuccessMessage({ message, onClose }) {
  return (
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
        animationData={successAnimation}
        loop={false}
        className="success-animation"
      />
      <h1>{message}</h1>
    </div>
  );
}

export default SuccessMessage;
