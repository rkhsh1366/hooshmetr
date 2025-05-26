import api from "./api";
import {
  Tool,
  ToolListParams,
  ToolListResponse,
  Category,
  CategoryListResponse,
  TagListResponse,
  TechnologyListResponse,
  BookmarkListResponse,
} from "@/types/tool";

export const toolService = {
  /**
   * Get all tools with pagination and filters
   * @param params Filter and pagination parameters
   * @returns Promise with tool list response
   */
  getTools: async (params?: ToolListParams): Promise<ToolListResponse> => {
    const response = await api.get("/tools", { params });
    return response.data;
  },

  /**
   * Get tool by slug
   * @param slug Tool slug
   * @returns Promise with tool data
   */
  getToolBySlug: async (slug: string): Promise<Tool> => {
    const response = await api.get(`/tools/${slug}`);
    return response.data;
  },

  /**
   * Get similar tools
   * @param slug Tool slug
   * @param limit Number of tools to return
   * @returns Promise with tool list response
   */
  getSimilarTools: async (
    slug: string,
    limit: number = 4
  ): Promise<ToolListResponse> => {
    const response = await api.get(`/tools/${slug}/similar`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get all categories
   * @param params Pagination parameters
   * @returns Promise with category list response
   */
  getCategories: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<CategoryListResponse> => {
    const response = await api.get("/categories", { params });
    return response.data;
  },

  /**
   * Get category by slug
   * @param slug Category slug
   * @returns Promise with category data
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  /**
   * Get all tags
   * @param params Pagination parameters
   * @returns Promise with tag list response
   */
  getTags: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<TagListResponse> => {
    const response = await api.get("/tags", { params });
    return response.data;
  },

  /**
   * Get all technologies
   * @param params Pagination parameters
   * @returns Promise with technology list response
   */
  getTechnologies: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<TechnologyListResponse> => {
    const response = await api.get("/technologies", { params });
    return response.data;
  },

  /**
   * Bookmark a tool
   * @param toolId Tool ID
   * @returns Promise with bookmark data
   */
  bookmarkTool: async (toolId: number) => {
    const response = await api.post("/bookmarks", {
      item_id: toolId,
      item_type: "tool",
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
   * Check if a tool is bookmarked by the current user
   * @param toolId Tool ID
   * @returns Promise with boolean indicating if tool is bookmarked
   */
  isToolBookmarked: async (toolId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/bookmarks/check`, {
        params: { item_id: toolId, item_type: "tool" },
      });
      return response.data.is_bookmarked;
    } catch (error) {
      return false;
    }
  },

  getToolsByIds: async (ids: number[]): Promise<Tool[]> => {
    const response = await api.get("/tools/by-ids", {
      params: { ids: ids.join(",") },
    });
    return response.data;
  },

  getToolFeatures: async (toolIds: number[]): Promise<any> => {
    const response = await api.get("/tools/features", {
      params: { tool_ids: toolIds.join(",") },
    });
    return response.data;
  },

  searchTools: async (query: string, limit: number = 10): Promise<Tool[]> => {
    const response = await api.get("/tools/search", {
      params: { q: query, limit },
    });
    return response.data;
  },
};
