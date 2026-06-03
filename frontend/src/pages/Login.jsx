import { useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import apiClient from "../api/apiClient";
import logo from "../assets/iuslogo.png";
import { useNavigate } from "react-router-dom";
import React from "react";

const azureClientId =
    import.meta.env.VITE_AZURE_CLIENT_ID || "562c6df4-0ce8-4165-8969-f300f4c1842a";
const azureTenantId =
    import.meta.env.VITE_AZURE_TENANT_ID || "2f2dcb5d-f3e1-4f33-8584-dcacd25d604d";
const azureApiScope =
    import.meta.env.VITE_AZURE_API_SCOPE || `api://${azureClientId}/.default`;

const msalClient = new PublicClientApplication({
    auth: {
        clientId: azureClientId,
        authority: `https://login.microsoftonline.com/${azureTenantId}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "localStorage",
    },
});

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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
            await msalClient.initialize();
            const result = await msalClient.loginPopup({
                scopes: [azureApiScope],
                prompt: "select_account",
            });

            const token = result.accessToken;
            const account = result.account;
            const roleClaim =
                account?.idTokenClaims?.roles ||
                account?.idTokenClaims?.[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    ] ||
                [];
            const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
            const role = roles[0] || "Student";

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", account?.localAccountId || "");
            localStorage.setItem("fullName", account?.name || "");

            if (role === "Admin") {
                navigate("/admin-dashboard");
            } else if (role === "Staff") {
                navigate("/dashboard");
            } else {
                navigate("/student-dashboard");
            }
        } catch {
            setError("Azure ID sign in failed");
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
