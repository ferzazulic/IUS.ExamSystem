import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

export function AdminDashboard() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [exams, setExams] = useState([]);
    const [rooms, setRooms] = useState([]);

    // User states
    const [createForm, setCreateForm] = useState({ fullName: "", email: "", password: "", role: "Student" });
    const [createError, setCreateError] = useState("");
    const [creating, setCreating] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Room states
    const [roomForm, setRoomForm] = useState({ name: "", capacity: "" });
    const [roomError, setRoomError] = useState("");
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [editRoom, setEditRoom] = useState(null);

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
            console.log("Users:", usersRes.data); // ← dodaj ovo
            setUsers(usersRes.data);
            setExams(examsRes.data.exams || []);
            setRooms(roomsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ── USER FUNCTIONS ──
    const createUser = async () => {
        if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim()) return;
        setCreating(true);
        setCreateError("");
        try {
            const res = await apiClient.post("/api/user", createForm);
            setUsers(prev => [...prev, res.data]);
            setCreateForm({ fullName: "", email: "", password: "", role: "Student" });
        } catch (err) {
            setCreateError(err.response?.data?.message || "Failed to create account");
        } finally {
            setCreating(false);
        }
    };

    const saveEditUser = async () => {
        try {
            await apiClient.put(`/api/user/${editUser.id}`, {
                fullName: editUser.fullName,
                email: editUser.email,
            });
            const roleRes = await apiClient.put(`/api/user/${editUser.id}/role`, {
                role: editUser.role,
            });
            console.log("Role update response:", roleRes.data);
            setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
            setEditUser(null);
        } catch (err) {
            console.error("Save error:", err.response?.data);
        }
    };

    const deleteUser = async (id) => {
        if (!confirm("Delete this user?")) return;
        await apiClient.delete(`/api/user/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    // ── ROOM FUNCTIONS ──
    const createRoom = async () => {
        if (!roomForm.name.trim() || !roomForm.capacity) return;
        setCreatingRoom(true);
        setRoomError("");
        try {
            const res = await apiClient.post("/api/room", {
                name: roomForm.name.trim(),
                capacity: parseInt(roomForm.capacity),
            });
            setRooms(prev => [...prev, res.data]);
            setRoomForm({ name: "", capacity: "" });
        } catch (err) {
            setRoomError(err.response?.data?.message || "Failed to add room");
        } finally {
            setCreatingRoom(false);
        }
    };

    const saveEditRoom = async () => {
        try {
            await apiClient.put(`/api/room/${editRoom.id}`, {
                name: editRoom.name,
                capacity: parseInt(editRoom.capacity),
            });
            setRooms(prev => prev.map(r => r.id === editRoom.id ? editRoom : r));
            setEditRoom(null);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteRoom = async (id) => {
        if (!confirm("Delete this room?")) return;
        try {
            await apiClient.delete(`/api/room/${id}`);
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete room");
        }
    };
    // ── EXAM FUNCTIONS ──
    const deleteExam = async (id) => {
        if (!confirm("Delete this exam?")) return;
        await apiClient.delete(`/api/exam/${id}`);
        setExams(prev => prev.filter(e => e.id !== id));
    };

    const totalStudents = users.filter(u => u.role === "Student").length;
    const totalStaff = users.filter(u => u.role === "Staff").length;
    const totalAdmins = users.filter(u => u.role === "Admin").length;

    // ── SHARED MODAL STYLE ──
    const modalOverlay = {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
    };
    const modalBox = {
        background: "white", borderRadius: "16px",
        padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    };
    const cardStyle = {
        background: "white", borderRadius: "16px", padding: "28px",
        width: "100%", boxSizing: "border-box",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    };
    const thStyle = {
        padding: "10px 12px", color: "#888",
        fontWeight: "600", fontSize: "0.85rem",
    };
    const tdStyle = { padding: "14px 12px" };

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

                    {/* ── DASHBOARD ── */}
                    {activeNav === "dashboard" && (
                        <>
                            <h1 style={{ marginBottom: "24px" }}>Admin Dashboard</h1>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: "16px",
                            }}>
                                {[
                                    { label: "Total Users", value: users.length, color: "#6c63ff" },
                                    { label: "Students", value: totalStudents, color: "#3498db" },
                                    { label: "Staff", value: totalStaff, color: "#2ecc71" },
                                    { label: "Admins", value: totalAdmins, color: "#e74c3c" },
                                    { label: "Exams", value: exams.length, color: "#f39c12" },
                                    { label: "Rooms", value: rooms.length, color: "#9b59b6" },
                                ].map(stat => (
                                    <div key={stat.label} style={{
                                        background: "white", borderRadius: "14px", padding: "20px",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                                        borderTop: `4px solid ${stat.color}`,
                                    }}>
                                        <div style={{ fontSize: "2rem", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#888", fontWeight: "600", marginTop: "4px" }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── USERS ── */}
                    {activeNav === "users" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>User Management</h2>

                            {/* CREATE */}
                            <div style={{ background: "#f8f7ff", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
                                <h3 style={{ fontWeight: "600", marginBottom: "14px", fontSize: "0.95rem" }}>Create Account</h3>
                                <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                                    <input className="login-input" placeholder="Full Name"
                                           value={createForm.fullName}
                                           onChange={e => setCreateForm(p => ({ ...p, fullName: e.target.value }))}
                                           style={{ flex: "1", minWidth: "140px", height: "40px" }} />
                                    <input className="login-input" placeholder="Email" type="email"
                                           value={createForm.email}
                                           onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                                           style={{ flex: "2", minWidth: "160px", height: "40px" }} />
                                    <input className="login-input" placeholder="Password" type="password"
                                           value={createForm.password}
                                           onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                                           style={{ flex: "1", minWidth: "130px", height: "40px" }} />
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                    {["Student", "Staff", "Admin"].map(role => (
                                        <button key={role} onClick={() => setCreateForm(p => ({ ...p, role }))}
                                                style={{
                                                    padding: "8px 18px", borderRadius: "8px", border: "2px solid", cursor: "pointer",
                                                    borderColor: createForm.role === role ? "#6c63ff" : "#e0e0e0",
                                                    background: createForm.role === role ? "#6c63ff" : "white",
                                                    color: createForm.role === role ? "white" : "#888",
                                                    fontWeight: "600", fontSize: "0.85rem", transition: "all 0.2s",
                                                }}>
                                            {role}
                                        </button>
                                    ))}
                                    <button className="table-btn primary" onClick={createUser} disabled={creating}
                                            style={{ marginLeft: "auto", height: "40px", padding: "0 24px", opacity: creating ? 0.6 : 1, borderRadius: "10px", fontWeight: "600" }}>
                                        {creating ? "Creating..." : "+ Create Account"}
                                    </button>
                                </div>
                                {createError && <p style={{ color: "#e74c3c", fontSize: "0.8rem", marginTop: "10px", fontWeight: "600" }}>{createError}</p>}
                            </div>

                            {/* TABLE */}
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                    <th style={{ ...thStyle, textAlign: "left" }}>Name</th>
                                    <th style={{ ...thStyle, textAlign: "left" }}>Email</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Role</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ ...tdStyle, fontWeight: "600" }}>{u.fullName}</td>
                                        <td style={{ ...tdStyle, color: "#666", fontSize: "0.9rem" }}>{u.email}</td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                                <span style={{
                                                    background: u.role === "Admin" ? "#fff0f0" : u.role === "Staff" ? "#f0f7ff" : "#f0eeff",
                                                    color: u.role === "Admin" ? "#e74c3c" : u.role === "Staff" ? "#3498db" : "#6c63ff",
                                                    padding: "4px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "600",
                                                }}>
                                                    {u.role}
                                                </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <button className="table-btn primary" onClick={() => setEditUser(u)}
                                                        style={{ padding: "6px 16px", borderRadius: "8px" }}>Edit</button>
                                                <button className="table-btn danger" onClick={() => deleteUser(u.id)}
                                                        style={{ padding: "6px 16px", borderRadius: "8px" }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* EDIT USER MODAL */}
                            {editUser && (
                                <div style={modalOverlay} onClick={() => setEditUser(null)}>
                                    <div style={{ ...modalBox, width: "420px" }} onClick={e => e.stopPropagation()}>
                                        <h3 style={{ fontWeight: "700", marginBottom: "20px", fontSize: "1.1rem" }}>Edit User</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <div>
                                                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#888", marginBottom: "4px", display: "block" }}>Full Name</label>
                                                <input className="login-input" value={editUser.fullName}
                                                       onChange={e => setEditUser(p => ({ ...p, fullName: e.target.value }))}
                                                       style={{ width: "100%", height: "40px", boxSizing: "border-box" }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#888", marginBottom: "4px", display: "block" }}>Email</label>
                                                <input className="login-input" type="email" value={editUser.email}
                                                       onChange={e => setEditUser(p => ({ ...p, email: e.target.value }))}
                                                       style={{ width: "100%", height: "40px", boxSizing: "border-box" }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#888", marginBottom: "6px", display: "block" }}>Role</label>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    {["Student", "Staff", "Admin"].map(role => (
                                                        <button key={role} onClick={() => setEditUser(p => ({ ...p, role }))}
                                                                style={{
                                                                    padding: "8px 16px", borderRadius: "8px", border: "2px solid", cursor: "pointer",
                                                                    borderColor: editUser.role === role ? "#6c63ff" : "#e0e0e0",
                                                                    background: editUser.role === role ? "#6c63ff" : "white",
                                                                    color: editUser.role === role ? "white" : "#888",
                                                                    fontWeight: "600", fontSize: "0.85rem",
                                                                }}>
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                                            <button onClick={() => setEditUser(null)}
                                                    style={{ padding: "8px 20px", borderRadius: "8px", border: "2px solid #e0e0e0", background: "white", color: "#888", fontWeight: "600", cursor: "pointer" }}>
                                                Cancel
                                            </button>
                                            <button className="table-btn primary" onClick={saveEditUser}
                                                    style={{ padding: "8px 24px", borderRadius: "8px" }}>
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── EXAMS ── */}
                    {activeNav === "exams" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>All Exams</h2>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                    <th style={{ ...thStyle, textAlign: "left" }}>Subject</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Room</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Start</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>End</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {exams.map(e => (
                                    <tr key={e.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ ...tdStyle, fontWeight: "600" }}>{e.subject}</td>
                                        <td style={{ ...tdStyle, textAlign: "center", color: "#666" }}>{e.room?.name || "—"}</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontSize: "0.85rem", color: "#666" }}>{new Date(e.startTime).toLocaleString()}</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontSize: "0.85rem", color: "#666" }}>{new Date(e.endTime).toLocaleString()}</td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <button className="table-btn danger" onClick={() => deleteExam(e.id)}
                                                    style={{ padding: "6px 16px", borderRadius: "8px" }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {exams.length === 0 && <p style={{ opacity: 0.5, marginTop: "20px" }}>No exams yet.</p>}
                        </div>
                    )}

                    {/* ── ROOMS ── */}
                    {activeNav === "rooms" && (
                        <div style={cardStyle}>
                            <h2 style={{ fontWeight: "700", marginBottom: "24px", fontSize: "1.4rem" }}>Rooms</h2>

                            {/* ADD ROOM */}
                            <div style={{ background: "#f8f7ff", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
                                <h3 style={{ fontWeight: "600", marginBottom: "14px", fontSize: "0.95rem" }}>Add Room</h3>
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                                    <input className="login-input" placeholder="Room Name (e.g. A101)"
                                           value={roomForm.name}
                                           onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))}
                                           style={{ flex: "1", minWidth: "140px", height: "40px" }} />
                                    <input className="login-input" placeholder="Capacity" type="number"
                                           value={roomForm.capacity}
                                           onChange={e => setRoomForm(p => ({ ...p, capacity: e.target.value }))}
                                           style={{ width: "120px", height: "40px" }} />
                                    <button className="table-btn primary" onClick={createRoom} disabled={creatingRoom}
                                            style={{ marginLeft: "auto", height: "40px", padding: "0 24px", opacity: creatingRoom ? 0.6 : 1, borderRadius: "10px", fontWeight: "600" }}>
                                        {creatingRoom ? "Adding..." : "+ Add Room"}
                                    </button>
                                </div>
                                {roomError && <p style={{ color: "#e74c3c", fontSize: "0.8rem", marginTop: "10px", fontWeight: "600" }}>{roomError}</p>}
                            </div>

                            {/* TABLE */}
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                                    <th style={{ ...thStyle, textAlign: "left" }}>Room Name</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Capacity</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rooms.map(r => (
                                    <tr key={r.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ ...tdStyle, fontWeight: "600" }}>{r.name}</td>
                                        <td style={{ ...tdStyle, textAlign: "center", color: "#666" }}>{r.capacity} seats</td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <button className="table-btn primary" onClick={() => setEditRoom(r)}
                                                        style={{ padding: "6px 16px", borderRadius: "8px" }}>Edit</button>
                                                <button className="table-btn danger" onClick={() => deleteRoom(r.id)}
                                                        style={{ padding: "6px 16px", borderRadius: "8px" }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {rooms.length === 0 && <p style={{ opacity: 0.5, marginTop: "20px" }}>No rooms yet.</p>}

                            {/* EDIT ROOM MODAL */}
                            {editRoom && (
                                <div style={modalOverlay} onClick={() => setEditRoom(null)}>
                                    <div style={{ ...modalBox, width: "380px" }} onClick={e => e.stopPropagation()}>
                                        <h3 style={{ fontWeight: "700", marginBottom: "20px", fontSize: "1.1rem" }}>Edit Room</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <div>
                                                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#888", marginBottom: "4px", display: "block" }}>Room Name</label>
                                                <input className="login-input" value={editRoom.name}
                                                       onChange={e => setEditRoom(p => ({ ...p, name: e.target.value }))}
                                                       style={{ width: "100%", height: "40px", boxSizing: "border-box" }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#888", marginBottom: "4px", display: "block" }}>Capacity</label>
                                                <input className="login-input" type="number" value={editRoom.capacity}
                                                       onChange={e => setEditRoom(p => ({ ...p, capacity: e.target.value }))}
                                                       style={{ width: "100%", height: "40px", boxSizing: "border-box" }} />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                                            <button onClick={() => setEditRoom(null)}
                                                    style={{ padding: "8px 20px", borderRadius: "8px", border: "2px solid #e0e0e0", background: "white", color: "#888", fontWeight: "600", cursor: "pointer" }}>
                                                Cancel
                                            </button>
                                            <button className="table-btn primary" onClick={saveEditRoom}
                                                    style={{ padding: "8px 24px", borderRadius: "8px" }}>
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}