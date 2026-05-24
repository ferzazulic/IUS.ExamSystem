import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

function getGrid(capacity) {
    if (!capacity) return { seatsPerRow: 1, numRows: 0 };
    const seatsPerRow = capacity >= 150 ? 8 : Math.ceil(capacity / Math.ceil(Math.sqrt(capacity)));
    const numRows = Math.ceil(capacity / seatsPerRow);
    return { seatsPerRow, numRows };
}

export function Seats() {
    const location = useLocation();
    const navigate = useNavigate();

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

    useEffect(() => {
        apiClient.get("/api/exam").then(res => setExams(res.data.exams || [])).catch(console.error);
        apiClient.get("/api/user")
            .then(res => setStudents(res.data.filter(u => u.role === "Student")))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedExamId) loadSeatMap();
        else { setSeatMapData([]); setCapacity(0); setRoomName(""); }
    }, [selectedExamId]);

    const loadSeatMap = async () => {
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
    };

    const handleSeatClick = async (seat) => {
        if (seat.studentId) {
            if (!window.confirm(`Remove ${seat.studentName} from seat ${seat.seatNumber}?`)) return;
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
        <div className="academia-container">
            <div className="page-container exams-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Dashboard</button>
                <div className="title-block">
                    <h1 className="exams-title">Seat Allocation</h1>
                    {roomName && (
                        <p className="exams-sub">
                            Room: {roomName} ({capacity} seats) — {assignedCount} assigned
                        </p>
                    )}
                </div>
                {selectedExamId && (
                    <div className="actions-bar">
                        <button className="mode-btn active" onClick={autoAssign}>Auto Assign All</button>
                    </div>
                )}
            </div>

            {/* Exam selector */}
            <div className="page-container" style={{ maxWidth: "420px" }}>
                <select
                    className="login-input"
                    value={selectedExamId}
                    onChange={e => { setSelectedSeat(null); setMessage(""); setSelectedExamId(e.target.value); }}
                >
                    <option value="">— Select an exam —</option>
                    {exams.map(e => (
                        <option key={e.id} value={e.id}>
                            {e.subject} — {new Date(e.startTime).toLocaleDateString()} ({e.room?.name || "No room"})
                        </option>
                    ))}
                </select>
            </div>

            {message && (
                <div className="page-container" style={{ color: message.includes("success") || message.includes("removed") ? "green" : "red", fontWeight: "600" }}>
                    {message}
                </div>
            )}

            {/* Student picker when a seat is selected */}
            {selectedSeat && (
                <div className="page-container student-picker">
                    <span>Assign student to seat <strong>{selectedSeat.seatNumber}</strong>:</span>
                    <select className="login-input" defaultValue="" onChange={e => assignStudent(e.target.value)}>
                        <option value="" disabled>Select student</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.fullName}</option>
                        ))}
                    </select>
                    <button onClick={() => setSelectedSeat(null)} style={{ background: "#eee", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                </div>
            )}

            {loading && <div className="page-container" style={{ opacity: 0.6 }}>Loading seat map...</div>}

            {/* Seat grid */}
            {seatRows.length > 0 && (
                <div className="page-container">
                    <div style={{ overflowX: "auto" }}>
                        <div style={{ display: "inline-block", minWidth: "fit-content" }}>
                            {/* Column numbers header */}
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
                                            <div
                                                key={seat.seatId}
                                                onClick={() => handleSeatClick(seat)}
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
                                                }}
                                            >
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
                <div className="page-container" style={{ opacity: 0.5 }}>No seats found for this exam's room.</div>
            )}
        </div>
    );
}
