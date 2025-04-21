// ReviewForm.jsx
// 📝 فرم ارسال نظر و امتیاز کاربران برای یک ابزار

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function ReviewForm({ toolId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5); // ⭐ امتیاز پیش‌فرض
  const [comment, setComment] = useState(""); // 💬 متن نظر
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/reviews/", {
        tool: toolId,
        rating,
        comment,
      });

      setSuccess(true);
      setComment("");
      setRating(5);
      onReviewSubmitted(); // رفرش لیست نظرات
    } catch (error) {
      alert("خطا در ارسال نظر. لطفاً بعداً دوباره امتحان کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 rounded-lg shadow space-y-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h3 className="font-bold text-lg text-purple-700">ثبت نظر و امتیاز</h3>

      {/* ⭐ امتیاز */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">امتیاز:</label>
        <select
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          {[5, 4, 3, 2, 1].map((num) => (
            <option key={num} value={num}>
              {num} ⭐
            </option>
          ))}
        </select>
      </div>

      {/* 💬 نظر */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="نظرت رو بنویس..."
        className="w-full border rounded px-3 py-2 text-sm"
        rows={3}
      />

      {/* 🔘 دکمه ارسال */}
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-sm"
      >
        {loading ? "در حال ارسال..." : "ارسال نظر"}
      </button>

      {/* ✅ پیام موفقیت */}
      {success && (
        <p className="text-green-600 text-sm mt-2">✔️ نظر با موفقیت ثبت شد!</p>
      )}
    </motion.form>
  );
}

export default ReviewForm;
