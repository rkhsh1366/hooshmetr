// AdminToolForm.jsx
// 📦 فرم افزودن ابزار با آپلود تصویر، دسته و تکنولوژی

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AdminToolForm({ onCreated, editTool }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    license_type: "free",
    supports_farsi: false,
    has_chatbot: false,
    multi_language_support: false,
    desktop_version: false,
    categories: [],
    technologies: [],
  });

  const [logo, setLogo] = useState(null);
  const [screenshot, setScreenshot] = useState(null);

  const [categories, setCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📥 گرفتن دسته‌بندی و تکنولوژی

  useEffect(() => {
    const fetchMeta = async () => {
      const token = localStorage.getItem("access");
      const [catRes, techRes] = await Promise.all([
        axios.get("/api/categories/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/technologies/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCategories(catRes.data);
      setTechnologies(techRes.data);
    };
    fetchMeta();
  }, []); // 👈 فقط برای بار اول اجرا میشه

  // 🧠 پر کردن فرم هنگام دریافت editTool
  useEffect(() => {
    if (editTool) {
      setForm({
        name: editTool.name || "",
        description: editTool.description || "",
        website: editTool.website || "",
        license_type: editTool.license_type || "free",
        supports_farsi: editTool.supports_farsi || false,
        has_chatbot: editTool.has_chatbot || false,
        multi_language_support: editTool.multi_language_support || false,
        desktop_version: editTool.desktop_version || false,
        categories: editTool.categories || [],
        technologies: editTool.technologies || [],
      });
    }
  }, [editTool]);

  // 🖊 هندل فیلدهای معمولی
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🟪 هندل چک‌باکس دسته و تکنولوژی چندتایی
  const handleMultiSelect = (type, id) => {
    setForm((prev) => {
      const list = new Set(prev[type]);
      list.has(id) ? list.delete(id) : list.add(id);
      return { ...prev, [type]: [...list] };
    });
  };

  // 🧾 ارسال فرم با فایل
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => data.append(key, v));
      } else {
        data.append(key, val);
      }
    });
    if (logo) data.append("logo", logo);
    if (screenshot) data.append("homepage_screenshot", screenshot);

    try {
      const url = editTool
        ? `/api/tools/${editTool.id}/update/`
        : "/api/tools/";

      await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ ابزار با موفقیت ثبت شد");
      toast.success("✅ ابزار با موفقیت ذخیره شد!");
      onCreated?.();
      setForm({
        ...form,
        name: "",
        description: "",
        website: "",
        categories: [],
        technologies: [],
      });
      setLogo(null);
      setScreenshot(null);
    } catch (err) {
      alert("❌ خطا در ثبت ابزار");
      toast.error("❌ خطا در ذخیره ابزار.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow border rounded p-4 mb-8 space-y-3"
    >
      <h3 className="text-lg font-bold text-purple-700">
        ➕ افزودن ابزار هوش مصنوعی
      </h3>

      <input
        name="name"
        placeholder="نام ابزار"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full border px-3 py-1 rounded"
      />
      <textarea
        name="description"
        placeholder="توضیح"
        value={form.description}
        onChange={handleChange}
        rows={3}
        required
        className="w-full border px-3 py-1 rounded"
      />
      <input
        name="website"
        type="url"
        placeholder="آدرس سایت"
        value={form.website}
        onChange={handleChange}
        className="w-full border px-3 py-1 rounded"
      />
      <select
        name="license_type"
        value={form.license_type}
        onChange={handleChange}
        className="w-full border rounded px-3 py-1"
      >
        <option value="free">رایگان</option>
        <option value="paid">پولی</option>
        <option value="freemium">فریمیوم</option>
      </select>

      {/* 🔘 Boolean flags */}
      <div className="grid grid-cols-2 text-sm gap-2">
        <label>
          <input
            type="checkbox"
            name="supports_farsi"
            checked={form.supports_farsi}
            onChange={handleChange}
          />{" "}
          پشتیبانی از فارسی
        </label>
        <label>
          <input
            type="checkbox"
            name="has_chatbot"
            checked={form.has_chatbot}
            onChange={handleChange}
          />{" "}
          چت‌بات دارد
        </label>
        <label>
          <input
            type="checkbox"
            name="multi_language_support"
            checked={form.multi_language_support}
            onChange={handleChange}
          />{" "}
          چندزبانه
        </label>
        <label>
          <input
            type="checkbox"
            name="desktop_version"
            checked={form.desktop_version}
            onChange={handleChange}
          />{" "}
          نسخه ویندوز
        </label>
      </div>

      {/* 📂 فایل‌ها */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">لوگو ابزار:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
          />
        </div>
        <div>
          <label className="text-sm">اسکرین‌شات صفحه اصلی:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files[0])}
          />
        </div>
      </div>

      {/* 📚 دسته‌ها */}
      <div>
        <h4 className="text-sm font-semibold">📂 دسته‌بندی‌ها:</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="text-xs bg-gray-100 px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={form.categories.includes(cat.id)}
                onChange={() => handleMultiSelect("categories", cat.id)}
                className="mr-1"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* 🔬 تکنولوژی‌ها */}
      <div>
        <h4 className="text-sm font-semibold">🔬 تکنولوژی‌ها:</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {technologies.map((tech) => (
            <label
              key={tech.id}
              className="text-xs bg-gray-100 px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={form.technologies.includes(tech.id)}
                onChange={() => handleMultiSelect("technologies", tech.id)}
                className="mr-1"
              />
              {tech.name}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
        disabled={loading}
      >
        {loading
          ? "در حال ارسال..."
          : editTool
          ? "ویرایش ابزار"
          : "افزودن ابزار"}
      </button>
    </form>
  );
}

export default AdminToolForm;
