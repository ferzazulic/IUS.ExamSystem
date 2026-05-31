import { useState, useEffect } from "react";

import apiClient from "../api/apiClient";
import { ProfessorLayout } from "./ProfessorLayout";

function getRoomGrid(capacity) {
    if (capacity <= 0) return { seatsPerRow: 1, numRows: 0 };
    const seatsPerRow = capacity >= 150 ? 8 : Math.ceil(capacity / Math.ceil(Math.sqrt(capacity)));
    const numRows = Math.ceil(capacity / seatsPerRow);
    return { seatsPerRow, numRows };
}

function RoomGrid({ capacity }) {
    const { seatsPerRow, numRows } = getRoomGrid(capacity);
    return (
        <div style={{ marginTop: "12px" }}>
            {Array.from({ length: numRows }, (_, r) => {
                const rowLabel = String.fromCharCode(65 + r);
                const start = r * seatsPerRow;
                const count = Math.min(seatsPerRow, capacity - start);
                return (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                        <span style={{ width: "18px", fontSize: "11px", fontWeight: "700", color: "#6c63ff", opacity: 0.7 }}>{rowLabel}</span>
                        {Array.from({ length: count }, (_, c) => (
                            <div key={c} style={{
                                width: "22px", height: "22px", borderRadius: "4px",
                                background: "#f0eeff", border: "1px solid #a29bfe",
                                fontSize: "9px", display: "flex", alignItems: "center",
                                justifyContent: "center", color: "#6c63ff", fontWeight: "600"
                            }}>
                                {c + 1}
                            </div>
                        ))}
                    </div>
                );
            })}
            <div style={{ fontSize: "11px", opacity: 0.5, marginTop: "6px" }}>
                {numRows} rows x {seatsPerRow} seats
            </div>
        </div>
    );
}

export function Rooms() {
    const role = localStorage.getItem("role");
    const canCreate = role === "Admin" || role === "Staff";

    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [error, setError] = useState("");
    const [expandedRoom, setExpandedRoom] = useState(null);

    useEffect(() => {
        apiClient.get("/api/room").then(res => setRooms(res.data)).catch(console.error);
    }, []);

    const createRoom = async () => {
        if (!name.trim() || !capacity || parseInt(capacity) <= 0) {
            setError("Enter a valid name and capacity.");
            return;
        }
        setError("");
        try {
            const res = await apiClient.post("/api/room", { name: name.trim(), capacity: parseInt(capacity) });
            setRooms(prev => [...prev, res.data]);
            setName("");
            setCapacity("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create room");
        }
    };

    const deleteRoom = async (id) => {
        if (!window.confirm("Delete this room?")) return;
        try {
            await apiClient.delete(`/api/room/${id}`);
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete room");
        }
    };

    return (
        <ProfessorLayout active="rooms">

            {/* HEADER */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontWeight: "800", fontSize: "1.8rem", margin: 0 }}>Rooms</h1>
            </div>

            {/* ADD ROOM */}
            {canCreate && (
                <div style={{
                    background: "white", borderRadius: "16px", padding: "24px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px"
                }}>
                    <h3 style={{ fontWeight: "700", marginBottom: "14px", fontSize: "0.95rem" }}>Add New Room</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            className="login-input"
                            placeholder="Room name (e.g. A101)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && createRoom()}
                            style={{ flex: "1", minWidth: "160px", height: "40px" }}
                        />
                        <input
                            className="login-input"
                            type="number"
                            placeholder="Capacity"
                            value={capacity}
                            min="1"
                            onChange={e => setCapacity(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && createRoom()}
                            style={{ width: "120px", height: "40px" }}
                        />
                        <button className="table-btn primary" onClick={createRoom}
                                style={{ height: "40px", padding: "0 24px", borderRadius: "10px", fontWeight: "600" }}>
                            + Create Room
                        </button>
                    </div>
                    {error && <p style={{ color: "#e74c3c", fontSize: "0.8rem", marginTop: "8px", fontWeight: "600" }}>{error}</p>}
                </div>
            )}

            {/* ROOMS GRID */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px"
            }}>
                {rooms.map(room => (
                    <div key={room.id} style={{
                        background: "white", padding: "20px", borderRadius: "16px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                        borderTop: "4px solid #6c63ff"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{room.name}</div>
                                <div style={{ fontSize: "0.82rem", color: "#888", marginTop: "2px" }}>{room.capacity} seats total</div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button className="table-btn primary"
                                        onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                                        style={{ padding: "6px 12px", borderRadius: "8px" }}>
                                    {expandedRoom === room.id ? "Hide" : "Layout"}
                                </button>
                                {canCreate && (
                                    <button className="table-btn danger"
                                            onClick={() => deleteRoom(room.id)}
                                            style={{ padding: "6px 12px", borderRadius: "8px" }}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                        {expandedRoom === room.id && <RoomGrid capacity={room.capacity} />}
                    </div>
                ))}
            </div>

            {rooms.length === 0 && <p style={{ opacity: 0.5, marginTop: "20px" }}>No rooms yet.</p>}

        </ProfessorLayout>
    );
}