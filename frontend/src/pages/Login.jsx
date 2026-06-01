import { useEffect, useState } from "react";
import logo from "../assets/iuslogo.png";
import { useNavigate } from "react-router-dom";
import { loginRequest, msalConfig } from "../msalConfig.js";
import apiClient from "../api/apiClient.js";
import { completeAzureLogin } from "../auth/completeAzureLogin.js";
import { msalInstance } from "../auth/msalInstance.js";

export function Login() {
    const [error, setError] = useState(() => {
        const storedError = localStorage.getItem("authError");
        if (storedError) {
            localStorage.removeItem("authError");
            return "Login failed: " + storedError;
        }
        return "";
    });
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const finishInterruptedRedirect = async () => {
            if (!sessionStorage.getItem("azureLoginInProgress") || localStorage.getItem("token")) {
                return;
            }

            const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
            if (!account) {
                return;
            }

            try {
                const scopes = ["openid", "profile", ...loginRequest.scopes];
                msalInstance.setActiveAccount(account);
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    scopes,
                    account,
                });
                const { path } = await completeAzureLogin({
                    accessToken: tokenResponse.accessToken,
                    account,
                });
                sessionStorage.removeItem("azureLoginInProgress");
                navigate(path, { replace: true });
            } catch (err) {
                console.error("Interrupted Azure login recovery failed", err);
                sessionStorage.removeItem("azureLoginInProgress");
                const message = err.response?.data?.message || err.message || "Microsoft login failed";
                setError("Login failed: " + message);
            }
        };

        finishInterruptedRedirect();
    }, [navigate]);

    const handleLogin = async () => {
        setError("");
        console.log("handleLogin start", { instance: msalInstance, redirectUri: msalConfig.auth.redirectUri });
        try {
            if (!msalInstance || typeof msalInstance.loginRedirect !== "function") {
                throw new Error("MSAL instance not ready or loginRedirect missing");
            }

            const scopes = ["openid", "profile", ...loginRequest.scopes];
            console.log("calling loginRedirect", scopes);
            sessionStorage.setItem("azureLoginInProgress", "true");
            await msalInstance.loginRedirect({
                ...loginRequest,
                scopes,
                redirectUri: msalConfig.auth.redirectUri,
                navigateToLoginRequestUrl: false,
                prompt: "select_account",
            });
        } catch (err) {
            console.error("handleLogin error", err);
            sessionStorage.removeItem("azureLoginInProgress");
            const message = err?.message || err?.errorMessage || "Login failed.";
            setError("Login failed: " + message);
        }
    };

    const handleEmailPasswordLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await apiClient.post("/api/auth/login", {
                email,
                password,
            });

            const jwtToken = response.data.token;
            localStorage.setItem("token", jwtToken);

            // Decode JWT to get role and userId
            const payload = JSON.parse(atob(jwtToken.split(".")[1]));
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
                         payload.role || 
                         "Student";
            const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                           payload.sub;

            localStorage.setItem("role", role);
            localStorage.setItem("userId", userId);

            if (role === "Admin") {
                navigate("/admin-dashboard");
            } else if (role === "Staff") {
                navigate("/dashboard");
            } else {
                navigate("/student-dashboard");
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Login failed";
            setError(message);
            console.error("Login error", err);
        } finally {
            setLoading(false);
        }
    };

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

                    <form onSubmit={handleEmailPasswordLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                                boxSizing: "border-box",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn"
                            style={{ marginBottom: "10px" }}
                        >
                            {loading ? "Logging in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="login-divider"></div>

                    <button type="button" className="login-btn" onClick={handleLogin}>
                        Log in with Azure AD
                    </button>

                    {error && <p style={{ color: "red", fontSize: "14px", margin: "4px 0" }}>{error}</p>}

                    <p className="login-forgot">Forgot password?</p>

                    <div className="login-divider"></div>

                    <button
                        type="button"
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
