export function AuthRedirect() {
    return (
        <div className="canvas page-transition" style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
            <div className="login-card">
                <h2 className="login-title">Processing authentication...</h2>
                <p className="login-sub">Please wait while sign-in completes.</p>
            </div>
        </div>
    );
}
