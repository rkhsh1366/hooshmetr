import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminBlogForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: null,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const token = localStorage.getItem("access_token"); // اگه از JWT استفاده می‌کنی
      const res = await axios.post("/api/blog/posts/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ مقاله با موفقیت ارسال شد!");
      toast.success("✅ مقاله با موفقیت ارسال شد!");
      setFormData({ title: "", excerpt: "", content: "", image: null });
    } catch (err) {
      console.error(err);
      setMessage("❌ خطا در ارسال مقاله");
      toast.error("❌ خطا در ارسال مقاله.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 text-right max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">📝 افزودن مقاله جدید</h2>
      {message && <p className="text-sm text-green-600">{message}</p>}
      <input
        type="text"
        name="title"
        placeholder="عنوان مقاله"
        className="w-full p-2 border rounded"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="excerpt"
        placeholder="خلاصه کوتاه"
        className="w-full p-2 border rounded"
        value={formData.excerpt}
        onChange={handleChange}
        required
      />
      <textarea
        name="content"
        placeholder="متن کامل مقاله"
        className="w-full p-2 border rounded"
        rows={8}
        value={formData.content}
        onChange={handleChange}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ارسال مقاله
      </button>
    </form>
  );
};

export default AdminBlogForm;
