import api from "./api";
import {
  SearchParams,
  SearchResponse,
  AutocompleteResponse,
} from "@/types/search";

export const searchService = {
  /**
   * Search across tools, blog posts, categories, and tags
   * @param params Search parameters
   * @returns Promise with search results
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await api.get("/search", { params });
    return response.data;
  },

  /**
   * Get autocomplete suggestions
   * @param query Search query
   * @param limit Number of results to return
   * @returns Promise with autocomplete results
   */
  autocomplete: async (
    query: string,
    limit: number = 5
  ): Promise<AutocompleteResponse> => {
    const response = await api.get("/search/autocomplete", {
      params: { query, limit },
    });
    return response.data;
  },
};
