import "./index.css";
import AddCard from "../AddCard/index";
import AddIcon from "../../../assets/svgs/addIcon";
import React, { useState, useEffect, useRef } from "react";

export default function Index() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddIconClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseClick = () => {
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="search__container">
        
        <div div className="addBtn" onClick={() => handleAddIconClick()}>
          <AddIcon />
          <p>Yeni işletme ekle</p>
        </div>
      </div>
      <AddCard isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />
    </>
  );
}
