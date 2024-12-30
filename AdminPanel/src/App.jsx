import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./components/Login";
import SerachBox from "./components/Home/SearchBox";
import List from "./components/Home/List";
import BuisnessPopUp from "./components/Home/BuisnessPopUp";

import "./App.css";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const islog = async () => {
      await axios
        .post(`https://loyaltybar-bl4z.onrender.com/admin/token`, {
          id: localStorage.getItem("isLoggedIn"),
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.status === "OK") {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setIsLoggedIn(false);
        });
    };
    console.log("islog", isLoggedIn);

    islog();
  }, []);

  const handleLogin = (e) => {
    localStorage.setItem("isLoggedIn", e);
  };

  if (isLoggedIn) {
    return (
      <Router>
        <div className="main">
          <SerachBox />
          <Routes>
            <Route path="/" element={<List />} />
            <Route path="/business/:id" element={<BuisnessPopUp />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return <LoginForm onLogin={handleLogin} />;
}

export default App;
