"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/authService";
import { User } from "@/types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (phoneNumber: string, code: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<User>;
  requestCode: (phoneNumber: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // بررسی وضعیت احراز هویت در هنگام بارگذاری
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ارسال کد تأیید
  const requestCode = async (phoneNumber: string): Promise<boolean> => {
    try {
      await authService.sendOtp(phoneNumber);
      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      return false;
    }
  };

  const login = async (phoneNumber: string, code: string): Promise<boolean> => {
    return verifyOtp(phoneNumber, code);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // تأیید کد و ورود
  const verifyOtp = async (
    phoneNumber: string,
    code: string
  ): Promise<boolean> => {
    try {
      const response = await authService.verifyOtp(phoneNumber, code);
      if (response.user && response.access_token) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem("access_token", response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    }
  };

  // خروج از حساب کاربری
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  // به‌روزرسانی اطلاعات کاربر
  const updateUser = async (userData: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await authService.updateUserProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    verifyOtp,
    logout,
    updateUser,
    requestCode,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
