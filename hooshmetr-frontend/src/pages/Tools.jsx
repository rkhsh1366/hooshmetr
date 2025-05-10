import { useEffect, useState } from "react";
import { getTools } from "@/api/tools";
import ToolCard from "@/components/ToolCard";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import SortMenu from "@/components/SortMenu";
import { useCompare } from "@/context/CompareContext";

function Tools() {
  const [tools, setTools] = useState([]);
  const [query, setQuery] = useState("");

  const normalizePersian = (text) =>
    text
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/ة/g, "ه")
      .replace(/ۀ/g, "ه")
      .replace(/ﻻ/g, "لا")
      .replace(/ؤ/g, "و")
      .replace(/إ|أ|آ|ا/g, "ا")
      .toLowerCase();

  const [filters, setFilters] = useState({
    supports_farsi: false,
    has_chatbot: false,
    desktop_version: false,
    multi_language_support: false,
    is_filtered: false,
    license_type: "", // "free", "paid", "freemium"
  });

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

  const [sortBy, setSortBy] = useState("name-asc");
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
    <section className="bg-gradient-to-b from-black via-gray-900 to-black min-h-screen text-white font-vazir px-4 py-12 rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-yellow-400 text-center mb-10">
          لیست ابزارهای هوش مصنوعی
        </h2>

        {/* 🔘 فیلترها و جستجو */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-1">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-4">
            <SearchBar value={query} onChange={setQuery} />
            <SortMenu sortBy={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* 🧠 کارت ابزارها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedTools.length > 0 ? (
            sortedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onCompareToggle={toggleCompare}
                isCompared={compareList.includes(tool.id)}
              />
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">
              ابزاری با این مشخصات یافت نشد.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Tools;
