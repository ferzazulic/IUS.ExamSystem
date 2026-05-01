import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Courses() {
    const navigate = useNavigate();

    const [courseName, setCourseName] = useState("");

    const [courses, setCourses] = useState(() => {
        return JSON.parse(localStorage.getItem("courses")) || [];
    });

    useEffect(() => {
        localStorage.setItem("courses", JSON.stringify(courses));
    }, [courses]);

    const addCourse = () => {
        if (!courseName.trim()) return;

        const newCourse = {
            id: Date.now(),
            name: courseName
        };

        setCourses([...courses, newCourse]);
        setCourseName("");
    };

    const deleteCourse = (id) => {
        setCourses(courses.filter(c => c.id !== id));
    };

    return (
        <div className="academia-container">

            {/* HEADER */}
            <div className="page-container exams-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Dashboard
                </button>

                <h1 className="exams-title">Courses</h1>
            </div>

            {/* 🔥 SVE ISPOD IDE U ISTI CONTAINER */}
            <div className="page-container">

                {/* ADD COURSE */}
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        marginTop: "20px",
                        maxWidth: "600px"
                    }}
                >
                    <input
                        className="login-input"
                        placeholder="Course name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") addCourse();
                        }}
                        style={{ flex: 1 }}
                    />

                    <button
                        className="table-btn primary"
                        style={{ minWidth: "140px" }}
                        onClick={addCourse}
                    >
                        + Add
                    </button>
                </div>

                {/* LIST */}
                <div style={{ marginTop: "20px", maxWidth: "600px" }}>
                    {courses.length === 0 ? (
                        <p
                            style={{
                                marginLeft:"2px",
                                marginTop: "10px",
                                fontWeight: "600",
                                color: "#111",
                                fontSize: "16px"
                            }}
                        >
                            No courses yet.
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {courses.map(c => (
                                <div
                                    key={c.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px 16px",
                                        borderRadius: "12px",
                                        background: "white",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <span style={{ fontWeight: "500" }}>
                                        {c.name}
                                    </span>

                                    <button
                                        className="table-btn danger"
                                        style={{ padding: "6px 12px" }}
                                        onClick={() => deleteCourse(c.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}