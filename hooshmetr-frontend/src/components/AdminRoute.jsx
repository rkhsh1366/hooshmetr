import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload?.role || "user");
      } catch {
        setRole("user");
      }
    }
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
