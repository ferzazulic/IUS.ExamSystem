import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Exams() {
    const navigate = useNavigate();

    const [examName, setExamName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // 👤 trenutno logovani user
    const user = localStorage.getItem("token");

    const storageKey = `exams-${user?.email}`;

    // 🔥 LOAD PO USERU
    const [exams, setExams] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    // 🔄 SAVE PO USERU
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(exams));
    }, [exams, storageKey]);

    const addExam = () => {
        if (!examName || !date || !time) return;

        const newExam = {
            id: Date.now(),
            name: examName,
            date,
            time,
            students: exams.length === 0
                ? [
                    { name: "Ajsa", enrolled: true },
                    { name: "Amir", enrolled: true },
                    { name: "Lejla", enrolled: true },
                    { name: "Haris", enrolled: true },
                    { name: "Sara", enrolled: false }
                ]
                : [],
            status: "Scheduled"
        };

        setExams([...exams, newExam]);

        setExamName("");
        setDate("");
        setTime("");
    };

    const deleteExam = (id) => {
        setExams(exams.filter((exam) => exam.id !== id));
    };

    return (
        <div className="academia-container">

            {/* HEADER */}
            <div className="page-container exams-header">
                <div>
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Dashboard
                    </button>

                    <h1 className="exams-title">Exams Management</h1>
                    <p className="exams-sub">
                        Create and manage exam schedules
                    </p>
                </div>
            </div>

            {/* ADD EXAM */}
            <div className="page-container exam-form">
                <input
                    className="login-input"
                    placeholder="Exam name"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                />

                <input
                    type="date"
                    className="login-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <input
                    type="time"
                    className="login-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <button className="table-btn primary" onClick={addExam}>
                    + Add Exam
                </button>
            </div>

            {/* TABLE */}
            <div className="page-container table-card">
                <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 8px"
                }}>

                    <thead>
                    <tr style={{ opacity: 0.6 }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>Exam</th>
                        <th style={{ textAlign: "center" }}>Date & Time</th>
                        <th style={{ textAlign: "center" }}>Students</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {exams.map((exam) => {

                        const enrolledCount = exam.students.filter(s => s.enrolled).length;

                        return (
                            <tr key={exam.id} style={{
                                background: "white",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                            }}>

                                <td style={{ padding: "12px", fontWeight: "600" }}>
                                    {exam.name}
                                </td>

                                <td style={{ textAlign: "center" }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                    }}>
                                        <span>{exam.date}</span>
                                        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                                            {exam.time}
                                        </span>
                                    </div>
                                </td>

                                <td style={{ textAlign: "center" }}>
                                    👥 {enrolledCount}
                                </td>

                                <td style={{ textAlign: "center" }}>
                                    <span style={{
                                        background: "#eafaf1",
                                        color: "#27ae60",
                                        padding: "4px 10px",
                                        borderRadius: "8px",
                                        fontSize: "0.75rem"
                                    }}>
                                        {exam.status}
                                    </span>
                                </td>

                                <td>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "8px"
                                    }}>
                                        <button
                                            className="table-btn primary"
                                            onClick={() =>
                                                navigate("/seats", { state: exam })
                                            }
                                        >
                                            Assign
                                        </button>

                                        <button
                                            className="table-btn danger"
                                            onClick={() => deleteExam(exam.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        );
                    })}
                    </tbody>

                </table>
            </div>

        </div>
    );
}