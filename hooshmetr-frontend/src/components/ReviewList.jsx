// ReviewList.jsx
// 🗒️ نمایش لیست نظرات ثبت‌شده کاربران برای ابزار

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

/**
 * props:
 * - toolId: آیدی ابزار
 * - refresh: فلگ برای اجرا مجدد دریافت داده‌ها
 * - onReviewSubmitted: برای رفرش بعد از ارسال
 */
function ReviewList({ toolId, refresh, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ✅ استخراج یوزرنیم یا موبایل از توکن JWT
  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.username || payload.mobile || payload.user_id;
    } catch (err) {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const [reactions, setReactions] = useState({});

  // 🔽 مرتب‌سازی نظرات: جدیدترین یا محبوب‌ترین
  const [reviewSort, setReviewSort] = useState("newest");

  // 📥 گرفتن نظرات از سرور
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `/api/reviews/?tool=${toolId}${
            reviewSort === "popular" ? "&ordering=likes" : ""
          }`
        );
        setReviews(response.data);

        // 📌 واکنش‌های کاربر از API جدا نیست پس از بررسی لیست خودمون می‌سازیم
        const userReactions = {};
        response.data.forEach((r) => {
          if (r.user === currentUser && r.my_reaction) {
            userReactions[r.id] = r.my_reaction;
          }
        });
        setReactions(userReactions);
      } catch (err) {
        console.error("خطا در دریافت نظرات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [toolId, refresh, reviewSort]); // 🆕 اضافه کردن reviewSort به وابستگی‌ها

  // 🧠 محاسبه میانگین امتیاز ابزار
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  // 👥 تعداد کل نظرات (شامل اصلی + پاسخ‌ها)
  const totalComments = reviews.length;

  // 💬 فقط نظرات اصلی (برای مقایسه)
  const totalTopLevel = reviews.filter((r) => !r.parent).length;

  // 🎨 رنگ امتیاز
  const getRatingColor = (rating) => {
    if (rating <= 2) return "text-red-500";
    if (rating === 3) return "text-yellow-500";
    return "text-green-600";
  };

  // ✏️ ویرایش نظر: مقدار قبلی در فرم
  const handleEdit = (review) => {
    setReplyingToId(review.id);
    setReplyText(review.comment);
  };

  // ❌ حذف نظر
  const handleDelete = async (id) => {
    const confirmDelete = confirm("آیا مطمئنی می‌خوای این نظر رو حذف کنی؟");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/reviews/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      onReviewSubmitted?.(); // 🔄 رفرش بعد از حذف
    } catch (err) {
      alert("خطا در حذف نظر");
    }
  };

  // 📤 ارسال ریپلای یا ویرایش
  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) {
      alert("متن پاسخ نمی‌تواند خالی باشد.");
      return;
    }

    setIsSending(true);
    try {
      const isEdit = reviews.some(
        (r) => r.id === parentId && r.comment === replyText.trim()
      );

      if (isEdit) {
        // اگر متن تغییری نکرده، نیازی به ارسال نیست
        setIsSending(false);
        setReplyingToId(null);
        return;
      }

      const method = reviews.find(
        (r) => r.id === parentId && r.user === currentUser
      )
        ? "patch"
        : "post";
      const url =
        method === "patch" ? `/api/reviews/${parentId}/` : "/api/reviews/";

      await axios[method](
        url,
        {
          tool: toolId,
          comment: replyText,
          parent: method === "post" ? parentId : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setReplyText("");
      setReplyingToId(null);
      onReviewSubmitted?.();
    } catch (err) {
      alert("خطا در ارسال یا ویرایش");
    } finally {
      setIsSending(false);
    }
  };

  // 📤 ارسال ری‌اکشن (لایک یا دیسلایک)
  const handleReaction = async (reviewId, type) => {
    // 🔐 جلوگیری از رأی دادن کاربر غیرفعال
    if (!currentUser) {
      alert("برای رأی دادن لطفاً وارد حساب شوید.");
      return;
    }

    try {
      const token = localStorage.getItem("access");

      await axios.post(
        `/api/reactions/`,
        { review: reviewId, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onReviewSubmitted?.(); // 🔁 رفرش لیست بعد از رأی
      alert("ری‌اکشن ثبت شد!");
    } catch (err) {
      if (err.response?.data?.detail?.includes("آپدیت شد")) {
        alert("ری‌اکشن قبلی آپدیت شد.");
        onReviewSubmitted?.();
      } else {
        alert("خطا در ثبت ری‌اکشن.");
      }
    }
  };

  // ✅ نمایش یک نظر + ریپلای‌ها + فرم و دکمه‌ها
  const renderReview = (review, isReply = false) => (
    <motion.div
      key={review.id}
      className={`border-b pb-3 ${
        isReply ? "ml-6 border-l-2 border-purple-200 pl-4" : ""
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center">
        <span className={`text-sm font-bold ${getRatingColor(review.rating)}`}>
          ⭐ {review.rating} / 5
        </span>
        <span className="text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString("fa-IR")}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>

      {/* 🔘 دکمه‌های ری‌اکشن + شمارش */}
      <div className="flex gap-6 mt-3 text-sm text-gray-500 items-center">
        const myReaction = reactions[review.id]; // واکنش کاربر فعلی برای این
        نظر
        {/* دکمه لایک */}
        <button
          onClick={() => handleReaction(review.id, "like")}
          className={`flex items-center gap-1 transition ${
            myReaction === "like"
              ? "text-green-600 font-bold"
              : "hover:text-green-600"
          }`}
        >
          👍{" "}
          <motion.span
            key={review.like_count} // تغییر برای ری‌اکت باعث رندر مجدد
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {review.like_count}
          </motion.span>
        </button>
        {/* دکمه دیسلایک */}
        <button
          onClick={() => handleReaction(review.id, "dislike")}
          className={`flex items-center gap-1 transition ${
            myReaction === "dislike"
              ? "text-red-600 font-bold"
              : "hover:text-red-500"
          }`}
        >
          👎 <span>{review.dislike_count}</span>
        </button>
      </div>

      {/* 🎯 فقط برای نظرات اصلی دکمه پاسخ */}
      {!isReply && (
        <button
          className="text-xs text-purple-600 mt-2 hover:underline"
          onClick={() => setReplyingToId(review.id)}
        >
          پاسخ
        </button>
      )}

      {/* ✏️ و ❌ دکمه فقط برای صاحب نظر */}
      {!isReply && review.user === currentUser && (
        <div className="flex gap-2 mt-2 text-xs">
          <button
            onClick={() => handleEdit(review)}
            className="text-blue-600 hover:underline"
          >
            ویرایش
          </button>
          <button
            onClick={() => handleDelete(review.id)}
            className="text-red-600 hover:underline"
          >
            حذف
          </button>
        </div>
      )}

      {/* 📝 فرم ریپلای یا ویرایش */}
      {replyingToId === review.id && (
        <motion.div
          className="mt-3 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full border border-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none rounded px-3 py-1 text-sm transition"
            placeholder="پاسخ خود را بنویسید..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleReplySubmit(review.id)}
              className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-1 text-sm rounded disabled:opacity-50"
              disabled={isSending}
            >
              {isSending ? "در حال ارسال..." : "ارسال"}
            </button>
            <button
              onClick={() => {
                setReplyingToId(null);
                setReplyText("");
              }}
              className="text-sm text-gray-500 px-3 py-1 hover:underline"
            >
              لغو
            </button>
          </div>
        </motion.div>
      )}

      {/* 🔁 نمایش ریپلای‌ها */}
      {review.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {review.replies.map((reply) => renderReview(reply, true))}
        </div>
      )}
    </motion.div>
  );

  if (loading)
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        در حال بارگذاری نظرات...
      </div>
    );

  if (reviews.length === 0)
    return (
      <div className="text-center text-sm text-gray-400 py-4">
        هیچ نظری هنوز ثبت نشده.
      </div>
    );

  return (
    <div className="bg-white mt-8 rounded-lg shadow-md p-4 space-y-4">
      <h3 className="text-lg font-bold text-purple-700 mb-1">نظرات کاربران</h3>

      {/* ⭐ نمایش میانگین امتیاز */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-yellow-500 text-lg">
          {"★".repeat(Math.round(averageRating))}
          {"☆".repeat(5 - Math.round(averageRating))}
        </div>
        <div className="text-sm text-gray-600">
          میانگین امتیاز: {averageRating.toFixed(1)} / 5 · {totalComments} نظر
        </div>
      </div>

      {/* 🔘 انتخاب نوع مرتب‌سازی نظرات */}
      <div className="flex justify-end mb-4">
        <select
          value={reviewSort}
          onChange={(e) => setReviewSort(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="newest">جدیدترین</option>
          <option value="popular">محبوب‌ترین</option>
        </select>
      </div>

      {reviews.filter((r) => !r.parent).map((review) => renderReview(review))}
    </div>
  );
}

export default ReviewList;
