import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      setChecking(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp > now) {
        setValid(true);
      } else {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    } catch {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    } finally {
      setChecking(false);
    }
  }, []);

  if (checking) return null;

  if (!isAuthenticated || !valid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
