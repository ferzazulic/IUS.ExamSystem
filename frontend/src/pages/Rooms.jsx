import { useState, useEffect } from "react";

import apiClient from "../api/apiClient";
import { ProfessorLayout } from "./ProfessorLayout";

function getRoomGrid(capacity) {
    if (capacity <= 0) return { seatsPerRow: 1, numRows: 0 };
    const seatsPerRow = capacity >= 150 ? 8 : Math.ceil(capacity / Math.ceil(Math.sqrt(capacity)));
    const numRows = Math.ceil(capacity / seatsPerRow);
    return { seatsPerRow, numRows };
}

function RoomGrid({ capacity, seatAssignments = [] }) {
    const { seatsPerRow, numRows } = getRoomGrid(capacity);
    const assignmentMap = {};
    seatAssignments.forEach(s => { assignmentMap[s.seatNumber] = s; });

    return (
        <div style={{ marginTop: "12px" }}>
            {Array.from({ length: numRows }, (_, r) => {
                const rowLabel = String.fromCharCode(65 + r);
                const start = r * seatsPerRow;
                const count = Math.min(seatsPerRow, capacity - start);
                return (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                        <span style={{ width: "18px", fontSize: "11px", fontWeight: "700", color: "#6c63ff", opacity: 0.7 }}>{rowLabel}</span>
                        {Array.from({ length: count }, (_, c) => {
                            const seatNum = start + c + 1;
                            const assignment = assignmentMap[seatNum];
                            const isAssigned = !!assignment?.studentId;
                            return (
                                <div key={c} title={isAssigned ? assignment.studentName : `Seat ${rowLabel}${c + 1}`} style={{
                                    width: "40px", height: "40px", borderRadius: "6px",
                                    background: isAssigned ? "#eafaf1" : "#f0eeff",
                                    border: isAssigned ? "1.5px solid #27ae60" : "1px solid #a29bfe",
                                    fontSize: "9px", display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    color: isAssigned ? "#27ae60" : "#6c63ff", fontWeight: "600",
                                    padding: "2px", boxSizing: "border-box", overflow: "hidden",
                                    lineHeight: "1.2", textAlign: "center",
                                }}>
                                    <span style={{ fontSize: "9px", opacity: isAssigned ? 0.7 : 1 }}>{rowLabel}{c + 1}</span>
                                    {isAssigned && (
                                        <span style={{ fontSize: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "36px" }}>
                                            {assignment.studentName?.split(" ")[0]}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
            <div style={{ fontSize: "11px", opacity: 0.5, marginTop: "6px" }}>
                {numRows} rows × {seatsPerRow} seats
            </div>
        </div>
    );
}

export function Rooms() {
    const role = localStorage.getItem("role");
    const canCreate = role === "Admin" || role === "Staff";

    const [rooms, setRooms] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [seatData, setSeatData] = useState(null);
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        apiClient.get("/api/room").then(res => setRooms(res.data)).catch(console.error);
        apiClient.get("/api/exam").then(res => setExams(res.data.exams || [])).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedExamId) { setSeatData(null); return; }
        apiClient.get(`/api/exam/${selectedExamId}/seat-map`)
            .then(res => setSeatData(res.data))
            .catch(console.error);
    }, [selectedExamId]);

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

            {/* EXAM SELECTOR */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "16px 24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px",
                display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap"
            }}>
                <span style={{ fontWeight: "600", fontSize: "0.85rem", color: "#555", whiteSpace: "nowrap" }}>Show seats for exam:</span>
                <select className="login-input" value={selectedExamId}
                        onChange={e => setSelectedExamId(e.target.value)}
                        style={{ flex: "1", minWidth: "200px", height: "38px" }}>
                    <option value="">— Empty layout —</option>
                    {exams.map(e => (
                        <option key={e.id} value={e.id}>
                            {e.subject} — {new Date(e.startTime).toLocaleDateString()} ({e.room?.name || "No room"})
                        </option>
                    ))}
                </select>
            </div>

            {/* ROOMS GRID */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px"
            }}>
                {rooms.map(room => {
                    const assignments = seatData?.roomName === room.name ? seatData.seats : [];
                    return (
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
                                {canCreate && (
                                    <button className="table-btn danger"
                                            onClick={() => deleteRoom(room.id)}
                                            style={{ padding: "6px 12px", borderRadius: "8px" }}>
                                        Delete
                                    </button>
                                )}
                            </div>
                            <RoomGrid capacity={room.capacity} seatAssignments={assignments} />
                        </div>
                    );
                })}
            </div>

            {rooms.length === 0 && <p style={{ opacity: 0.5, marginTop: "20px" }}>No rooms yet.</p>}

        </ProfessorLayout>
    );
}
