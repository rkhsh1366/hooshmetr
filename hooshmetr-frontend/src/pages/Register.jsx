import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("رمز عبور با تکرار آن مطابقت ندارد.");
      return;
    }

    try {
      await axios.post("/api/register/", {
        username: formData.username,
        password: formData.password,
      });
      navigate("/login");
      toast.success("✅ ثبت‌نام با موفقیت انجام شد!");
      toast.error("❌ خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.");
    } catch (err) {
      setError("ثبت‌نام ناموفق بود. احتمالاً نام کاربری تکراری است.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-right">
      <h2 className="text-2xl font-bold mb-4">ثبت‌نام</h2>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="نام کاربری"
          className="w-full border p-2 rounded"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="رمز عبور"
          className="w-full border p-2 rounded"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password2"
          placeholder="تکرار رمز عبور"
          className="w-full border p-2 rounded"
          value={formData.password2}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          ثبت‌نام
        </button>
      </form>
    </div>
  );
};

export default Register;
