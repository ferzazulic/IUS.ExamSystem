import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function Dashboard() {
    const navigate = useNavigate();

    // 👤 user
    const user = JSON.parse(localStorage.getItem("auth"));

    // 🔒 AUTH PROTECTION
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, []);

    // 📊 LOAD PO USERU
    const exams = JSON.parse(
        localStorage.getItem(`exams-${user?.email}`)
    ) || [];

    const examCount = exams.length;

    const studentCount = exams.reduce(
        (total, exam) => total + (exam.students?.length || 0),
        0
    );

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
                        onClick={() => navigate("/seats")}
                    >
                        🪑 Seat Allocation
                    </div>

                    <div className="nav-pill">🏫 Rooms</div>

                    {/* LOGOUT */}
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

                    <h1 style={{ marginBottom: "20px" }}>
                        Professor Dashboard 📊
                    </h1>

                    {/* HERO */}
                    <div className="dashboard-hero-card">
                        <div>
                            <span className="hero-badge">Professor Panel</span>
                            <h2>Manage exams & seating</h2>

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
                                    <strong>5</strong>
                                    <span>Rooms</span>
                                </div>

                            </div>
                        </div>

                        <div style={{ fontSize: "4rem" }}>📝</div>
                    </div>

                    {/* ACTION CARDS */}
                    <div className="feature-hub-grid">

                        <div
                            className="hub-card"
                            onClick={() => navigate("/exams")}
                        >
                            <div className="hub-icon">📝</div>
                            <div>
                                <strong>Manage Exams</strong>
                                <p>Create and schedule exams</p>
                            </div>
                        </div>

                        <div
                            className="hub-card"
                            onClick={() => navigate("/seats")}
                        >
                            <div className="hub-icon">🪑</div>
                            <div>
                                <strong>Seat Allocation</strong>
                                <p>Assign students to seats</p>
                            </div>
                        </div>

                        <div className="hub-card">
                            <div className="hub-icon">🏫</div>
                            <div>
                                <strong>Rooms</strong>
                                <p>Manage room capacity</p>
                            </div>
                        </div>

                        <div className="hub-card">
                            <div className="hub-icon">📊</div>
                            <div>
                                <strong>Reports</strong>
                                <p>View exam analytics</p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}