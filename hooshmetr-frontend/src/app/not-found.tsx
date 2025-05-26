import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-6">
        صفحه مورد نظر یافت نشد
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button>بازگشت به صفحه اصلی</Button>
        </Link>
        <Link href="/tools">
          <Button variant="outline">مشاهده ابزارها</Button>
        </Link>
      </div>
    </div>
  );
}
