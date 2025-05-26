import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaUsers, FaTools, FaComments, FaChartLine } from "react-icons/fa";

export const metadata: Metadata = {
  title: "درباره ما | هوش‌متر",
  description:
    "درباره هوش‌متر، مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران فارسی‌زبان",
};

export default function AboutPage() {
  return (
    <div>
      {/* بخش هدر */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            درباره هوش‌متر
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران فارسی‌زبان
          </p>
        </div>
      </section>

      {/* بخش معرفی */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              هوش‌متر چیست؟
            </h2>
            <div className="prose prose-lg max-w-none">
              <p>
                هوش‌متر یک پلتفرم جامع برای معرفی، مقایسه و بررسی ابزارهای هوش
                مصنوعی است که با هدف کمک به کاربران فارسی‌زبان برای انتخاب
                بهترین ابزارهای هوش مصنوعی متناسب با نیازهایشان ایجاد شده است.
              </p>
              <p>
                در دنیای امروز، ابزارهای هوش مصنوعی با سرعت زیادی در حال توسعه
                هستند و انتخاب بهترین گزینه از میان صدها ابزار موجود، کار
                ساده‌ای نیست. هوش‌متر با ارائه اطلاعات جامع، مقایسه‌های دقیق،
                نظرات کاربران و خلاصه‌های هوشمند، به شما کمک می‌کند تا
                آگاهانه‌تر تصمیم بگیرید.
              </p>
              <p>
                ما در هوش‌متر تلاش می‌کنیم تا جدیدترین و کاربردی‌ترین ابزارهای
                هوش مصنوعی را به زبان فارسی معرفی کنیم و اطلاعات مفیدی درباره
                قابلیت‌ها، مزایا، معایب و کاربردهای آن‌ها ارائه دهیم. همچنین با
                ارائه مقالات آموزشی و راهنماها، به شما کمک می‌کنیم تا بتوانید از
                این ابزارها به بهترین شکل استفاده کنید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* بخش ویژگی‌ها */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            ویژگی‌های هوش‌متر
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTools className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">معرفی ابزارها</h3>
              <p className="text-gray-600">
                معرفی جامع ابزارهای هوش مصنوعی با ذکر ویژگی‌ها، قابلیت‌ها و
                اطلاعات کاربردی
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">مقایسه ابزارها</h3>
              <p className="text-gray-600">
                امکان مقایسه مستقیم ابزارهای مختلف هوش مصنوعی و انتخاب بهترین
                گزینه
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">نظرات کاربران</h3>
              <p className="text-gray-600">
                دسترسی به نظرات واقعی کاربران و خلاصه‌های هوشمند نظرات با
                استفاده از هوش مصنوعی
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">جامعه کاربران</h3>
              <p className="text-gray-600">
                عضویت در جامعه کاربران علاقه‌مند به هوش مصنوعی و مشارکت در توسعه
                محتوا
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* بخش داستان ما */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">داستان ما</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                هوش‌متر از یک ایده ساده شروع شد: ایجاد یک منبع جامع و قابل
                اعتماد به زبان فارسی برای معرفی و مقایسه ابزارهای هوش مصنوعی. با
                گسترش روزافزون ابزارهای هوش مصنوعی و کاربردهای متنوع آن‌ها، نیاز
                به یک مرجع فارسی که بتواند اطلاعات دقیق و کاربردی در اختیار
                کاربران قرار دهد، بیش از پیش احساس می‌شد.
              </p>
              <p>
                تیم ما متشکل از متخصصان حوزه هوش مصنوعی، توسعه‌دهندگان نرم‌افزار
                و تولیدکنندگان محتوا است که با هدف ارائه بهترین تجربه کاربری و
                اطلاعات مفید به کاربران فارسی‌زبان گرد هم آمده‌اند. ما معتقدیم
                که هوش مصنوعی می‌تواند زندگی و کار همه ما را بهبود بخشد، اما
                برای استفاده مؤثر از آن، نیاز به آگاهی و شناخت داریم.
              </p>
              <p>
                هوش‌متر با تمرکز بر نیازهای کاربران ایرانی و فارسی‌زبان، اطلاعات
                مفیدی درباره پشتیبانی از زبان فارسی، دسترس‌پذیری در ایران و سایر
                ملاحظات مهم برای کاربران ایرانی ارائه می‌دهد. ما همچنین تلاش
                می‌کنیم تا با تولید محتوای آموزشی، به افزایش سواد دیجیتال و
                آشنایی بیشتر کاربران با مفاهیم و کاربردهای هوش مصنوعی کمک کنیم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* بخش تیم ما */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            تیم ما
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src="/team-member-1.jpg"
                    alt="عضو تیم هوش‌متر"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">علی محمدی</h3>
              <p className="text-gray-500 mb-3">بنیان‌گذار و مدیر محصول</p>
              <p className="text-gray-600 text-sm">
                متخصص هوش مصنوعی و یادگیری ماشین با بیش از 8 سال تجربه در توسعه
                محصولات مبتنی بر هوش مصنوعی
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src="/team-member-2.jpg"
                    alt="عضو تیم هوش‌متر"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">سارا رضایی</h3>
              <p className="text-gray-500 mb-3">سردبیر محتوا</p>
              <p className="text-gray-600 text-sm">
                نویسنده و پژوهشگر حوزه هوش مصنوعی با تخصص در تولید محتوای آموزشی
                و کاربردی
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src="/team-member-3.jpg"
                    alt="عضو تیم هوش‌متر"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">امیر حسینی</h3>
              <p className="text-gray-500 mb-3">مدیر فنی</p>
              <p className="text-gray-600 text-sm">
                توسعه‌دهنده ارشد با تجربه در طراحی و پیاده‌سازی پلتفرم‌های
                مقایسه و بررسی محصولات
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* بخش تماس با ما */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            با ما در ارتباط باشید
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            نظرات، پیشنهادات و انتقادات شما به ما کمک می‌کند تا هوش‌متر را بهتر
            و کاربردی‌تر کنیم.
          </p>
          <Link href="/contact">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              تماس با ما
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
