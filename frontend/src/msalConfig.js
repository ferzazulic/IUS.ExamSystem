export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "562c6df4-0ce8-4165-8969-f300f4c1842a",
        authority:
            `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "2f2dcb5d-f3e1-4f33-8584-dcacd25d604d"}`,
        redirectUri: `${window.location.origin}/auth`,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: [
        import.meta.env.VITE_AZURE_API_SCOPE ||
        "api://562c6df4-0ce8-4165-8969-f300f4c1842a/api_access",
    ],
};
