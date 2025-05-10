// ToolCard.jsx
import { Link } from "react-router-dom";

// 🔐 گرفتن نقش کاربر از توکن
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
    <Link to={`/tools/${tool.id}`} className="block group">
      <div className="bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-2xl p-5 text-white transition-transform duration-300 hover:scale-[1.03] shadow-lg hover:shadow-2xl relative overflow-hidden">
        {/* 🧠 آیکن یا تصویر ابزار */}
        <img
          src={tool.image}
          alt={tool.name}
          className="w-20 h-20 object-contain mx-auto mb-4"
          loading="lazy"
        />

        {/* 🟣 نام ابزار */}
        <h3 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
          {tool.name}
        </h3>

        {/* توضیح خلاصه */}
        <p className="text-sm text-gray-300 mt-2 line-clamp-3">
          {tool.description}
        </p>

        {/* برچسب دسته‌بندی */}
        <span className="text-xs mt-3 inline-block bg-purple-700 bg-opacity-20 text-purple-300 px-3 py-1 rounded-full">
          {tool.category}
        </span>

        {/* دکمه مقایسه */}
        <button
          className={`block w-full mt-4 py-2 px-4 text-sm font-semibold rounded-full transition ${
            isCompared
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCompareToggle(tool.id);
          }}
        >
          {isCompared ? "حذف از مقایسه" : "افزودن به مقایسه"}
        </button>

        {/* ابزار مدیریتی برای ادمین */}
        {userRole === "admin" && (
          <div className="flex justify-center gap-4 text-xs text-gray-400 mt-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert("ویرایش ابزار (در حال توسعه)");
              }}
              className="hover:text-blue-400"
            >
              ویرایش
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert("حذف ابزار (در حال توسعه)");
              }}
              className="hover:text-red-400"
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
