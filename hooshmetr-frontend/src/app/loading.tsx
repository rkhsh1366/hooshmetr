export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-bold text-gray-700">در حال بارگذاری...</h2>
      <p className="text-gray-500 mt-2">لطفاً صبر کنید</p>
    </div>
  );
}
