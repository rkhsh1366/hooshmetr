"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // گزارش خطا به سرویس‌های تحلیلی یا گزارش خطا
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">خطا</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-6">
        مشکلی پیش آمده است
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        متأسفانه در پردازش درخواست شما خطایی رخ داده است. لطفاً دوباره تلاش کنید
        یا با پشتیبانی تماس بگیرید.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={reset}>تلاش مجدد</Button>
        <Link href="/">
          <Button variant="outline">بازگشت به صفحه اصلی</Button>
        </Link>
      </div>
    </div>
  );
}
