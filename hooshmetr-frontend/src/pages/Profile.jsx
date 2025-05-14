import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [reviews, setReviews] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}` };

  // گرفتن اطلاعات پروفایل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/auth/profile/", { headers });
        setProfile(res.data);
      } catch {
        console.warn("عدم موفقیت در دریافت پروفایل");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // گرفتن نظرات کاربر
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/api/reviews/my/", { headers });
        setReviews(res.data);
      } catch (err) {
        console.error("خطا در دریافت نظرات:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  // ذخیره اطلاعات ویرایش‌شده
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/auth/profile/", profile, { headers });
      setEditMode(false);
    } catch {
      alert("خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile || loadingReviews) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded space-y-10">
      {/* اطلاعات پروفایل */}
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-4">پروفایل من</h2>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="نام"
            value={profile.first_name}
            onChange={(e) =>
              setProfile({ ...profile, first_name: e.target.value })
            }
            className="w-full p-2 border rounded"
            disabled={!editMode}
          />
          <input
            type="text"
            placeholder="نام خانوادگی"
            value={profile.last_name}
            onChange={(e) =>
              setProfile({ ...profile, last_name: e.target.value })
            }
            className="w-full p-2 border rounded"
            disabled={!editMode}
          />
          <input
            type="email"
            placeholder="ایمیل (اختیاری)"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={!editMode}
          />
        </div>

        {editMode ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ویرایش اطلاعات
          </button>
        )}
      </div>

      {/* نظرات ثبت‌شده */}
      <div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          نظرات ثبت‌شده ({reviews.length})
        </h3>
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
    </div>
  );
}

export default Profile;
