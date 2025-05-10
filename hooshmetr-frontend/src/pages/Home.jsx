import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="bg-black text-white font-vazir">
      {/* Hero Section */}
      <div className="relative text-center py-32 px-4 bg-gradient-to-r from-black to-gray-900 text-white overflow-hidden">
        <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
          مقایسه ابزارهای هوش مصنوعی
        </h2>
        <p className="text-xl md:text-2xl mb-10">
          مقایسه و انتخاب بین ابزارهای هوشمند، ساده‌تر از همیشه!
        </p>

        {/* Search Bar */}
        <div className="flex justify-center mb-10">
          <div className="relative w-72 md:w-96">
            <input
              type="text"
              placeholder="جستجو بین ابزارها..."
              className="w-full px-10 py-3 rounded-full text-black bg-gray-100 focus:outline-none shadow-inner"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Live Comparison Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
          <input
            type="text"
            placeholder="ابزار اول..."
            className="px-6 py-3 rounded-full w-64 text-black bg-gray-100 focus:outline-none"
          />
          <span className="text-xl font-bold">VS</span>
          <input
            type="text"
            placeholder="ابزار دوم..."
            className="px-6 py-3 rounded-full w-64 text-black bg-gray-100 focus:outline-none"
          />
          <Link to="/compare">
            <button className="mt-4 md:mt-0 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-full transition duration-300">
              مقایسه
            </button>
          </Link>
        </div>

        <div className="w-full overflow-hidden">
          <svg
            className="w-full"
            viewBox="0 0 1440 150"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#fff"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,96C672,96,768,128,864,133.3C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
          <img
            src="/icons/analysis.svg"
            alt="تحلیل دقیق"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h3 className="text-2xl font-bold mb-3">تحلیل دقیق</h3>
          <p className="text-gray-300">
            تحلیل بی‌طرف و تخصصی از ابزارهای هوش مصنوعی
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
          <img
            src="/icons/compare.svg"
            alt="مقایسه سریع"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h3 className="text-2xl font-bold mb-3">مقایسه سریع</h3>
          <p className="text-gray-300">مقایسه حرفه‌ای بر اساس نیاز شما</p>
        </div>
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
          <img
            src="/icons/community.svg"
            alt="جامعه کاربران"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h3 className="text-2xl font-bold mb-3">جامعه کاربران</h3>
          <p className="text-gray-300">نظرات واقعی کاربران برای انتخاب بهتر</p>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center text-white mb-10">
          ابزارهای محبوب
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">ChatGPT</h3>
            <p className="text-gray-300 text-sm">
              ابزار قدرتمند مکالمه و تولید محتوا با هوش مصنوعی
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Gemini</h3>
            <p className="text-gray-300 text-sm">
              ابزار تحلیلی و جستجوگر چندمدلی گوگل
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Claude</h3>
            <p className="text-gray-300 text-sm">
              دستیار هوشمند متن‌باز با رویکرد انسان‌محور
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-purple-900 text-white text-center py-16 px-6">
        <h2 className="text-4xl font-extrabold mb-6">
          آیا می‌خواهید تصمیم هوشمندانه‌تری بگیرید؟
        </h2>
        <p className="mb-6">
          همین حالا ابزارهای هوش مصنوعی را مقایسه و بهترین را انتخاب کنید
        </p>
        <Link to="/compare">
          <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full text-lg transition duration-300">
            مقایسه ابزارها
          </button>
        </Link>
      </section>
    </section>
  );
}
