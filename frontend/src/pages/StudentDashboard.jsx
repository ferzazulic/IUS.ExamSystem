import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    const user = JSON.parse(localStorage.getItem("auth"));

    useEffect(() => {
        if (!user) navigate("/login");
    }, []);

    const [exams, setExams] = useState([]);
    const [activeNav, setActiveNav] = useState("dashboard");

    useEffect(() => {
        const allExams = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("exams-")) {
                const data = JSON.parse(localStorage.getItem(key)) || [];
                data.forEach(exam => {
                    const studentName = user?.email?.split("@")[0] || user?.email;
                    const studentEntry = exam.students?.find(s => s.name === studentName);
                    allExams.push({
                        ...exam,
                        enrolled: studentEntry ? studentEntry.enrolled : false
                    });
                });
            }
        }
        setExams(allExams);
    }, []);

    const toggleEnroll = (examId) => {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("exams-")) {
                const data = JSON.parse(localStorage.getItem(key)) || [];
                const examIndex = data.findIndex(e => e.id === examId);
                if (examIndex !== -1) {
                    const exam = data[examIndex];
                    const studentName = user?.email?.split("@")[0] || user?.email;
                    const existingIndex = exam.students.findIndex(s => s.name === studentName);

                    if (existingIndex !== -1) {
                        exam.students[existingIndex].enrolled = !exam.students[existingIndex].enrolled;
                    } else {
                        exam.students.push({ name: studentName, enrolled: true });
                    }

                    data[examIndex] = exam;
                    localStorage.setItem(key, JSON.stringify(data));

                    setExams(prev => prev.map(e =>
                        e.id === examId
                            ? { ...e, enrolled: exam.students.find(s => s.name === studentName)?.enrolled }
                            : e
                    ));
                    break;
                }
            }
        }
    };

    const enrolledCount = exams.filter(e => e.enrolled).length;

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

                    <div
                        className="nav-pill"
                        style={{ marginTop: "auto" }}
                        onClick={() => {
                            localStorage.removeItem("auth");
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
                                    <strong>{enrolledCount}</strong>
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
                                            <th style={{ textAlign: "center" }}>Enrollment</th>
                                            <th style={{ textAlign: "center" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.map((exam) => (
                                            <tr key={exam.id} style={{
                                                background: "white",
                                                borderRadius: "12px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                            }}>
                                                <td style={{ padding: "12px", fontWeight: "600" }}>{exam.name}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <span>{exam.date}</span>
                                                        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{exam.time}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span style={{
                                                        background: "#eafaf1", color: "#27ae60",
                                                        padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem"
                                                    }}>
                                                        {exam.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span style={{
                                                        background: exam.enrolled ? "#eafaf1" : "#fdf0f0",
                                                        color: exam.enrolled ? "#27ae60" : "#e74c3c",
                                                        padding: "4px 12px", borderRadius: "8px",
                                                        fontSize: "0.75rem", fontWeight: "600"
                                                    }}>
                                                        {exam.enrolled ? "✓ Enrolled" : "✗ Not enrolled"}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center", padding: "12px" }}>
                                                    <button
                                                        className={`table-btn ${exam.enrolled ? "danger" : "primary"}`}
                                                        onClick={() => toggleEnroll(exam.id)}
                                                    >
                                                        {exam.enrolled ? "Unenroll" : "Enroll"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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

                </div>
            </div>
        </div>
    );
}