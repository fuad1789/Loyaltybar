import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import axios from "axios";
import BuisnessPopUp from "../BuisnessPopUp/index";
import "./index.css";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "buisnessName", headerName: "İşletme ismi", width: 130 },
  { field: "buisnessNumber", headerName: "İşletme numarası", width: 150 },
  { field: "owner", headerName: "İşletme sahibi", width: 130 },
];

export default function DataTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const paginationModel = { page: 0, pageSize: 5 };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `https://loyaltybar-bl4z.onrender.com/buisness/getall`,
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });
        if (response.data && Array.isArray(response.data)) {
          const dataWithId = response.data.map((item, index) => ({
            ...item,
            id: item._id || index,
          }));
          setRows(dataWithId);
        } else {
          console.error("Invalid response format:", response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching businesses:", error);
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const getRowClassName = (params) => {
    return params.row.block ? "blocked-row" : "";
  };

  return (
    <div className="list">
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          getRowId={(row) => row.id}
          getRowClassName={getRowClassName}
          onRowClick={(e) => {
            setIsModal(e);
          }}
          disableColumnFilter
          disableColumnMenu
        />
      </Paper>
      {isModal && <BuisnessPopUp setIsModal={setIsModal} isModal={isModal} />}
    </div>
  );
}
