import { useNavigate } from "react-router-dom";

export function ProfessorLayout({ children, active }) {
    const navigate = useNavigate();
    const fullName = localStorage.getItem("fullName") || "";
    const initials = fullName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    const navItems = [
        { key: "dashboard", label: "Dashboard", route: "/dashboard" },
        { key: "exams", label: "Exams", route: "/exams" },
        { key: "courses", label: "Courses", route: "/courses" },
        { key: "seats", label: "Seat Allocation", route: "/seats" },
        { key: "rooms", label: "Rooms", route: "/rooms" },
        { key: "grade-exams", label: "Grade Exams", route: "/grade-exams" },
        { key: "notifications-manage", label: "Post Notifications", route: "/notifications-manage" },
    ];

    return (
        <div className="canvas">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="glass-wrapper">

                {/* SIDEBAR */}
                <div className="ultra-sidebar">
                    <div className="brand">
                        <div className="ius-logo">{initials}</div>
                        <strong>Professor Panel</strong>
                    </div>

                    {navItems.map(item => (
                        <div
                            key={item.key}
                            className={`nav-pill ${active === item.key ? "active" : ""}`}
                            onClick={() => navigate(item.route)}
                        >
                            {item.label}
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
                    {children}
                </div>

            </div>
        </div>
    );
}