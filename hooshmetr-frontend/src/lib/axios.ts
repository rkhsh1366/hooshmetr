import axios from "axios";

// تنظیم URL پایه برای API
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ایجاد نمونه axios با تنظیمات پیش‌فرض
const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// افزودن interceptor برای ارسال توکن احراز هویت با هر درخواست
instance.interceptors.request.use(
  (config) => {
    // بررسی وجود توکن در localStorage
    const token = localStorage.getItem("access_token");

    // افزودن توکن به هدر درخواست در صورت وجود
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// افزودن interceptor برای مدیریت پاسخ‌ها و خطاها
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // اگر خطای 401 (عدم احراز هویت) دریافت شد و قبلاً تلاش مجدد نشده است
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // پاک کردن توکن و هدایت به صفحه ورود
      localStorage.removeItem("access_token");

      // اگر در محیط مرورگر هستیم، کاربر را به صفحه ورود هدایت می‌کنیم
      if (typeof window !== "undefined") {
        window.location.href = `/login?redirect=${window.location.pathname}`;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
