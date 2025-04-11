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
      const response = await axios.post(
        "https://loyaltybar-bl4z.onrender.com/admin/login",
        {
          email,
          password,
        }
      );
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
        <h2>Admin Panel</h2>
        <div>
          <label htmlFor="mail">E-mail</label>
          <input
            type="email"
            id="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail adresinizi girin"
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
            placeholder="Şifrenizi girin"
            required
          />
        </div>
        <button type="submit" disabled={loading || !email || !password}>
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Giriş Yapılıyor...
            </>
          ) : (
            "Giriş Yap"
          )}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default LoginForm;
