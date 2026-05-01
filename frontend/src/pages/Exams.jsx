import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//  PREDEFINED ROOMS
const rooms = [
    { id: 1, name: "Sports Hall", capacity: 200 },
    { id: 2, name: "BF1.17", capacity: 40 },
    { id: 3, name: "BF2.15", capacity: 80 },
    { id: 4, name: "BF1.18", capacity: 35 },
    { id: 5, name: "BF2.10", capacity: 60 }
];

export function Exams() {
    const navigate = useNavigate();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(""); // 🔥 novo

    const user = localStorage.getItem("token");
    const storageKey = `exams-${user?.email}`;

    //  LOAD COURSES
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
        setCourses(storedCourses);
    }, []);

    //  LOAD EXAMS
    const [exams, setExams] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    //  SAVE EXAMS
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(exams));
    }, [exams, storageKey]);

    // ➕ ADD EXAM
    const addExam = () => {
        if (!date || !time || !selectedCourse || !selectedRoom) return;

        //  ROOM CONFLICT CHECK
        const conflict = exams.find(e =>
            e.roomId == selectedRoom &&
            e.date === date &&
            e.time === time
        );

        if (conflict) {
            alert("Room already booked!");
            return;
        }

        const newExam = {
            id: Date.now(),
            course: selectedCourse,
            roomId: selectedRoom,
            date,
            time,
            students: [],
            status: "Scheduled"
        };

        setExams([...exams, newExam]);

        setDate("");
        setTime("");
        setSelectedCourse("");
        setSelectedRoom("");
    };

    //  DELETE
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

                {/* SELECT COURSE */}
                <select
                    className="login-input"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    <option value="">Select course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.name}>
                            {course.name}
                        </option>
                    ))}
                </select>

                {/*  SELECT ROOM */}
                <select
                    className="login-input"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                >
                    <option value="">Select room</option>
                    {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                            {room.name} ({room.capacity})
                        </option>
                    ))}
                </select>

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
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: "0 8px"
                    }}
                >

                    <thead>
                    <tr style={{ opacity: 0.6 }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>Course</th>
                        <th style={{ textAlign: "center" }}>Room</th>
                        <th style={{ textAlign: "center" }}>Date & Time</th>
                        <th style={{ textAlign: "center" }}>Students</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {exams.map((exam) => {

                        const enrolledCount = exam.students.length;
                        const room = rooms.find(r => r.id == exam.roomId);

                        return (
                            <tr
                                key={exam.id}
                                style={{
                                    background: "white",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                }}
                            >

                                <td style={{ padding: "12px", fontWeight: "600" }}>
                                    {exam.course}
                                </td>

                                <td style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {room?.name || "—"}
                                    </div>
                                </td>

                                <td style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center"
                                        }}
                                    >
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
                                    <span
                                        style={{
                                            background: "#eafaf1",
                                            color: "#27ae60",
                                            padding: "4px 10px",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem"
                                        }}
                                    >
                                        {exam.status}
                                    </span>
                                </td>

                                <td>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "8px"
                                        }}
                                    >
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