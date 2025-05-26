"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaEdit, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";
import { UserProfile, UserProfileUpdate } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserProfileUpdate>({
    first_name: "",
    last_name: "",
    email: "",
    display_name: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTab, setSelectedTab] = useState<string>("profile");

  // بررسی احراز هویت و دریافت پروفایل
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login?redirect=/profile");
        return;
      }

      if (isAuthenticated) {
        try {
          setLoading(true);
          const data = await profileService.getUserProfile();
          setProfile(data);
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            display_name: data.display_name || "",
            bio: data.bio || "",
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, router]);

  // تغییر فرم
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // پاک کردن خطا در صورت تغییر فیلد
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // اعتبارسنجی فرم
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "ایمیل معتبر نیست";
    }

    if (formData.display_name && formData.display_name.length < 3) {
      newErrors.display_name = "نام نمایشی باید حداقل 3 کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ذخیره تغییرات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const updatedProfile = await profileService.updateUserProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      await refreshUser();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // آپلود تصویر پروفایل
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری انتخاب کنید");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم فایل نباید بیشتر از 2 مگابایت باشد");
      return;
    }

    try {
      setIsUploading(true);
      const updatedProfile = await profileService.uploadAvatar(file);
      setProfile(updatedProfile);
      await refreshUser();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsUploading(false);
    }
  };

  // حذف تصویر پروفایل
  const handleDeleteAvatar = async () => {
    if (!confirm("آیا از حذف تصویر پروفایل مطمئن هستید؟")) {
      return;
    }

    try {
      setIsUploading(true);
      const updatedProfile = await profileService.deleteAvatar();
      setProfile(updatedProfile);
      await refreshUser();
    } catch (error) {
      console.error("Error deleting avatar:", error);
      alert("خطا در حذف تصویر. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsUploading(false);
    }
  };

  // لغو ویرایش
  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
      });
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
      <h1 className="text-2xl md:text-3xl font-bold mb-8">پروفایل کاربری</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="profile">اطلاعات شخصی</TabsTrigger>
              <TabsTrigger value="activity">فعالیت‌ها</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="flex flex-col md:flex-row gap-8">
                {/* بخش آواتار */}
                <div className="md:w-1/4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="تصویر پروفایل"
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <FaUser size={48} />
                        </div>
                      )}

                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <FaSpinner
                            className="animate-spin text-white"
                            size={24}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 w-full">
                      <label className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          fullWidth
                          className="cursor-pointer"
                          disabled={isUploading}
                        >
                          تغییر تصویر
                        </Button>
                      </label>

                      {profile?.avatar_url && (
                        <Button
                          type="button"
                          variant="outline"
                          color="danger"
                          fullWidth
                          onClick={handleDeleteAvatar}
                          disabled={isUploading}
                        >
                          حذف تصویر
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* بخش اطلاعات شخصی */}
                <div className="md:w-3/4">
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input
                          label="نام"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="نام خود را وارد کنید"
                        />

                        <Input
                          label="نام خانوادگی"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="نام خانوادگی خود را وارد کنید"
                        />

                        <Input
                          label="نام نمایشی"
                          name="display_name"
                          value={formData.display_name}
                          onChange={handleChange}
                          placeholder="نام نمایشی خود را وارد کنید"
                          error={errors.display_name}
                          helperText="این نام در نظرات و مقایسه‌های شما نمایش داده می‌شود"
                        />

                        <Input
                          label="ایمیل"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ایمیل خود را وارد کنید"
                          error={errors.email}
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          درباره من
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="درباره خود بنویسید..."
                          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                        />
                      </div>

                      <div className="flex justify-end space-x-4 space-x-reverse">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          rightIcon={<FaTimes />}
                        >
                          انصراف
                        </Button>

                        <Button
                          type="submit"
                          isLoading={isSaving}
                          rightIcon={<FaCheck />}
                        >
                          ذخیره تغییرات
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            شماره موبایل
                          </h3>
                          <p className="mt-1">{profile?.phone_number}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            ایمیل
                          </h3>
                          <p className="mt-1">{profile?.email || "—"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            نام و نام خانوادگی
                          </h3>
                          <p className="mt-1">
                            {profile?.first_name || profile?.last_name
                              ? `${profile?.first_name || ""} ${
                                  profile?.last_name || ""
                                }`
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            نام نمایشی
                          </h3>
                          <p className="mt-1">{profile?.display_name || "—"}</p>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-gray-500">
                            درباره من
                          </h3>
                          <p className="mt-1 whitespace-pre-line">
                            {profile?.bio || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          rightIcon={<FaEdit />}
                        >
                          ویرایش اطلاعات
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-blue-700 mb-2">
                    نظرات
                  </h3>
                  <p className="text-3xl font-bold mb-4">
                    {profile?.review_count || 0}
                  </p>
                  <Link href="/profile/reviews">
                    <Button variant="outline" fullWidth>
                      مشاهده نظرات
                    </Button>
                  </Link>
                </div>

                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-green-700 mb-2">
                    مقایسه‌ها
                  </h3>
                  <p className="text-3xl font-bold mb-4">
                    {profile?.comparison_count || 0}
                  </p>
                  <Link href="/profile/comparisons">
                    <Button variant="outline" fullWidth>
                      مشاهده مقایسه‌ها
                    </Button>
                  </Link>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">
                    نشان‌شده‌ها
                  </h3>
                  <p className="text-3xl font-bold mb-4">-</p>
                  <Link href="/profile/bookmarks">
                    <Button variant="outline" fullWidth>
                      مشاهده نشان‌شده‌ها
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">تاریخچه فعالیت</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    تاریخچه فعالیت‌های شما در این بخش نمایش داده می‌شود.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
