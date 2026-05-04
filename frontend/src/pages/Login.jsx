import { useState } from "react";
import apiClient from "../api/apiClient";
import logo from "../assets/iuslogo.png";
import { useNavigate } from "react-router-dom";

export function Login() {
     const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

    const navigate = useNavigate();

    return (
        <div className="canvas page-transition">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>

            <div
                className="glass-wrapper"
                style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}
            >
                <img src={logo} alt="IUS logo" className="login-logo-img" />

                <div className="login-card view-fade-in">

                    <h2 className="login-title">Welcome back</h2>
                    <p className="login-sub">Sign in to continue</p>

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

                    <button
      className="login-btn"
      onClick={async () => {
          if (!email || !password) return;
          setError("");
          try {
              const res = await apiClient.post("/api/Auth/login", { email, password });
              const token = res.data.token;
              const payload = JSON.parse(atob(token.split(".")[1]));
              const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
              const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
              localStorage.setItem("token", token);
              localStorage.setItem("role", role);
              localStorage.setItem("userId", userId);
              if (role === "Admin") {
                 navigate("/admin-dashboard");
                } else if (role === "Staff") {
                    navigate("/dashboard");
              } else {
                  navigate("/student-dashboard");
              }
          } catch {
              setError("Invalid email or password");
          }
      }}
  >
      Log in
  </button>
{error && <p style={{ color: "red", fontSize: "14px", margin: "4px 0" }}>{error}</p>}
                    <p className="login-forgot">Forgot password?</p>

                    <div className="login-divider"></div>

                    <button
                        className="register-btn"
                        onClick={() => navigate("/register")}
                    >
                        Create new account
                    </button>

                </div>
            </div>
        </div>
    );
}