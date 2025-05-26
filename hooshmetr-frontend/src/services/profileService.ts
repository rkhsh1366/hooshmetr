import api from "./api";
import { UserProfile, UserProfileUpdate } from "@/types/user";

export const profileService = {
  /**
   * Get current user profile
   * @returns Promise with user profile data
   */
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/profile");
    return response.data;
  },

  /**
   * Update user profile
   * @param data Updated profile data
   * @returns Promise with updated profile
   */
  updateUserProfile: async (data: UserProfileUpdate): Promise<UserProfile> => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  /**
   * Upload avatar
   * @param file Avatar image file
   * @returns Promise with updated profile including avatar URL
   */
  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Delete avatar
   * @returns Promise with updated profile
   */
  deleteAvatar: async (): Promise<UserProfile> => {
    const response = await api.delete("/profile/avatar");
    return response.data;
  },
};
