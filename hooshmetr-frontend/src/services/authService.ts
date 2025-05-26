import axios from "@/lib/axios";
import { User } from "@/types/user";

interface LoginResponse {
  user: User;
  access_token: string;
}

export const authService = {
  // ارسال کد تأیید
  async sendOtp(phoneNumber: string): Promise<void> {
    await axios.post("/api/auth/send-otp", { phone_number: phoneNumber });
  },

  // تأیید کد و ورود
  async verifyOtp(phoneNumber: string, code: string): Promise<LoginResponse> {
    const response = await axios.post("/api/auth/verify-otp", {
      phone_number: phoneNumber,
      code,
    });
    return response.data;
  },

  // دریافت اطلاعات کاربر فعلی
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get("/api/users/me");
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // به‌روزرسانی پروفایل کاربر
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const response = await axios.patch("/api/users/me", userData);
    return response.data;
  },

  // تغییر رمز عبور
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await axios.post("/api/users/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  // بازیابی رمز عبور
  async resetPassword(phoneNumber: string): Promise<void> {
    await axios.post("/api/auth/reset-password", {
      phone_number: phoneNumber,
    });
  },

  // تأیید کد بازیابی رمز عبور و تنظیم رمز جدید
  async verifyResetCode(
    phoneNumber: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    await axios.post("/api/auth/verify-reset-code", {
      phone_number: phoneNumber,
      code,
      new_password: newPassword,
    });
  },
};
