import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import apiClient from "../api/apiClient";

  export function Rooms() {
      const navigate = useNavigate();
      const [rooms, setRooms] = useState([]);

      useEffect(() => {
          apiClient.get("/api/room").then(res => setRooms(res.data)).catch(console.error);
      }, []);

      return (
          <div className="academia-container">
              <div className="page-container exams-header">
                  <button className="back-btn" onClick={() => navigate(-1)}>← Dashboard</button>
                  <h1 className="exams-title">Rooms</h1>
              </div>
              <div className="page-container">
                  <div style={{ marginTop: "20px", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {rooms.map(room => (
                          <div key={room.id} style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                  <div style={{ fontWeight: "600", fontSize: "16px" }}>🏫 {room.name}</div>
                                  <div style={{ fontSize: "14px", opacity: 0.7 }}>{room.capacity} seats</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }