import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "buisnessName", headerName: "İşletme ismi", width: 130 },
  { field: "buisnessNumber", headerName: "İşletme numarası", width: 150 },
  { field: "owner", headerName: "İşletme sahibi", width: 130 },
  { field: "userCount", headerName: "Kullanıcı sayısı", width: 150 },
];

export default function DataTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${import.meta.env.VITE_API_URL}/buisness/getall`,
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });
        if (response.data && Array.isArray(response.data)) {
          const dataWithId = response.data.map((item, index) => ({
            ...item,
            id: item._id || index,
            userCount: item.users.length,
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
          getRowId={(row) => row.id}
          getRowClassName={getRowClassName}
          onRowClick={(e) => {
            navigate(`/business/${e.row.id}`);
          }}
          disableColumnFilter
          disableColumnMenu
        />
      </Paper>
    </div>
  );
}
