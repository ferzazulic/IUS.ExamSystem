import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Rooms() {
    const navigate = useNavigate();

    //  PREDEFINED ROOMS
    const rooms = [
        { id: 1, name: "Sports Hall", capacity: 200 },
        { id: 2, name: "BF1.17", capacity: 40 },
        { id: 3, name: "BF2.15", capacity: 80 },
        { id: 4, name: "BF1.18", capacity: 35 },
        { id: 5, name: "BF2.10", capacity: 60 }
    ];

    return (
        <div className="academia-container">

            {/* HEADER */}
            <div className="page-container exams-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Dashboard
                </button>

                <h1 className="exams-title">Rooms</h1>
            </div>

            <div className="page-container">

                {/* LIST */}
                <div
                    style={{
                        marginTop: "20px",
                        maxWidth: "500px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}
                >

                    {rooms.map(room => (
                        <div
                            key={room.id}
                            style={{
                                background: "white",
                                padding: "16px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: "600", fontSize: "16px" }}>
                                    🏫 {room.name}
                                </div>
                                <div style={{ fontSize: "14px", opacity: 0.7 }}>
                                    {room.capacity} seats
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}