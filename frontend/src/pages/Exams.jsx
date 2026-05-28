import { useState, useEffect } from "react";                                                                                                   
  import { useNavigate } from "react-router-dom";                                                                                              
  import apiClient from "../api/apiClient";

  export function Exams() {
      const navigate = useNavigate();

        const [rooms, setRooms] = useState([]);
        const [exams, setExams] = useState([]);
        const [courses, _setCourses] = useState(() => JSON.parse(localStorage.getItem("courses")) || []);

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
              alert("End time must be after start time");
              return;
          }

          try {
              const res = await apiClient.post("/api/exam", {
                  subject: selectedCourse,
                  startTime: startDateTime,
                  endTime: endDateTime,
                  roomId: parseInt(selectedRoom)
              });
              const created = res.data;
              setExams(prev => [...prev, created]);
              setSelectedCourse("");
              setSelectedRoom("");
              setStartDate("");
              setStartTime("");
              setEndTime("");
            } catch (err) {
                console.error(err);
                alert("Failed to create exam");
            }
      };

      const deleteExam = async (id) => {
          try {
              await apiClient.delete(`/api/exam/${id}`);
              setExams(prev => prev.filter(e => e.id !== id));
          } catch {
              alert("Failed to delete exam");
          }
      };

      return (
          <div className="academia-container">
              <div className="page-container exams-header">
                  <div>
                      <button className="back-btn" onClick={() => navigate(-1)}>← Dashboard</button>
                      <h1 className="exams-title">Exams Management</h1>
                      <p className="exams-sub">Create and manage exam schedules</p>
                  </div>
              </div>

              <div className="page-container exam-form">
                  <select className="login-input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                      <option value="">Select course</option>
                      {courses.map(course => (
                          <option key={course.id} value={course.name}>{course.name}</option>
                      ))}
                  </select>

                  <select className="login-input" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                      <option value="">Select room</option>
                      {rooms.map(room => (
                          <option key={room.id} value={room.id}>{room.name} ({room.capacity})</option>
                      ))}
                  </select>

                  <input type="date" className="login-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <input type="time" className="login-input" placeholder="Start time" value={startTime} onChange={(e) =>
  setStartTime(e.target.value)} />
                  <input type="time" className="login-input" placeholder="End time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
  />

                  <button className="table-btn primary" onClick={addExam}>+ Add Exam</button>
              </div>

              <div className="page-container table-card">
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                      <thead>
                          <tr style={{ opacity: 0.6 }}>
                              <th style={{ padding: "10px", textAlign: "left" }}>Subject</th>
                              <th style={{ textAlign: "center" }}>Room</th>
                              <th style={{ textAlign: "center" }}>Start</th>
                              <th style={{ textAlign: "center" }}>End</th>
                              <th style={{ textAlign: "center" }}>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {exams.map((exam) => (
                              <tr key={exam.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                  <td style={{ padding: "12px", fontWeight: "600" }}>{exam.subject}</td>
                                  <td style={{ textAlign: "center" }}>{exam.room?.name || "—"}</td>
                                  <td style={{ textAlign: "center", fontSize: "0.85rem" }}>{new Date(exam.startTime).toLocaleString()}</td>
                                  <td style={{ textAlign: "center", fontSize: "0.85rem" }}>{new Date(exam.endTime).toLocaleString()}</td>
                                  <td>
                                      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                          <button className="table-btn primary" onClick={() => navigate("/seats", { state: exam
  })}>Assign</button>
                                          <button className="table-btn danger" onClick={() => deleteExam(exam.id)}>Delete</button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }