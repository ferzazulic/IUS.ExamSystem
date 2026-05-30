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
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [notifications, setNotifications] = useState([]);

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

    const fetchMyCourses = () => {
        apiClient.get("/api/course/my-courses")
            .then(res => {
                const data = res.data || [];
                setEnrolledCourseIds(new Set(data.map(c => c.id)));
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchMyCourses();
        apiClient.get("/api/course")
            .then(res => setAllCourses(res.data || []))
            .catch(console.error);
        apiClient.get("/api/notification")
            .then(res => setNotifications(res.data || []))
            .catch(console.error);
    }, []);

    const handleEnrollCourse = async (courseId) => {
        try {
            await apiClient.post(`/api/course/${courseId}/enroll`);
            fetchMyCourses();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to enroll in course");
        }
    };

    const handleUnenrollCourse = async (courseId) => {
        try {
            await apiClient.delete(`/api/course/${courseId}/enroll`);
            fetchMyCourses();
        } catch {
            alert("Failed to unenroll from course");
        }
    };

    const [seatModal, setSeatModal] = useState(null); // { examId, examName, seatsPerRow, seatRows }
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [seatLoading, setSeatLoading] = useState(false);

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

            setSeatModal({
                examId: exam.id,
                examName: exam.subject,
                seatsPerRow,
                seatRows
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
                        Dashboard
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "notifications" ? "active" : ""}`}
                        onClick={() => setActiveNav("notifications")}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                        <span>Notifications</span>
                        {notifications.length > 0 && (
                            <span style={{
                                background: notifications.some(n => n.isImportant) ? "#e74c3c" : "#6c63ff",
                                color: "white", borderRadius: "12px", padding: "1px 7px",
                                fontSize: "0.7rem", fontWeight: "700", minWidth: "20px", textAlign: "center"
                            }}>
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "exams" ? "active" : ""}`}
                        onClick={() => setActiveNav("exams")}
                    >
                        My Exams
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "schedule" ? "active" : ""}`}
                        onClick={() => setActiveNav("schedule")}
                    >
                        Schedule
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "classes" ? "active" : ""}`}
                        onClick={() => setActiveNav("classes")}
                    >
                        My Classes
                    </div>
                    <div
                        className={`nav-pill ${activeNav === "grades" ? "active" : ""}`}
                        onClick={() => setActiveNav("grades")}
                    >
                        My Grades
                    </div>
                    <div className={`nav-pill ${activeNav === "seats" ? "active" : ""}`}
                    onClick={() => setActiveNav("seats")}
                     >
                          My Seats
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
                        Logout
                    </div>
                </div>

                {/* MAIN */}
                <div className="main-stage">

                    <h1 style={{ marginBottom: "20px" }}>Student Dashboard</h1>

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
                            </div>
                        </div>
                        <div></div>
                    </div>

                    {/* NOTIFICATIONS PREVIEW on dashboard */}
                    {activeNav === "dashboard" && notifications.length > 0 && (
                        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {notifications.slice(0, 3).map(n => {
                                const accent = n.type === "warning" ? "#f39c12"
                                    : n.type === "exam" ? "#6c63ff" : "#1a73e8";
                                return (
                                    <div key={n.id} style={{
                                        background: "white", borderRadius: "14px",
                                        padding: "14px 18px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        borderLeft: `4px solid ${accent}`
                                    }}>
                                        <div style={{ fontWeight: "700", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                            {n.title}
                                            {n.isImportant && (
                                                <span style={{ background: "#ffe0e0", color: "#e74c3c", fontSize: "0.65rem", padding: "2px 7px", borderRadius: "6px", fontWeight: "700" }}>
                                                    IMPORTANT
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "3px" }}>{n.body}</div>
                                        <div style={{ fontSize: "0.72rem", opacity: 0.45, marginTop: "5px" }}>
                                            {new Date(n.createdAt).toLocaleString()} · {n.createdBy}
                                        </div>
                                    </div>
                                );
                            })}
                            {notifications.length > 3 && (
                                <div
                                    onClick={() => setActiveNav("notifications")}
                                    style={{ textAlign: "center", color: "#6c63ff", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem", padding: "4px" }}
                                >
                                    View all {notifications.length} notifications →
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
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>Available Exams</h2>

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


                    
                    {/* MY CLASSES */}
                    {activeNav === "classes" && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>My Classes</h2>

                            {allCourses.length === 0 ? (
                                <p style={{ opacity: 0.5, padding: "20px 0" }}>No courses available yet.</p>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                    <thead>
                                        <tr style={{ opacity: 0.6 }}>
                                            <th style={{ padding: "10px", textAlign: "left" }}>Code</th>
                                            <th style={{ textAlign: "left" }}>Course Name</th>
                                            <th style={{ textAlign: "center" }}>Type</th>
                                            <th style={{ textAlign: "left" }}>Professor</th>
                                            <th style={{ textAlign: "center" }}>Status</th>
                                            <th style={{ textAlign: "center" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allCourses.map((c) => {
                                            const enrolled = enrolledCourseIds.has(c.id);
                                            return (
                                                <tr key={c.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                    <td style={{ padding: "12px", fontWeight: "700", color: "#6c63ff" }}>{c.code}</td>
                                                    <td style={{ padding: "12px", fontWeight: "600" }}>{c.name}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span style={{ background: "#f0eeff", color: "#6c63ff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem" }}>
                                                            {c.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "12px", opacity: 0.8 }}>{c.professor}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span style={{ background: enrolled ? "#eafaf1" : "#fff8e1", color: enrolled ? "#27ae60" : "#f39c12", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem" }}>
                                                            {enrolled ? "Enrolled" : "Available"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "center", padding: "12px" }}>
                                                        {enrolled ? (
                                                            <button
                                                                onClick={() => handleUnenrollCourse(c.id)}
                                                                style={{ background: "#ffe0e0", color: "#e74c3c", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}
                                                            >
                                                                Unenroll
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEnrollCourse(c.id)}
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

                    {/* NOTIFICATIONS */}
                    {activeNav === "notifications" && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>Notifications</h2>
                            {notifications.length === 0 ? (
                                <p style={{ opacity: 0.5, padding: "20px 0" }}>No notifications yet.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                                    {notifications.map(n => {
                                        const accent = n.type === "warning" ? "#f39c12"
                                            : n.type === "exam" ? "#6c63ff" : "#1a73e8";
                                        return (
                                            <div key={n.id} style={{
                                                borderRadius: "14px",
                                                padding: "16px 20px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                                borderLeft: `5px solid ${accent}`,
                                                background: n.isImportant ? "#fffaf9" : "white"
                                            }}>
                                                <div style={{ fontWeight: "700", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                    {n.title}
                                                    {n.isImportant && (
                                                        <span style={{ background: "#ffe0e0", color: "#e74c3c", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                                                            IMPORTANT
                                                        </span>
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
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MY GRADES */}
                    {activeNav === "grades" && (
                        <div className="hub-card" style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: "24px",
                            marginTop: "20px"
                        }}>
                            <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>My Grades</h2>
                            {mySeats.length === 0 ? (
                                <p style={{ opacity: 0.5, padding: "20px 0" }}>No exam results yet.</p>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                    <thead>
                                        <tr style={{ opacity: 0.6 }}>
                                            <th style={{ padding: "10px", textAlign: "left" }}>Exam</th>
                                            <th style={{ textAlign: "center" }}>Date</th>
                                            <th style={{ textAlign: "center" }}>Score</th>
                                            <th style={{ textAlign: "center" }}>Letter</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mySeats.map((s) => {
                                            const letter = s.score == null ? "—"
                                                : s.score >= 90 ? "A"
                                                : s.score >= 80 ? "B"
                                                : s.score >= 70 ? "C"
                                                : s.score >= 55 ? "D" : "F";
                                            const passed = s.score != null && s.score >= 55;
                                            const gradeColor = s.score == null ? "#999" : passed ? "#27ae60" : "#e74c3c";
                                            return (
                                                <tr key={s.examId} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                    <td style={{ padding: "12px", fontWeight: "600" }}>{s.subject}</td>
                                                    <td style={{ textAlign: "center" }}>{new Date(s.examDate).toLocaleDateString()}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        {s.score != null ? (
                                                            <span style={{ fontWeight: "700", color: gradeColor }}>{s.score}/100</span>
                                                        ) : (
                                                            <span style={{ opacity: 0.4 }}>Not graded</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
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

                      {/* MY SEATS */}
                      {activeNav === "seats" && (
                          <div className="hub-card" style={{
                              flexDirection: "column",
                              alignItems: "flex-start",
                              padding: "24px",
                              marginTop: "20px"
                          }}>
                              <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>My Seat Assignments</h2>

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
                        <p style={{ opacity: 0.6, marginBottom: "16px", fontSize: "0.9rem" }}>{seatModal.examName}</p>

                        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", fontSize: "12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#1a3a6b", border: "2px solid #1a3a6b", display: "inline-block" }} /> Selected
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#e8f0fe", border: "2px solid #1a73e8", display: "inline-block" }} /> Available
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#f5f5f5", border: "2px solid #ccc", display: "inline-block" }} /> Taken
                            </span>
                        </div>

                        {seatModal.seatRows.length === 0 ? (
                            <p style={{ opacity: 0.5, textAlign: "center", padding: "20px 0" }}>No seats available for this exam.</p>
                        ) : (
                            <div style={{ marginBottom: "24px", overflowX: "auto" }}>
                                {/* Column header */}
                                <div style={{ display: "flex", gap: "6px", marginBottom: "4px", marginLeft: "24px" }}>
                                    {Array.from({ length: seatModal.seatsPerRow }, (_, i) => (
                                        <div key={i} style={{ width: "40px", textAlign: "center", fontSize: "10px", fontWeight: "700", opacity: 0.4 }}>{i + 1}</div>
                                    ))}
                                </div>
                                {seatModal.seatRows.map(({ label, seats }) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                        <div style={{ width: "18px", fontWeight: "700", fontSize: "12px", color: "#6c63ff" }}>{label}</div>
                                        {seats.map(seat => (
                                            <button
                                                key={seat.seatNumber}
                                                disabled={!seat.available}
                                                onClick={() => seat.available && setSelectedSeatId(seat.seatId)}
                                                style={{
                                                    width: "40px", height: "40px",
                                                    borderRadius: "8px",
                                                    border: (seat.seatId !== null && selectedSeatId === seat.seatId)
                                                        ? "2px solid #1a3a6b"
                                                        : seat.available ? "2px solid #1a73e8" : "2px solid #ccc",
                                                    background: (seat.seatId !== null && selectedSeatId === seat.seatId)
                                                        ? "#1a3a6b"
                                                        : seat.available ? "#e8f0fe" : "#f5f5f5",
                                                    color: (seat.seatId !== null && selectedSeatId === seat.seatId)
                                                        ? "white"
                                                        : seat.available ? "#1a73e8" : "#bbb",
                                                    fontWeight: "700", fontSize: "11px",
                                                    cursor: seat.available ? "pointer" : "not-allowed",
                                                    transition: "all 0.15s"
                                                }}
                                            >
                                                {seat.label}
                                            </button>
                                        ))}
                                    </div>
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