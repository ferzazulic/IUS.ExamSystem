import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import apiClient from "./api/apiClient.js";
import { msalInstance } from "./auth/msalInstance.js";
import { loginRequest } from "./msalConfig.js";

const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const userIdClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

function parseJwtPayload(token) {
    const encodedPayload = token.split(".")[1];
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");

    return JSON.parse(atob(padded));
}

function dashboardRouteFor(role) {
    if (role === "Admin") return "/admin-dashboard";
    if (role === "Staff") return "/dashboard";
    return "/student-dashboard";
}

function storeSession(token, account) {
    const payload = parseJwtPayload(token);
    const role = payload[roleClaim] || payload.role || "Student";
    const userId = payload[userIdClaim] || payload.sub || "";
    const fullName = payload.fullName || account?.name || "";

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);
    localStorage.setItem("fullName", fullName);

    return role;
}

async function completeAzureRedirect(redirectResult) {
    const account = redirectResult.account;
    msalInstance.setActiveAccount(account);

    const tokenResponse = redirectResult.accessToken
        ? redirectResult
        : await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account,
        });

    const backendResponse = await apiClient.post("/api/Auth/azure-login", {
        token: tokenResponse.accessToken,
    });

    const jwtToken = backendResponse.data.token;
    const role = storeSession(jwtToken, account);

    window.history.replaceState({}, "", dashboardRouteFor(role));
}

function renderApp() {
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </StrictMode>,
    )
}

async function bootstrap() {
    try {
        await msalInstance.initialize();

        const redirectResult = await msalInstance.handleRedirectPromise();
        if (redirectResult?.account) {
            await completeAzureRedirect(redirectResult);
        }
    } catch (error) {
        localStorage.setItem(
            "authError",
            error.response?.data?.message || error.message || "Azure authentication failed."
        );
        window.history.replaceState({}, "", "/login");
    }

    renderApp();
}

bootstrap();
