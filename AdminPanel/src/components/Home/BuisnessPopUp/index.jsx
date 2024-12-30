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

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axios.get(
          `https://loyaltybar-bl4z.onrender.com/buisness/${id}`
        );
        setBusiness(response.data.buisness);
      } catch (error) {
        console.error("Error fetching business:", error);
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
    await axios
      .post(`https://loyaltybar-bl4z.onrender.com/buisness/block`, {
        buisnessId: business._id,
      })
      .catch((res) => {
        console.log(res.data);
      })
      .finally(() => {
        window.location.reload();
      });
  };

  const deleteBuisness = async () => {
    await axios
      .delete(`https://loyaltybar-bl4z.onrender.com/buisness/delete`, {
        data: { buisnessId: business._id },
      })
      .catch((res) => {
        console.log(res.data);
      })
      .finally(() => {
        window.location.reload();
      });
  };

  if (!business) return <div>Loading...</div>;

  return (
    <div className="popup">
      <div className="back">
        <img src={backIcon} alt="backicon" onClick={() => navigate(-1)} />
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
          <img src={qrIcon} alt="qr icon" />
        )}
        {isDownloading
          ? "QR Kodları İndiriliyor..."
          : "Kullanıcıların QR giriş kodlarını indir"}
      </button>
      <button
        onClick={() => blockBuisness()}
        style={{ backgroundColor: business.block ? "white" : "yellow" }}
      >
        <img src={blockIcon} alt="block icon" />
        {business.block
          ? "İşletmenin hesabının engelini kaldır"
          : "İşletmenin hesabını engelle"}
      </button>
      <button
        onClick={() => deleteBuisness()}
        style={{ backgroundColor: "red" }}
      >
        <img src={deleteIcon} alt="delete icon" />
        İşletmenin hesabını sil
      </button>
    </div>
  );
}
