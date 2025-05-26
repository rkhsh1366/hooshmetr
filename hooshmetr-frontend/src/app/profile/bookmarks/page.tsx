"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar,
  FaTrash,
  FaExclamationTriangle,
  FaCommentAlt,
  FaEye,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { bookmarkService } from "@/services/bookmarkService";
import { Bookmark } from "@/types/tool";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Category, Tag } from "@/types/tool";
import { BlogCategory, BlogTag } from "@/types/blog";

export default function UserBookmarksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tools" | "blogs">("tools");

  // بررسی احراز هویت و دریافت نشان‌شده‌ها
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login?redirect=/profile/bookmarks");
        return;
      }

      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await bookmarkService.getBookmarks(activeTab, page);
          setBookmarks(response.results);
          setTotalPages(response.pages);
        } catch (error) {
          console.error("Error fetching bookmarks:", error);
          setError("خطا در دریافت نشان‌شده‌ها. لطفاً دوباره تلاش کنید.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookmarks();
  }, [authLoading, isAuthenticated, router, page, activeTab]);

  // حذف نشان‌شده
  const handleRemoveBookmark = async (bookmarkId: number) => {
    if (!confirm("آیا از حذف این نشان‌شده مطمئن هستید؟")) {
      return;
    }

    try {
      setIsDeleting(true);
      await bookmarkService.removeBookmark(bookmarkId);
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
      alert("خطا در حذف نشان‌شده. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsDeleting(false);
    }
  };

  // تغییر صفحه
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // تغییر تب
  const handleTabChange = (value: string) => {
    setActiveTab(value as "tools" | "blogs");
    setPage(1);
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // ریدایرکت در useEffect انجام می‌شود
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">نشان‌شده‌های من</h1>
        <Link href="/profile">
          <Button variant="outline">بازگشت به پروفایل</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="text-red-500 ml-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="p-4 border-b border-gray-200">
            <TabsList>
              <TabsTrigger value="tools">ابزارها</TabsTrigger>
              <TabsTrigger value="blogs">مقالات</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tools">
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">
                  هیچ ابزاری نشان نشده است
                </h2>
                <p className="text-gray-600 mb-6">
                  شما هنوز هیچ ابزاری را نشان نکرده‌اید. با نشان کردن ابزارها،
                  می‌توانید به راحتی به آنها دسترسی داشته باشید.
                </p>
                <Link href="/tools">
                  <Button>مشاهده ابزارها</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bookmarks.map((bookmark) => {
                  const tool = bookmark.item;
                  return (
                    <div key={bookmark.id} className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 mb-4 md:mb-0 md:ml-6">
                          <div className="relative h-48 w-full bg-gray-100 rounded-md overflow-hidden">
                            {tool.image_url ? (
                              <Image
                                src={tool.image_url}
                                alt={tool.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <span className="text-3xl font-bold">
                                  {tool.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:w-3/4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">
                              <Link
                                href={`/tools/${tool.slug}`}
                                className="hover:text-blue-600"
                              >
                                {tool.name}
                              </Link>
                            </h3>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-400 ml-1" />
                              <span>{tool.average_rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {tool.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {tool.categories?.map((category: Category) => (
                              <Link
                                key={category.id}
                                href={`/tools?category=${category.slug}`}
                                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full hover:bg-blue-100"
                              >
                                {category.name}
                              </Link>
                            ))}

                            {tool.tags?.slice(0, 3).map((tag: Tag) => (
                              <Link
                                key={tag.id}
                                href={`/tools?tag=${tag.slug}`}
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full hover:bg-gray-200"
                              >
                                {tag.name}
                              </Link>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4 space-x-reverse text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaCommentAlt className="text-gray-400 ml-1" />
                                <span>{tool.review_count} نظر</span>
                              </div>

                              <div className="flex items-center">
                                <FaEye className="text-gray-400 ml-1" />
                                <span>{tool.view_count} بازدید</span>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveBookmark(bookmark.id)}
                              disabled={isDeleting}
                              rightIcon={<FaTrash />}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blogs">
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">
                  هیچ مقاله‌ای نشان نشده است
                </h2>
                <p className="text-gray-600 mb-6">
                  شما هنوز هیچ مقاله‌ای را نشان نکرده‌اید. با نشان کردن مقالات،
                  می‌توانید به راحتی به آنها دسترسی داشته باشید.
                </p>
                <Link href="/blog">
                  <Button>مشاهده مقالات</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bookmarks.map((bookmark) => {
                  const post = bookmark.item;
                  return (
                    <div key={bookmark.id} className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 mb-4 md:mb-0 md:ml-6">
                          <div className="relative h-48 w-full bg-gray-100 rounded-md overflow-hidden">
                            {post.featured_image ? (
                              <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <span className="text-3xl font-bold">
                                  {post.title.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:w-3/4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">
                              <Link
                                href={`/blog/${post.slug}`}
                                className="hover:text-blue-600"
                              >
                                {post.title}
                              </Link>
                            </h3>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                post.published_at || post.created_at
                              ).toLocaleDateString("fa-IR")}
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{post.summary}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.categories?.map((category: BlogCategory) => (
                              <Link
                                key={category.id}
                                href={`/blog?category=${category.slug}`}
                                className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full hover:bg-purple-100"
                              >
                                {category.name}
                              </Link>
                            ))}

                            {post.tags?.slice(0, 3).map((tag: BlogTag) => (
                              <Link
                                key={tag.id}
                                href={`/blog?tag=${tag.slug}`}
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full hover:bg-gray-200"
                              >
                                {tag.name}
                              </Link>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>
                                نویسنده:{" "}
                                {post.author?.display_name ||
                                  post.author?.first_name ||
                                  "هوش‌متر"}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveBookmark(bookmark.id)}
                              disabled={isDeleting}
                              rightIcon={<FaTrash />}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* پیمایش صفحات */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <div className="flex space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                قبلی
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
