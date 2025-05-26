"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaExchangeAlt,
  FaShare,
  FaTrash,
  FaExclamationTriangle,
  FaLink,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { comparisonService } from "@/services/comparisonService";
import { Comparison } from "@/types/comparison";
import { Button } from "@/components/ui/Button";

export default function UserComparisonsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // بررسی احراز هویت و دریافت مقایسه‌ها
  useEffect(() => {
    const fetchComparisons = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login?redirect=/profile/comparisons");
        return;
      }

      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await comparisonService.getUserComparisons(page);
          setComparisons(response.results);
          setTotalPages(response.pages);
        } catch (error) {
          console.error("Error fetching comparisons:", error);
          setError("خطا در دریافت مقایسه‌ها. لطفاً دوباره تلاش کنید.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchComparisons();
  }, [authLoading, isAuthenticated, router, page]);

  // حذف مقایسه
  const handleDeleteComparison = async (comparisonId: number) => {
    if (!confirm("آیا از حذف این مقایسه مطمئن هستید؟")) {
      return;
    }

    try {
      setIsDeleting(true);
      await comparisonService.deleteComparison(comparisonId);
      setComparisons(comparisons.filter((comp) => comp.id !== comparisonId));
    } catch (error) {
      console.error("Error deleting comparison:", error);
      alert("خطا در حذف مقایسه. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsDeleting(false);
    }
  };

  // تغییر وضعیت اشتراک‌گذاری
  const handleToggleSharing = async (comparisonId: number) => {
    try {
      setIsSharing(true);
      const updatedComparison = await comparisonService.toggleSharing(
        comparisonId
      );

      setComparisons(
        comparisons.map((comp) =>
          comp.id === comparisonId ? updatedComparison : comp
        )
      );
    } catch (error) {
      console.error("Error toggling sharing:", error);
      alert("خطا در تغییر وضعیت اشتراک‌گذاری. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSharing(false);
    }
  };

  // کپی لینک اشتراک‌گذاری
  const handleCopyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/compare/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    alert("لینک اشتراک‌گذاری کپی شد.");
  };

  // تغییر صفحه
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold">مقایسه‌های من</h1>
        <div className="flex space-x-4 space-x-reverse">
          <Link href="/profile">
            <Button variant="outline">بازگشت به پروفایل</Button>
          </Link>
          <Link href="/compare">
            <Button rightIcon={<FaExchangeAlt />}>مقایسه جدید</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="text-red-500 ml-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {comparisons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-4">
            هنوز مقایسه‌ای ایجاد نکرده‌اید
          </h2>
          <p className="text-gray-600 mb-6">
            شما هنوز هیچ مقایسه‌ای بین ابزارهای هوش مصنوعی ایجاد نکرده‌اید. با
            مقایسه ابزارها، تصمیم‌گیری برای انتخاب بهترین ابزار آسان‌تر می‌شود.
          </p>
          <Link href="/compare">
            <Button rightIcon={<FaExchangeAlt />}>ایجاد مقایسه جدید</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {comparisons.map((comparison) => (
              <div key={comparison.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      {comparison.title}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {new Date(comparison.created_at).toLocaleDateString(
                        "fa-IR"
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    {comparison.shared ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        قابل اشتراک‌گذاری
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        خصوصی
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {comparison.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center bg-gray-50 rounded-md p-2"
                    >
                      <div className="relative w-8 h-8 ml-2">
                        {tool.image_url ? (
                          <Image
                            src={tool.image_url}
                            alt={tool.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                            {tool.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm">{tool.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/compare?ids=${comparison.tools
                      .map((t) => t.id)
                      .join(",")}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<FaExchangeAlt />}
                    >
                      مشاهده مقایسه
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleSharing(comparison.id)}
                    disabled={isSharing}
                    rightIcon={<FaShare />}
                  >
                    {comparison.shared ? "لغو اشتراک‌گذاری" : "اشتراک‌گذاری"}
                  </Button>

                  {comparison.shared && comparison.share_token && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyShareLink(comparison.share_token!)
                      }
                      rightIcon={<FaLink />}
                    >
                      کپی لینک
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteComparison(comparison.id)}
                    disabled={isDeleting}
                    rightIcon={<FaTrash />}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
      )}
    </div>
  );
}
