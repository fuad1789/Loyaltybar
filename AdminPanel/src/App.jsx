import React, { useState, useEffect } from "react";
import LoginForm from "./components/Login";
import SerachBox from "./components/Home/SearchBox";
import List from "./components/Home/List";

import "./App.css";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const islog = async () => {
      await axios
        .post(`http://localhost:3000/admin/token`, {
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
      <div className="main">
        <SerachBox />
        <List />
      </div>
    );
  }

  return <LoginForm onLogin={handleLogin} />;
}

export default App;
