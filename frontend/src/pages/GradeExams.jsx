import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { ProfessorLayout } from "./ProfessorLayout";

export function GradeExams() {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [examStudents, setExamStudents] = useState([]);
    const [scoreInputs, setScoreInputs] = useState({});
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        apiClient.get("/api/exam")
            .then(res => setExams(res.data.exams || []))
            .catch(console.error);
    }, []);

    const loadExamStudents = (examId) => {
        setSelectedExamId(examId);
        setExamStudents([]);
        setScoreInputs({});
        apiClient.get(`/api/exam/${examId}/students`)
            .then(res => {
                const students = res.data || [];
                setExamStudents(students);
                const inputs = {};
                students.forEach(s => { inputs[s.studentId] = s.score ?? ""; });
                setScoreInputs(inputs);
            })
            .catch(console.error);
    };

    const saveGrade = async (studentId) => {
        const score = parseFloat(scoreInputs[studentId]);
        if (isNaN(score) || score < 0 || score > 100) {
            alert("Score must be between 0 and 100");
            return;
        }
        setSavingId(studentId);
        try {
            await apiClient.put(`/api/exam/${selectedExamId}/grade/${studentId}`, { score });
            setExamStudents(prev => prev.map(s =>
                s.studentId === studentId
                    ? { ...s, score, grade: score >= 90 ? 4.0 : score >= 80 ? 3.0 : score >= 70 ? 2.0 : score >= 55 ? 1.0 : 0.0 }
                    : s
            ));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to save grade");
        } finally {
            setSavingId(null);
        }
    };

    const letterGrade = (score) => {
        if (score == null) return "—";
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 55) return "D";
        return "F";
    };

    const thStyle = { padding: "10px 12px", color: "#888", fontWeight: "600", fontSize: "0.85rem" };

    return (
        <ProfessorLayout active="grade-exams">
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontWeight: "800", fontSize: "1.8rem", margin: 0 }}>Grade Exams</h1>
                <p style={{ color: "#888", margin: "4px 0 0", fontSize: "0.9rem" }}>Select an exam and enter scores</p>
            </div>

            {/* EXAM SELECTOR */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px"
            }}>
                <h3 style={{ fontWeight: "700", marginBottom: "14px", fontSize: "0.95rem" }}>Select Exam</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {exams.map(e => (
                        <button key={e.id} onClick={() => loadExamStudents(e.id)}
                                style={{
                                    padding: "10px 18px", borderRadius: "10px", border: "2px solid",
                                    borderColor: selectedExamId === e.id ? "#6c63ff" : "#e0e0e0",
                                    background: selectedExamId === e.id ? "#f0eeff" : "white",
                                    color: selectedExamId === e.id ? "#6c63ff" : "#333",
                                    fontWeight: "600", cursor: "pointer", fontSize: "0.85rem"
                                }}>
                            {e.subject}
                            <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.6, fontWeight: "400" }}>
                                {new Date(e.startTime).toLocaleDateString()}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* STUDENTS TABLE */}
            {selectedExamId && (
                <div style={{
                    background: "white", borderRadius: "16px", padding: "24px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
                }}>
                    <h3 style={{ fontWeight: "700", marginBottom: "16px", fontSize: "0.95rem" }}>
                        {exams.find(e => e.id === selectedExamId)?.subject} — Students
                    </h3>
                    {examStudents.length === 0 ? (
                        <p style={{ opacity: 0.5 }}>No students enrolled in this exam.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                <th style={{ ...thStyle, textAlign: "left" }}>Student</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Seat</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Current Grade</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Score (0–100)</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {examStudents.map(s => {
                                const letter = letterGrade(s.score);
                                const gradeColor = s.score == null ? "#999" : s.score >= 55 ? "#27ae60" : "#e74c3c";
                                return (
                                    <tr key={s.studentId} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ padding: "14px 12px", fontWeight: "600" }}>{s.studentName}</td>
                                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#666" }}>{s.seatNumber ?? "—"}</td>
                                        <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                                <span style={{
                                                    background: s.score == null ? "#f5f5f5" : s.score >= 55 ? "#eafaf1" : "#ffe0e0",
                                                    color: gradeColor,
                                                    padding: "4px 12px", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem"
                                                }}>
                                                    {s.score != null ? `${s.score}/100 (${letter})` : "Not graded"}
                                                </span>
                                        </td>
                                        <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                            <input
                                                type="number" min="0" max="100"
                                                value={scoreInputs[s.studentId] ?? ""}
                                                onChange={e => setScoreInputs(prev => ({ ...prev, [s.studentId]: e.target.value }))}
                                                style={{
                                                    width: "80px", padding: "6px 10px", borderRadius: "8px",
                                                    border: "1.5px solid #ddd", textAlign: "center",
                                                    fontSize: "0.9rem", fontWeight: "600", outline: "none"
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                            <button className="table-btn primary"
                                                    onClick={() => saveGrade(s.studentId)}
                                                    disabled={savingId === s.studentId}
                                                    style={{ padding: "6px 16px", borderRadius: "8px", opacity: savingId === s.studentId ? 0.6 : 1 }}>
                                                {savingId === s.studentId ? "Saving..." : "Save"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </ProfessorLayout>
    );
}