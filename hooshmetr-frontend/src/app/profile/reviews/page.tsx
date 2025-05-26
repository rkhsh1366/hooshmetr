"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { reviewService } from "@/services/reviewService";
import { ToolReview } from "@/types/review";
import { Button } from "@/components/ui/Button";

export default function UserReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<ToolReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // بررسی احراز هویت و دریافت نظرات
  useEffect(() => {
    const fetchReviews = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login?redirect=/profile/reviews");
        return;
      }

      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await reviewService.getUserReviews(page);
          setReviews(response.results);
          setTotalPages(response.pages);
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setError("خطا در دریافت نظرات. لطفاً دوباره تلاش کنید.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReviews();
  }, [authLoading, isAuthenticated, router, page]);

  // حذف نظر
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) {
      return;
    }

    try {
      setIsDeleting(true);
      await reviewService.deleteReview(reviewId);
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("خطا در حذف نظر. لطفاً دوباره تلاش کنید.");
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

  // نمایش امتیاز
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="mr-1 text-gray-600">{rating}/5</span>
      </div>
    );
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
        <h1 className="text-2xl md:text-3xl font-bold">نظرات من</h1>
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

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-4">هنوز نظری ثبت نکرده‌اید</h2>
          <p className="text-gray-600 mb-6">
            شما هنوز برای هیچ ابزاری نظر یا امتیازی ثبت نکرده‌اید. با مرور
            ابزارها و ثبت نظرات خود، به دیگران در انتخاب بهتر کمک کنید.
          </p>
          <Link href="/tools">
            <Button>مشاهده ابزارها</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="relative w-12 h-12 ml-4">
                      {review.tool?.image_url ? (
                        <Image
                          src={review.tool.image_url}
                          alt={review.tool?.name || ""}
                          fill
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                          {review.tool?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">
                        <Link
                          href={`/tools/${review.tool?.slug}`}
                          className="hover:text-blue-600"
                        >
                          {review.tool?.name}
                        </Link>
                      </h3>
                      <div className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "fa-IR"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {renderRating(review.rating)}
                  </div>
                </div>

                {review.content && (
                  <div className="mb-4 text-gray-700">{review.content}</div>
                )}

                {(review.pros || review.cons) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <h4 className="font-medium text-green-800 mb-2">
                          نقاط قوت
                        </h4>
                        <p className="text-sm text-gray-700">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="bg-red-50 p-3 rounded-md">
                        <h4 className="font-medium text-red-800 mb-2">
                          نقاط ضعف
                        </h4>
                        <p className="text-sm text-gray-700">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Link
                    href={`/tools/${review.tool?.slug}/review/edit/${review.id}`}
                  >
                    <Button variant="outline" size="sm" rightIcon={<FaEdit />}>
                      ویرایش
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
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
