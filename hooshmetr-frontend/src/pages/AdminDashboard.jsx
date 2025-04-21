// AdminDashboard.jsx
// 🎛️ صفحه داشبورد مدیریت با امکان جستجوی ابزار و نظرات

import { useEffect, useState } from "react";
import axios from "axios";
import AdminToolForm from "@/components/admin/AdminToolForm";

function AdminDashboard() {
  const [tools, setTools] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(""); // 🔍 جستجو بین ابزارها
  const [reviewQuery, setReviewQuery] = useState(""); // 🔍 جستجو بین نظرات

  // 🗑 حذف ابزار
  const handleDeleteTool = async (id) => {
    const confirmDel = confirm("آیا از حذف این ابزار مطمئن هستی؟");
    if (!confirmDel) return;
    try {
      await axios.delete(`/api/tools/${id}/delete/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setTools((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("خطا در حذف ابزار");
    }
  };

  // 🗑 حذف نظر
  const handleDeleteReview = async (id) => {
    const confirmDel = confirm("آیا از حذف این نظر مطمئن هستی؟");
    if (!confirmDel) return;
    try {
      await axios.delete(`/api/reviews/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("خطا در حذف نظر");
    }
  };

  // ⬇️ دریافت ابزارها و نظرات
  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
    );

  // 🎯 فیلتر ابزارها بر اساس نام یا توضیح
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(query.toLowerCase().trim())
  );

  // 🎯 فیلتر نظرات بر اساس ابزار یا محتوا
  const filteredReviews = reviews.filter((r) =>
    (r.tool_name + r.comment)
      .toLowerCase()
      .includes(reviewQuery.toLowerCase().trim())
  );
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access");

      const [toolsRes, reviewsRes] = await Promise.all([
        axios.get("/api/tools/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/reviews/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTools(toolsRes.data);
      setReviews(reviewsRes.data);
    } catch {
      alert("دسترسی ادمین نیاز است.");
    } finally {
      setLoading(false);
    }
  };

  const [editTool, setEditTool] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        🎛️ داشبورد مدیریت
      </h2>

      <AdminToolForm onCreated={fetchData} editTool={editTool} />

      {/* 📦 ابزارها */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">📦 ابزارها</h3>
          <input
            type="text"
            placeholder="جستجو ابزار..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
        </div>

        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white p-4 rounded border shadow-sm flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold">{tool.name}</h4>
                <p className="text-xs text-gray-500">{tool.license_type}</p>
              </div>
              <div className="flex gap-3 items-center text-sm">
                <a
                  href={tool.website}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  سایت
                </a>

                <button
                  onClick={() => setEditTool(tool)}
                  className="text-blue-600 hover:underline"
                >
                  ویرایش
                </button>

                <button
                  onClick={() => handleDeleteTool(tool.id)}
                  className="text-red-600 hover:underline"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 💬 نظرات کاربران */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">💬 نظرات</h3>
          <input
            type="text"
            placeholder="جستجو نظر..."
            value={reviewQuery}
            onChange={(e) => setReviewQuery(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredReviews.map((r) => (
            <div key={r.id} className="bg-gray-50 p-4 rounded border shadow-sm">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>ابزار: {r.tool_name}</span>
                <span>
                  {new Date(r.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-2">⭐ {r.rating}</div>
              <p className="text-sm text-gray-600">{r.comment}</p>
              <button
                onClick={() => handleDeleteReview(r.id)}
                className="text-sm text-red-600 hover:underline mt-2"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
