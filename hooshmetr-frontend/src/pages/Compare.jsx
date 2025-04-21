// Compare.jsx
// 📊 نمایش ابزارهای انتخاب‌شده برای مقایسه ویژگی به ویژگی

import { useEffect, useState } from "react";
import { getTools } from "@/api/tools";
import { useCompare } from "@/context/CompareContext"; // 🔁 استفاده از Context

function Compare() {
  const [tools, setTools] = useState([]);

  const { compareList } = useCompare(); // 🟪 لیست ابزارهای انتخاب‌شده از کانتکست

  // 📥 دریافت ابزارها از API فرضی
  useEffect(() => {
    const fetch = async () => {
      const data = await getTools();
      setTools(data);
    };
    fetch();
  }, []);

  // 🎯 فقط ابزارهایی که در لیست مقایسه هستن نمایش داده بشه
  const compared = tools.filter((tool) => compareList.includes(tool.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">
        مقایسه ابزارهای هوش مصنوعی
      </h2>

      {/* 📊 جدول مقایسه فقط وقتی ابزار کافی انتخاب شده */}
      {compared.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-center">
            <thead className="bg-gray-100 font-bold">
              <tr>
                <th className="p-2">ویژگی</th>
                {compared.map((tool) => (
                  <th key={tool.id} className="p-2">
                    {tool.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium p-2">پشتیبانی فارسی</td>
                {compared.map((tool) => (
                  <td key={tool.id}>{tool.supports_farsi ? "✅" : "❌"}</td>
                ))}
              </tr>
              <tr>
                <td className="font-medium p-2">چت‌بات</td>
                {compared.map((tool) => (
                  <td key={tool.id}>{tool.has_chatbot ? "🤖" : "—"}</td>
                ))}
              </tr>
              <tr>
                <td className="font-medium p-2">نسخه دسکتاپ</td>
                {compared.map((tool) => (
                  <td key={tool.id}>{tool.desktop_version ? "🖥" : "—"}</td>
                ))}
              </tr>
              <tr>
                <td className="font-medium p-2">زبان‌ها</td>
                {compared.map((tool) => (
                  <td key={tool.id}>
                    {tool.multi_language_support
                      ? "🌐 چند زبانه"
                      : "فقط انگلیسی"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-medium p-2">وضعیت در ایران</td>
                {compared.map((tool) => (
                  <td key={tool.id}>
                    {tool.is_filtered ? "🚫 فیلتر" : "✅ آزاد"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-medium p-2">نوع لایسنس</td>
                {compared.map((tool) => (
                  <td key={tool.id}>
                    {tool.license_type === "free"
                      ? "رایگان"
                      : tool.license_type === "paid"
                      ? "پولی"
                      : "فریمیوم"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          لطفاً حداقل ۲ ابزار برای مقایسه انتخاب کنید.
        </div>
      )}
    </div>
  );
}

export default Compare;
