import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { ProfessorLayout } from "./ProfessorLayout";

export function Dashboard() {
    const navigate = useNavigate();
    const [examCount, setExamCount] = useState(0);
    const [roomCount, setRoomCount] = useState(0);
    const [courses] = useState(() => JSON.parse(localStorage.getItem("courses")) || []);

    useEffect(() => {
        if (!localStorage.getItem("token")) navigate("/login");
        apiClient.get("/api/exam").then(res => setExamCount(res.data.exams?.length || 0)).catch(console.error);
        apiClient.get("/api/room").then(res => setRoomCount(res.data?.length || 0)).catch(console.error);
    }, [navigate]);

    return (
        <ProfessorLayout active="dashboard">
            <h1 style={{ marginBottom: "24px" }}>Professor Dashboard</h1>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "16px",
                marginBottom: "28px"
            }}>
                {[
                    { label: "Exams", value: examCount, color: "#6c63ff" },
                    { label: "Rooms", value: roomCount, color: "#3498db" },
                    { label: "Courses", value: courses.length, color: "#2ecc71" },
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

            <div style={{
                background: "white", borderRadius: "16px", padding: "28px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
            }}>
                <h3 style={{ fontWeight: "700", marginBottom: "16px", fontSize: "1rem" }}>Quick Actions</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {[
                        { label: "Manage Exams", route: "/exams", color: "#6c63ff" },
                        { label: "Manage Courses", route: "/courses", color: "#3498db" },
                        { label: "Seat Allocation", route: "/seats", color: "#2ecc71" },
                        { label: "Manage Rooms", route: "/rooms", color: "#f39c12" },
                        { label: "Grade Exams", route: "/grade-exams", color: "#e74c3c" },
                        { label: "Post Notifications", route: "/notifications-manage", color: "#9b59b6" },
                    ].map(action => (
                        <button key={action.label} onClick={() => navigate(action.route)}
                                style={{
                                    padding: "10px 20px", borderRadius: "10px", border: "none",
                                    background: action.color, color: "white",
                                    fontWeight: "600", fontSize: "0.9rem", cursor: "pointer",
                                    boxShadow: `0 4px 12px ${action.color}40`,
                                    transition: "transform 0.1s",
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </ProfessorLayout>
    );
}
