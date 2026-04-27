import { useState } from "react";
import logo from "../assets/iuslogo.png";
import { useNavigate } from "react-router-dom";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
                        onClick={() => {
                            if (!email || !password) return;

                            const storedUser = JSON.parse(localStorage.getItem("user"));

                            if (!storedUser) {
                                alert("No account found. Please register.");
                                return;
                            }

                            if (
                                email === storedUser.email &&
                                password === storedUser.password
                            ) {
                                localStorage.setItem(
                                    "auth",
                                    JSON.stringify({
                                        email,
                                        role: "professor"
                                    })
                                );

                                navigate("/dashboard");
                            } else {
                                alert("Invalid email or password");
                            }
                        }}
                    >
                        Log in
                    </button>

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