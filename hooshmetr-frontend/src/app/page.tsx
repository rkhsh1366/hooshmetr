"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaArrowLeft,
  FaStar,
  FaEye,
  FaCommentAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toolService } from "@/services/toolService";
import { blogService } from "@/services/blogService";
import { Tool } from "@/types/tool";
import { BlogPost } from "@/types/blog";
import { Category } from "@/types/tool";

export default function HomePage() {
  const [popularTools, setPopularTools] = useState<Tool[]>([]);
  const [newTools, setNewTools] = useState<Tool[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // دریافت ابزارهای محبوب
        const popularToolsResponse = await toolService.getTools({
          sort_by: "rating",
          sort_order: "desc",
          limit: 8,
        });
        setPopularTools(popularToolsResponse.results);

        // دریافت ابزارهای جدید
        const newToolsResponse = await toolService.getTools({
          sort_by: "newest",
          limit: 4,
        });
        setNewTools(newToolsResponse.results);

        // دریافت مقالات ویژه
        const featuredPostsResponse = await blogService.getBlogPosts({
          sort_by: "popular",
          limit: 3,
        });
        setFeaturedPosts(featuredPostsResponse.results);

        // دریافت دسته‌بندی‌ها
        const categoriesResponse = await toolService.getCategories({
          limit: 8,
        });
        setCategories(categoriesResponse.results);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  };

  return (
    <div>
      {/* بخش هدر و جستجو */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            مقایسه و انتخاب بهترین ابزارهای هوش مصنوعی
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            هوش‌متر، مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران
            فارسی‌زبان
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="جستجوی ابزارهای هوش مصنوعی..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FaSearch className="text-gray-400" />}
              className="py-3 px-5 text-lg"
            />
            <Button
              type="submit"
              className="absolute left-1 top-1 h-[calc(100%-8px)]"
            >
              جستجو
            </Button>
          </form>
        </div>
      </section>

      {/* دسته‌بندی‌ها */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">دسته‌بندی‌های ابزارها</h2>
            <Link
              href="/tools"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              مشاهده همه
              <FaArrowLeft className="mr-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/tools?category=${category.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center"
                >
                  <div className="h-16 w-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    {category.image_url ? (
                      <div className="relative h-10 w-10">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl text-blue-600">
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.tool_count} ابزار
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ابزارهای محبوب */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">محبوب‌ترین ابزارها</h2>
            <Link
              href="/tools?sort=rating"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              مشاهده همه
              <FaArrowLeft className="mr-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="tool-card"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    {tool.image_url ? (
                      <Image
                        src={tool.image_url}
                        alt={tool.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <span className="text-2xl font-bold">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tool.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{tool.average_rating.toFixed(1)}</span>
                      </div>

                      <div className="flex items-center">
                        <FaCommentAlt className="text-gray-400 mr-1" />
                        <span>{tool.review_count}</span>
                      </div>

                      <div className="flex items-center">
                        <FaEye className="text-gray-400 mr-1" />
                        <span>{tool.view_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* بخش مقایسه */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                ابزارهای هوش مصنوعی را با هم مقایسه کنید
              </h2>
              <p className="text-gray-600 mb-6">
                با استفاده از امکان مقایسه هوش‌متر، می‌توانید ویژگی‌های ابزارهای
                مختلف هوش مصنوعی را کنار هم ببینید و بهترین انتخاب را برای
                نیازهای خود داشته باشید.
              </p>
              <Link href="/compare">
                <Button rightIcon={<FaExchangeAlt />}>
                  شروع مقایسه ابزارها
                </Button>
              </Link>
            </div>

            <div className="md:w-1/2 md:pr-8">
              <div className="bg-white rounded-lg shadow-md p-6 relative">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 border border-gray-200 rounded-md p-3">
                    <h4 className="font-bold mb-2">ChatGPT</h4>
                    <div className="text-sm text-gray-600 mb-1">
                      امتیاز: 4.8/5
                    </div>
                    <div className="text-sm text-gray-600">نظرات: 1240</div>
                  </div>

                  <div className="flex-1 border border-gray-200 rounded-md p-3">
                    <h4 className="font-bold mb-2">Claude</h4>
                    <div className="text-sm text-gray-600 mb-1">
                      امتیاز: 4.6/5
                    </div>
                    <div className="text-sm text-gray-600">نظرات: 856</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-1/3 font-medium">پشتیبانی از فارسی</div>
                    <div className="w-1/3 text-center text-green-600">دارد</div>
                    <div className="w-1/3 text-center text-green-600">دارد</div>
                  </div>

                  <div className="flex">
                    <div className="w-1/3 font-medium">نسخه رایگان</div>
                    <div className="w-1/3 text-center text-green-600">دارد</div>
                    <div className="w-1/3 text-center text-green-600">دارد</div>
                  </div>

                  <div className="flex">
                    <div className="w-1/3 font-medium">API</div>
                    <div className="w-1/3 text-center text-green-600">دارد</div>
                    <div className="w-1/3 text-center text-red-600">ندارد</div>
                  </div>
                </div>

                <div className="absolute -top-4 -left-4 bg-yellow-400 text-xs text-gray-800 px-2 py-1 rounded-md">
                  نمونه
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ابزارهای جدید */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">جدیدترین ابزارها</h2>
            <Link
              href="/tools?sort=newest"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              مشاهده همه
              <FaArrowLeft className="mr-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="tool-card"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    {tool.image_url ? (
                      <Image
                        src={tool.image_url}
                        alt={tool.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <span className="text-2xl font-bold">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        جدید
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tool.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{tool.average_rating.toFixed(1)}</span>
                      </div>

                      <div className="flex items-center">
                        <FaCommentAlt className="text-gray-400 mr-1" />
                        <span>{tool.review_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* مقالات وبلاگ */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">آخرین مقالات</h2>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              مشاهده همه
              <FaArrowLeft className="mr-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <span className="text-2xl font-bold">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.summary}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        {post.author?.display_name ||
                          post.author?.first_name ||
                          "هوش‌متر"}
                      </div>

                      <div>
                        {new Date(
                          post.published_at || post.created_at
                        ).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* بخش تماس با ما */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            با ما در ارتباط باشید
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            اگر سوالی دارید یا پیشنهادی برای بهبود هوش‌متر دارید، خوشحال می‌شویم
            با ما در ارتباط باشید.
          </p>
          <Link href="/contact">
            <Button color="secondary">تماس با ما</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
