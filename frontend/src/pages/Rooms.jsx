import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

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
                        <span style={{ width: "18px", fontSize: "11px", fontWeight: "700", color: "#1a73e8", opacity: 0.7 }}>{rowLabel}</span>
                        {Array.from({ length: count }, (_, c) => (
                            <div key={c} style={{
                                width: "22px", height: "22px", borderRadius: "4px",
                                background: "#e8f0fe", border: "1px solid #a8c4f8",
                                fontSize: "9px", display: "flex", alignItems: "center",
                                justifyContent: "center", color: "#1a73e8", fontWeight: "600"
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
    const navigate = useNavigate();
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
        <div className="academia-container">
            <div className="page-container exams-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Dashboard</button>
                <h1 className="exams-title">Rooms</h1>
            </div>

            {canCreate && (
                <div className="page-container exam-form" style={{ maxWidth: "700px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <h3 style={{ margin: "0", fontWeight: "700", whiteSpace: "nowrap" }}>Add New Room</h3>
                        <input
                            className="login-input"
                            placeholder="Room name (e.g. Room A)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && createRoom()}
                            style={{ margin: "0", flex: "1", minWidth: "160px" }}
                        />
                        <input
                            className="login-input"
                            type="number"
                            placeholder="Capacity"
                            value={capacity}
                            min="1"
                            onChange={e => setCapacity(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && createRoom()}
                            style={{ margin: "0", width: "120px" }}
                        />
                        <button
                            onClick={createRoom}
                            style={{ background: "#1a73e8", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" }}
                        >
                            + Create Room
                        </button>
                    </div>
                    {error && <p style={{ color: "red", fontSize: "13px", margin: "8px 0 0" }}>{error}</p>}
                </div>
            )}

            <div className="page-container">
                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {rooms.map(room => (
                        <div key={room.id} style={{
                            background: "white", padding: "20px", borderRadius: "16px",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: "700", fontSize: "17px" }}>{room.name}</div>
                                    <div style={{ fontSize: "13px", opacity: 0.6, marginTop: "2px" }}>{room.capacity} seats total</div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <button
                                        onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                                        style={{ background: "#1a73e8", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                                    >
                                        {expandedRoom === room.id ? "Hide" : "Layout"}
                                    </button>
                                    {canCreate && (
                                        <button
                                            onClick={() => deleteRoom(room.id)}
                                            style={{ background: "#ffe0e0", color: "#e74c3c", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            {expandedRoom === room.id && <RoomGrid capacity={room.capacity} />}
                        </div>
                    ))}
                </div>

                {rooms.length === 0 && (
                    <p style={{ opacity: 0.5, marginTop: "20px" }}>No rooms yet.</p>
                )}
            </div>
        </div>
    );
}
