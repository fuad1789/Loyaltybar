import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css";

const columns = [
  { field: "id", headerName: "ID", width: 220 },
  { field: "buisnessName", headerName: "İşletme İsmi", width: 200 },
  { field: "buisnessNumber", headerName: "İşletme Numarası", width: 180 },
  { field: "owner", headerName: "İşletme Sahibi", width: 180 },
  { field: "userCount", headerName: "Kullanıcı Sayısı", width: 150 },
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
      <Paper
        sx={{
          height: "100%",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
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
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(67, 97, 238, 0.04)",
            },
          }}
        />
      </Paper>
    </div>
  );
}
