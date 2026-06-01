import apiClient from "../api/apiClient.js";

function decodeJwtPayload(token) {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
        atob(base64)
            .split("")
            .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
            .join("")
    );

    return JSON.parse(json);
}

export function getDashboardPath(role) {
    if (role === "Admin") return "/admin-dashboard";
    if (role === "Staff") return "/dashboard";
    return "/student-dashboard";
}

export async function completeAzureLogin({ accessToken, account }) {
    const backendResponse = await apiClient.post("/api/auth/azure-login", {
        token: accessToken,
        email: account?.username,
        fullName: account?.name,
        azureId: account?.localAccountId || account?.homeAccountId,
    });

    const jwtToken = backendResponse.data.token;
    localStorage.setItem("token", jwtToken);

    const payload = decodeJwtPayload(jwtToken);
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload.role ||
        "Student";
    const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload.sub ||
        payload.oid;

    localStorage.setItem("role", role);
    if (userId) localStorage.setItem("userId", userId);
    if (account?.name) localStorage.setItem("userName", account.name);

    return {
        role,
        userId,
        path: getDashboardPath(role),
    };
}
