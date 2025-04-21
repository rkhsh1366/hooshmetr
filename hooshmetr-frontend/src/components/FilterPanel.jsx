// FilterPanel.jsx
// ✅ کامپوننت فیلتر ویژگی‌ها برای فیلتر کردن ابزارهای هوش مصنوعی

function FilterPanel({ filters, onChange }) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {/* 🔘 چک‌باکس‌ها برای هر ویژگی */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.supports_farsi}
            onChange={(e) => onChange({ ...filters, supports_farsi: e.target.checked })}
          />
          پشتیبانی از فارسی
        </label>
  
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_chatbot}
            onChange={(e) => onChange({ ...filters, has_chatbot: e.target.checked })}
          />
          چت‌بات
        </label>
  
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.desktop_version}
            onChange={(e) => onChange({ ...filters, desktop_version: e.target.checked })}
          />
          نسخه دسکتاپ
        </label>
  
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.multi_language_support}
            onChange={(e) => onChange({ ...filters, multi_language_support: e.target.checked })}
          />
          چند زبانه
        </label>
  
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.is_filtered}
            onChange={(e) => onChange({ ...filters, is_filtered: e.target.checked })}
          />
          فیلتر بودن در ایران
        </label>
  
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.license_type === "free"}
            onChange={(e) =>
              onChange({
                ...filters,
                license_type: e.target.checked ? "free" : "",
              })
            }
          />
          فقط رایگان
        </label>
      </div>
    );
  }
  
  export default FilterPanel;
  