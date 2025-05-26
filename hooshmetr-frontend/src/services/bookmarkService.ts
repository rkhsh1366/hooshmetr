import api from "./api";
import { BookmarkListResponse, Bookmark } from "@/types/tool";

export const bookmarkService = {
  /**
   * Get user bookmarks
   * @param type Bookmark type (tools or blogs)
   * @param page Page number
   * @returns Promise with bookmark list response
   */
  getBookmarks: async (
    type: "tools" | "blogs",
    page: number = 1
  ): Promise<BookmarkListResponse> => {
    const response = await api.get("/bookmarks", { params: { type, page } });
    return response.data;
  },

  /**
   * Add bookmark
   * @param itemId Item ID
   * @param itemType Item type (tool or blog)
   * @returns Promise with bookmark data
   */
  addBookmark: async (
    itemId: number,
    itemType: "tool" | "blog"
  ): Promise<Bookmark> => {
    const response = await api.post("/bookmarks", {
      item_id: itemId,
      item_type: itemType,
    });
    return response.data;
  },

  /**
   * Remove bookmark
   * @param bookmarkId Bookmark ID
   * @returns Promise with response
   */
  removeBookmark: async (bookmarkId: number) => {
    const response = await api.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  },

  /**
   * Check if an item is bookmarked by the current user
   * @param itemId Item ID
   * @param itemType Item type (tool or blog)
   * @returns Promise with boolean indicating if item is bookmarked
   */
  isBookmarked: async (
    itemId: number,
    itemType: "tool" | "blog"
  ): Promise<boolean> => {
    try {
      const response = await api.get(`/bookmarks/check`, {
        params: { item_id: itemId, item_type: itemType },
      });
      return response.data.is_bookmarked;
    } catch (error) {
      return false;
    }
  },
};
