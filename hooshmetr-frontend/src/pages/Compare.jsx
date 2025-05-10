// Compare.jsx
import { useEffect, useState } from "react";
import { getTools } from "@/api/tools";
import { useCompare } from "@/context/CompareContext";
import { Link } from "react-router-dom";

function Compare() {
  const [tools, setTools] = useState([]);
  const { compareList } = useCompare();

  useEffect(() => {
    const fetch = async () => {
      const data = await getTools();
      setTools(data);
    };
    fetch();
  }, []);

  const compared = tools.filter((tool) => compareList.includes(tool.id));

  return (
    <section className="bg-gradient-to-b from-black to-gray-900 text-white min-h-screen pt-12 px-6 font-vazir">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-center text-white mb-8">
          مقایسه ابزارهای هوش مصنوعی
        </h1>

        {/* اگر ابزار کافی نیست */}
        {compared.length < 2 ? (
          <p className="text-center text-gray-400 mt-20">
            لطفاً حداقل دو ابزار را برای مقایسه انتخاب کنید.
          </p>
        ) : (
          <>
            {/* جدول مقایسه */}
            <div className="overflow-x-auto bg-gray-800 rounded-2xl shadow-lg">
              <table className="min-w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-purple-900 text-white">
                    <th className="p-4">ویژگی</th>
                    {compared.map((tool) => (
                      <th
                        key={tool.id}
                        className="p-4 border-l border-gray-700"
                      >
                        <div className="font-bold text-lg">{tool.name}</div>
                        <div className="text-yellow-400 mt-1">
                          {"⭐".repeat(Math.round(tool.user_rating || 4))}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  <CompareRow
                    title="پشتیبانی فارسی"
                    field="supports_farsi"
                    values={compared}
                  />
                  <CompareRow
                    title="چت‌بات"
                    field="has_chatbot"
                    values={compared}
                    icon="🤖"
                  />
                  <CompareRow
                    title="نسخه دسکتاپ"
                    field="desktop_version"
                    values={compared}
                    icon="🖥"
                  />
                  <CompareRow
                    title="زبان‌ها"
                    field="multi_language_support"
                    values={compared}
                    custom={(v) => (v ? "چند زبانه 🌐" : "فقط انگلیسی")}
                  />
                  <CompareRow
                    title="وضعیت در ایران"
                    field="is_filtered"
                    values={compared}
                    custom={(v) => (v ? "🚫 فیلتر" : "✅ آزاد")}
                  />
                  <CompareRow
                    title="نوع لایسنس"
                    field="license_type"
                    values={compared}
                    custom={(v) =>
                      v === "free"
                        ? "رایگان"
                        : v === "paid"
                        ? "پولی"
                        : "فریمیوم"
                    }
                  />
                </tbody>
              </table>
            </div>

            {/* موج جداکننده */}
            <svg
              className="w-full mt-[-1px]"
              viewBox="0 0 1440 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4B0082"
                fillOpacity="1"
                d="M0,64L48,69.3C96,75,192,85,288,74.7C384,64,480,32,576,32C672,32,768,64,864,74.7C960,85,1056,75,1152,69.3C1248,64,1344,64,1392,64L1440,64V100H0Z"
              />
            </svg>

            {/* CTA */}
            <div className="text-center mt-16">
              <h2 className="text-2xl font-extrabold mb-4">
                هنوز انتخاب نکردی؟
              </h2>
              <Link to="/tools">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full text-lg transition duration-300">
                  مشاهده ابزارهای بیشتر
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// کامپوننت سطر جدول برای کاهش تکرار
function CompareRow({ title, field, values, icon, custom }) {
  return (
    <tr className="border-t border-gray-700 hover:bg-gray-700/20 transition">
      <td className="p-3 font-bold text-white">{title}</td>
      {values.map((tool) => {
        const value = tool[field];
        const display = custom
          ? custom(value)
          : value
          ? icon || "✅"
          : icon
          ? "—"
          : "❌";
        return (
          <td key={tool.id} className="p-3 border-l border-gray-800">
            {display}
          </td>
        );
      })}
    </tr>
  );
}

export default Compare;
