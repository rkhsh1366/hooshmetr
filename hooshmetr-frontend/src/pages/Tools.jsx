// صفحه نمایش لیست ابزارها

import { useEffect, useState } from "react";
import { getTools } from "../api/tools";
import ToolCard from "../components/ToolCard";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import SortMenu from "@/components/SortMenu";
import { useCompare } from "@/context/CompareContext";

function Tools() {
  const [tools, setTools] = useState([]);
  const [query, setQuery] = useState("");

  // 🔠 تبدیل حروف فارسی به فرم نرمال برای جستجوی دقیق‌تر
  const normalizePersian = (text) => {
    return text
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/ة/g, "ه")
      .replace(/ۀ/g, "ه")
      .replace(/ﻻ/g, "لا")
      .replace(/ؤ/g, "و")
      .replace(/إ|أ|آ|ا/g, "ا")
      .toLowerCase();
  };

  const [filters, setFilters] = useState({
    supports_farsi: false,
    has_chatbot: false,
    desktop_version: false,
    multi_language_support: false,
    is_filtered: false,
    license_type: "", // "free"
  });

  // 🔍 تابع فیلتر ابزارها با حساسیت به زبان فارسی و انگلیسی
  const filteredTools = tools.filter((tool) => {
    const q = normalizePersian(query.trim().toLowerCase());

    const matchesSearch =
      normalizePersian(tool.name).includes(q) ||
      normalizePersian(tool.description).includes(q);

    const matchesFilters =
      (!filters.supports_farsi || tool.supports_farsi) &&
      (!filters.has_chatbot || tool.has_chatbot) &&
      (!filters.desktop_version || tool.desktop_version) &&
      (!filters.multi_language_support || tool.multi_language_support) &&
      (!filters.is_filtered || tool.is_filtered) &&
      (!filters.license_type || tool.license_type === filters.license_type);

    return matchesSearch && matchesFilters;
  });

  // استیت جدید برای مرتب‌سازی
  const [sortBy, setSortBy] = useState("name-asc");
  // تابع مرتب‌سازی ابزارها
  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "date-oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      default:
        return 0;
    }
  });

  const { compareList, toggleCompare } = useCompare();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTools();
      setTools(data);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 🔹 تیتر اصلی صفحه */}
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
        لیست ابزارهای هوش مصنوعی
      </h2>

      <FilterPanel filters={filters} onChange={setFilters} />
      {/* 🔍 کامپوننت جستجو */}
      <SearchBar value={query} onChange={setQuery} />

      <SortMenu sortBy={sortBy} onChange={setSortBy} />

      {/* 🧩 لیست کارت‌های ابزار با استفاده از داده‌های فیلتر شده */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onCompareToggle={toggleCompare}
            isCompared={compareList.includes(tool.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Tools;
