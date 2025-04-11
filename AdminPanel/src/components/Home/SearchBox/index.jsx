import "./index.css";
import AddCard from "../AddCard/index";
import React, { useState } from "react";

export default function Index() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddIconClick = () => {
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="search__container">
        <div className="addBtn" onClick={handleAddIconClick}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>Yeni İşletme Ekle</p>
        </div>
      </div>
      <AddCard isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />
    </>
  );
}
