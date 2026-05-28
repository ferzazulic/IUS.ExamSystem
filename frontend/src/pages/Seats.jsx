import { useState, useEffect } from "react";                                                                                                   
  import { useLocation, useNavigate } from "react-router-dom";                                                                                   
  import apiClient from "../api/apiClient";                                                                                                      
                                                                                                                                                 
  export function Seats() {                                                                                                                    
      const location = useLocation();
      const navigate = useNavigate();

      const exam = location.state;
      const capacity = exam?.room?.capacity || 0;

      let numRows, seatsPerRow;
      if (capacity >= 150) {
          seatsPerRow = 8;
          numRows = Math.ceil(capacity / seatsPerRow);
      } else {
          numRows = Math.ceil(Math.sqrt(capacity));
          seatsPerRow = Math.ceil(capacity / numRows);
      }

      const rows = Array.from({ length: numRows }, (_, i) => String.fromCharCode(65 + i));

      const [seatMap, setSeatMap] = useState({});
      const [selectedSeat, setSelectedSeat] = useState(null);
      const [mode, setMode] = useState("manual");
      const [message, setMessage] = useState("");
      const [assignments, setAssignments] = useState([]);
      const [students, setStudents] = useState([]);

    useEffect(() => {
        const load = async () => {
            if (exam?.id) {
                try {
                    const res = await apiClient.get(`/api/exam/${exam.id}`);
                    setAssignments(res.data.assignments || []);
                } catch (e) {
                    console.error(e);
                }
            }

            try {
                const res = await apiClient.get("/api/user");
                setStudents(res.data.filter(u => u.role === "Student"));
            } catch (e) {
                console.error(e);
            }
        };

        load();
    }, [exam?.id]);

      const assignStudent = (studentName) => {
          if (!selectedSeat) return;
          const updated = { ...seatMap };
          Object.keys(updated).forEach(seat => {
              if (updated[seat] === studentName) delete updated[seat];
          });
          updated[selectedSeat] = studentName;
          setSeatMap(updated);
          setSelectedSeat(null);
      };

      const removeStudent = (seatLabel) => {
          const updated = { ...seatMap };
          delete updated[seatLabel];
          setSeatMap(updated);
      };

    const autoAssign = async () => {
        try {
            await apiClient.post(`/api/exam/allocate/${exam.id}`);
            setMessage("Seats allocated successfully!");
            try {
                const res = await apiClient.get(`/api/exam/${exam.id}`);
                setAssignments(res.data.assignments || []);
            } catch (e) {
                console.error(e);
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to allocate seats.");
        }
    };

      const reset = () => {
          setSeatMap({});
          setSelectedSeat(null);
          setMessage("");
      };

      return (
          <div className="academia-container">
              <div className="page-container exams-header">
                  <button className="back-btn" onClick={() => navigate(-1)}>← Dashboard</button>
                  <div className="title-block">
                      <h1 className="exams-title">Seat Allocation</h1>
                      <p className="exams-sub">
                          {exam?.subject} — {exam?.startTime ? new Date(exam.startTime).toLocaleString() : ""}
                          <br />
                          Room: {exam?.room?.name} ({capacity} seats) — {assignments.length} assigned
                      </p>
                  </div>
                  <div className="actions-bar">
                      <button className={`mode-btn ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>Manual</button>
                      <button className={`mode-btn ${mode === "auto" ? "active" : ""}`} onClick={autoAssign}>Auto Assign</button>
                      <button className="mode-btn danger" onClick={reset}>Reset</button>
                  </div>
              </div>

              {message && (
                  <div className="page-container" style={{ color: message.includes("success") ? "green" : "red", fontWeight: "600" }}>
                      {message}
                  </div>
              )}

              {mode === "manual" && selectedSeat && (
                  <div className="page-container student-picker">
                      <span>Assign to {selectedSeat}:</span>
                      <select className="login-input" onChange={(e) => assignStudent(e.target.value)} defaultValue="">
                          <option value="" disabled>Select student</option>
                          {students.map(s => (
                              <option key={s.id} value={s.fullName}>{s.fullName}</option>
                          ))}
                      </select>
                  </div>
              )}

              <div className="seats-wrapper">
                  {rows.map((row, rowIndex) => {
                      const start = rowIndex * seatsPerRow;
                      const end = Math.min(start + seatsPerRow, capacity);
                      const rowSeats = [];
                      for (let i = start; i < end; i++) {
                          rowSeats.push(`${row}${i - start + 1}`);
                      }
                      if (rowSeats.length === 0) return null;
                      return (
                          <div className="seat-row" key={row} style={{ justifyContent: "center" }}>
                              {rowSeats.map(label => (
                                  <Seat
                                      key={label}
                                      label={label}
                                      student={seatMap[label]}
                                      onClick={() => mode === "manual"
                                          ? seatMap[label]
                                              ? removeStudent(label)
                                              : setSelectedSeat(label)
                                          : null
                                      }
                                  />
                              ))}
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  function Seat({ label, student, onClick }) {
      return (
          <div className={`seat ${student ? "active" : ""}`} onClick={onClick}>
              {student || label}
          </div>
      );
  }