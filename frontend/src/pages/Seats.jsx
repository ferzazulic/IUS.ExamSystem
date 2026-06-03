import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/apiClient";
import { ProfessorLayout } from "./ProfessorLayout";

function getGrid(capacity) {
    if (!capacity) return { seatsPerRow: 1, numRows: 0 };
    const seatsPerRow = capacity >= 150 ? 8 : Math.ceil(capacity / Math.ceil(Math.sqrt(capacity)));
    const numRows = Math.ceil(capacity / seatsPerRow);
    return { seatsPerRow, numRows };
}

export function Seats() {
    const location = useLocation();
    const navExam = location.state;

    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(navExam?.id || "");
    const [seatMapData, setSeatMapData] = useState([]);
    const [capacity, setCapacity] = useState(0);
    const [roomName, setRoomName] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const loadSeatMap = useCallback(async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await apiClient.get(`/api/exam/${selectedExamId}/seat-map`);
            setSeatMapData(res.data.seats || []);
            setCapacity(res.data.capacity || 0);
            setRoomName(res.data.roomName || "");
        } catch {
            setMessage("Failed to load seat map.");
        } finally {
            setLoading(false);
        }
    }, [selectedExamId]);

    useEffect(() => {
        apiClient.get("/api/exam").then(res => setExams(res.data.exams || [])).catch(console.error);
        apiClient.get("/api/user")
            .then(res => setStudents(res.data.filter(u => u.role === "Student")))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedExamId) Promise.resolve().then(loadSeatMap);
    }, [selectedExamId, loadSeatMap]);

    const handleSeatClick = async (seat) => {
        if (seat.studentId) {
            try {
                await apiClient.delete(`/api/exam/${selectedExamId}/seat/${seat.seatId}`);
                await loadSeatMap();
                setMessage("Assignment removed.");
            } catch (err) {
                setMessage(err.response?.data?.error || "Failed to remove assignment.");
            }
        } else {
            setSelectedSeat(seat);
        }
    };

    const assignStudent = async (studentId) => {
        if (!selectedSeat || !studentId) return;
        try {
            await apiClient.post(`/api/exam/${selectedExamId}/assign-seat`, {
                studentId: parseInt(studentId),
                seatId: selectedSeat.seatId
            });
            setSelectedSeat(null);
            await loadSeatMap();
            setMessage("Seat assigned successfully!");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to assign seat.");
        }
    };

    const autoAssign = async () => {
        try {
            await apiClient.post(`/api/exam/allocate/${selectedExamId}`);
            await loadSeatMap();
            setMessage("Seats auto-allocated successfully!");
        } catch {
            setMessage("Failed to auto-allocate seats.");
        }
    };

    const { seatsPerRow } = getGrid(capacity);
    const seatRows = [];
    for (let i = 0; i < seatMapData.length; i += seatsPerRow) {
        const rowLabel = String.fromCharCode(65 + Math.floor(i / seatsPerRow));
        seatRows.push({ label: rowLabel, seats: seatMapData.slice(i, i + seatsPerRow) });
    }

    const assignedCount = seatMapData.filter(s => s.studentId).length;

    return (
        <ProfessorLayout active="seats">

            {/* HEADER */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontWeight: "800", fontSize: "1.8rem", margin: 0 }}>Seat Allocation</h1>
                {roomName && (
                    <p style={{ color: "#888", margin: "4px 0 0", fontSize: "0.9rem" }}>
                        Room: {roomName} ({capacity} seats) — {assignedCount} assigned
                    </p>
                )}
            </div>

            {/* EXAM SELECTOR + AUTO ASSIGN */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px"
            }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <select className="login-input"
                            value={selectedExamId}
                            onChange={e => {
                                setSelectedSeat(null);
                                setMessage("");
                                setSeatMapData([]);
                                setCapacity(0);
                                setRoomName("");
                                setSelectedExamId(e.target.value);
                            }}
                            style={{ flex: "1", minWidth: "200px", height: "40px" }}>
                        <option value="">— Select an exam —</option>
                        {exams.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.subject} — {new Date(e.startTime).toLocaleDateString()} ({e.room?.name || "No room"})
                            </option>
                        ))}
                    </select>
                    {selectedExamId && (
                        <button className="table-btn primary" onClick={autoAssign}
                                style={{ height: "40px", padding: "0 24px", borderRadius: "10px", fontWeight: "600" }}>
                            Auto Assign All
                        </button>
                    )}
                </div>
            </div>

            {/* MESSAGE */}
            {message && (
                <div style={{
                    padding: "12px 16px", borderRadius: "10px", marginBottom: "16px",
                    background: message.includes("success") || message.includes("removed") ? "#eafaf1" : "#ffe0e0",
                    color: message.includes("success") || message.includes("removed") ? "#27ae60" : "#e74c3c",
                    fontWeight: "600", fontSize: "0.9rem"
                }}>
                    {message}
                </div>
            )}

            {/* STUDENT PICKER */}
            {selectedSeat && (
                <div style={{
                    background: "white", borderRadius: "16px", padding: "20px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px",
                    display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"
                }}>
                    <span style={{ fontWeight: "600" }}>Assign student to seat <strong style={{ color: "#6c63ff" }}>{selectedSeat.seatNumber}</strong>:</span>
                    <select className="login-input" defaultValue=""
                            onChange={e => assignStudent(e.target.value)}
                            style={{ flex: "1", minWidth: "200px", height: "40px" }}>
                        <option value="" disabled>Select student</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.fullName}</option>
                        ))}
                    </select>
                    <button onClick={() => setSelectedSeat(null)}
                            style={{ padding: "8px 20px", borderRadius: "8px", border: "2px solid #e0e0e0", background: "white", color: "#888", fontWeight: "600", cursor: "pointer" }}>
                        Cancel
                    </button>
                </div>
            )}

            {loading && <p style={{ opacity: 0.6 }}>Loading seat map...</p>}

            {/* SEAT GRID */}
            {seatRows.length > 0 && (
                <div style={{
                    background: "white", borderRadius: "16px", padding: "24px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
                }}>
                    <div style={{ overflowX: "auto" }}>
                        <div style={{ display: "inline-block", minWidth: "fit-content" }}>
                            <div style={{ display: "flex", gap: "6px", marginBottom: "4px", marginLeft: "28px" }}>
                                {Array.from({ length: seatsPerRow }, (_, i) => (
                                    <div key={i} style={{ width: "52px", textAlign: "center", fontSize: "11px", fontWeight: "700", opacity: 0.4 }}>{i + 1}</div>
                                ))}
                            </div>
                            {seatRows.map(({ label, seats }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                    <div style={{ width: "22px", textAlign: "center", fontWeight: "700", fontSize: "13px", color: "#6c63ff" }}>{label}</div>
                                    {seats.map(seat => {
                                        const isSelected = selectedSeat?.seatId === seat.seatId;
                                        const isAssigned = !!seat.studentId;
                                        return (
                                            <div key={seat.seatId} onClick={() => handleSeatClick(seat)}
                                                 title={isAssigned ? `${seat.studentName} — click to remove` : `Seat ${seat.seatNumber} — click to assign`}
                                                 style={{
                                                     width: "52px", height: "52px", borderRadius: "10px",
                                                     border: isSelected ? "2px solid #6c63ff" : isAssigned ? "2px solid #27ae60" : "2px solid #e0e0e0",
                                                     background: isSelected ? "#f0eeff" : isAssigned ? "#eafaf1" : "white",
                                                     display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                     cursor: "pointer", fontSize: "10px", fontWeight: "600",
                                                     color: isAssigned ? "#27ae60" : "#555",
                                                     transition: "all 0.15s", padding: "4px", textAlign: "center",
                                                     overflow: "hidden", lineHeight: "1.2"
                                                 }}>
                                                <span style={{ fontSize: "9px", opacity: 0.6 }}>{label}{seat.seatNumber}</span>
                                                {isAssigned && (
                                                    <span style={{ fontSize: "9px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "48px" }}>
                                                        {seat.studentName?.split(" ")[0]}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: "16px", display: "flex", gap: "16px", fontSize: "13px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "14px", height: "14px", borderRadius: "3px", background: "#eafaf1", border: "2px solid #27ae60", display: "inline-block" }} />
                            Assigned
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "14px", height: "14px", borderRadius: "3px", background: "white", border: "2px solid #e0e0e0", display: "inline-block" }} />
                            Free
                        </span>
                    </div>
                </div>
            )}

            {selectedExamId && !loading && seatMapData.length === 0 && (
                <p style={{ opacity: 0.5 }}>No seats found for this exam's room.</p>
            )}
        </ProfessorLayout>
    );
}
