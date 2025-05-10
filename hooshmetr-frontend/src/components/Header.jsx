import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

export default function Header() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload?.role || "user");
      } catch {
        console.error("توکن خراب یا نامعتبر است");
      }
    }
  }, []);

  return (
    <header className="bg-gradient-to-r from-purple-900 to-black text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-yellow-400">
          هوش‌متر
        </h1>
        <nav className="flex gap-4 rtl:space-x-reverse text-sm sm:text-base">
          <Link to="/" className="hover:text-yellow-400 transition">
            خانه
          </Link>
          <Link to="/tools" className="hover:text-yellow-400 transition">
            ابزارها
          </Link>
          <Link to="/compare" className="hover:text-yellow-400 transition">
            مقایسه
          </Link>
          <Link to="/blog" className="hover:text-yellow-400 transition">
            بلاگ
          </Link>
          <Link to="/about" className="hover:text-yellow-400 transition">
            درباره ما
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/profile" className="hover:text-yellow-400 transition">
                پروفایل
              </Link>
              {userRole === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="hover:text-yellow-400 transition"
                >
                  مدیریت
                </Link>
              )}
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-600 transition"
              >
                خروج
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="hover:text-yellow-400 transition">
                ورود
              </Link>
              <Link to="/register" className="hover:text-yellow-400 transition">
                ثبت‌نام
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
