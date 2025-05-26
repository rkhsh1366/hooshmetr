import { Metadata } from "next";
import Link from "next/link";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export const metadata: Metadata = {
  title: "سوالات متداول | هوش‌متر",
  description:
    "پاسخ به سوالات رایج درباره هوش‌متر، مرجع مقایسه ابزارهای هوش مصنوعی",
};

// کامپوننت آکاردئون برای سوالات متداول
const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-4 px-2 text-right"
        onClick={onClick}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <span className="text-blue-600">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 px-2">
          <div className="text-gray-700 leading-relaxed">{answer}</div>
        </div>
      )}
    </div>
  );
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">سوالات متداول</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* سوالات درباره هوش‌متر */}
          <h2 className="text-xl font-bold mb-6">درباره هوش‌متر</h2>

          <div className="space-y-2">
            <FAQItem
              question="هوش‌متر چیست؟"
              answer={
                <p>
                  هوش‌متر یک پلتفرم جامع برای معرفی، مقایسه و بررسی ابزارهای هوش
                  مصنوعی است که به کاربران فارسی‌زبان کمک می‌کند تا بهترین
                  ابزارهای هوش مصنوعی را برای نیازهای خود پیدا کنند. در هوش‌متر
                  می‌توانید اطلاعات جامعی درباره ابزارهای مختلف هوش مصنوعی،
                  مقایسه ویژگی‌ها، نظرات کاربران و خلاصه‌های هوشمند نظرات را
                  مشاهده کنید.
                </p>
              }
              isOpen={true}
              onClick={() => {}}
            />

            <FAQItem
              question="چرا باید از هوش‌متر استفاده کنم؟"
              answer={
                <div>
                  <p>هوش‌متر مزایای زیادی برای کاربران دارد:</p>
                  <ul className="list-disc pr-6 mt-2 space-y-1">
                    <li>
                      دسترسی به اطلاعات جامع درباره ابزارهای هوش مصنوعی به زبان
                      فارسی
                    </li>
                    <li>
                      امکان مقایسه مستقیم ابزارهای مختلف و ویژگی‌های آن‌ها
                    </li>
                    <li>مشاهده نظرات و تجربیات واقعی کاربران</li>
                    <li>
                      خلاصه‌های هوشمند نظرات کاربران با استفاده از هوش مصنوعی
                    </li>
                    <li>
                      دسترسی به مقالات آموزشی و راهنماهای استفاده از ابزارهای
                      هوش مصنوعی
                    </li>
                    <li>امکان ذخیره و اشتراک‌گذاری مقایسه‌های شخصی</li>
                  </ul>
                </div>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="آیا استفاده از هوش‌متر رایگان است؟"
              answer={
                <p>
                  بله، استفاده از تمامی امکانات هوش‌متر کاملاً رایگان است. هدف
                  ما ارائه اطلاعات جامع و دقیق درباره ابزارهای هوش مصنوعی به
                  کاربران فارسی‌زبان است تا بتوانند آگاهانه‌تر تصمیم‌گیری کنند.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />
          </div>

          {/* سوالات درباره ابزارهای هوش مصنوعی */}
          <h2 className="text-xl font-bold mb-6 mt-12">ابزارهای هوش مصنوعی</h2>

          <div className="space-y-2">
            <FAQItem
              question="هوش مصنوعی چیست؟"
              answer={
                <p>
                  هوش مصنوعی (AI) به سیستم‌هایی اشاره دارد که می‌توانند وظایفی
                  را انجام دهند که معمولاً به هوش انسانی نیاز دارند، مانند درک
                  زبان طبیعی، تشخیص الگوها، یادگیری و تصمیم‌گیری. امروزه
                  ابزارهای متنوعی بر پایه هوش مصنوعی توسعه یافته‌اند که در
                  زمینه‌های مختلف مانند تولید متن، تصویر، صدا، کدنویسی و بسیاری
                  موارد دیگر کاربرد دارند.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="چه نوع ابزارهای هوش مصنوعی در هوش‌متر معرفی شده‌اند؟"
              answer={
                <div>
                  <p>
                    در هوش‌متر، انواع مختلفی از ابزارهای هوش مصنوعی معرفی
                    شده‌اند، از جمله:
                  </p>
                  <ul className="list-disc pr-6 mt-2 space-y-1">
                    <li>
                      چت‌بات‌ها و دستیارهای هوشمند (مانند ChatGPT، Claude)
                    </li>
                    <li>
                      ابزارهای تولید تصویر (مانند DALL-E، Midjourney، Stable
                      Diffusion)
                    </li>
                    <li>ابزارهای تولید و ویرایش متن</li>
                    <li>دستیارهای کدنویسی و برنامه‌نویسی</li>
                    <li>ابزارهای تولید و ویرایش صدا و موسیقی</li>
                    <li>ابزارهای تولید و ویرایش ویدیو</li>
                    <li>ابزارهای طراحی و گرافیک</li>
                    <li>ابزارهای تحلیل داده و هوش تجاری</li>
                    <li>و بسیاری موارد دیگر</li>
                  </ul>
                </div>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="آیا همه ابزارهای معرفی شده از زبان فارسی پشتیبانی می‌کنند؟"
              answer={
                <p>
                  خیر، همه ابزارهای معرفی شده در هوش‌متر از زبان فارسی پشتیبانی
                  نمی‌کنند. ما در صفحه هر ابزار مشخص کرده‌ایم که آیا از زبان
                  فارسی پشتیبانی می‌کند یا خیر. همچنین می‌توانید با استفاده از
                  فیلترهای جستجو، ابزارهایی که از زبان فارسی پشتیبانی می‌کنند را
                  جداگانه مشاهده کنید.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="آیا همه ابزارهای معرفی شده رایگان هستند؟"
              answer={
                <p>
                  خیر، برخی از ابزارهای معرفی شده رایگان، برخی دارای نسخه رایگان
                  با محدودیت، و برخی کاملاً پولی هستند. ما در صفحه هر ابزار،
                  اطلاعات مربوط به قیمت‌گذاری و نحوه دسترسی به آن را ذکر
                  کرده‌ایم. همچنین می‌توانید با استفاده از فیلترهای جستجو،
                  ابزارهای رایگان را جداگانه مشاهده کنید.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />
          </div>

          {/* سوالات درباره نحوه استفاده از سایت */}
          <h2 className="text-xl font-bold mb-6 mt-12">نحوه استفاده از سایت</h2>

          <div className="space-y-2">
            <FAQItem
              question="چگونه می‌توانم ابزارهای مختلف را با هم مقایسه کنم؟"
              answer={
                <div>
                  <p>
                    برای مقایسه ابزارهای مختلف، می‌توانید به دو روش عمل کنید:
                  </p>
                  <ol className="list-decimal pr-6 mt-2 space-y-1">
                    <li>
                      از صفحه «مقایسه» در منوی اصلی استفاده کنید و ابزارهای مورد
                      نظر خود را انتخاب کنید.
                    </li>
                    <li>
                      در صفحه هر ابزار، گزینه «افزودن به مقایسه» را انتخاب کنید
                      و سپس ابزارهای دیگری را برای مقایسه اضافه کنید.
                    </li>
                  </ol>
                  <p className="mt-2">
                    پس از انتخاب ابزارها، می‌توانید ویژگی‌های آن‌ها را کنار هم
                    مشاهده کنید و تصمیم بگیرید کدام یک برای نیازهای شما مناسب‌تر
                    است.
                  </p>
                </div>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="آیا برای ثبت نظر نیاز به ثبت‌نام دارم؟"
              answer={
                <p>
                  بله، برای ثبت نظر، امتیازدهی به ابزارها، ایجاد مقایسه‌های شخصی
                  و نشان کردن ابزارها و مقالات، نیاز به ثبت‌نام دارید. ثبت‌نام
                  در هوش‌متر بسیار ساده است و تنها با شماره موبایل و دریافت کد
                  تأیید انجام می‌شود.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="چگونه می‌توانم مقایسه‌های خود را با دیگران به اشتراک بگذارم؟"
              answer={
                <div>
                  <p>
                    برای اشتراک‌گذاری مقایسه‌های خود با دیگران، مراحل زیر را
                    دنبال کنید:
                  </p>
                  <ol className="list-decimal pr-6 mt-2 space-y-1">
                    <li>وارد حساب کاربری خود شوید.</li>
                    <li>به صفحه «مقایسه‌های من» در پروفایل خود بروید.</li>
                    <li>
                      روی دکمه «اشتراک‌گذاری» در کنار مقایسه مورد نظر کلیک کنید.
                    </li>
                    <li>
                      لینک اشتراک‌گذاری را کپی کنید و برای دیگران ارسال کنید.
                    </li>
                  </ol>
                  <p className="mt-2">
                    افرادی که این لینک را دریافت می‌کنند، می‌توانند مقایسه شما
                    را مشاهده کنند، حتی اگر حساب کاربری نداشته باشند.
                  </p>
                </div>
              }
              isOpen={false}
              onClick={() => {}}
            />
          </div>

          {/* سوالات درباره همکاری و تماس */}
          <h2 className="text-xl font-bold mb-6 mt-12">همکاری و تماس</h2>

          <div className="space-y-2">
            <FAQItem
              question="چگونه می‌توانم یک ابزار جدید را به هوش‌متر پیشنهاد دهم؟"
              answer={
                <p>
                  اگر ابزار هوش مصنوعی می‌شناسید که در هوش‌متر معرفی نشده است،
                  می‌توانید از طریق{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:underline"
                  >
                    فرم تماس با ما
                  </Link>{" "}
                  آن را به ما پیشنهاد دهید. ما پس از بررسی، آن را به فهرست
                  ابزارهای هوش‌متر اضافه خواهیم کرد.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="آیا می‌توانم در نوشتن محتوا برای هوش‌متر همکاری کنم؟"
              answer={
                <p>
                  بله، ما از همکاری علاقه‌مندان به هوش مصنوعی برای تولید محتوای
                  آموزشی و مقالات استقبال می‌کنیم. اگر تمایل به همکاری دارید،
                  لطفاً از طریق{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:underline"
                  >
                    فرم تماس با ما
                  </Link>{" "}
                  با ذکر زمینه‌های تخصصی خود با ما در ارتباط باشید.
                </p>
              }
              isOpen={false}
              onClick={() => {}}
            />

            <FAQItem
              question="چگونه می‌توانم با تیم هوش‌متر در ارتباط باشم؟"
              answer={
                <div>
                  <p>شما می‌توانید از روش‌های زیر با ما در ارتباط باشید:</p>
                  <ul className="list-disc pr-6 mt-2 space-y-1">
                    <li>
                      استفاده از{" "}
                      <Link
                        href="/contact"
                        className="text-blue-600 hover:underline"
                      >
                        فرم تماس با ما
                      </Link>
                    </li>
                    <li>ارسال ایمیل به آدرس: info@hooshmetr.com</li>
                    <li>
                      پیام در شبکه‌های اجتماعی:{" "}
                      <a
                        href="https://instagram.com/hooshmetr"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        اینستاگرام
                      </a>{" "}
                      و{" "}
                      <a
                        href="https://twitter.com/hooshmetr"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        توییتر
                      </a>
                    </li>
                  </ul>
                </div>
              }
              isOpen={false}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
