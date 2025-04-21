// Profile.jsx
// 👤 نمایش پروفایل کاربر لاگین‌شده + لیست نظراتش

import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // گرفتن نظرات مربوط به کاربر
  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("/api/reviews/my/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(response.data);
      } catch (err) {
        console.error("خطا در دریافت نظرات من:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  if (loading)
    return <div className="text-center py-8">در حال بارگذاری...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">پروفایل من</h2>

      <p className="text-sm text-gray-600 mb-6">
        تعداد نظرات ثبت‌شده: <strong>{reviews.length}</strong>
      </p>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border-b pb-3">
            <h4 className="font-semibold text-gray-800 text-sm mb-1">
              ابزار: {r.tool_name}
            </h4>
            <p className="text-sm text-gray-600">⭐ {r.rating} / 5</p>
            <p className="text-sm mt-1 text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
