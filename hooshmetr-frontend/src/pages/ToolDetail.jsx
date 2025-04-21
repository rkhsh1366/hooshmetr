// ToolDetail.jsx
// 📄 صفحه نمایش کامل مشخصات یک ابزار هوش مصنوعی

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTools } from "@/api/tools"; // فرض بر اینه ابزارها رو لوکالی یا API می‌گیریم
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

function ToolDetail() {
  const { id } = useParams(); // گرفتن آیدی از URL
  const [tool, setTool] = useState(null);

  // 🔄 فلگ برای رفرش کردن لیست نظرات بعد از ثبت نظر
  const [refreshReviews, setRefreshReviews] = useState(false);

  useEffect(() => {
    const fetchTool = async () => {
      const data = await getTools(); // گرفتن کل لیست ابزارها
      const found = data.find((t) => t.id.toString() === id);
      setTool(found);
    };
    fetchTool();
  }, [id]);

  if (!tool)
    return (
      <div className="text-center py-10 text-gray-500">در حال بارگذاری...</div>
    );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">{tool.name}</h1>

      <div className="bg-white rounded-xl p-6 shadow-md mb-6 space-y-4">
        {/* لوگو یا تصویر ابزار */}
        {tool.logo && (
          <img
            src={tool.logo}
            alt={tool.name}
            className="w-24 h-24 object-contain mb-3 mx-auto"
          />
        )}

        <p className="text-gray-700 leading-relaxed">{tool.description}</p>

        {/* دسته‌بندی‌ها */}
        <div className="text-sm text-gray-500">
          <strong>دسته‌بندی:</strong>{" "}
          {tool.categories?.map((cat) => cat).join("، ") || "—"}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div>📌 پشتیبانی از فارسی: {tool.supports_farsi ? "✅" : "❌"}</div>
          <div>🤖 چت‌بات: {tool.has_chatbot ? "✅" : "—"}</div>
          <div>🖥 نسخه دسکتاپ: {tool.desktop_version ? "✅" : "—"}</div>
          <div>🌐 چند زبانه: {tool.multi_language_support ? "✅" : "—"}</div>
          <div>🚫 فیلتر در ایران: {tool.is_filtered ? "بله" : "خیر"}</div>
          <div>💳 نوع لایسنس: {tool.license_type}</div>
        </div>

        <a
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-purple-600 text-white py-2 rounded mt-6 hover:bg-purple-700"
        >
          ورود به سایت ابزار
        </a>
      </div>

      {/* ⭐️ فرم ارسال نظر و امتیاز */}
      <ReviewForm
        toolId={tool.id}
        onReviewSubmitted={() => setRefreshReviews((prev) => !prev)}
      />

      <ReviewList
        toolId={tool.id}
        refresh={refreshReviews}
        onReviewSubmitted={() => setRefreshReviews((prev) => !prev)}
      />
    </div>
  );
}

export default ToolDetail;
