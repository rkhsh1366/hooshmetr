"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaExternalLinkAlt,
  FaThumbsUp,
  FaThumbsDown,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toolService } from "@/services/toolService";
import { reviewService } from "@/services/reviewService";
import { Tool } from "@/types/tool";
import { ToolReview } from "@/types/review";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ToolDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<ToolReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">(
    "overview"
  );
  const [userReview, setUserReview] = useState<ToolReview | null>(null);

  // دریافت اطلاعات ابزار
  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true);
        const data = await toolService.getToolBySlug(slug as string);
        setTool(data);
      } catch (error) {
        console.error("Error fetching tool:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTool();
    }
  }, [slug]);

  // دریافت نظرات ابزار
  useEffect(() => {
    const fetchReviews = async () => {
      if (!tool) return;

      try {
        setReviewsLoading(true);
        const data = await reviewService.getToolReviews(tool.id);
        setReviews(data.results);

        // بررسی نظر کاربر فعلی
        if (isAuthenticated && user) {
          const userReviewData = data.results.find(
            (review: ToolReview) => review.user?.id === user.id
          );
          setUserReview(userReviewData || null);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (tool) {
      fetchReviews();
    }
  }, [tool, isAuthenticated, user]);

  // تابع برای مدیریت تغییر واکنش‌ها
  const handleReactionChange = (
    reviewId: number,
    reactionType: "like" | "dislike" | null
  ) => {
    setReviews(
      reviews.map((r) => {
        if (r.id === reviewId) {
          const newReview = { ...r };
          const currentReaction = r.user_reaction;

          if (currentReaction === reactionType) {
            // حذف reaction
            newReview.user_reaction = null;
            newReview.positive_reactions_count = Math.max(
              0,
              (r.positive_reactions_count || 0) -
                (reactionType === "like" ? 1 : 0)
            );
            newReview.negative_reactions_count = Math.max(
              0,
              (r.negative_reactions_count || 0) -
                (reactionType === "dislike" ? 1 : 0)
            );
          } else if (currentReaction && reactionType) {
            // تغییر reaction
            newReview.user_reaction = reactionType;
            newReview.positive_reactions_count = Math.max(
              0,
              (r.positive_reactions_count || 0) +
                (currentReaction === "like" ? -1 : 0) +
                (reactionType === "like" ? 1 : 0)
            );
            newReview.negative_reactions_count = Math.max(
              0,
              (r.negative_reactions_count || 0) +
                (currentReaction === "dislike" ? -1 : 0) +
                (reactionType === "dislike" ? 1 : 0)
            );
          } else if (!currentReaction && reactionType) {
            // اضافه کردن reaction جدید
            newReview.user_reaction = reactionType;
            newReview.positive_reactions_count =
              (r.positive_reactions_count || 0) +
              (reactionType === "like" ? 1 : 0);
            newReview.negative_reactions_count =
              (r.negative_reactions_count || 0) +
              (reactionType === "dislike" ? 1 : 0);
          }

          return newReview;
        }
        return r;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">ابزار یافت نشد</h1>
        <p className="mb-6">ابزار مورد نظر شما یافت نشد یا حذف شده است.</p>
        <Link href="/tools">
          <Button>بازگشت به لیست ابزارها</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* هدر ابزار */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex-shrink-0">
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
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
            </div>
          </div>

          <div className="md:w-3/4">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{tool.name}</h1>
              <div className="flex items-center">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center">
                  <span className="text-xl font-bold ml-1">
                    {tool.average_rating.toFixed(1)}
                  </span>
                  <FaStar />
                </div>
                <span className="text-gray-500 mr-2">
                  {tool.review_count} نظر
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tool.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/tools?category=${category.slug}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <p className="text-gray-700 mb-6">
              {tool.description || "توضیحاتی برای این ابزار ثبت نشده است."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <span className="ml-2">قیمت:</span>
                <span
                  className={tool.is_free ? "text-green-600" : "text-blue-600"}
                >
                  {tool.is_free ? "رایگان" : "پولی"}
                </span>
                {tool.pricing_info && (
                  <span className="text-gray-500 mr-2">
                    ({tool.pricing_info})
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="ml-2">پشتیبانی از فارسی:</span>
                {tool.supports_farsi ? (
                  <span className="text-green-600 flex items-center">
                    <FaCheck className="ml-1" /> دارد
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <FaTimes className="ml-1" /> ندارد
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="ml-2">تحریم ایران:</span>
                {tool.is_sanctioned ? (
                  <span className="text-red-600 flex items-center">
                    <FaCheck className="ml-1" /> دارد
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <FaTimes className="ml-1" /> ندارد
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="ml-2">API:</span>
                {tool.api_available ? (
                  <span className="text-green-600 flex items-center">
                    <FaCheck className="ml-1" /> دارد
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <FaTimes className="ml-1" /> ندارد
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {tool.website && (
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center hover:bg-blue-700 transition-colors"
                >
                  مشاهده وب‌سایت <FaExternalLinkAlt className="mr-2" />
                </a>
              )}

              <Link
                href={`/compare?tools=${tool.slug}`}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                افزودن به مقایسه
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              معرفی و ویژگی‌ها
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              نظرات ({tool.review_count})
            </button>
          </nav>
        </div>
      </div>

      {/* محتوای تب */}
      <div className="mb-8">
        {activeTab === "overview" ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">ویژگی‌های برجسته</h2>
            {tool.highlight_features ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: tool.highlight_features }}
              />
            ) : (
              <p className="text-gray-500">
                ویژگی برجسته‌ای برای این ابزار ثبت نشده است.
              </p>
            )}

            {/* خلاصه نظرات */}
            {tool.review_summary && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">خلاصه نظرات کاربران</h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="mb-4">
                    {tool.review_summary.summary ||
                      "خلاصه نظرات در دسترس نیست."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-green-600 mb-2">
                        نقاط قوت
                      </h3>
                      <div className="bg-white p-3 rounded-md">
                        {tool.review_summary.pros_summary ||
                          "نقاط قوتی ثبت نشده است."}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-red-600 mb-2">نقاط ضعف</h3>
                      <div className="bg-white p-3 rounded-md">
                        {tool.review_summary.cons_summary ||
                          "نقاط ضعفی ثبت نشده است."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* تگ‌ها */}
            {tool.tags.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">تگ‌ها</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tools?tag=${tag.slug}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* تکنولوژی‌ها */}
            {tool.technologies.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">تکنولوژی‌ها</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.technologies.map((tech) => (
                    <div
                      key={tech.id}
                      className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tech.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* فرم ثبت نظر */}
            {isAuthenticated ? (
              <ReviewForm
                toolId={tool.id}
                userReview={userReview}
                onReviewSubmitted={(newReview) => {
                  if (userReview) {
                    setReviews(
                      reviews.map((r) =>
                        r.id === newReview.id ? newReview : r
                      )
                    );
                  } else {
                    setReviews([newReview, ...reviews]);
                  }
                  setUserReview(newReview);
                }}
              />
            ) : (
              <Card className="mb-6">
                <CardContent className="p-6 text-center">
                  <p className="mb-4">
                    برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.
                  </p>
                  <Link href="/login">
                    <Button>ورود / ثبت‌نام</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* لیست نظرات */}
            <h2 className="text-xl font-bold mb-4">نظرات کاربران</h2>

            {reviewsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p>
                  هنوز نظری برای این ابزار ثبت نشده است. اولین نفری باشید که نظر
                  می‌دهید!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    onReactionChanged={handleReactionChange}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// کامپوننت فرم ثبت نظر
interface ReviewFormProps {
  toolId: number;
  userReview: ToolReview | null;
  onReviewSubmitted: (review: ToolReview) => void;
}

function ReviewForm({
  toolId,
  userReview,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(userReview?.rating || 5);
  const [content, setContent] = useState(userReview?.content || "");
  const [pros, setPros] = useState(userReview?.pros || "");
  const [cons, setCons] = useState(userReview?.cons || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      const reviewData = {
        tool_id: toolId,
        rating,
        content,
        pros,
        cons,
      };

      let response;

      if (userReview) {
        // به‌روزرسانی نظر موجود
        response = await reviewService.updateReview(userReview.id, {
          rating,
          content,
          pros,
          cons,
        });
      } else {
        // ایجاد نظر جدید
        response = await reviewService.createReview(reviewData);
      }

      onReviewSubmitted(response);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("خطا در ثبت نظر. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{userReview ? "ویرایش نظر شما" : "ثبت نظر جدید"}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              امتیاز شما
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl ml-1 focus:outline-none"
                >
                  <FaStar
                    className={
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }
                  />
                </button>
              ))}
              <span className="mr-2 text-gray-600">{rating} از 5</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نظر شما
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="نظر خود را درباره این ابزار بنویسید..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نقاط قوت
              </label>
              <textarea
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="نقاط قوت ابزار را بنویسید..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نقاط ضعف
              </label>
              <textarea
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="نقاط ضعف ابزار را بنویسید..."
              ></textarea>
            </div>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            {userReview ? "به‌روزرسانی نظر" : "ثبت نظر"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// کامپوننت کارت نظر
interface ReviewCardProps {
  review: ToolReview;
  currentUserId?: number;
  onReactionChanged: (
    reviewId: number,
    reactionType: "like" | "dislike" | null
  ) => void;
}

function ReviewCard({
  review,
  currentUserId,
  onReactionChanged,
}: ReviewCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReaction = async (reactionType: "like" | "dislike") => {
    if (!currentUserId || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // اگر کاربر قبلاً همین واکنش را داده بود، واکنش را حذف می‌کنیم
      if (review.user_reaction === reactionType) {
        await reviewService.deleteReaction(review.id);
        onReactionChanged(review.id, null);
      }
      // اگر کاربر قبلاً واکنش دیگری داده بود، واکنش را به‌روزرسانی می‌کنیم
      else if (review.user_reaction) {
        await reviewService.updateReaction(review.id, reactionType);
        onReactionChanged(review.id, reactionType);
      }
      // اگر کاربر قبلاً واکنشی نداده بود، واکنش جدید ایجاد می‌کنیم
      else {
        await reviewService.addReaction(review.id, reactionType);
        onReactionChanged(review.id, reactionType);
      }
    } catch (err) {
      console.error("Error handling reaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR").format(date);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold mr-3">
              {review.user?.display_name?.[0] || "ک"}
            </div>
            <div>
              <div className="font-medium">
                {review.user?.display_name || "کاربر هوش‌متر"}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={
                  star <= review.rating ? "text-yellow-400" : "text-gray-300"
                }
              />
            ))}
          </div>
        </div>

        {review.content && (
          <div className="mb-4">
            <p className="text-gray-700">{review.content}</p>
          </div>
        )}

        {(review.pros || review.cons) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {review.pros && (
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-1">
                  نقاط قوت
                </h4>
                <p className="text-sm bg-green-50 p-2 rounded-md">
                  {review.pros}
                </p>
              </div>
            )}

            {review.cons && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-1">
                  نقاط ضعف
                </h4>
                <p className="text-sm bg-red-50 p-2 rounded-md">
                  {review.cons}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end mt-2">
          <button
            onClick={() => handleReaction("like")}
            disabled={!currentUserId || isSubmitting}
            className={`flex items-center ml-4 ${
              !currentUserId ? "opacity-50 cursor-not-allowed" : ""
            } ${
              review.user_reaction === "like"
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            <FaThumbsUp className="ml-1" />
            <span>{review.positive_reactions_count || 0}</span>
          </button>

          <button
            onClick={() => handleReaction("dislike")}
            disabled={!currentUserId || isSubmitting}
            className={`flex items-center ${
              !currentUserId ? "opacity-50 cursor-not-allowed" : ""
            } ${
              review.user_reaction === "dislike"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            <FaThumbsDown className="ml-1" />
            <span>{review.negative_reactions_count || 0}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
