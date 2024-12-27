import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./index.css";

export default function Index({ isFormOpen, setIsFormOpen }) {
  const formRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleOutsideClick = (e) => {
    if (formRef.current && !formRef.current.contains(e.target)) {
      setIsFormOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      buisnessName: e.target.isim.value,
      buisnessNumber: e.target.tel.value,
      owner: e.target.owner.value,
    };

    axios
      .post(`https://loyaltybar.onrender.com/buisness/addnew`, {
        ...data,
        adminId: localStorage.getItem("isLoggedIn"),
      })
      .then((response) => {
        console.log(response.data);
        setIsFormOpen(false); // Formu kapat
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
        window.location.reload();
      });
  };

  const newLocal = "Loading";
  return (
    <>
      {isFormOpen && (
        <form
          className="container addBox"
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <p>İşletme ekle</p>
          <div>
            <label htmlFor="isim">İşletme isimi:</label>
            <input type="text" id="isim" required />
          </div>
          <div>
            <label htmlFor="tel">İşletme telefon numarası:</label>
            <input type="text" id="tel" required />
          </div>
          <div>
            <label htmlFor="owner">İşletme sahibi:</label>
            <input type="text" id="owner" required />
          </div>
          <button disabled={isLoading} type="submit">
            {isLoading ? "Loading..." : "Ekle"}
          </button>
        </form>
      )}
    </>
  );
}
