import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import campusBg from "../assets/login.jpg";
import campusLogo from "../assets/logo2.png";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-.9 2.5-2 3.3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.2H3v2.6C4.7 19.8 8.1 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.3 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7V7.7H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.3l3.3-2.6z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.2 14.7 2 12 2 8.1 2 4.7 4.2 3 7.7l3.3 2.6C7.1 7.9 9.3 6.1 12 6.1z"
      />
    </svg>
  );
}

function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F4]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#70071C] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F4F4] px-4 py-8">
      <div className="absolute inset-0">
        <img
          src={campusBg}
          alt="Campus background"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#212325]/40" />
        <div className="absolute inset-0 bg-linear-to-br from-[#212325]/60 via-[#4A0513]/35 to-[#70071C]/30" />
        <div className="absolute inset-0 backdrop-blur-[3px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-4xl border border-white/25 bg-white/18 shadow-[0_30px_80px_rgba(33,35,37,0.30)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent" />

          <div className="p-8 sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
              <img
                src={campusLogo}
                alt="CampusOps Hub logo"
                className="h-12 w-12 object-contain"
              />
            </div>

            <h1 className="mt-7 text-center text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
              Welcome back
            </h1>

            <p className="mx-auto mt-4 max-w-xs text-center text-sm leading-7 text-white/80 sm:text-base">
              Sign in with your Google account to continue to CampusOps Hub.
            </p>

            <button
              onClick={handleGoogleLogin}
              className="group relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/35 bg-white px-5 py-4 text-base font-semibold text-[#212325] shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-white hover:shadow-[0_18px_40px_rgba(112,7,28,0.28)] focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <span className="absolute inset-0 bg-linear-to-r from-white via-[#F4F4F4] to-white opacity-100 transition duration-300 group-hover:opacity-90" />
              <span className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <span className="absolute inset-0 bg-linear-to-r from-[#70071C]/8 via-transparent to-[#70071C]/8" />
              </span>

              <span className="relative flex items-center gap-3">
                <GoogleIcon />
                <span>Continue with Google</span>
              </span>

              <span className="relative ml-auto text-[#70071C] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>

            <p className="mt-6 text-center text-sm leading-7 text-white/75">
              First-time sign-in creates your account automatically.
            </p>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                CampusOps
              </span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="text-sm font-semibold text-white/90 transition hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;