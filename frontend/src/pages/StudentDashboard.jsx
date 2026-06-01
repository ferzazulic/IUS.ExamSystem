import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

export function StudentDashboard() {
    const navigate = useNavigate();
    const user = localStorage.getItem("token");

    useEffect(() => {
        if (!user) navigate("/login");
    }, []);

    const [exams, setExams] = useState([]);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [mySeats, setMySeats] = useState([]);
    const [enrolledExamIds, setEnrolledExamIds] = useState(new Set());


    const [notifications, setNotifications] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            const stored = localStorage.getItem("dismissedNotifications");
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch { return new Set(); }
    });
    const [seatModal, setSeatModal] = useState(null);
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [seatLoading, setSeatLoading] = useState(false);

    const fetchMySeats = () => {
        apiClient.get("/api/exam/my-seats")
            .then(res => {
                const data = res.data || [];
                setMySeats(data);
                setEnrolledExamIds(new Set(data.map(s => s.examId)));
            })
            .catch(console.error);
    };



    useEffect(() => {
        fetchMySeats();

        apiClient.get("/api/exam").then(res => setExams(res.data.exams || [])).catch(console.error);
        apiClient.get("/api/notification").then(res => setNotifications(res.data || [])).catch(console.error);
    }, []);



    const openSeatPicker = async (exam) => {
        try {
            const res = await apiClient.get(`/api/exam/${exam.id}/available-seats`);
            const totalCapacity = res.data.totalCapacity || 0;
            const availableSeats = res.data.availableSeats || [];
            const availableByNumber = {};
            availableSeats.forEach(s => { availableByNumber[s.seatNumber] = s; });

            const seatsPerRow = totalCapacity >= 150 ? 8 : (totalCapacity > 0 ? Math.ceil(totalCapacity / Math.ceil(Math.sqrt(totalCapacity))) : 6);
            const allSeats = Array.from({ length: totalCapacity }, (_, i) => {
                const num = i + 1;
                const rowLabel = String.fromCharCode(65 + Math.floor(i / seatsPerRow));
                const col = (i % seatsPerRow) + 1;
                return {
                    seatNumber: num,
                    seatId: availableByNumber[num]?.seatId || null,
                    available: !!availableByNumber[num],
                    label: `${rowLabel}${col}`
                };
            });

            const seatRows = [];
            for (let i = 0; i < allSeats.length; i += seatsPerRow) {
                const rowLabel = String.fromCharCode(65 + Math.floor(i / seatsPerRow));
                seatRows.push({ label: rowLabel, seats: allSeats.slice(i, i + seatsPerRow) });
            }

            setSeatModal({ examId: exam.id, examName: exam.subject, seatsPerRow, seatRows });
            setSelectedSeatId(null);
        } catch {
            alert("Failed to load available seats");
        }
    };

    const confirmEnroll = async () => {
        if (!selectedSeatId) return;
        setSeatLoading(true);
        try {
            await apiClient.post(`/api/exam/${seatModal.examId}/enroll`, { seatId: selectedSeatId });
            fetchMySeats();
            setSeatModal(null);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to enroll");
        } finally {
            setSeatLoading(false);
        }
    };

    const handleUnenroll = async (examId) => {
        try {
            await apiClient.delete(`/api/exam/${examId}/enroll`);
            fetchMySeats();
        } catch {
            alert("Failed to unenroll from exam");
        }
    };

    const dismissNotification = (id) => {
        setDismissedIds(prev => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem("dismissedNotifications", JSON.stringify([...next]));
            return next;
        });
    };

    const dismissAll = () => {
        setDismissedIds(prev => {
            const next = new Set([...prev, ...notifications.map(n => n.id)]);
            localStorage.setItem("dismissedNotifications", JSON.stringify([...next]));
            return next;
        });
    };

    const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

    // ── SHARED STYLES ──
    const cardStyle = {
        background: "white", borderRadius: "16px", padding: "28px",
        width: "100%", boxSizing: "border-box",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        marginTop: "20px",
    };
    const thStyle = { padding: "10px 12px", color: "#888", fontWeight: "600", fontSize: "0.85rem" };
    const tdStyle = { padding: "14px 12px" };
    const modalOverlay = {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    };

    return (
        <div className="canvas">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <div className="glass-wrapper">

                {/* SIDEBAR */}
                <div className="ultra-sidebar">
                    <div className="brand">
                        <div className="ius-logo">IUS</div>
                        <strong>Student Panel</strong>
                    </div>

                    {[
                        { key: "dashboard", label: "Dashboard" },
                        { key: "exams", label: "My Exams" },
                        { key: "grades", label: "My Grades" },
                        { key: "seats", label: "My Seats" },
                        {
                            key: "notifications", label: "Notifications", badge: visibleNotifications.length > 0 ? {
                                count: visibleNotifications.length,
                                color: visibleNotifications.some(n => n.isImportant) ? "#e74c3c" : "#6c63ff"
                            } : null
                        },
                    ].map(item => (
                        <div
                            key={item.key}
                            className={`nav-pill ${activeNav === item.key ? "active" : ""}`}
                            onClick={() => { setActiveNav(item.key); if (item.key === "notifications") dismissAll(); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        >
                            <span>{item.label}</span>
                            {item.badge && (
                                <span style={{
                                    background: item.badge.color, color: "white",
                                    borderRadius: "12px", padding: "1px 7px",
                                    fontSize: "0.7rem", fontWeight: "700",
                                }}>
                                    {item.badge.count}
                                </span>
                            )}
                        </div>
                    ))}

                    <div className="nav-pill" style={{ marginTop: "auto" }} onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");
                        navigate("/login");
                    }}>
                        Logout
                    </div>
                </div>

                {/* MAIN */}
                <div className="main-stage">

                    {/* ── DASHBOARD ── */}
                    {activeNav === "dashboard" && (
                        <>
                            <h1 style={{ marginBottom: "24px" }}>Student Dashboard</h1>

                            {/* STAT KARTICE */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: "16px",
                            }}>
                                {[
                                    { label: "Available Exams", value: exams.length, color: "#6c63ff" },
                                    { label: "Enrolled Exams", value: enrolledExamIds.size, color: "#2ecc71" },

                                    { label: "Notifications", value: visibleNotifications.length, color: "#f39c12" },
                                ].map(stat => (
                                    <div key={stat.label} style={{
                                        background: "white", borderRadius: "14px", padding: "20px",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                                        borderTop: `4px solid ${stat.color}`,
                                    }}>
                                        <div style={{ fontSize: "2rem", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#888", fontWeight: "600", marginTop: "4px" }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* NOTIFICATIONS PREVIEW */}
                            {visibleNotifications.length > 0 && (
                                <div style={{ ...cardStyle }}>
                                    <h3 style={{ fontWeight: "700", marginBottom: "16px", fontSize: "1rem" }}>Recent Notifications</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {visibleNotifications.slice(0, 3).map(n => {
                                            const accent = n.type === "warning" ? "#f39c12" : n.type === "exam" ? "#6c63ff" : "#1a73e8";
                                            return (
                                                <div key={n.id} style={{
                                                    background: "#fafafa", borderRadius: "10px",
                                                    padding: "12px 16px", borderLeft: `4px solid ${accent}`,
                                                    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px"
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: "700", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                                            {n.title}
                                                            {n.isImportant && (
                                                                <span style={{ background: "#ffe0e0", color: "#e74c3c", fontSize: "0.65rem", padding: "2px 7px", borderRadius: "6px", fontWeight: "700" }}>IMPORTANT</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: "3px" }}>{n.body}</div>
                                                    </div>
                                                    <button onClick={() => dismissNotification(n.id)} style={{
                                                        background: "none", border: "none", cursor: "pointer",
                                                        color: "#aaa", fontSize: "1rem", lineHeight: 1, padding: "0 2px", flexShrink: 0
                                                    }}>×</button>
                                                </div>
                                            );
                                        })}
                                        {visibleNotifications.length > 3 && (
                                            <div onClick={() => { setActiveNav("notifications"); dismissAll(); }}
                                                 style={{ textAlign: "center", color: "#6c63ff", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem", padding: "4px" }}>
                                                View all {visibleNotifications.length} notifications →
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── MY EXAMS ── */}
                    {activeNav === "exams" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>Available Exams</h2>
                            {exams.length === 0 ? (
                                <p style={{ opacity: 0.5 }}>No exams available yet.</p>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                    <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                        <th style={{ ...thStyle, textAlign: "left" }}>Exam</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Date & Time</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Room</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {exams.map(exam => {
                                        const enrolled = enrolledExamIds.has(exam.id);
                                        return (
                                            <tr key={exam.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                                <td style={{ ...tdStyle, fontWeight: "600" }}>{exam.subject}</td>
                                                <td style={{ ...tdStyle, textAlign: "center", fontSize: "0.85rem", color: "#666" }}>
                                                    {new Date(exam.startTime).toLocaleDateString()}<br />
                                                    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{new Date(exam.startTime).toLocaleTimeString()}</span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center", color: "#666" }}>{exam.room?.name || "—"}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                        <span style={{
                                                            background: enrolled ? "#eafaf1" : "#fff8e1",
                                                            color: enrolled ? "#27ae60" : "#f39c12",
                                                            padding: "4px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "600"
                                                        }}>
                                                            {enrolled ? "Enrolled" : "Available"}
                                                        </span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    {enrolled ? (
                                                        <button onClick={() => handleUnenroll(exam.id)}
                                                                className="table-btn danger" style={{ padding: "6px 16px", borderRadius: "8px" }}>
                                                            Unenroll
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => openSeatPicker(exam)}
                                                                className="table-btn primary" style={{ padding: "6px 16px", borderRadius: "8px" }}>
                                                            Enroll
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}



                    {/* ── MY GRADES ── */}
                    {activeNav === "grades" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>My Grades</h2>
                            {mySeats.length === 0 ? (
                                <p style={{ opacity: 0.5 }}>No exam results yet.</p>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                    <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                        <th style={{ ...thStyle, textAlign: "left" }}>Exam</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Date</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Score</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Grade</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {mySeats.map(s => {
                                        const letter = s.score == null ? "—" : s.score >= 90 ? "A" : s.score >= 80 ? "B" : s.score >= 70 ? "C" : s.score >= 55 ? "D" : "F";
                                        const passed = s.score != null && s.score >= 55;
                                        const gradeColor = s.score == null ? "#999" : passed ? "#27ae60" : "#e74c3c";
                                        return (
                                            <tr key={s.examId} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                                <td style={{ ...tdStyle, fontWeight: "600" }}>{s.subject}</td>
                                                <td style={{ ...tdStyle, textAlign: "center", color: "#666", fontSize: "0.85rem" }}>{new Date(s.examDate).toLocaleDateString()}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    {s.score != null ? (
                                                        <span style={{ fontWeight: "700", color: gradeColor }}>{s.score}/100</span>
                                                    ) : (
                                                        <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>Not graded</span>
                                                    )}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                        <span style={{
                                                            background: s.score == null ? "#f5f5f5" : passed ? "#eafaf1" : "#ffe0e0",
                                                            color: gradeColor,
                                                            padding: "4px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "0.9rem"
                                                        }}>
                                                            {letter}
                                                        </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── MY SEATS ── */}
                    {activeNav === "seats" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>My Seat Assignments</h2>
                            {mySeats.length === 0 ? (
                                <p style={{ opacity: 0.5 }}>No seat assignments yet.</p>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                    <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                        <th style={{ ...thStyle, textAlign: "left" }}>Exam</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Date</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Room</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Seat</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {mySeats.map(s => (
                                        <tr key={s.examId} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                            <td style={{ ...tdStyle, fontWeight: "600" }}>{s.subject}</td>
                                            <td style={{ ...tdStyle, textAlign: "center", color: "#666", fontSize: "0.85rem" }}>{new Date(s.examDate).toLocaleString()}</td>
                                            <td style={{ ...tdStyle, textAlign: "center", color: "#666" }}>{s.roomName || "—"}</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>
                                                {s.seatNumber != null ? (
                                                    <span style={{ background: "#eafaf1", color: "#27ae60", padding: "4px 12px", borderRadius: "8px", fontWeight: "700" }}>
                                                            Seat {s.seatNumber}
                                                        </span>
                                                ) : (
                                                    <span style={{ background: "#fff8e1", color: "#f39c12", padding: "4px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "600" }}>
                                                            Pending
                                                        </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeNav === "notifications" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>Notifications</h2>
                            {notifications.length === 0 ? (
                                <p style={{ opacity: 0.5 }}>No notifications yet.</p>
                            ) : visibleNotifications.length === 0 ? (
                                <p style={{ opacity: 0.5 }}>All notifications dismissed.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {visibleNotifications.map(n => {
                                        const accent = n.type === "warning" ? "#f39c12" : n.type === "exam" ? "#6c63ff" : "#1a73e8";
                                        return (
                                            <div key={n.id} style={{
                                                borderRadius: "12px", padding: "16px 20px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                                borderLeft: `5px solid ${accent}`,
                                                background: n.isImportant ? "#fffaf9" : "white",
                                                display: "flex", alignItems: "flex-start", gap: "12px"
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: "700", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                        {n.title}
                                                        {n.isImportant && (
                                                            <span style={{ background: "#ffe0e0", color: "#e74c3c", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>IMPORTANT</span>
                                                        )}
                                                        <span style={{ marginLeft: "auto", background: accent + "22", color: accent, fontSize: "0.7rem", padding: "2px 8px", borderRadius: "6px", fontWeight: "600", textTransform: "capitalize" }}>
                                                            {n.type}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: "0.9rem", color: "#444", lineHeight: "1.5" }}>{n.body}</div>
                                                    <div style={{ fontSize: "0.75rem", opacity: 0.45, marginTop: "8px" }}>
                                                        Posted by {n.createdBy} · {new Date(n.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <button onClick={() => dismissNotification(n.id)} style={{
                                                    background: "none", border: "none", cursor: "pointer",
                                                    color: "#bbb", fontSize: "1.2rem", lineHeight: 1,
                                                    padding: "0 4px", flexShrink: 0, marginTop: "2px"
                                                }} title="Dismiss">×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* SEAT PICKER MODAL */}
            {seatModal && (
                <div style={modalOverlay} onClick={() => setSeatModal(null)}>
                    <div style={{
                        background: "white", borderRadius: "16px", padding: "28px",
                        width: "480px", maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: "700", marginBottom: "6px", fontSize: "1.1rem" }}>Pick Your Seat</h3>
                        <p style={{ opacity: 0.6, marginBottom: "16px", fontSize: "0.9rem" }}>{seatModal.examName}</p>

                        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", fontSize: "12px" }}>
                            {[
                                { color: "#1a3a6b", bg: "#1a3a6b", label: "Selected" },
                                { color: "#1a73e8", bg: "#e8f0fe", label: "Available" },
                                { color: "#ccc", bg: "#f5f5f5", label: "Taken" },
                            ].map(item => (
                                <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: item.bg, border: `2px solid ${item.color}`, display: "inline-block" }} />
                                    {item.label}
                                </span>
                            ))}
                        </div>

                        {seatModal.seatRows.length === 0 ? (
                            <p style={{ opacity: 0.5, textAlign: "center", padding: "20px 0" }}>No seats available.</p>
                        ) : (
                            <div style={{ marginBottom: "24px", overflowX: "auto" }}>
                                <div style={{ display: "flex", gap: "6px", marginBottom: "4px", marginLeft: "24px" }}>
                                    {Array.from({ length: seatModal.seatsPerRow }, (_, i) => (
                                        <div key={i} style={{ width: "40px", textAlign: "center", fontSize: "10px", fontWeight: "700", opacity: 0.4 }}>{i + 1}</div>
                                    ))}
                                </div>
                                {seatModal.seatRows.map(({ label, seats }) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                        <div style={{ width: "18px", fontWeight: "700", fontSize: "12px", color: "#6c63ff" }}>{label}</div>
                                        {seats.map(seat => (
                                            <button key={seat.seatNumber} disabled={!seat.available}
                                                    onClick={() => seat.available && setSelectedSeatId(seat.seatId)}
                                                    style={{
                                                        width: "40px", height: "40px", borderRadius: "8px",
                                                        border: selectedSeatId === seat.seatId ? "2px solid #1a3a6b" : seat.available ? "2px solid #1a73e8" : "2px solid #ccc",
                                                        background: selectedSeatId === seat.seatId ? "#1a3a6b" : seat.available ? "#e8f0fe" : "#f5f5f5",
                                                        color: selectedSeatId === seat.seatId ? "white" : seat.available ? "#1a73e8" : "#bbb",
                                                        fontWeight: "700", fontSize: "11px",
                                                        cursor: seat.available ? "pointer" : "not-allowed",
                                                        transition: "all 0.15s"
                                                    }}>
                                                {seat.label}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setSeatModal(null)}
                                    style={{ padding: "8px 20px", borderRadius: "8px", border: "2px solid #e0e0e0", background: "white", color: "#888", fontWeight: "600", cursor: "pointer" }}>
                                Cancel
                            </button>
                            <button onClick={confirmEnroll} disabled={!selectedSeatId || seatLoading}
                                    className="table-btn primary"
                                    style={{ padding: "8px 24px", borderRadius: "8px", opacity: (!selectedSeatId || seatLoading) ? 0.6 : 1 }}>
                                {seatLoading ? "Enrolling..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}