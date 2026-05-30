import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

export function NotificationsManage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [form, setForm] = useState({ title: "", body: "", type: "info", isImportant: false });
    const [saving, setSaving] = useState(false);

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
            alert(err.response?.data?.error || "Failed to post notification");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!confirm("Delete this notification?")) return;
        await apiClient.delete(`/api/notification/${id}`);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const typeColor = (type) =>
        type === "warning" ? "#f39c12" : type === "exam" ? "#6c63ff" : "#1a73e8";

    return (
        <div className="academia-container">
            <div className="page-container exams-header">
                <div>
                    <button className="back-btn" onClick={() => navigate(-1)}>← Dashboard</button>
                    <h1 className="exams-title">Notifications</h1>
                    <p className="exams-sub">Post news and announcements for students</p>
                </div>
            </div>

            {/* Post form */}
            <div className="page-container exam-form" style={{ flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
                <input
                    className="login-input"
                    placeholder="Title"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
                <textarea
                    placeholder="Message body..."
                    value={form.body}
                    onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    rows={4}
                    style={{
                        padding: "12px 16px", borderRadius: "12px",
                        border: "1.5px solid #e0e0e0", fontSize: "0.9rem",
                        fontFamily: "inherit", resize: "vertical", outline: "none"
                    }}
                />
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {["info", "warning", "exam"].map(t => (
                        <button
                            key={t}
                            onClick={() => setForm(p => ({ ...p, type: t }))}
                            style={{
                                padding: "6px 16px", borderRadius: "8px", border: "2px solid",
                                borderColor: form.type === t ? "#6c63ff" : "#ddd",
                                background: form.type === t ? "#f0eeff" : "white",
                                color: form.type === t ? "#6c63ff" : "#666",
                                fontWeight: "600", cursor: "pointer", fontSize: "0.85rem",
                                textTransform: "capitalize"
                            }}
                        >
                            {t}
                        </button>
                    ))}
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                        <input
                            type="checkbox"
                            checked={form.isImportant}
                            onChange={e => setForm(p => ({ ...p, isImportant: e.target.checked }))}
                        />
                        Mark as Important
                    </label>
                    <button
                        className="table-btn primary"
                        onClick={post}
                        disabled={saving || !form.title.trim() || !form.body.trim()}
                        style={{ marginLeft: "auto", minWidth: "100px", opacity: saving ? 0.6 : 1 }}
                    >
                        {saving ? "Posting..." : "+ Post"}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="page-container table-card">
                {notifications.length === 0 ? (
                    <p style={{ opacity: 0.5, padding: "20px 0" }}>No notifications posted yet.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                        <thead>
                            <tr style={{ opacity: 0.6 }}>
                                <th style={{ padding: "10px", textAlign: "left" }}>Title</th>
                                <th style={{ textAlign: "left" }}>Message</th>
                                <th style={{ textAlign: "center" }}>Type</th>
                                <th style={{ textAlign: "center" }}>Important</th>
                                <th style={{ textAlign: "center" }}>Posted</th>
                                <th style={{ textAlign: "center" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map(n => (
                                <tr key={n.id} style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                    <td style={{ padding: "12px", fontWeight: "700" }}>{n.title}</td>
                                    <td style={{ padding: "12px", opacity: 0.7, maxWidth: "280px" }}>{n.body}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <span style={{
                                            background: typeColor(n.type) + "22",
                                            color: typeColor(n.type),
                                            padding: "3px 10px", borderRadius: "8px",
                                            fontSize: "0.75rem", fontWeight: "600", textTransform: "capitalize"
                                        }}>
                                            {n.type}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {n.isImportant && (
                                            <span style={{ background: "#ffe0e0", color: "#e74c3c", padding: "3px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                                                Yes
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center", fontSize: "0.8rem", opacity: 0.6 }}>
                                        {new Date(n.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ textAlign: "center", padding: "12px" }}>
                                        <button className="table-btn danger" onClick={() => remove(n.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
