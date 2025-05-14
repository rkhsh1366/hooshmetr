import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setChecking(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // بررسی تاریخ انقضا
      const now = Math.floor(Date.now() / 1000); // timestamp فعلی
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        setRole("expired");
      } else {
        setRole(payload.role || "user");
      }
    } catch {
      setRole("invalid");
    } finally {
      setChecking(false);
    }
  }, []);

  // تا زمان بررسی، چیزی نمایش نده
  if (checking) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
