"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaMobileAlt, FaKey, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, requestCode, login } = useAuth();

  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  // ریدایرکت در صورت لاگین بودن
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  // شمارنده معکوس برای ارسال مجدد کد
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // اعتبارسنجی شماره موبایل
  const validatePhoneNumber = (phone: string): boolean => {
    const regex = /^09\d{9}$/;
    return regex.test(phone);
  };

  // درخواست کد تأیید
  const handleRequestCode = async () => {
    setError("");

    if (!validatePhoneNumber(phoneNumber)) {
      setError("لطفاً یک شماره موبایل معتبر وارد کنید");
      return;
    }

    try {
      setLoading(true);
      await requestCode(phoneNumber);
      setStep("verify");
      setCountdown(120); // 2 دقیقه زمان برای وارد کردن کد
    } catch (err: any) {
      console.error("Error requesting code:", err);
      setError(
        err.response?.data?.detail ||
          "خطا در ارسال کد تأیید. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // تأیید کد و ورود
  const handleVerifyCode = async () => {
    setError("");

    if (!verificationCode || verificationCode.length !== 5) {
      setError("لطفاً کد 5 رقمی را وارد کنید");
      return;
    }

    try {
      setLoading(true);
      await login(phoneNumber, verificationCode);

      // ریدایرکت به صفحه قبلی یا صفحه اصلی
      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
    } catch (err: any) {
      console.error("Error verifying code:", err);
      setError(
        err.response?.data?.detail ||
          "کد تأیید نامعتبر است. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // ارسال مجدد کد
  const handleResendCode = async () => {
    try {
      setLoading(true);
      await requestCode(phoneNumber);
      setCountdown(120);
      setError("");
    } catch (err: any) {
      console.error("Error resending code:", err);
      setError(
        err.response?.data?.detail ||
          "خطا در ارسال مجدد کد. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // بازگشت به مرحله وارد کردن شماره موبایل
  const handleBack = () => {
    setStep("phone");
    setVerificationCode("");
    setError("");
  };

  // اگر کاربر لاگین است، صفحه خالی نمایش داده می‌شود تا ریدایرکت شود
  if (isLoading || isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">ورود / ثبت‌نام</h1>
          <p className="text-gray-600 mt-2">
            {step === "phone"
              ? "برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید."
              : "کد تأیید ارسال شده به شماره موبایل خود را وارد کنید."}
          </p>
        </div>

        {step === "phone" ? (
          <div>
            <div className="mb-6">
              <Input
                label="شماره موبایل"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                leftIcon={<FaMobileAlt className="text-gray-400" />}
                error={error}
                dir="ltr"
              />
            </div>

            <Button fullWidth isLoading={loading} onClick={handleRequestCode}>
              دریافت کد تأیید
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-2">
              <p className="text-sm text-gray-600 mb-2">
                کد تأیید به شماره{" "}
                <span className="font-bold">{phoneNumber}</span> ارسال شد.
              </p>
            </div>

            <div className="mb-6">
              <Input
                label="کد تأیید"
                type="text"
                placeholder="کد 5 رقمی"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/[^0-9]/g, "").slice(0, 5)
                  )
                }
                leftIcon={<FaKey className="text-gray-400" />}
                error={error}
                maxLength={5}
                dir="ltr"
              />
            </div>

            <Button
              fullWidth
              isLoading={loading}
              onClick={handleVerifyCode}
              className="mb-4"
            >
              تأیید و ورود
            </Button>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaArrowLeft className="ml-1" />
                <span>تغییر شماره موبایل</span>
              </button>

              {countdown > 0 ? (
                <span className="text-sm text-gray-500">
                  ارسال مجدد کد تا {countdown} ثانیه دیگر
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
