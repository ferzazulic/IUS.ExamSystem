import { useNavigate, useLocation } from "react-router-dom";
  import { useEffect, useState } from "react";
  import apiClient from "../api/apiClient";

  export function Dashboard() {
      const navigate = useNavigate();
      const location = useLocation();

      useEffect(() => {
          if (!localStorage.getItem("token")) navigate("/login");
      }, []);

      const [examCount, setExamCount] = useState(0);
      const [roomCount, setRoomCount] = useState(0);
      const [courses, setCourses] = useState([]);
      const [readNotifications, setReadNotifications] = useState([]);

      const navItems = [
          { label: "Dashboard", path: "/dashboard", icon: "🏠" },
          { label: "Exams", path: "/exams", icon: "📝" },
          { label: "Courses", path: "/courses", icon: "📚" },
          { label: "Seat Allocation", path: "/seats", icon: "🪑" },
          { label: "Rooms", path: "/rooms", icon: "🏫" },
      ];

      const isActive = (path) => location.pathname === path;

      useEffect(() => {
          apiClient.get("/api/exam").then(res => setExamCount(res.data.exams?.length || 0)).catch(console.error);
          apiClient.get("/api/room").then(res => setRoomCount(res.data?.length || 0)).catch(console.error);
          setCourses(JSON.parse(localStorage.getItem("courses")) || []);
      }, []);

      const notifications = [
          { id: 1, type: "exam", message: "New exam scheduled: Data Structures", time: "2 hours ago", icon: "📋" },
          { id: 2, type: "room", message: "Room A-101 capacity updated to 45 seats", time: "5 hours ago", icon: "🏫" },
          { id: 3, type: "alert", message: "3 conflicting exam assignments detected", time: "1 day ago", icon: "⚠️" },
          { id: 4, type: "success", message: "All exams successfully allocated", time: "2 days ago", icon: "✅" },
      ];

      const systemNews = [
          { id: 1, title: "System Maintenance", description: "Scheduled maintenance on May 10th 2-4 AM", date: "May 5, 2026", priority: "high" },
          { id: 2, title: "New Feature", description: "Conflict detection now includes temporal conflicts", date: "May 4, 2026", priority: "normal" },
          { id: 3, title: "Update Available", description: "Database optimization complete", date: "May 2, 2026", priority: "low" },
      ];

      const toggleNotification = (id) => {
          setReadNotifications(prev => 
              prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
          );
      };

      const getPriorityColor = (priority) => {
          switch(priority) {
              case 'high': return '#ff6b6b';
              case 'normal': return '#4ecdc4';
              case 'low': return '#95e1d3';
              default: return '#4ecdc4';
          }
      };

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

                      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                          {navItems.map(item => (
                              <div
                                  key={item.path}
                                  className={`nav-pill ${isActive(item.path) ? 'active' : ''}`}
                                  onClick={() => navigate(item.path)}
                                  title={item.label}
                              >
                                  <span>{item.icon}</span>
                                  <span>{item.label}</span>
                              </div>
                          ))}
                      </nav>

                      <div 
                          className="nav-pill" 
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                              localStorage.removeItem("token");
                              localStorage.removeItem("role");
                              navigate("/login");
                          }}
                          title="Logout"
                      >
                          <span>🚪</span>
                          <span>Logout</span>
                      </div>
                  </div>

                  <div className="main-stage" style={{ overflowY: "auto", maxHeight: "90vh" }}>
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

                      
                      <div style={{ marginTop: "30px" }}>
                          <h3 style={{ fontSize: "1.3rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                              🔔 Recent Notifications
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                              {notifications.map(notif => (
                                  <div
                                      key={notif.id}
                                      onClick={() => toggleNotification(notif.id)}
                                      style={{
                                          backgroundColor: readNotifications.includes(notif.id) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                                          border: "1px solid rgba(255,255,255,0.2)",
                                          borderRadius: "12px",
                                          padding: "12px 16px",
                                          cursor: "pointer",
                                          transition: "all 0.3s ease",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "12px",
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = readNotifications.includes(notif.id) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}
                                  >
                                      <span style={{ fontSize: "1.5rem" }}>{notif.icon}</span>
                                      <div style={{ flex: 1 }}>
                                          <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>{notif.message}</div>
                                          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>{notif.time}</div>
                                      </div>
                                      <span style={{ fontSize: "1.2rem", opacity: readNotifications.includes(notif.id) ? "0.5" : "1" }}>●</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                     
                      <div style={{ marginTop: "30px", marginBottom: "40px" }}>
                          <h3 style={{ fontSize: "1.3rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                              📰 System News & Updates
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
                              {systemNews.map(news => (
                                  <div
                                      key={news.id}
                                      style={{
                                          backgroundColor: "rgba(255,255,255,0.08)",
                                          border: `2px solid ${getPriorityColor(news.priority)}`,
                                          borderRadius: "12px",
                                          padding: "16px",
                                          transition: "all 0.3s ease",
                                          cursor: "pointer",
                                      }}
                                      onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = "translateY(-4px)";
                                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
                                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
                                      }}
                                      onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = "translateY(0)";
                                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                                          e.currentTarget.style.boxShadow = "none";
                                      }}
                                  >
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                                          <h4 style={{ fontSize: "1.05rem", margin: 0 }}>{news.title}</h4>
                                          <span style={{
                                              backgroundColor: getPriorityColor(news.priority),
                                              color: "#000",
                                              padding: "4px 8px",
                                              borderRadius: "6px",
                                              fontSize: "0.7rem",
                                              fontWeight: "bold",
                                              textTransform: "uppercase"
                                          }}>
                                              {news.priority}
                                          </span>
                                      </div>
                                      <p style={{ margin: "8px 0", fontSize: "0.95rem", lineHeight: "1.4", color: "rgba(255,255,255,0.9)" }}>
                                          {news.description}
                                      </p>
                                      <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: "10px" }}>
                                          📅 {news.date}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }