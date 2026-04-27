import { useState } from "react";
import apiClient from "../api/apiClient";
import logo from "../assets/iuslogo.png";
import { useNavigate } from "react-router-dom";

export function Register() {
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState(2);
  const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleRegister = async () => {
      if (!name || !email || !password || !confirm) {
          setError("Please fill all fields");
          return;
      }
      if (password !== confirm) {
          setError("Passwords do not match");
          return;
      }
      setError("");
      try {
          await apiClient.post("/api/Auth/register", {
              fullName: name,
              email,
              password,
              role
          });
          navigate("/login");
      } catch {
          setError("Registration failed. Email may already be in use.");
      }
  };

    return (
        <div className="canvas page-transition">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <div
                className="glass-wrapper"
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}
            >
                <img src={logo} alt="IUS logo" className="login-logo-img" />

                <div className="login-card view-fade-in">

                    <h2 className="login-title">Create account</h2>
                    <p className="login-sub">Join the platform</p>

                    <input
                        className="login-input"
                        placeholder=" Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        className="login-input"
                        placeholder=" Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="login-input"
                        type="password"
                        placeholder=" Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        className="login-input"
                        type="password"
                        placeholder=" Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />

<div style={{ display: "flex", gap: "10px", margin: "8px 0" }}>
      {[{ label: "🎓 Student", value: 2 }, { label: "👨‍🏫 Professor", value: 1 }].map(r => (
          <button
              key={r.value}
              onClick={() => setRole(r.value)}
              style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: role === r.value ? "2px solid #6c63ff" : "2px solid #ddd",
                  background: role === r.value ? "#f0eeff" : "white",
                  color: role === r.value ? "#6c63ff" : "#999",
                  fontWeight: "600",
                  cursor: "pointer"
              }}
          >
              {r.label}
          </button>
      ))}
  </div>
  {error && <p style={{ color: "red", fontSize: "14px", margin: "4px 0" }}>{error}</p>}

                    <button className="login-btn" onClick={handleRegister}>
                        Create account
                    </button>

                    <div className="login-divider"></div>

                    <button
                        className="register-btn"
                        onClick={() => navigate("/login")}
                    >
                        Already have an account? Log in
                    </button>

                </div>
            </div>
        </div>
    );
}