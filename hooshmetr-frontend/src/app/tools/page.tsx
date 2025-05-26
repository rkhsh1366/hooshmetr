"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaFilter,
  FaStar,
  FaEye,
  FaComment,
  FaExchangeAlt,
} from "react-icons/fa";
import { toolService } from "@/services/toolService";
import { Tool, Category, SortOption } from "@/types/tool";
import { Card } from "@/components/ui/Card";

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isFree, setIsFree] = useState<boolean | null>(null);
  const [supportsFarsi, setSupportsFarsi] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.NEWEST);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchQuery,
          category_ids:
            selectedCategories.length > 0 ? selectedCategories : undefined,
          is_free: isFree === null ? undefined : isFree,
          supports_farsi: supportsFarsi === null ? undefined : supportsFarsi, // این خط تغییر کرد
          sort_by: sortBy,
        };

        const data = await toolService.getTools(params);
        setTools(data.results);
      } catch (error) {
        console.error("Error fetching tools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [searchQuery, selectedCategories, isFree, supportsFarsi, sortBy]);

  // فرض کنید که ما دسته‌بندی‌ها را از API دریافت می‌کنیم
  useEffect(() => {
    // در اینجا می‌توانیم دسته‌بندی‌ها را از API دریافت کنیم
    // فعلاً از داده‌های نمونه استفاده می‌کنیم
    setCategories([
      { id: 1, name: "چت‌بات‌ها", slug: "chatbots", icon: "chat" },
      { id: 2, name: "تولید تصویر", slug: "image-generation", icon: "image" },
      {
        id: 3,
        name: "تبدیل متن به گفتار",
        slug: "text-to-speech",
        icon: "audio",
      },
      {
        id: 4,
        name: "خلاصه‌سازی متن",
        slug: "text-summarization",
        icon: "document",
      },
    ]);
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* فیلترها - نسخه موبایل */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-center"
          >
            <FaFilter className="ml-2" />
            فیلترها
          </button>

          {filtersOpen && (
            <div className="bg-white border border-gray-300 rounded-md mt-2 p-4">
              {renderFilters()}
            </div>
          )}
        </div>

        {/* فیلترها - نسخه دسکتاپ */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
            <h3 className="text-lg font-bold mb-4">فیلترها</h3>
            {renderFilters()}
          </div>
        </div>

        {/* لیست ابزارها */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {searchQuery
                ? `نتایج جستجو برای "${searchQuery}"`
                : "ابزارهای هوش مصنوعی"}
            </h1>

            <div className="flex items-center">
              <label className="text-sm ml-2">مرتب‌سازی:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm"
              >
                <option value="newest">جدیدترین</option>
                <option value="name">نام</option>
                <option value="rating">امتیاز</option>
                <option value="reviews">تعداد نظرات</option>
                <option value="views">بیشترین بازدید</option>
                <option value="comparisons">بیشترین مقایسه</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : tools.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-bold mb-2">نتیجه‌ای یافت نشد</h3>
              <p className="text-gray-600">
                لطفاً معیارهای جستجو یا فیلترها را تغییر دهید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Link href={`/tools/${tool.slug}`} key={tool.id}>
                  <Card hover className="h-full flex flex-col">
                    <div className="h-48 relative">
                      {tool.image_url ? (
                        <Image
                          src={tool.image_url}
                          alt={tool.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">بدون تصویر</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {tool.average_rating.toFixed(1)}{" "}
                        <FaStar className="inline ml-1" />
                      </div>
                    </div>

                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-bold mb-1">{tool.name}</h3>

                      <div className="mb-2 flex flex-wrap gap-1">
                        {tool.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {tool.categories.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{tool.categories.length - 2}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {tool.description ||
                          "توضیحاتی برای این ابزار ثبت نشده است."}
                      </p>

                      <div className="flex items-center text-xs text-gray-500 mt-auto">
                        <span className="flex items-center ml-3">
                          <FaEye className="ml-1" /> {tool.view_count}
                        </span>
                        <span className="flex items-center ml-3">
                          <FaComment className="ml-1" /> {tool.review_count}
                        </span>
                        <span className="flex items-center">
                          <FaExchangeAlt className="ml-1" />{" "}
                          {tool.comparison_count}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        {tool.is_free ? (
                          <span className="text-green-600 text-sm">رایگان</span>
                        ) : (
                          <span className="text-blue-600 text-sm">پولی</span>
                        )}
                      </div>
                      <div>
                        {tool.supports_farsi && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            پشتیبانی از فارسی
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderFilters() {
    return (
      <>
        <div className="mb-4">
          <h4 className="font-medium mb-2">دسته‌بندی‌ها</h4>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="ml-2"
                />
                <label htmlFor={`category-${category.id}`} className="text-sm">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">قیمت</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <input
                type="radio"
                id="price-all"
                checked={isFree === null}
                onChange={() => setIsFree(null)}
                className="ml-2"
                name="price"
              />
              <label htmlFor="price-all" className="text-sm">
                همه
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="price-free"
                checked={isFree === true}
                onChange={() => setIsFree(true)}
                className="ml-2"
                name="price"
              />
              <label htmlFor="price-free" className="text-sm">
                رایگان
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="price-paid"
                checked={isFree === false}
                onChange={() => setIsFree(false)}
                className="ml-2"
                name="price"
              />
              <label htmlFor="price-paid" className="text-sm">
                پولی
              </label>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">پشتیبانی از فارسی</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <input
                type="radio"
                id="farsi-all"
                checked={supportsFarsi === null}
                onChange={() => setSupportsFarsi(null)}
                className="ml-2"
                name="farsi"
              />
              <label htmlFor="farsi-all" className="text-sm">
                همه
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="farsi-yes"
                checked={supportsFarsi === true}
                onChange={() => setSupportsFarsi(true)}
                className="ml-2"
                name="farsi"
              />
              <label htmlFor="farsi-yes" className="text-sm">
                پشتیبانی می‌کند
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="farsi-no"
                checked={supportsFarsi === false}
                onChange={() => setSupportsFarsi(false)}
                className="ml-2"
                name="farsi"
              />
              <label htmlFor="farsi-no" className="text-sm">
                پشتیبانی نمی‌کند
              </label>
            </div>
          </div>
        </div>
      </>
    );
  }
}
