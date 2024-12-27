import React, { useState, useEffect } from "react";
import "./App.css";
import QrVideo from "./components/qrvideo";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn")) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const buisnessId = e.target.elements.id.value;
    setLoading(true);

    try {
      const response = await axios.post(
        "https://loyaltybar.onrender.com/buisness/adminLogin",
        { buisnessId }
      );

      if (response.status === 200) {
        localStorage.setItem("isLoggedIn", response.data.buisness._id);
        setIsLoggedIn(true);
        setMessage("Erfolgreiche Anmeldung");
        setSeverity("success");
      } else {
        setMessage("Anmeldung fehlgeschlagen");
        setSeverity("error");
      }
    } catch (error) {
      console.error("Fehler bei der Anmeldung:", error);
      setMessage("Fehler bei der Anmeldung");
      setSeverity("error");
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  if (isLoggedIn) {
    return <QrVideo />;
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Einloggen</h1>
        <label htmlFor="id">Login-ID:</label>
        <input type="text" id="id" />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Einloggen"
          )}
        </Button>
      </form>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
