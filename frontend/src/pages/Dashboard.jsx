import { useNavigate } from "react-router-dom";
  import { useEffect, useState } from "react";
  import apiClient from "../api/apiClient";

  export function Dashboard() {
      const navigate = useNavigate();

      useEffect(() => {
          if (!localStorage.getItem("token")) navigate("/login");
      }, []);

      const [examCount, setExamCount] = useState(0);
      const [roomCount, setRoomCount] = useState(0);
      const [courses, setCourses] = useState([]);

      useEffect(() => {
          apiClient.get("/api/exam").then(res => setExamCount(res.data.exams?.length || 0)).catch(console.error);
          apiClient.get("/api/room").then(res => setRoomCount(res.data?.length || 0)).catch(console.error);
          setCourses(JSON.parse(localStorage.getItem("courses")) || []);
      }, []);

      return (
          <div className="canvas">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>

              <div className="glass-wrapper">
                  <div className="ultra-sidebar">
                      <div className="brand">
                          <div className="ius-logo">IUS</div>
                          <strong>Exam System</strong>
                      </div>

                      <div className="nav-pill active">🏠 Dashboard</div>
                      <div className="nav-pill" onClick={() => navigate("/exams")}>📝 Exams</div>
                      <div className="nav-pill" onClick={() => navigate("/courses")}>📚 Courses</div>
                      <div className="nav-pill" onClick={() => navigate("/seats")}>🪑 Seat Allocation</div>
                      <div className="nav-pill" onClick={() => navigate("/rooms")}>🏫 Rooms</div>

                      <div className="nav-pill" style={{ marginTop: "auto" }} onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("role");
                          navigate("/login");
                      }}>
                          🚪 Logout
                      </div>
                  </div>

                  <div className="main-stage">
                      <h1 style={{ marginBottom: "20px" }}>Professor Dashboard 📊</h1>

                      <div className="dashboard-hero-card">
                          <div>
                              <span className="hero-badge">Professor Panel</span>
                              <h2>Manage exams & courses</h2>
                              <div className="hero-stats">
                                  <div className="mini-stat"><strong>{examCount}</strong><span>Exams</span></div>
                                  <div className="mini-stat"><strong>{roomCount}</strong><span>Rooms</span></div>
                                  <div className="mini-stat"><strong>{courses.length}</strong><span>Courses</span></div>
                              </div>
                          </div>
                          <div style={{ fontSize: "4rem" }}>📊</div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }