"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FaCalendarAlt, FaEye } from "react-icons/fa";
import { blogService } from "@/services/blogService";
import { BlogPost, BlogCategory, BlogTag } from "@/types/blog";
import { Card } from "@/components/ui/Card";

export default function BlogPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  // دریافت مقالات
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await blogService.getBlogPosts({
          search: searchQuery,
          category: selectedCategory,
          tag: selectedTag,
        });
        setPosts(response.results);
        setTotalPages(response.pages);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, categorySlug, tagSlug]);

  // دریافت دسته‌بندی‌ها و تگ‌ها
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          blogService.getCategories(),
          blogService.getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error("Error fetching categories and tags:", error);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR").format(date);
  };

  // عنوان صفحه بر اساس فیلترها
  const getPageTitle = () => {
    if (categorySlug) {
      const category = categories.find((c) => c.slug === categorySlug);
      return category ? `مقالات دسته ${category.name}` : "مقالات";
    }

    if (tagSlug) {
      const tag = tags.find((t) => t.slug === tagSlug);
      return tag ? `مقالات با برچسب ${tag.name}` : "مقالات";
    }

    return "وبلاگ هوش‌متر";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{getPageTitle()}</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* ستون اصلی */}
        <div className="md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-bold mb-2">مقاله‌ای یافت نشد</h2>
              <p className="text-gray-600">
                متأسفانه مقاله‌ای با معیارهای انتخابی شما یافت نشد.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card hover className="h-full flex flex-col">
                      <div className="relative h-48">
                        {post.featured_image ? (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                            <span className="text-gray-500">بدون تصویر</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-grow">
                        <h2 className="text-lg font-bold mb-2 line-clamp-2">
                          {post.title}
                        </h2>

                        <div className="flex text-xs text-gray-500 mb-3">
                          <div className="flex items-center ml-4">
                            <FaCalendarAlt className="ml-1" />
                            {formatDate(post.published_at || post.created_at)}
                          </div>
                          <div className="flex items-center">
                            <FaEye className="ml-1" />
                            {post.view_count} بازدید
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.summary || post.content.substring(0, 150)}
                        </p>

                        <div className="mt-auto">
                          {post.categories.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {post.categories[0].name}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* صفحه‌بندی */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded-l-md ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      قبلی
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 ${
                            p === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className={`px-3 py-1 rounded-r-md ${
                        page === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      بعدی
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* سایدبار */}
        <div className="md:w-1/4">
          {/* دسته‌بندی‌ها */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">
              دسته‌بندی‌ها
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/blog?category=${category.slug}`}
                    className={`block hover:text-blue-600 ${
                      categorySlug === category.slug
                        ? "text-blue-600 font-medium"
                        : ""
                    }`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* تگ‌ها */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">برچسب‌ها</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className={`px-3 py-1 rounded-full text-sm ${
                    tagSlug === tag.slug
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
