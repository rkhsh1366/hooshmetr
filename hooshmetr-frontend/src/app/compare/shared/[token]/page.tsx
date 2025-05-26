"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaCheck, FaTimes, FaExternalLinkAlt, FaCopy } from "react-icons/fa";
import { comparisonService } from "@/services/comparisonService";
import { Comparison } from "@/types/comparison";
import { Button } from "@/components/ui/Button";

export default function SharedComparisonPage() {
  const { token } = useParams();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // دریافت مقایسه با توکن اشتراک‌گذاری
  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const data = await comparisonService.getSharedComparison(
          token as string
        );
        setComparison(data);
      } catch (error) {
        console.error("Error fetching shared comparison:", error);
        setError("مقایسه مورد نظر یافت نشد یا دیگر به اشتراک گذاشته نمی‌شود.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchComparison();
    }
  }, [token]);

  // کپی لینک
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR").format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">خطا در بارگذاری مقایسه</h1>
        <p className="mb-6">{error}</p>
        <Link href="/compare">
          <Button>ایجاد مقایسه جدید</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{comparison.title}</h1>
            <p className="text-gray-500 text-sm">
              به اشتراک گذاشته شده در {formatDate(comparison.created_at)} توسط{" "}
              {comparison.user?.display_name || "کاربر هوش‌متر"}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex">
            <Button onClick={copyLink} variant="outline" className="ml-2">
              <FaCopy className="ml-2" />
              {copied ? "کپی شد!" : "کپی لینک"}
            </Button>

            <Link href="/compare">
              <Button>مقایسه جدید</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* جدول مقایسه */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 overflow-x-auto">
        <h2 className="text-xl font-bold mb-6">جدول مقایسه</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-3 text-right">ویژگی</th>
              {comparison.tools.map((tool) => (
                <th
                  key={tool.id}
                  className="border p-3 text-center min-w-[200px]"
                >
                  {tool.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ردیف تصویر */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">تصویر</td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  <div className="flex justify-center">
                    {tool.image_url ? (
                      <div className="relative w-24 h-24">
                        <Image
                          src={tool.image_url}
                          alt={tool.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">بدون تصویر</span>
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* ردیف توضیحات */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">توضیحات</td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3">
                  <p className="line-clamp-3">
                    {tool.description || "توضیحاتی ثبت نشده است."}
                  </p>
                </td>
              ))}
            </tr>

            {/* ردیف امتیاز */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">
                امتیاز کاربران
              </td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-lg font-bold ml-1">
                      {tool.average_rating.toFixed(1)}
                    </span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-gray-500 mr-1">
                      ({tool.review_count} نظر)
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* ردیف قیمت */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">قیمت</td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  <span
                    className={
                      tool.is_free ? "text-green-600" : "text-blue-600"
                    }
                  >
                    {tool.is_free ? "رایگان" : "پولی"}
                  </span>
                  {tool.pricing_info && (
                    <p className="text-gray-500 text-sm mt-1">
                      {tool.pricing_info}
                    </p>
                  )}
                </td>
              ))}
            </tr>

            {/* ردیف پشتیبانی از فارسی */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">
                پشتیبانی از فارسی
              </td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  {tool.supports_farsi ? (
                    <span className="text-green-600 flex items-center justify-center">
                      <FaCheck className="ml-1" /> دارد
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center justify-center">
                      <FaTimes className="ml-1" /> ندارد
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* ردیف تحریم */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">تحریم ایران</td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  {tool.is_sanctioned ? (
                    <span className="text-red-600 flex items-center justify-center">
                      <FaCheck className="ml-1" /> دارد
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center justify-center">
                      <FaTimes className="ml-1" /> ندارد
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* ردیف API */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">API</td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  {tool.api_available ? (
                    <span className="text-green-600 flex items-center justify-center">
                      <FaCheck className="ml-1" /> دارد
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center justify-center">
                      <FaTimes className="ml-1" /> ندارد
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* ردیف وب‌سایت */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">وب‌سایت</td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3 text-center">
                  {tool.website ? (
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center justify-center"
                    >
                      مشاهده <FaExternalLinkAlt className="mr-1 text-xs" />
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* ردیف دسته‌بندی */}
            <tr>
              <td className="border p-3 bg-gray-50 font-medium">
                دسته‌بندی‌ها
              </td>
              {comparison.tools.map((tool) => (
                <td key={tool.id} className="border p-3">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {tool.categories.map((category) => (
                      <span
                        key={category.id}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* لینک‌های ابزارها */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">مشاهده جزئیات ابزارها</h2>
        <div className="flex flex-wrap gap-4">
          {comparison.tools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <Button variant="outline">مشاهده {tool.name}</Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
