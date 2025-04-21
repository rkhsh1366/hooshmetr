// ToolCard.jsx
// 🎴 نمایش کارت ابزار هوش مصنوعی + دکمه افزودن/حذف از لیست مقایسه

/**
 * props:
 * - tool: شیء ابزار شامل ویژگی‌ها
 * - onCompareToggle: تابعی برای افزودن یا حذف ابزار از مقایسه
 * - isCompared: آیا ابزار در حال حاضر در لیست مقایسه است؟
 */

import { Link } from "react-router-dom";
// 📌 گرفتن نقش کاربر از توکن
const getUserRole = () => {
  try {
    const token = localStorage.getItem("access");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "user";
  } catch {
    return null;
  }
};

function ToolCard({ tool, onCompareToggle, isCompared }) {
  const userRole = getUserRole();

  return (
    <Link to={`/tools/${tool.id}`} className="block">
      <div
        className="bg-white rounded-xl shadow-md hover:shadow-xl 
                 transition-transform hover:-translate-y-1 
                 p-5 flex flex-col items-center text-center 
                 cursor-pointer border"
      >
        {/* 🔸 تصویر ابزار */}
        <img
          src={tool.image}
          alt={tool.name}
          className="w-20 h-20 object-contain mb-3"
          loading="lazy"
        />

        {/* 🔸 نام ابزار */}
        <h3 className="text-lg font-bold text-gray-800">{tool.name}</h3>

        {/* 🔸 توضیح کوتاه با محدودیت ۳ خط */}
        <p className="text-sm text-gray-500 mt-2 line-clamp-3">
          {tool.description}
        </p>

        {/* 🔸 برچسب دسته‌بندی */}
        <span className="text-xs mt-3 mb-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          {tool.category}
        </span>

        {/* 🟪 دکمه افزودن به مقایسه */}
        <button
          className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${
            isCompared
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
          onClick={(e) => {
            e.stopPropagation(); // جلوگیری از کلیک روی کارت در صورت wrap شدن با لینک
            onCompareToggle(tool.id); // فراخوانی تابع toggle مقایسه
          }}
        >
          {isCompared ? "حذف از مقایسه" : "افزودن به مقایسه"}
        </button>
        {/* 🛠 فقط برای ادمین‌ها: دکمه مدیریت ابزار */}
        {userRole === "admin" && (
          <div className="mt-2 flex gap-2 text-xs">
            <button
              onClick={(e) => {
                e.preventDefault(); // جلوگیری از هدایت لینک
                e.stopPropagation();
                alert("ویرایش ابزار (در حال توسعه)");
              }}
              className="text-blue-600 hover:underline"
            >
              ویرایش
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert("حذف ابزار (در حال توسعه)");
              }}
              className="text-red-600 hover:underline"
            >
              حذف
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ToolCard;
