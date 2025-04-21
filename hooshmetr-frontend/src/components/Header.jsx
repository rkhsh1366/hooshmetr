import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 📌 استخراج نقش کاربر از JWT
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || "user"; // پیش‌فرض: user
    } catch {
      return null;
    }
  };

  // 🔍 بررسی وجود توکن و معتبر بودن آن هنگام لود شدن کامپوننت
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000); // زمان حال به ثانیه
        if (payload.exp && payload.exp > now) {
          setIsLoggedIn(true);
          setUserRole(getUserRole());
        }
      } catch (e) {
        console.error("توکن نامعتبر است");
      }
    }
  }, []);

  const [userRole, setUserRole] = useState("user");

  return (
    <header className="bg-purple-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* 🔹 لوگو */}
        <h1 className="text-2xl font-bold">Hooshmetr</h1>

        {/* 🔹 لینک‌های ناوبری */}
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">
            خانه
          </Link>
          <Link to="/about" className="hover:underline">
            درباره
          </Link>
          <Link to="/tools" className="hover:underline">
            ابزارها
          </Link>

          {/* ✅ فقط اگر لاگین کرده باشد، نمایش لینک پروفایل */}
          {isLoggedIn && (
            <Link to="/profile" className="hover:underline">
              پروفایل من
            </Link>
          )}
          {/* 🛠 فقط اگر مدیر بود نمایش داشبورد */}
          {isLoggedIn && userRole === "admin" && (
            <Link to="/admin/dashboard" className="hover:underline">
              داشبورد مدیریت
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
