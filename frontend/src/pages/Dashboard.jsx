import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function Dashboard() {
    const navigate = useNavigate();

    const user = localStorage.getItem("token");

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, []);

    // 📊 EXAMS
    const exams = JSON.parse(
        localStorage.getItem(`exams-${user?.email}`)
    ) || [];

    const examCount = exams.length;

    const studentCount = exams.reduce(
        (total, exam) => total + (exam.students?.length || 0),
        0
    );

    //  COURSES
    const [courses, setCourses] = useState(() => {
        return JSON.parse(localStorage.getItem("courses")) || [];
    });

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

                    <div className="nav-pill active">🏠 Dashboard</div>

                    <div
                        className="nav-pill"
                        onClick={() => navigate("/exams")}
                    >
                        📝 Exams
                    </div>

                    <div
                        className="nav-pill"
                        onClick={() => navigate("/courses")}
                    >
                        📚 Courses
                    </div>

                    <div
                        className="nav-pill"
                        onClick={() => navigate("/seats")}
                    >
                        🪑 Seat Allocation
                    </div>

                    <div className="nav-pill" onClick={() => navigate("/rooms")}>
                        🏫 Rooms
                    </div>

                    {/* LOGOUT */}
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

                    <h1 style={{ marginBottom: "20px" }}>
                        Professor Dashboard 📊
                    </h1>

                    {/* HERO */}
                    <div className="dashboard-hero-card">
                        <div>
                            <span className="hero-badge">Professor Panel</span>
                            <h2>Manage exams & courses</h2>

                            <div className="hero-stats">

                                <div className="mini-stat">
                                    <strong>{examCount}</strong>
                                    <span>Exams</span>
                                </div>

                                <div className="mini-stat">
                                    <strong>{studentCount}</strong>
                                    <span>Students</span>
                                </div>

                                <div className="mini-stat">
                                    <strong>{courses.length}</strong>
                                    <span>Courses</span>
                                </div>

                            </div>
                        </div>

                        <div style={{ fontSize: "4rem" }}>📊</div>
                    </div>

                </div>

            </div>
        </div>
    );
}