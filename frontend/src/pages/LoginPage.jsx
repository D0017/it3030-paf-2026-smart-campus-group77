function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto", textAlign: "center" }}>
      <h1>CampusOps Hub</h1>
      <p>Sign in to continue to the Smart Campus Operations Hub.</p>

      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          background: "#111827",
          color: "white",
          fontSize: "16px",
        }}
      >
        Continue with Google
      </button>
    </div>
  );
}

export default LoginPage;