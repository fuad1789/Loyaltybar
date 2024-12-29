import React, { useEffect } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./index.css";
import backIcon from "../../../assets/return.png";
import qrIcon from "../../../assets/qr.png";
import blockIcon from "../../../assets/block.png";
import deleteIcon from "../../../assets/delete.png";
import axios from "axios";

export default function Index({ setIsModal, isModal }) {
  useEffect(() => {
    console.log(isModal.row);
  }, [isModal]);

  const downloadQrCodes = async () => {
    const zip = new JSZip();
    const imgFolder = zip.folder("qr_codes");
    for (let user of isModal.row.users) {
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, user.userId, {
        errorCorrectionLevel: "H",
        margin: 2,
        scale: 8,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];
      imgFolder.file(`${user.userId}.png`, base64, { base64: true });
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${isModal.row._id}.zip`);
    });
  };

  const blockBuisness = async () => {
    await axios
      .post(`https://loyaltybar-bl4z.onrender.com/buisness/block`, {
        buisnessId: isModal.row._id,
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
        data: { buisnessId: isModal.row._id },
      })
      .catch((res) => {
        console.log(res.data);
      })
      .finally(() => {
        window.location.reload();
      });
  };

  return (
    <div className="popup">
      <div className="back">
        <img src={backIcon} alt="backicon" onClick={() => setIsModal(false)} />
      </div>
      <h1>{isModal.row.buisnessName}</h1>
      <p>ID: {isModal.row._id}</p>
      <p>İşletme numarası: {isModal.row.buisnessNumber}</p>
      <p>İşletme sahibi: {isModal.row.owner}</p>
      <p>Kullanıcı sayısı: {isModal.row.users.length}</p>
      <button onClick={() => downloadQrCodes()}>
        <img src={qrIcon} alt="qr icon" />
        Kullanıcıların QR giriş kodlarını indir
      </button>
      <button
        onClick={() => blockBuisness()}
        style={{ backgroundColor: isModal.row.block ? "white" : "yellow" }}
      >
        <img src={blockIcon} alt="block icon" />
        {isModal.row.block
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
