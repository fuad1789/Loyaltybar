import React, { useState } from "react";
import axios from "axios";
import "./index.css";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/admin/login", {
        email,
        password,
      });
      setMessage(response.data.status);
      if (response.data.status === "OK") {
        onLogin(response.data.user._id);
        window.location.reload();
      }
    } catch (error) {
      setMessage(error.response.data.msg);
    }
    setLoading(false);
  };

  return (
    <div className="background">
      <form className="container" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="mail">E-mail adresiniz:</label>
          <input
            type="email"
            id="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading || !email || !password}>
          {loading ? "Loading..." : "Giriş"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default LoginForm;
