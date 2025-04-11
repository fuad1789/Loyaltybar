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
      userCount: e.target.userCount.value,
    };

    axios
      .post(`${import.meta.env.VITE_API_URL}/buisness/addnew`, {
        ...data,
        adminId: localStorage.getItem("isLoggedIn"),
      })
      .then((response) => {
        console.log(response.data);
        setIsFormOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        window.location.reload();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {isFormOpen && (
        <form className="addBox" ref={formRef} onSubmit={handleSubmit}>
          <p>İşletme Ekle</p>
          <div>
            <label htmlFor="isim">İşletme İsmi</label>
            <input
              type="text"
              id="isim"
              placeholder="İşletme ismini girin"
              required
            />
          </div>
          <div>
            <label htmlFor="tel">İşletme Telefon Numarası</label>
            <input
              type="text"
              id="tel"
              placeholder="Telefon numarasını girin"
              required
            />
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <div>
              <label htmlFor="owner">İşletme Sahibi</label>
              <input
                type="text"
                id="owner"
                placeholder="İşletme sahibinin adını girin"
                required
              />
            </div>
            <div>
              <label htmlFor="userCount">Kullanıcı Sayısı</label>
              <input
                type="number"
                id="userCount"
                placeholder="Sayı"
                required
                max="500"
              />
            </div>
          </div>
          <button disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Ekleniyor...
              </>
            ) : (
              "Ekle"
            )}
          </button>
        </form>
      )}
    </>
  );
}
