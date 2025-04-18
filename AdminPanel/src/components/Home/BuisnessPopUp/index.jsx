import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./index.css";
import backIcon from "../../../assets/return.png";
import qrIcon from "../../../assets/qr.png";
import blockIcon from "../../../assets/block.png";
import deleteIcon from "../../../assets/delete.png";
import axios from "axios";

export default function BuisnessPopUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/buisness/${id}`
        );
        setBusiness(response.data.buisness);
      } catch (error) {
        console.error("Error fetching business:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  const downloadQrCodes = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const imgFolder = zip.folder("qr_codes");

      await Promise.all(
        business.users.map(async (user) => {
          const canvas = document.createElement("canvas");
          await QRCode.toCanvas(canvas, user.userId, {
            errorCorrectionLevel: "H",
            margin: 2,
            scale: 8,
          });
          const dataUrl = canvas.toDataURL("image/png");
          const base64 = dataUrl.split(",")[1];
          imgFolder.file(`${user.userId}.png`, base64, { base64: true });
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${business._id}.zip`);
    } catch (error) {
      console.error("QR kodları indirilirken hata oluştu:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const blockBuisness = async () => {
    setIsBlocking(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/buisness/block`, {
        buisnessId: business._id,
      });

      await new Promise((resolve) => setTimeout(resolve, 4000));

      setBusiness((prev) => ({
        ...prev,
        block: !prev.block,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setIsBlocking(false);
    }
  };

  const deleteBuisness = async () => {
    setIsDeleting(true);
    await axios
      .delete(`${import.meta.env.VITE_API_URL}/buisness/delete`, {
        data: { buisnessId: business._id },
      })
      .catch((res) => {
        console.log(res.data);
      })
      .finally(() => {
        setIsDeleting(false);
        const currentUrl = window.location.href;
        const mainUrl = currentUrl.split("/").slice(0, 3).join("/");
        if (currentUrl !== mainUrl) {
          window.location.href = mainUrl;
        }
      });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>İşletme bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!business)
    return (
      <div className="loading-container">
        <p>İşletme bulunamadı.</p>
      </div>
    );

  return (
    <div className="popup">
      <div className="back">
        <img src={backIcon} alt="Geri" onClick={() => navigate(-1)} />
      </div>
      <h1>{business.buisnessName}</h1>
      <p>ID: {business._id}</p>
      <p>İşletme numarası: {business.buisnessNumber}</p>
      <p>İşletme sahibi: {business.owner}</p>
      <p>Kullanıcı sayısı: {business.users.length}</p>
      <button
        onClick={downloadQrCodes}
        disabled={isDownloading}
        className={isDownloading ? "loading-button" : ""}
      >
        {isDownloading ? (
          <div className="loading-spinner"></div>
        ) : (
          <img src={qrIcon} alt="QR" />
        )}
        {isDownloading
          ? "QR Kodları İndiriliyor..."
          : "Kullanıcıların QR Giriş Kodlarını İndir"}
      </button>
      <button
        onClick={blockBuisness}
        style={{
          backgroundColor: business.block ? "white" : "var(--warning-color)",
        }}
        disabled={isBlocking}
        className={isBlocking ? "loading-button" : ""}
      >
        {isBlocking ? (
          <div className="loading-spinner"></div>
        ) : (
          <img src={blockIcon} alt="Engelle" />
        )}
        {isBlocking
          ? business.block
            ? "Engel Kaldırılıyor..."
            : "Engelleniyor..."
          : business.block
          ? "İşletmenin Hesabının Engelini Kaldır"
          : "İşletmenin Hesabını Engelle"}
      </button>
      <button
        onClick={deleteBuisness}
        style={{ backgroundColor: "var(--danger-color)" }}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <div className="loading-spinner"></div>
        ) : (
          <img src={deleteIcon} alt="Sil" />
        )}
        {isDeleting ? "Siliniyor..." : "İşletmenin Hesabını Sil"}
      </button>
    </div>
  );
}
