import { useState } from "react";
import apiClient from "../api/apiClient";
import logo from "../assets/iuslogo.png";
import { useNavigate } from "react-router-dom";
import React from "react";
import { loginRequest, msalConfig } from "../msalConfig.js";
import { msalInstance } from "../auth/msalInstance.js";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(() => {
        const storedError = localStorage.getItem("authError");
        if (!storedError) return "";
        localStorage.removeItem("authError");
        return `Login failed: ${storedError}`;
    });

    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }

        setError("");

        try {
            const res = await apiClient.post("/api/Auth/login", {
                email,
                password,
            });

            const token = res.data.token;
            const payload = JSON.parse(atob(token.split(".")[1]));

            const role =
                payload[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    ];

            const userId =
                payload[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                    ];

            const fullName = payload["fullName"] || "";

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", userId);
            localStorage.setItem("fullName", fullName);

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
    };

    const handleAzureLogin = async () => {
        setError("");

        try {
            await msalInstance.loginRedirect({
                ...loginRequest,
                redirectUri: msalConfig.auth.redirectUri,
            });
        } catch (err) {
            setError(`Azure ID sign in failed: ${err.message || "Unknown error"}`);
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
                    flexDirection: "column",
                }}
            >
                <img
                    src={logo}
                    alt="IUS logo"
                    className="login-logo-img"
                />

                <div className="login-card view-fade-in">
                    <h2 className="login-title">Welcome back</h2>
                    <p className="login-sub">Sign in to continue</p>

                    <input
                        className="login-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <p
                            style={{
                                color: "red",
                                fontSize: "14px",
                                marginBottom: "10px",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        className="login-btn"
                        onClick={handleLogin}
                    >
                        Log in
                    </button>

                    <div className="login-divider">or</div>

                    <button
                        className="azure-login-btn"
                        type="button"
                        onClick={handleAzureLogin}
                    >
                        Sign in with Azure ID
                    </button>
                </div>
            </div>
        </div>
    );
}
