import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginSuccessPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleLoginSuccess = async () => {
      await refreshUser();
      navigate("/dashboard", { replace: true });
    };

    handleLoginSuccess();
  }, [navigate, refreshUser]);

  return <p>Signing you in...</p>;
}

export default LoginSuccessPage;