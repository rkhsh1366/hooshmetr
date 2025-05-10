import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTools } from "@/api/tools";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

function ToolDetail() {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [refreshReviews, setRefreshReviews] = useState(false);

  useEffect(() => {
    const fetchTool = async () => {
      const data = await getTools();
      const found = data.find((t) => t.id.toString() === id);
      setTool(found);
    };
    fetchTool();
  }, [id]);

  if (!tool)
    return (
      <div className="text-center py-16 text-gray-400 text-lg">
        در حال بارگذاری ابزار...
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
      {/* 🟪 معرفی ابزار */}
      <section className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl shadow-lg mb-10">
        <div className="flex flex-col items-center text-center">
          <img
            src={tool.image || tool.logo}
            alt={tool.name}
            className="w-24 h-24 object-contain mb-4"
          />
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            {tool.name}
          </h1>
          <p className="text-gray-300 mb-4 leading-relaxed">
            {tool.description}
          </p>

          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
          >
            رفتن به سایت ابزار
          </a>
        </div>
      </section>

      {/* 🔍 ویژگی‌ها */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-6 rounded-xl mb-10">
        <div>
          📌 پشتیبانی فارسی: {tool.supports_farsi ? "✅ دارد" : "❌ ندارد"}
        </div>
        <div>🤖 چت‌بات: {tool.has_chatbot ? "✅ دارد" : "—"}</div>
        <div>🖥 نسخه دسکتاپ: {tool.desktop_version ? "✅ دارد" : "—"}</div>
        <div>
          🌐 چندزبانه: {tool.multi_language_support ? "✅ بله" : "فقط انگلیسی"}
        </div>
        <div>🚫 فیلتر در ایران: {tool.is_filtered ? "بله" : "خیر"}</div>
        <div>💳 نوع لایسنس: {tool.license_type}</div>
      </section>

      {/* 🔘 دسته‌بندی */}
      <div className="text-sm text-gray-400 mb-10">
        <strong>دسته‌بندی:</strong> {tool.categories?.join("، ") || "—"}
      </div>

      {/* ⭐️ نظرات و امتیاز */}
      <section className="bg-gray-900 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-yellow-300">
          ثبت نظر و امتیاز
        </h2>
        <ReviewForm
          toolId={tool.id}
          onReviewSubmitted={() => setRefreshReviews((prev) => !prev)}
        />
        <ReviewList
          toolId={tool.id}
          refresh={refreshReviews}
          onReviewSubmitted={() => setRefreshReviews((prev) => !prev)}
        />
      </section>
    </div>
  );
}

export default ToolDetail;
