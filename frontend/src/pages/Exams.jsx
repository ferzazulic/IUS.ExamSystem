import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import apiClient from "../api/apiClient";
import {ProfessorLayout} from "./ProfessorLayout";

export function Exams() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [exams, setExams] = useState([]);
    const [courses] = useState(() => JSON.parse(localStorage.getItem("courses")) || []);
    const [error, setError] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
        apiClient.get("/api/room").then(res => setRooms(res.data)).catch(console.error);
        apiClient.get("/api/exam").then(res => setExams(res.data.exams || [])).catch(console.error);
    }, []);

    const addExam = async () => {
        if (!selectedCourse || !selectedRoom || !startDate || !startTime || !endTime) return;

        const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
        const endDateTime = new Date(`${startDate}T${endTime}`).toISOString();

        if (endDateTime <= startDateTime) {
            setError("End time must be after start time");
            return;
        }

        try {
            await apiClient.post("/api/exam", {
                subject: selectedCourse,
                startTime: startDateTime,
                endTime: endDateTime,
                roomId: parseInt(selectedRoom)
            });

            const examsRes = await apiClient.get("/api/exam");
            setExams(examsRes.data.exams || []);

            setSelectedCourse("");
            setSelectedRoom("");
            setStartDate("");
            setStartTime("");
            setEndTime("");
        } catch {
            setError("Failed to create exam");
        }
    };

    const deleteExam = async (id) => {
        try {
            await apiClient.delete(`/api/exam/${id}`);
            setExams(prev => prev.filter(e => e.id !== id));
        } catch {
            setError("Failed to delete exam");
        }
    };

    const thStyle = {padding: "10px 12px", color: "#888", fontWeight: "600", fontSize: "0.85rem"};

    return (
        <ProfessorLayout active="exams">

            {/* HEADER */}
            <div style={{marginBottom: "24px"}}>
                <h1 style={{fontWeight: "800", fontSize: "1.8rem", margin: 0}}>Exams Management</h1>
                <p style={{color: "#888", margin: "4px 0 0", fontSize: "0.9rem"}}>Create and manage exam schedules</p>
            </div>

            {/* CREATE FORM */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px"
            }}>
                <h3 style={{fontWeight: "700", marginBottom: "16px", fontSize: "0.95rem"}}>Add New Exam</h3>
                <div style={{display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center"}}>
                    <select className="login-input" value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                            style={{flex: "1", minWidth: "140px", height: "40px"}}>
                        <option value="">Select course</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.name}>{course.name}</option>
                        ))}
                    </select>

                    <select className="login-input" value={selectedRoom}
                            onChange={e => setSelectedRoom(e.target.value)}
                            style={{flex: "1", minWidth: "140px", height: "40px"}}>
                        <option value="">Select room</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name} ({room.capacity})</option>
                        ))}
                    </select>

                    <input type="date" className="login-input" value={startDate}
                           onChange={e => setStartDate(e.target.value)}
                           style={{height: "40px"}}/>

                    <input type="time" className="login-input" placeholder="Start time" value={startTime}
                           onChange={e => setStartTime(e.target.value)}
                           style={{height: "40px"}}/>

                    <input type="time" className="login-input" placeholder="End time" value={endTime}
                           onChange={e => setEndTime(e.target.value)}
                           style={{height: "40px"}}/>

                    <button className="table-btn primary" onClick={addExam}
                            style={{height: "40px", padding: "0 24px", borderRadius: "10px", fontWeight: "600"}}>
                        + Add Exam
                    </button>
                </div>

                {error && (
                    <p style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: "10px",
                        fontWeight: "600"
                    }}>
                        {error}
                    </p>
                )}
            </div>

            {/* TABLE */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
            }}>
                <h3 style={{fontWeight: "700", marginBottom: "16px", fontSize: "0.95rem"}}>All Exams</h3>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <thead>
                    <tr style={{borderBottom: "2px solid #f0eeff"}}>
                        <th style={{...thStyle, textAlign: "left"}}>Subject</th>
                        <th style={{...thStyle, textAlign: "center"}}>Room</th>
                        <th style={{...thStyle, textAlign: "center"}}>Start</th>
                        <th style={{...thStyle, textAlign: "center"}}>End</th>
                        <th style={{...thStyle, textAlign: "center"}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {exams.map(exam => (
                        <tr key={exam.id} style={{borderBottom: "1px solid #f5f5f5"}}>
                            <td style={{padding: "14px 12px", fontWeight: "600"}}>{exam.subject}</td>
                            <td style={{
                                padding: "14px 12px",
                                textAlign: "center",
                                color: "#666"
                            }}>{exam.room?.name || "—"}</td>
                            <td style={{
                                padding: "14px 12px",
                                textAlign: "center",
                                fontSize: "0.85rem",
                                color: "#666"
                            }}>{new Date(exam.startTime).toLocaleString()}</td>
                            <td style={{
                                padding: "14px 12px",
                                textAlign: "center",
                                fontSize: "0.85rem",
                                color: "#666"
                            }}>{new Date(exam.endTime).toLocaleString()}</td>
                            <td style={{padding: "14px 12px", textAlign: "center"}}>
                                <div style={{display: "flex", justifyContent: "center", gap: "8px"}}>
                                    <button className="table-btn primary"
                                            onClick={() => navigate("/seats", {state: exam})}
                                            style={{padding: "6px 16px", borderRadius: "8px"}}>
                                        Assign
                                    </button>
                                    {localStorage.getItem("role") === "Admin" && <button className="table-btn danger"
                                                                      onClick={() => deleteExam(exam.id)}
                                                                      style={{
                                                                          padding: "6px 16px",
                                                                          borderRadius: "8px"
                                                                      }}>
                                        Delete
                                    </button>}

                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {exams.length === 0 && <p style={{opacity: 0.5, marginTop: "20px"}}>No exams yet.</p>}
            </div>

        </ProfessorLayout>
    );
}
