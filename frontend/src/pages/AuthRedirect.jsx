import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function AuthRedirect() {
    const navigate = useNavigate();
    const location = useLocation();
    const processedRef = useRef(false);
    const [error] = useState(() => sessionStorage.getItem("authRedirectError") || "");

    useEffect(() => {
        const processAuth = () => {
            if (location.pathname !== "/auth") {
                console.log("AuthRedirect: not on /auth route, skipping", { pathname: location.pathname });
                return;
            }

            if (processedRef.current) {
                return;
            }
            processedRef.current = true;
        };

        processAuth();
    }, [location.pathname]);

    return (
        <div className="canvas page-transition" style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
            <div className="login-card">
                <h2 className="login-title">{error ? "Authentication failed" : "Processing authentication..."}</h2>
                <p className="login-sub">
                    {error || "Please wait while the sign-in completes."}
                </p>
                {error && (
                    <button type="button" className="login-btn" onClick={() => {
                        sessionStorage.removeItem("authRedirectError");
                        navigate("/login", { replace: true });
                    }}>
                        Back to login
                    </button>
                )}
            </div>
        </div>
    );
}
