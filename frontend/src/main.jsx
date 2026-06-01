import {createRoot} from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import { loginRequest } from "./msalConfig.js";
import { completeAzureLogin } from "./auth/completeAzureLogin.js";
import { msalInstance } from "./auth/msalInstance.js";

window.msalInstance = msalInstance;

async function processMicrosoftRedirect() {
    const isAuthCallback = window.location.pathname === "/auth" &&
        (window.location.hash.includes("code=") || window.location.hash.includes("error="));

    if (!isAuthCallback) {
        return;
    }

    try {
        const scopes = ["openid", "profile", ...loginRequest.scopes];
        const redirectResponse = await msalInstance.handleRedirectPromise({
            navigateToLoginRequestUrl: false,
        });
        const account = redirectResponse?.account ||
            msalInstance.getActiveAccount() ||
            msalInstance.getAllAccounts()[0];

        if (!account) {
            throw new Error("Microsoft sign-in completed, but no account was returned by MSAL.");
        }

        msalInstance.setActiveAccount(account);
        const tokenResponse = redirectResponse?.accessToken
            ? redirectResponse
            : await msalInstance.acquireTokenSilent({
                ...loginRequest,
                scopes,
                account,
            });

        const { path } = await completeAzureLogin({
            accessToken: tokenResponse.accessToken,
            account,
        });

        sessionStorage.removeItem("azureLoginInProgress");
        window.location.replace(path);
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Microsoft login failed";
        sessionStorage.removeItem("azureLoginInProgress");
        sessionStorage.setItem("authRedirectError", message);
        window.history.replaceState(null, "", "/auth");
    }
}

msalInstance.initialize().then(async () => {
    await processMicrosoftRedirect();

    createRoot(document.getElementById('root')).render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>,
    )
});
