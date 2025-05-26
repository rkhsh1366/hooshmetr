import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaTwitter, FaTelegram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* بخش لوگو و توضیحات */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo-white.svg"
                alt="هوش‌متر"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold mr-2">هوش‌متر</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران
              فارسی‌زبان
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a
                href="https://instagram.com/hooshmetr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://twitter.com/hooshmetr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://t.me/hooshmetr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaTelegram size={20} />
              </a>
              <a
                href="https://linkedin.com/company/hooshmetr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* بخش دسترسی سریع */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="text-gray-400 hover:text-white">
                  ابزارهای هوش مصنوعی
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-gray-400 hover:text-white"
                >
                  مقایسه ابزارها
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white">
                  وبلاگ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">
                  سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white"
                >
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* بخش دسته‌بندی‌ها */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4">دسته‌بندی‌ها</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tools?category=chatbots"
                  className="text-gray-400 hover:text-white"
                >
                  چت‌بات‌ها
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=image-generation"
                  className="text-gray-400 hover:text-white"
                >
                  تولید تصویر
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=text-generation"
                  className="text-gray-400 hover:text-white"
                >
                  تولید متن
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=coding"
                  className="text-gray-400 hover:text-white"
                >
                  کدنویسی
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=audio-generation"
                  className="text-gray-400 hover:text-white"
                >
                  تولید صدا
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=video-editing"
                  className="text-gray-400 hover:text-white"
                >
                  ویرایش ویدیو
                </Link>
              </li>
            </ul>
          </div>

          {/* بخش قانونی */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4">اطلاعات قانونی</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  قوانین و مقررات
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white"
                >
                  حریم خصوصی
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-white"
                >
                  سیاست کوکی‌ها
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* بخش کپی‌رایت */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            تمامی حقوق برای هوش‌متر محفوظ است. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
