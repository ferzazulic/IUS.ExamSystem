import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { ProfessorLayout } from "./ProfessorLayout";

export function NotificationsManage() {
    const [notifications, setNotifications] = useState([]);
    const [form, setForm] = useState({ title: "", body: "", type: "info", isImportant: false });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const fetchNotifications = () => {
        apiClient.get("/api/notification")
            .then(res => setNotifications(res.data || []))
            .catch(console.error);
    };

    useEffect(() => { fetchNotifications(); }, []);

    const post = async () => {
        if (!form.title.trim() || !form.body.trim()) return;
        setSaving(true);
        try {
            await apiClient.post("/api/notification", form);
            setForm({ title: "", body: "", type: "info", isImportant: false });
            fetchNotifications();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to post notification");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        try {
            await apiClient.delete(`/api/notification/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch {
            setError("Failed to delete notification");
        }
    };

    const typeColor = (type) =>
        type === "warning" ? "#f39c12" : type === "exam" ? "#6c63ff" : "#1a73e8";

    const thStyle = { padding: "10px 12px", color: "#888", fontWeight: "600", fontSize: "0.85rem" };

    return (
        <ProfessorLayout active="notifications-manage">
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontWeight: "800", fontSize: "1.8rem", margin: 0 }}>Notifications</h1>
                <p style={{ color: "#888", margin: "4px 0 0", fontSize: "0.9rem" }}>Post announcements for students</p>
            </div>

            {/* POST FORM */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "24px"
            }}>
                <h3 style={{ fontWeight: "700", marginBottom: "14px", fontSize: "0.95rem" }}>New Notification</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input className="login-input" placeholder="Title"
                           value={form.title}
                           onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                           style={{ height: "40px" }} />
                    <textarea placeholder="Message body..."
                              value={form.body}
                              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                              rows={4}
                              style={{
                                  padding: "12px 16px", borderRadius: "12px",
                                  border: "1.5px solid #e0e0e0", fontSize: "0.9rem",
                                  fontFamily: "inherit", resize: "vertical", outline: "none"
                              }} />
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        {["info", "warning", "exam"].map(t => (
                            <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                                    style={{
                                        padding: "6px 16px", borderRadius: "8px", border: "2px solid",
                                        borderColor: form.type === t ? "#6c63ff" : "#ddd",
                                        background: form.type === t ? "#f0eeff" : "white",
                                        color: form.type === t ? "#6c63ff" : "#666",
                                        fontWeight: "600", cursor: "pointer", fontSize: "0.85rem",
                                        textTransform: "capitalize"
                                    }}>
                                {t}
                            </button>
                        ))}
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                            <input type="checkbox" checked={form.isImportant}
                                   onChange={e => setForm(p => ({ ...p, isImportant: e.target.checked }))} />
                            Mark as Important
                        </label>
                        <button className="table-btn primary" onClick={post}
                                disabled={saving || !form.title.trim() || !form.body.trim()}
                                style={{ marginLeft: "auto", padding: "0 24px", height: "40px", borderRadius: "10px", opacity: saving ? 0.6 : 1 }}>
                            {saving ? "Posting..." : "+ Post"}
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
            </div>

            {/* LIST */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "24px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
            }}>
                <h3 style={{ fontWeight: "700", marginBottom: "16px", fontSize: "0.95rem" }}>Posted Notifications</h3>
                {notifications.length === 0 ? (
                    <p style={{ opacity: 0.5 }}>No notifications posted yet.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ borderBottom: "2px solid #f0eeff" }}>
                            <th style={{ ...thStyle, textAlign: "left" }}>Title</th>
                            <th style={{ ...thStyle, textAlign: "left" }}>Message</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Type</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Important</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Posted</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {notifications.map(n => (
                            <tr key={n.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                <td style={{ padding: "14px 12px", fontWeight: "700" }}>{n.title}</td>
                                <td style={{ padding: "14px 12px", color: "#666", maxWidth: "280px", fontSize: "0.85rem" }}>{n.body}</td>
                                <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                        <span style={{
                                            background: typeColor(n.type) + "22", color: typeColor(n.type),
                                            padding: "3px 10px", borderRadius: "8px",
                                            fontSize: "0.75rem", fontWeight: "600", textTransform: "capitalize"
                                        }}>
                                            {n.type}
                                        </span>
                                </td>
                                <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                    {n.isImportant && (
                                        <span style={{ background: "#ffe0e0", color: "#e74c3c", padding: "3px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                                                Yes
                                            </span>
                                    )}
                                </td>
                                <td style={{ padding: "14px 12px", textAlign: "center", fontSize: "0.8rem", color: "#888" }}>
                                    {new Date(n.createdAt).toLocaleString()}
                                </td>
                                <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                    <button className="table-btn danger" onClick={() => remove(n.id)}
                                            style={{ padding: "6px 16px", borderRadius: "8px" }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </ProfessorLayout>
    );
}
