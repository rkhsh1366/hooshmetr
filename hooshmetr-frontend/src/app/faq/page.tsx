import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "سوالات متداول | هوش‌متر",
  description:
    "پاسخ به سوالات رایج درباره هوش‌متر، مرجع مقایسه ابزارهای هوش مصنوعی",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">سوالات متداول</h1>
        <FAQClient />
      </div>
    </div>
  );
}
