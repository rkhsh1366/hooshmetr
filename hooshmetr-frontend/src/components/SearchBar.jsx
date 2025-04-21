// SearchBar.jsx
// 🔎 کامپوننت جستجو برای فیلتر کردن ابزارها بر اساس نام یا توضیح

function SearchBar({ value, onChange }) {
    return (
      <div className="relative w-full max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="جستجوی ابزار..."
          className="w-full px-4 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
  
        {/* آیکن 🔍 سمت راست */}
        <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
          🔍
        </div>
      </div>
    );
  }
  
  export default SearchBar;
  