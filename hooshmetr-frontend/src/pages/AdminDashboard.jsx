import { useEffect, useState } from "react";
import axios from "axios";
import AdminToolForm from "@/components/admin/AdminToolForm";
import AdminBlogForm from "@/components/admin/AdminBlogForm"; // ✅ اضافه شده

function AdminDashboard() {
  const [tools, setTools] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [reviewQuery, setReviewQuery] = useState("");
  const [editTool, setEditTool] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center py-8 text-gray-500">در حال بارگذاری...</div>
    );

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(query.toLowerCase().trim())
  );

  const filteredReviews = reviews.filter((r) =>
    (r.tool_name + r.comment)
      .toLowerCase()
      .includes(reviewQuery.toLowerCase().trim())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        🎛️ داشبورد مدیریت
      </h2>

      {/* 📝 فرم افزودن مقاله جدید */}
      <div className="mb-12">
        <AdminBlogForm />
      </div>

      {/* 🛠️ فرم ابزار */}
      <AdminToolForm onCreated={fetchData} editTool={editTool} />

      {/* 📦 ابزارها */}
      {/* (بقیه کدها دست نخورده باقی می‌ماند...) */}

      {/* 💬 نظرات */}
      {/* (همان بخش قبلی بدون تغییر) */}
    </div>
  );
}

export default AdminDashboard;
