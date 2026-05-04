import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import apiClient from "../api/apiClient";

  export function AdminDashboard() {
      const navigate = useNavigate();
      const [activeNav, setActiveNav] = useState("dashboard");
      const [users, setUsers] = useState([]);
      const [exams, setExams] = useState([]);
      const [rooms, setRooms] = useState([]);

      useEffect(() => {
          if (!localStorage.getItem("token")) navigate("/login");
          fetchAll();
      }, []);

      const fetchAll = async () => {
          try {
              const [usersRes, examsRes, roomsRes] = await Promise.all([
                  apiClient.get("/api/user"),
                  apiClient.get("/api/exam"),
                  apiClient.get("/api/room"),
              ]);
              setUsers(usersRes.data);
              setExams(examsRes.data.exams || []);
              setRooms(roomsRes.data);
          } catch (err) {
              console.error(err);
          }
      };

      const deleteUser = async (id) => {
          if (!confirm("Delete this user?")) return;
          await apiClient.delete(`/api/user/${id}`);
          setUsers(prev => prev.filter(u => u.id !== id));
      };

      const changeRole = async (id, role) => {
          await apiClient.put(`/api/user/${id}/role`, { role });
          setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      };

      const deleteExam = async (id) => {
          if (!confirm("Delete this exam?")) return;
          await apiClient.delete(`/api/exam/${id}`);
          setExams(prev => prev.filter(e => e.id !== id));
      };

      const totalStudents = users.filter(u => u.role === "Student").length;

      return (
          <div className="canvas">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
              <div className="glass-wrapper">

                  {/* SIDEBAR */}
                  <div className="ultra-sidebar">
                      <div className="brand">
                          <div className="ius-logo">IUS</div>
                          <strong>Admin Panel</strong>
                      </div>
                      {[
                          { key: "dashboard", label: "Dashboard" },
                          { key: "users", label: "Users" },
                          { key: "exams", label: "Exams" },
                          { key: "rooms", label: "Rooms" },
                      ].map(item => (
                          <div
                              key={item.key}
                              className={`nav-pill ${activeNav === item.key ? "active" : ""}`}
                              onClick={() => setActiveNav(item.key)}
                          >
                              {item.label}
                          </div>
                      ))}
                      <div className="nav-pill" style={{ marginTop: "auto" }} onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("role");
                          navigate("/login");
                      }}>
                          Logout
                      </div>
                  </div>

                  {/* MAIN */}
                  <div className="main-stage">

                      {/* OVERVIEW */}
                      {activeNav === "dashboard" && (
                          <>
                              <h1 style={{ marginBottom: "20px" }}>Admin Dashboard</h1>
                              <div className="dashboard-hero-card">
                                  <div>
                                      <span className="hero-badge">Admin Panel</span>
                                      <h2>System Overview</h2>
                                      <div className="hero-stats">
                                          <div className="mini-stat"><strong>{users.length}</strong><span>Users</span></div>
                                          <div className="mini-stat"><strong>{exams.length}</strong><span>Exams</span></div>
                                          <div className="mini-stat"><strong>{rooms.length}</strong><span>Rooms</span></div>
                                          <div className="mini-stat"><strong>{totalStudents}</strong><span>Students</span></div>
                                      </div>
                                  </div>
                                  <div style={{ fontSize: "4rem" }}>⚙️ </div>
                              </div>
                          </>
                      )}

                      {/* USERS */}
                      {activeNav === "users" && (
                          <div className="hub-card" style={{ flexDirection: "column", alignItems: "flex-start", padding: "24px" }}>
                              <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>User Management</h2>
                              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                  <thead>
                                      <tr style={{ opacity: 0.6 }}>
                                          <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                                          <th style={{ textAlign: "left" }}>Email</th>
                                          <th style={{ textAlign: "center" }}>Role</th>
                                          <th style={{ textAlign: "center" }}>Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {users.map(u => (
                                          <tr key={u.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px  rgba(0,0,0,0.05)" }}>
                                              <td style={{ padding: "12px", fontWeight: "600" }}>{u.fullName}</td>
                                              <td style={{ padding: "12px", opacity: 0.7 }}>{u.email}</td>
                                              <td style={{ textAlign: "center" }}>
                                                  <span style={{ background: "#f0eeff", color: "#6c63ff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem" }}>
                                                      {u.role}
                                                  </span>
                                              </td>
                                              <td style={{ textAlign: "center", padding: "12px", display: "flex", gap: "8px", justifyContent:  "center" }}>
                                                  <button className="table-btn primary" onClick={() => changeRole(u.id, "Staff")}>Make Staff</button>
                                                  <button className="table-btn primary" onClick={() => changeRole(u.id, "Student")}>Make Student</button>
                                                  <button className="table-btn danger" onClick={() => deleteUser(u.id)}>Delete</button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}

                      {/* EXAMS */}
                      {activeNav === "exams" && (
                          <div className="hub-card" style={{ flexDirection: "column", alignItems: "flex-start", padding: "24px" }}>
                              <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>All Exams</h2>
                              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                  <thead>
                                      <tr style={{ opacity: 0.6 }}>
                                          <th style={{ padding: "10px", textAlign: "left" }}>Subject</th>
                                          <th style={{ textAlign: "center" }}>Room</th>
                                          <th style={{ textAlign: "center" }}>Start</th>
                                          <th style={{ textAlign: "center" }}>End</th>
                                          <th style={{ textAlign: "center" }}>Action</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {exams.map(e => (
                                          <tr key={e.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px  rgba(0,0,0,0.05)" }}>
                                              <td style={{ padding: "12px", fontWeight: "600" }}>{e.subject}</td>
                                              <td style={{ textAlign: "center" }}>{e.room?.name}</td>
                                              <td style={{ textAlign: "center", fontSize: "0.85rem" }}>{new Date(e.startTime).toLocaleString()}</td>
                                              <td style={{ textAlign: "center", fontSize: "0.85rem" }}>{new Date(e.endTime).toLocaleString()}</td>
                                              <td style={{ textAlign: "center", padding: "12px" }}>
                                                  <button className="table-btn danger" onClick={() => deleteExam(e.id)}>Delete</button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}

                      {/* ROOMS */}
                      {activeNav === "rooms" && (
                          <div className="hub-card" style={{ flexDirection: "column", alignItems: "flex-start", padding: "24px" }}>
                              <h2 style={{ marginBottom: "16px", fontWeight: "700" }}>Rooms</h2>
                              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                  <thead>
                                      <tr style={{ opacity: 0.6 }}>
                                          <th style={{ padding: "10px", textAlign: "left" }}>Room Name</th>
                                          <th style={{ textAlign: "center" }}>Capacity</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {rooms.map(r => (
                                          <tr key={r.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px  rgba(0,0,0,0.05)" }}>
                                              <td style={{ padding: "12px", fontWeight: "600" }}>{r.name}</td>
                                              <td style={{ textAlign: "center" }}>{r.capacity}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}

                  </div>
              </div>
          </div>
      );
  }
