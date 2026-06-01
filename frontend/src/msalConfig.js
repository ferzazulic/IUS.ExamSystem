const localOrigin = window.location.origin.replace("127.0.0.1", "localhost");

export const msalConfig = {
    auth: {
        clientId: "562c6df4-0ce8-4165-8969-f300f4c1842a",
        authority: "https://login.microsoftonline.com/2f2dcb5d-f3e1-4f33-8584-dcacd25d604d",
        redirectUri: `${localOrigin}/auth`,
        postLogoutRedirectUri: `${localOrigin}/login`,
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: true,
    }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
    scopes: ["api://562c6df4-0ce8-4165-8969-f300f4c1842a/api_access"]
};
