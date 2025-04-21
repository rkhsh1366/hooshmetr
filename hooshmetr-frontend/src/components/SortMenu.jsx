// SortMenu.jsx
// 📊 کامپوننت انتخاب نوع مرتب‌سازی برای لیست ابزارها

function SortMenu({ sortBy, onChange }) {
  return (
    <div className="w-full max-w-xs mb-6 mx-auto">
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-400"
      >
        <option value="name-asc">مرتب‌سازی بر اساس نام (صعودی)</option>
        <option value="name-desc">مرتب‌سازی بر اساس نام (نزولی)</option>
        <option value="date-newest">جدیدترین ابزارها</option>
        <option value="date-oldest">قدیمی‌ترین ابزارها</option>
      </select>
    </div>
  );
}

export default SortMenu;
