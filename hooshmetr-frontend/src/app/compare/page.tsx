"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaSearch,
  FaTimes,
  FaPlus,
  FaExchangeAlt,
  FaSave,
  FaShareAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { toolService } from "@/services/toolService";
import { comparisonService } from "@/services/comparisonService";
import { Tool } from "@/types/tool";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [comparisonTitle, setComparisonTitle] = useState<string>("");
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [comparisonId, setComparisonId] = useState<number | null>(null);
  const [featureGroups, setFeatureGroups] = useState<any[]>([]);

  // تنظیم ابزارهای انتخاب شده از پارامترهای URL
  useEffect(() => {
    const fetchToolsFromParams = async () => {
      const ids = searchParams.get("ids");
      if (!ids) {
        setLoading(false);
        return;
      }

      try {
        const toolIds = ids
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
        if (toolIds.length === 0) {
          setLoading(false);
          return;
        }

        const tools = await toolService.getToolsByIds(toolIds);
        setSelectedTools(tools);

        // دریافت گروه‌های ویژگی‌ها برای ابزارهای انتخاب شده
        if (tools.length > 0) {
          const featureData = await toolService.getToolFeatures(toolIds);
          setFeatureGroups(featureData.groups);
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
        setError("خطا در دریافت اطلاعات ابزارها. لطفاً دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    fetchToolsFromParams();
  }, [searchParams]);

  // جستجوی ابزارها
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const results = await toolService.searchTools(searchQuery);

      // حذف ابزارهای تکراری که قبلاً انتخاب شده‌اند
      const filteredResults = results.filter(
        (tool: Tool) =>
          !selectedTools.some((selected) => selected.id === tool.id)
      );

      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching tools:", error);
      setError("خطا در جستجوی ابزارها. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSearching(false);
    }
  };

  // افزودن ابزار به مقایسه
  const handleAddTool = (tool: Tool) => {
    if (selectedTools.length >= 4) {
      alert("حداکثر 4 ابزار را می‌توانید با هم مقایسه کنید.");
      return;
    }

    setSelectedTools([...selectedTools, tool]);
    setSearchResults(searchResults.filter((item) => item.id !== tool.id));
    setSearchQuery("");

    // به‌روزرسانی URL
    const newIds = [...selectedTools.map((t) => t.id), tool.id].join(",");
    router.push(`/compare?ids=${newIds}`);
  };

  // حذف ابزار از مقایسه
  const handleRemoveTool = (toolId: number) => {
    const updatedTools = selectedTools.filter((tool) => tool.id !== toolId);
    setSelectedTools(updatedTools);

    // به‌روزرسانی URL
    if (updatedTools.length > 0) {
      const newIds = updatedTools.map((t) => t.id).join(",");
      router.push(`/compare?ids=${newIds}`);
    } else {
      router.push("/compare");
    }
  };

  // ذخیره مقایسه
  const handleSaveComparison = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/compare");
      return;
    }

    if (selectedTools.length < 2) {
      alert("لطفاً حداقل دو ابزار برای مقایسه انتخاب کنید.");
      return;
    }

    if (!comparisonTitle.trim()) {
      alert("لطفاً عنوانی برای مقایسه وارد کنید.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const result = await comparisonService.createComparison({
        title: comparisonTitle,
        tool_ids: selectedTools.map((tool) => tool.id),
      });

      setComparisonId(result.id);
      setShowSaveForm(false);
      alert("مقایسه با موفقیت ذخیره شد.");
    } catch (error) {
      console.error("Error saving comparison:", error);
      setError("خطا در ذخیره مقایسه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  // اشتراک‌گذاری مقایسه
  const handleShareComparison = async () => {
    if (selectedTools.length < 2) {
      alert("لطفاً حداقل دو ابزار برای مقایسه انتخاب کنید.");
      return;
    }

    try {
      setSharing(true);
      setError(null);

      // اگر مقایسه قبلاً ذخیره شده، از آن استفاده کنید
      if (comparisonId) {
        const result = await comparisonService.toggleSharing(comparisonId);
        setShareLink(
          `${window.location.origin}/compare/shared/${result.share_token}`
        );
      } else {
        // اگر کاربر لاگین نکرده یا مقایسه ذخیره نشده، از لینک معمولی استفاده کنید
        const currentUrl = window.location.href;
        setShareLink(currentUrl);
      }
    } catch (error) {
      console.error("Error sharing comparison:", error);
      setError("خطا در اشتراک‌گذاری مقایسه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSharing(false);
    }
  };

  // کپی لینک اشتراک‌گذاری
  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("لینک مقایسه کپی شد.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        مقایسه ابزارهای هوش مصنوعی
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="text-red-500 ml-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* بخش انتخاب ابزارها */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">انتخاب ابزارها برای مقایسه</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => {
            const tool = selectedTools[index];

            return (
              <div
                key={index}
                className={`border rounded-lg p-4 h-32 flex flex-col ${
                  tool
                    ? "border-gray-300"
                    : "border-dashed border-gray-300 bg-gray-50"
                }`}
              >
                {tool ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-2">
                      <div className="relative w-10 h-10 ml-2">
                        {tool.image_url ? (
                          <Image
                            src={tool.image_url}
                            alt={tool.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                            {tool.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <h3 className="font-medium truncate">{tool.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="حذف"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2 flex-1">
                      {tool.description}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    {selectedTools.length > 0 ? (
                      <>
                        <FaPlus className="text-2xl mb-2" />
                        <span className="text-sm">افزودن ابزار</span>
                      </>
                    ) : (
                      <>
                        <FaExchangeAlt className="text-2xl mb-2" />
                        <span className="text-sm">ابزاری انتخاب نشده است</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative">
          <div className="flex">
            <Input
              placeholder="جستجوی ابزار برای مقایسه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              leftIcon={<FaSearch className="text-gray-400" />}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              className="mr-2"
              isLoading={isSearching}
            >
              جستجو
            </Button>
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white rounded-md shadow-lg mt-1 border border-gray-200 max-h-80 overflow-y-auto">
              <div className="p-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    {searchResults.length} نتیجه
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSearchResults(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {searchResults.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddTool(tool)}
                    >
                      <div className="relative w-10 h-10 ml-2">
                        {tool.image_url ? (
                          <Image
                            src={tool.image_url}
                            alt={tool.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                            {tool.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                      <div className="text-blue-600 ml-2">
                        <FaPlus />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && (
            <div className="absolute z-10 w-full bg-white rounded-md shadow-lg mt-1 border border-gray-200 p-4 text-center">
              <p className="text-gray-500">
                نتیجه‌ای یافت نشد. لطفاً عبارت دیگری را جستجو کنید.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* بخش مقایسه */}
      {selectedTools.length >= 2 ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">مقایسه ویژگی‌ها</h2>

            <div className="flex space-x-2 space-x-reverse">
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  rightIcon={<FaSave />}
                >
                  ذخیره مقایسه
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleShareComparison}
                isLoading={sharing}
                rightIcon={<FaShareAlt />}
              >
                اشتراک‌گذاری
              </Button>
            </div>
          </div>

          {/* فرم ذخیره مقایسه */}
          {showSaveForm && (
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Input
                  placeholder="عنوان مقایسه"
                  value={comparisonTitle}
                  onChange={(e) => setComparisonTitle(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveComparison} isLoading={saving}>
                  ذخیره
                </Button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* لینک اشتراک‌گذاری */}
          {shareLink && (
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex-1 truncate bg-white border border-gray-200 rounded-md p-2">
                  {shareLink}
                </div>
                <Button onClick={handleCopyShareLink}>کپی لینک</Button>
                <button
                  type="button"
                  onClick={() => setShareLink(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* جدول مقایسه */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-right border-b border-r border-gray-200 w-1/4">
                      ویژگی
                    </th>
                    {selectedTools.map((tool) => (
                      <th
                        key={tool.id}
                        className="p-4 text-center border-b border-r border-gray-200"
                      >
                        <div className="flex flex-col items-center">
                          <div className="relative w-10 h-10 mb-2">
                            {tool.image_url ? (
                              <Image
                                src={tool.image_url}
                                alt={tool.name}
                                fill
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                {tool.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="font-bold hover:text-blue-600"
                          >
                            {tool.name}
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* اطلاعات اصلی */}
                  <tr>
                    <td className="p-4 font-bold bg-gray-50 border-b border-r border-gray-200">
                      توضیحات
                    </td>
                    {selectedTools.map((tool) => (
                      <td
                        key={tool.id}
                        className="p-4 border-b border-r border-gray-200"
                      >
                        {tool.description}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold bg-gray-50 border-b border-r border-gray-200">
                      امتیاز کاربران
                    </td>
                    {selectedTools.map((tool) => (
                      <td
                        key={tool.id}
                        className="p-4 text-center border-b border-r border-gray-200"
                      >
                        <div className="flex items-center justify-center">
                          <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-md">
                            {tool.average_rating.toFixed(1)} از 5
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold bg-gray-50 border-b border-r border-gray-200">
                      تعداد نظرات
                    </td>
                    {selectedTools.map((tool) => (
                      <td
                        key={tool.id}
                        className="p-4 text-center border-b border-r border-gray-200"
                      >
                        {tool.review_count} نظر
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-bold bg-gray-50 border-b border-r border-gray-200">
                      وب‌سایت
                    </td>
                    {selectedTools.map((tool) => (
                      <td
                        key={tool.id}
                        className="p-4 text-center border-b border-r border-gray-200"
                      >
                        {tool.website_url ? (
                          <a
                            href={tool.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            مشاهده وب‌سایت
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* گروه‌های ویژگی */}
                  {featureGroups.map((group) => (
                    <React.Fragment key={group.id}>
                      <tr>
                        <td
                          colSpan={selectedTools.length + 1}
                          className="p-4 font-bold bg-blue-50 border-b border-r border-gray-200"
                        >
                          {group.name}
                        </td>
                      </tr>

                      {group.features.map((feature: any) => (
                        <tr key={feature.id}>
                          <td className="p-4 font-bold bg-gray-50 border-b border-r border-gray-200">
                            {feature.name}
                            {feature.description && (
                              <p className="text-sm text-gray-500 font-normal mt-1">
                                {feature.description}
                              </p>
                            )}
                          </td>

                          {selectedTools.map((tool) => {
                            const toolFeature = feature.tool_features.find(
                              (tf: any) => tf.tool_id === tool.id
                            );

                            return (
                              <td
                                key={tool.id}
                                className="p-4 text-center border-b border-r border-gray-200"
                              >
                                {toolFeature ? (
                                  <>
                                    {toolFeature.value_type === "boolean" ? (
                                      toolFeature.boolean_value ? (
                                        <span className="text-green-600 font-bold">
                                          دارد
                                        </span>
                                      ) : (
                                        <span className="text-red-600 font-bold">
                                          ندارد
                                        </span>
                                      )
                                    ) : toolFeature.value_type === "text" ? (
                                      toolFeature.text_value || "-"
                                    ) : toolFeature.value_type === "number" ? (
                                      toolFeature.number_value || "-"
                                    ) : (
                                      "-"
                                    )}

                                    {toolFeature.notes && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        {toolFeature.notes}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-8 text-center mb-8">
          <h2 className="text-xl font-bold mb-4">
            حداقل دو ابزار برای مقایسه انتخاب کنید
          </h2>
          <p className="text-gray-600 mb-6">
            برای مقایسه ابزارهای هوش مصنوعی، حداقل دو ابزار را از طریق جستجو
            انتخاب کنید تا بتوانید ویژگی‌های آن‌ها را کنار هم ببینید.
          </p>
        </div>
      )}

      {/* بخش ابزارهای محبوب */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">ابزارهای محبوب برای مقایسه</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 bg-gray-100 rounded-md animate-pulse"
              ></div>
            ))
          ) : (
            <>
              <div
                className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push("/compare?ids=1,2")}
              >
                <h3 className="font-bold mb-2">ChatGPT vs Claude</h3>
                <p className="text-sm text-gray-500">مقایسه دو چت‌بات محبوب</p>
              </div>

              <div
                className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push("/compare?ids=3,4,5")}
              >
                <h3 className="font-bold mb-2">ابزارهای تولید تصویر</h3>
                <p className="text-sm text-gray-500">
                  DALL-E، Midjourney و Stable Diffusion
                </p>
              </div>

              <div
                className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push("/compare?ids=6,7")}
              >
                <h3 className="font-bold mb-2">دستیارهای کدنویسی</h3>
                <p className="text-sm text-gray-500">
                  GitHub Copilot و Tabnine
                </p>
              </div>

              <div
                className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push("/compare?ids=8,9")}
              >
                <h3 className="font-bold mb-2">ابزارهای خلاصه‌سازی متن</h3>
                <p className="text-sm text-gray-500">
                  مقایسه ابزارهای خلاصه‌سازی محتوا
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
