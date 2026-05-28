import { useEffect } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../msalConfig.js";
import apiClient from "../api/apiClient.js";

export function AuthRedirect() {
    const { instance, accounts, inProgress } = useMsal();
    const navigate = useNavigate();

    useEffect(() => {
        const processAuth = async () => {
            if (!instance || inProgress !== InteractionStatus.None) {
                return;
            }

            console.log("AuthRedirect status", {
                url: window.location.href,
                inProgress,
                accounts,
                active: instance.getActiveAccount()?.username,
            });

            const account = instance.getActiveAccount() || accounts[0];
            if (!account) {
                console.warn("No account available after redirect");
                navigate("/login");
                return;
            }

            instance.setActiveAccount(account);

            try {
                // Get the Azure AD token
                const tokenResponse = await instance.acquireTokenSilent({
                    ...loginRequest,
                    scopes: ["openid", "profile", ...loginRequest.scopes],
                    account,
                });

                const azureToken = tokenResponse.accessToken;
                console.log("Azure token acquired", { azureToken: azureToken?.substring(0, 20) + "..." });

                // Exchange Azure token for JWT token from backend
                const backendResponse = await apiClient.post("/api/auth/azure-login", {
                    token: azureToken,
                });

                const jwtToken = backendResponse.data.token;
                localStorage.setItem("token", jwtToken);

                // Decode JWT to get role and userId
                const payload = JSON.parse(atob(jwtToken.split(".")[1]));
                const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
                             payload.role || 
                             "Student";
                const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                               payload.sub || 
                               payload.oid;

                localStorage.setItem("role", role);
                localStorage.setItem("userId", userId);
                localStorage.setItem("userName", account.name);

                console.log("Login successful", { role, userId });

                if (role === "Admin") {
                    navigate("/admin-dashboard");
                } else if (role === "Staff") {
                    navigate("/dashboard");
                } else {
                    navigate("/student-dashboard");
                }
            } catch (authError) {
                console.error("AuthRedirect error", authError);
                const errorMessage = authError.response?.data?.message || authError.message || "Authentication failed";
                localStorage.setItem("authError", errorMessage);
                navigate("/login");
            }
        };

        processAuth();
    }, [instance, accounts, inProgress, navigate]);

    return (
        <div className="canvas page-transition" style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
            <div className="login-card">
                <h2 className="login-title">Processing authentication...</h2>
                <p className="login-sub">Please wait while the sign-in completes.</p>
            </div>
        </div>
    );
}
