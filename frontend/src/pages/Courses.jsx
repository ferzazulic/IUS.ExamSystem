import { useState, useEffect } from "react";
import { ProfessorLayout } from "./ProfessorLayout";

export function Courses() {
    const [courseName, setCourseName] = useState("");
    const [courses, setCourses] = useState(() => {
        return JSON.parse(localStorage.getItem("courses")) || [];
    });

    useEffect(() => {
        localStorage.setItem("courses", JSON.stringify(courses));
    }, [courses]);

    const addCourse = () => {
        if (!courseName.trim()) return;
        setCourses([...courses, { id: Date.now(), name: courseName }]);
        setCourseName("");
    };

    const deleteCourse = (id) => {
        setCourses(courses.filter(c => c.id !== id));
    };

    return (
        <ProfessorLayout active="courses">
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontWeight: "800", fontSize: "1.8rem", margin: 0 }}>Courses</h1>
            </div>

            {/* ADD COURSE */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px"
            }}>
                <h3 style={{ fontWeight: "700", marginBottom: "14px", fontSize: "0.95rem" }}>Add Course</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", maxWidth: "600px" }}>
                    <input
                        className="login-input"
                        placeholder="Course name"
                        value={courseName}
                        onChange={e => setCourseName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCourse()}
                        style={{ flex: 1, height: "40px" }}
                    />
                    <button className="table-btn primary" onClick={addCourse}
                            style={{ height: "40px", padding: "0 24px", borderRadius: "10px", fontWeight: "600" }}>
                        + Add
                    </button>
                </div>
            </div>

            {/* LIST */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
            }}>
                <h3 style={{ fontWeight: "700", marginBottom: "14px", fontSize: "0.95rem" }}>All Courses</h3>
                {courses.length === 0 ? (
                    <p style={{ opacity: 0.5 }}>No courses yet.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {courses.map(c => (
                            <div key={c.id} data-testid="course-item" style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "14px 16px", borderRadius: "12px",
                                background: "#fafafa", border: "1px solid #f0eeff"
                            }}>
                                <span style={{ fontWeight: "600" }}>{c.name}</span>
                                <button className="table-btn danger"
                                        onClick={() => deleteCourse(c.id)}
                                        style={{ padding: "6px 16px", borderRadius: "8px" }}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProfessorLayout>
    );
}