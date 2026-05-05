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
    }, []);

    const [exams, setExams] = useState([]);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [mySeats, setMySeats] = useState([]);
    const [enrolledExamIds, setEnrolledExamIds] = useState(new Set());
    const [studentReport, setStudentReport] = useState(null);
    const [gradesLoading, setGradesLoading] = useState(false);
    const [gradesError, setGradesError] = useState("");

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
        fetchStudentReport();
    }, []);

    const fetchStudentReport = async () => {
        const studentId = localStorage.getItem("userId");
        if (!studentId) return;

        setGradesLoading(true);
        setGradesError("");

        try {
            const res = await apiClient.get(`/api/report/student/${studentId}`);
            setStudentReport(res.data);
        } catch (err) {
            console.error(err);
            setGradesError("Unable to load grades.");
        } finally {
            setGradesLoading(false);
        }
    };

    useEffect(() => {
        apiClient.get("/api/exam")
            .then(res => setExams(res.data.exams || []))
            .catch(console.error);
    }, []);

    const [seatModal, setSeatModal] = useState(null); // { examId, examName, seats: [] }
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [seatLoading, setSeatLoading] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState(null);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackSaving, setFeedbackSaving] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState("");

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

    const openFeedbackModal = (seat) => {
        setFeedbackModal(seat);
        setFeedbackText(seat?.feedback || "");
        setFeedbackSuccess("");
    };

    const submitFeedback = async () => {
        if (!feedbackModal || !feedbackText.trim()) return;

        setFeedbackSaving(true);
        try {
            await apiClient.post(`/api/exam/${feedbackModal.examId}/feedback`, { feedback: feedbackText.trim() });
            setFeedbackSuccess("Your feedback has been sent.");
            setFeedbackModal(null);
            setFeedbackText("");
            fetchMySeats();
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to submit feedback.";
            alert(msg);
        } finally {
            setFeedbackSaving(false);
        }
    };

    const upcomingNotifications = mySeats.filter((seat) => {
        const examDate = new Date(seat.examDate);
        const now = new Date();
        const diffHours = (examDate - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 48;
    }).map((seat) => ({
        examId: seat.examId,
        subject: seat.subject,
        examDate: seat.examDate,
        roomName: seat.roomName,
        seatNumber: seat.seatNumber
    }));

    const notificationCount = upcomingNotifications.length;

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
                    <div className={`nav-pill ${activeNav === "notifications" ? "active" : ""}`}
                        onClick={() => setActiveNav("notifications")}
                    >
                        🔔 Notifications{notificationCount > 0 ? ` (${notificationCount})` : ""}
                    </div>
                    <div className={`nav-pill ${activeNav === "grades" ? "active" : ""}`}
                        onClick={() => setActiveNav("grades")}
                    >
                        📈 My Grades
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
                            localStorage.removeItem("userId");
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
                                    <strong>{notificationCount}</strong>
                                    <span>Upcoming</span>
                                </div>
                                <div className="mini-stat">
                                    <strong>{studentReport ? studentReport.averageGrade.toFixed(1) : "—"}</strong>
                                    <span>Avg Grade</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: "4rem" }}>🎓</div>
                    </div>

                    {/* notifikacije */}
                    {(activeNav === "dashboard" || activeNav === "notifications") && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>🔔 Notifications</h2>

                            {upcomingNotifications.length === 0 ? (
                                <p style={{ opacity: 0.5, padding: "20px 0" }}>No upcoming exams within 48 hours.</p>
                            ) : (
                                <div style={{ display: "grid", gap: "14px", width: "100%" }}>
                                    {upcomingNotifications.map((item) => {
                                        const examDate = new Date(item.examDate);
                                        const days = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));
                                        const hours = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60)));
                                        return (
                                            <div key={item.examId} style={{ background: "white", padding: "18px", borderRadius: "16px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", width: "100%" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontWeight: "700" }}>{item.subject}</span>
                                                    <span style={{ color: "#6c63ff", fontWeight: "700" }}>{hours <= 24 ? `${hours}h` : `${days}d`}</span>
                                                </div>
                                                <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
                                                    Exam starts on {examDate.toLocaleDateString()} at {examDate.toLocaleTimeString()} in {item.roomName || "the assigned room"}.
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

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

                    {(activeNav === "grades") && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>📈 My Grades</h2>

                            {gradesLoading ? (
                                <p style={{ opacity: 0.6, padding: "20px 0" }}>Loading grades...</p>
                            ) : gradesError ? (
                                <p style={{ color: "#e74c3c", padding: "20px 0" }}>{gradesError}</p>
                            ) : !studentReport || studentReport.examScores.length === 0 ? (
                                <p style={{ opacity: 0.5, padding: "20px 0" }}>No grades available yet.</p>
                            ) : (
                                <>
                                    <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginBottom: "20px" }}>
                                        <div style={{ background: "#f7f8ff", padding: "18px 22px", borderRadius: "16px", minWidth: "180px" }}>
                                            <span style={{ display: "block", opacity: 0.7, marginBottom: "8px" }}>Completed Exams</span>
                                            <strong style={{ fontSize: "1.7rem" }}>{studentReport.totalExamsTaken}</strong>
                                        </div>
                                        <div style={{ background: "#f7f8ff", padding: "18px 22px", borderRadius: "16px", minWidth: "180px" }}>
                                            <span style={{ display: "block", opacity: 0.7, marginBottom: "8px" }}>Average Grade</span>
                                            <strong style={{ fontSize: "1.7rem" }}>{studentReport.averageGrade.toFixed(1)}</strong>
                                        </div>
                                    </div>

                                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                        <thead>
                                            <tr style={{ opacity: 0.6 }}>
                                                <th style={{ padding: "10px", textAlign: "left" }}>Exam</th>
                                                <th style={{ textAlign: "center" }}>Date</th>
                                                <th style={{ textAlign: "center" }}>Score</th>
                                                <th style={{ textAlign: "center" }}>Grade</th>
                                                <th style={{ textAlign: "center" }}>Seat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentReport.examScores.map((score) => (
                                                <tr key={score.examId} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                    <td style={{ padding: "12px", fontWeight: "600" }}>{score.subject}</td>
                                                    <td style={{ textAlign: "center" }}>{new Date(score.examDate).toLocaleDateString()}</td>
                                                    <td style={{ textAlign: "center" }}>{score.score != null ? score.score.toFixed(1) : "—"}</td>
                                                    <td style={{ textAlign: "center" }}>{score.grade != null ? score.grade.toFixed(1) : "—"}</td>
                                                    <td style={{ textAlign: "center" }}>{score.seatNumber || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
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
                                              <th style={{ textAlign: "center" }}>Feedback</th>
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
                                                  <td style={{ textAlign: "center" }}>
                                                      <button
                                                          onClick={() => openFeedbackModal(s)}
                                                          style={{
                                                              background: "#f0eeff",
                                                              color: "#6c63ff",
                                                              border: "none",
                                                              padding: "6px 14px",
                                                              borderRadius: "8px",
                                                              cursor: "pointer",
                                                              fontWeight: "600",
                                                              fontSize: "0.8rem"
                                                          }}
                                                      >
                                                          Send Feedback
                                                      </button>
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

            {/* sjediste*/}
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

            {/* ovaj feedback */}
            {feedbackModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "white", borderRadius: "20px", padding: "32px",
                        width: "520px", maxWidth: "92vw", maxHeight: "80vh", overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <h2 style={{ marginBottom: "6px", fontWeight: "700" }}>Send Feedback</h2>
                        <p style={{ opacity: 0.6, marginBottom: "24px", fontSize: "0.9rem" }}>
                            Request a review or ask to meet your instructor about {feedbackModal.subject}.
                        </p>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Type your feedback request here..."
                            style={{ width: "100%", minHeight: "160px", borderRadius: "14px", border: "1px solid #ddd", padding: "16px", fontSize: "1rem", resize: "vertical" }}
                        />
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "18px" }}>
                            <button
                                onClick={() => setFeedbackModal(null)}
                                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: "600" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitFeedback}
                                disabled={feedbackSaving || !feedbackText.trim()}
                                style={{
                                    padding: "10px 24px", borderRadius: "10px", border: "none",
                                    background: feedbackText.trim() ? "#6c63ff" : "#ccc",
                                    color: "white", fontWeight: "700", cursor: feedbackText.trim() ? "pointer" : "not-allowed"
                                }}
                            >
                                {feedbackSaving ? "Sending..." : "Submit Feedback"}
                            </button>
                        </div>
                        {feedbackSuccess && (
                            <p style={{ marginTop: "16px", color: "#27ae60" }}>{feedbackSuccess}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}