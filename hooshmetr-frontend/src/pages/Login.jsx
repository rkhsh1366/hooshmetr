import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [step, setStep] = useState(1); // مرحله: 1=شماره، 2=کد
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!/^09\d{9}$/.test(mobile)) {
      toast.error("شماره موبایل صحیح نیست.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/accounts/send-code/", { mobile });
      toast.success("کد تأیید ارسال شد 📲");
      setStep(2);
    } catch (err) {
      toast.error("ارسال کد ناموفق بود.");
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/accounts/verify-code/", {
        mobile,
        code: otp,
      });
      const { access, refresh } = res.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      toast.success("ورود موفق بود 🎉");
      navigate("/admin-dashboard");
    } catch (err) {
      toast.error("کد وارد شده صحیح نیست.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-right">
      <h2 className="text-2xl font-bold mb-4">ورود با شماره موبایل</h2>

      {step === 1 && (
        <>
          <label className="block mb-2">شماره موبایل:</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="مثلاً 09123456789"
          />
          <button
            onClick={handleSendCode}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <label className="block mb-2">کد تأیید:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="کد دریافتی را وارد کنید"
          />
          <button
            onClick={handleVerifyCode}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "در حال بررسی..." : "ورود"}
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
