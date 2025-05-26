"use client";

import { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaInstagram,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import { contactService } from "@/services/contactService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "نام الزامی است";
    }

    if (!formData.email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "ایمیل معتبر نیست";
    }

    if (!formData.message.trim()) {
      newErrors.message = "پیام الزامی است";
    } else if (formData.message.length < 10) {
      newErrors.message = "پیام باید حداقل 10 کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await contactService.sendContactForm(formData);

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitError("خطا در ارسال فرم. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">تماس با ما</h1>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">ایمیل</h3>
            <p className="text-gray-600">info@hooshmetr.com</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPhone className="text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">تلفن</h3>
            <p className="text-gray-600">021-12345678</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMapMarkerAlt className="text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">آدرس</h3>
            <p className="text-gray-600">تهران، خیابان ولیعصر</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">ارسال پیام</h2>

              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <p className="text-green-700">
                    پیام شما با موفقیت ارسال شد. تیم ما در اسرع وقت با شما تماس
                    خواهد گرفت.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                      <p className="text-red-700">{submitError}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <Input
                      label="نام و نام خانوادگی"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <Input
                      label="ایمیل"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <Input
                      label="موضوع"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      پیام <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${
                        errors.message ? "border-red-500" : "border-gray-300"
                      } shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32`}
                      required
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" fullWidth isLoading={isSubmitting}>
                    ارسال پیام
                  </Button>
                </form>
              )}
            </div>

            <div className="bg-blue-600 text-white p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">با ما در ارتباط باشید</h2>

              <div className="mb-8">
                <p className="mb-4">
                  از طریق فرم تماس، ایمیل یا شبکه‌های اجتماعی با ما در ارتباط
                  باشید. ما آماده پاسخگویی به سؤالات، پیشنهادات و انتقادات شما
                  هستیم.
                </p>
                <p>
                  اگر ابزار هوش مصنوعی می‌شناسید که در هوش‌متر معرفی نشده است،
                  یا تمایل به همکاری با ما دارید، خوشحال می‌شویم با ما در میان
                  بگذارید.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold">
                  ما را در شبکه‌های اجتماعی دنبال کنید:
                </h3>

                <div className="flex space-x-4 space-x-reverse">
                  <a
                    href="https://instagram.com/hooshmetr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-200"
                  >
                    <FaInstagram className="ml-2" />
                    <span>Instagram</span>
                  </a>

                  <a
                    href="https://twitter.com/hooshmetr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-200"
                  >
                    <FaTwitter className="ml-2" />
                    <span>Twitter</span>
                  </a>

                  <a
                    href="https://t.me/hooshmetr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-200"
                  >
                    <FaTelegram className="ml-2" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
