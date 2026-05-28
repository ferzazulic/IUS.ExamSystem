import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; 
const MY_CLASSES = [
    {
        code: "CS413.1",
        name: "Developing the Interactive Web",
        type: "P/E - Program Electives",
        category: "Major",
        level: "Senior",
        professor: "Assistant Mirza Selimović"
    },
    {
        code: "MATH209.1",
        name: "Discrete Mathematics II",
        type: "Major",
        category: "Major",
        level: "",
        professor: "Assoc. Prof. Dr. Ozge Buyukdagli"
    },
    {
        code: "SE308.1",
        name: "Communication Systems and Networks",
        type: "Major",
        category: "Major",
        level: "",
        professor: "Assist. Prof. Dr. Amal Mersni"
    },
    {
        code: "SE407.1",
        name: "Software Quality Management",
        type: "Major",
        category: "Major",
        level: "",
        professor: "Assist. Prof. Dr. Mohammed Saeed Jawad"
    }
];

export function StudentDashboard() {
    const navigate = useNavigate();
    const user = localStorage.getItem("token");

    useEffect(() => {
        if (!user) navigate("/login");
    }, [navigate, user]);

    const [exams, setExams] = useState([]);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [mySeats, setMySeats] = useState([]);
    const [enrolledExamIds, setEnrolledExamIds] = useState(new Set());

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
    }, []);

    useEffect(() => {
        apiClient.get("/api/exam")
            .then(res => setExams(res.data.exams || []))
            .catch(console.error);
    }, []);

    const [seatModal, setSeatModal] = useState(null); // { examId, examName, seats: [] }
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [seatLoading, setSeatLoading] = useState(false);

    const openSeatPicker = async (exam) => {
        try {
            const res = await apiClient.get(`/api/exam/${exam.id}/available-seats`);
            setSeatModal({
                examId: exam.id,
                examName: exam.subject,
                seats: res.data.availableSeats || []
            });
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
            const msg = err.response?.data?.error || "Failed to enroll";
            alert(msg);
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

    
    return (
        <div className="canvas">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <div className="glass-wrapper">

                {/* SIDEBAR */}
                <div className="ultra-sidebar">
                    <div className="brand">
                        <div className="ius-logo">IUS</div>
                        <strong>Exam System</strong>
                    </div>

                    <div
                        className={`nav-pill ${activeNav === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveNav("dashboard")}
                    >
                        🏠 Dashboard
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "exams" ? "active" : ""}`}
                        onClick={() => setActiveNav("exams")}
                    >
                        📋 My Exams
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "classes" ? "active" : ""}`}
                        onClick={() => setActiveNav("classes")}
                    >
                        📚 My Classes
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "schedule" ? "active" : ""}`}
                        onClick={() => setActiveNav("schedule")}
                    >
                        📅 Schedule
                    </div>
                    <div className={`nav-pill ${activeNav === "seats" ? "active" : ""}`}
                    onClick={() => setActiveNav("seats")}
                     >
                          🪑 My Seats
                         </div>
                    <div
                        className="nav-pill"
                        style={{ marginTop: "auto" }}
                        onClick={() => {
                            localStorage.removeItem("token");
                             localStorage.removeItem("role");
                            navigate("/login");
                        }}
                    >
                        🚪 Logout
                    </div>
                </div>

                {/* MAIN */}
                <div className="main-stage">

                    <h1 style={{ marginBottom: "20px" }}>Student Dashboard 🎓</h1>

                    {/* HERO */}
                    <div className="dashboard-hero-card">
                        <div>
                            <span className="hero-badge">Student Panel</span>
                            <h2>Your exam overview</h2>
                            <div className="hero-stats">
                                <div className="mini-stat">
                                    <strong>{exams.length}</strong>
                                    <span>Available</span>
                                </div>
                                <div className="mini-stat">
                                    <strong>{enrolledExamIds.size}</strong>
                                    <span>Enrolled</span>
                                </div>
                                <div className="mini-stat">
                                    <strong>{MY_CLASSES.length}</strong>
                                    <span>Classes</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: "4rem" }}>🎓</div>
                    </div>

                    {/* EXAMS SECTION */}
                    {(activeNav === "dashboard" || activeNav === "exams") && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>📋 Available Exams</h2>

                            {exams.length === 0 ? (
                                <p style={{ opacity: 0.5, padding: "20px 0" }}>No exams available yet.</p>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                    <thead>
                                        <tr style={{ opacity: 0.6 }}>
                                            <th style={{ padding: "10px", textAlign: "left" }}>Exam</th>
                                            <th style={{ textAlign: "center" }}>Date & Time</th>
                                            <th style={{ textAlign: "center" }}>Status</th>
                                            <th style={{ textAlign: "center" }}>Room</th>
                                            <th style={{ textAlign: "center" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.map((exam) => {
                                            const enrolled = enrolledExamIds.has(exam.id);
                                            return (
                                                <tr key={exam.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                    <td style={{ padding: "12px", fontWeight: "600" }}>{exam.subject}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                                                            <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{new Date(exam.startTime).toLocaleTimeString()}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span style={{ background: enrolled ? "#eafaf1" : "#fff8e1", color: enrolled ? "#27ae60" : "#f39c12", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem" }}>
                                                            {enrolled ? "Enrolled" : "Scheduled"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>{exam.room?.name || "—"}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        {enrolled ? (
                                                            <button
                                                                onClick={() => handleUnenroll(exam.id)}
                                                                style={{ background: "#ffe0e0", color: "#e74c3c", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}
                                                            >
                                                                Unenroll
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openSeatPicker(exam)}
                                                                style={{ background: "#e8f5e9", color: "#27ae60", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}
                                                            >
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

                    {/* CLASSES SECTION */}
                    {(activeNav === "dashboard" || activeNav === "classes") && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>📚 My Classes</h2>

                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                <thead>
                                    <tr style={{ opacity: 0.6 }}>
                                        <th style={{ padding: "10px", textAlign: "left" }}>Code</th>
                                        <th style={{ textAlign: "left" }}>Course Name</th>
                                        <th style={{ textAlign: "center" }}>Type</th>
                                        <th style={{ textAlign: "left" }}>Professor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MY_CLASSES.map((cls) => (
                                        <tr key={cls.code} style={{
                                            background: "white",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                        }}>
                                            <td style={{ padding: "12px", fontWeight: "700", color: "#6c63ff" }}>
                                                {cls.code}
                                            </td>
                                            <td style={{ padding: "12px", fontWeight: "600" }}>
                                                {cls.name}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span style={{
                                                    background: "#f0eeff", color: "#6c63ff",
                                                    padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem"
                                                }}>
                                                    {cls.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", opacity: 0.75, fontSize: "0.9rem" }}>
                                                👨‍🏫 {cls.professor}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    
                      {/* MY SEATS */}
                      {activeNav === "seats" && (
                          <div className="hub-card" style={{
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "24px",
                              marginTop: "20px"
                          }}>
                              <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>🪑 My Seat Assignments</h2>

                              {mySeats.length === 0 ? (
                                  <p style={{ opacity: 0.5, padding: "20px 0" }}>No seat assignments yet.</p>
                              ) : (
                                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                      <thead>
                                          <tr style={{ opacity: 0.6 }}>
                                              <th style={{ padding: "10px", textAlign: "left" }}>Exam</th>
                                              <th style={{ textAlign: "center" }}>Date</th>
                                              <th style={{ textAlign: "center" }}>Room</th>
                                              <th style={{ textAlign: "center" }}>Seat</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {mySeats.map((s) => (
                                              <tr key={s.examId} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                  <td style={{ padding: "12px", fontWeight: "600" }}>{s.subject}</td>
                                                  <td style={{ textAlign: "center" }}>{new Date(s.examDate).toLocaleString()}</td>
                                                  <td style={{ textAlign: "center" }}>{s.roomName || "—"}</td>
                                                  <td style={{ textAlign: "center" }}>
                                                      {s.seatNumber != null ? (
                                                          <span style={{ background: "#eafaf1", color: "#27ae60", padding: "4px 12px", borderRadius: "8px", fontWeight: "700" }}>
                                                              Seat {s.seatNumber}
                                                          </span>
                                                      ) : (
                                                          <span style={{ background: "#fff8e1", color: "#f39c12", padding: "4px 12px", borderRadius: "8px", fontSize: "0.75rem" }}>
                                                              Pending allocation
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
                </div>
            </div>

            {/* SEAT PICKER MODAL */}
            {seatModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "white", borderRadius: "20px", padding: "32px",
                        width: "480px", maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <h2 style={{ marginBottom: "6px", fontWeight: "700" }}>Pick Your Seat</h2>
                        <p style={{ opacity: 0.6, marginBottom: "24px", fontSize: "0.9rem" }}>{seatModal.examName}</p>

                        {seatModal.seats.length === 0 ? (
                            <p style={{ opacity: 0.5, textAlign: "center", padding: "20px 0" }}>No available seats for this exam.</p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "24px" }}>
                                {seatModal.seats.map(seat => (
                                    <button
                                        key={seat.seatId}
                                        onClick={() => setSelectedSeatId(seat.seatId)}
                                        style={{
                                            padding: "12px 0",
                                            borderRadius: "10px",
                                            border: selectedSeatId === seat.seatId ? "2px solid #6c63ff" : "2px solid #e0e0e0",
                                            background: selectedSeatId === seat.seatId ? "#f0eeff" : "white",
                                            color: selectedSeatId === seat.seatId ? "#6c63ff" : "#333",
                                            fontWeight: "700",
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                            transition: "all 0.15s"
                                        }}
                                    >
                                        {seat.seatNumber}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setSeatModal(null)}
                                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: "600" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEnroll}
                                disabled={!selectedSeatId || seatLoading}
                                style={{
                                    padding: "10px 24px", borderRadius: "10px", border: "none",
                                    background: selectedSeatId ? "#6c63ff" : "#ccc",
                                    color: "white", fontWeight: "700", cursor: selectedSeatId ? "pointer" : "not-allowed"
                                }}
                            >
                                {seatLoading ? "Enrolling..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}