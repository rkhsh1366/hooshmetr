import api from "./api";
import {
  Comparison,
  ComparisonCreate,
  ComparisonUpdate,
  ComparisonListParams,
  ComparisonListResponse,
} from "@/types/comparison";

export const comparisonService = {
  /**
   * Get comparisons by current user
   * @param page Page number
   * @returns Promise with comparison list response
   */
  getUserComparisons: async (
    page: number = 1
  ): Promise<ComparisonListResponse> => {
    const response = await api.get("/comparisons/me", { params: { page } });
    return response.data;
  },

  /**
   * Create a new comparison
   * @param data Comparison data
   * @returns Promise with created comparison
   */
  createComparison: async (data: ComparisonCreate): Promise<Comparison> => {
    const response = await api.post("/comparisons", data);
    return response.data;
  },

  /**
   * Update a comparison
   * @param comparisonId Comparison ID
   * @param data Updated comparison data
   * @returns Promise with updated comparison
   */
  updateComparison: async (
    comparisonId: number,
    data: ComparisonUpdate
  ): Promise<Comparison> => {
    const response = await api.put(`/comparisons/${comparisonId}`, data);
    return response.data;
  },

  /**
   * Delete a comparison
   * @param comparisonId Comparison ID
   * @returns Promise with response
   */
  deleteComparison: async (comparisonId: number) => {
    const response = await api.delete(`/comparisons/${comparisonId}`);
    return response.data;
  },

  /**
   * Get a comparison by ID
   * @param comparisonId Comparison ID
   * @returns Promise with comparison data
   */
  getComparison: async (comparisonId: number): Promise<Comparison> => {
    const response = await api.get(`/comparisons/${comparisonId}`);
    return response.data;
  },

  /**
   * Get a shared comparison by token
   * @param token Share token
   * @returns Promise with comparison data
   */
  getSharedComparison: async (token: string): Promise<Comparison> => {
    const response = await api.get(`/comparisons/shared/${token}`);
    return response.data;
  },

  /**
   * Toggle sharing for a comparison
   * @param comparisonId Comparison ID
   * @returns Promise with updated comparison
   */
  toggleSharing: async (comparisonId: number): Promise<Comparison> => {
    const response = await api.post(
      `/comparisons/${comparisonId}/toggle-sharing`
    );
    return response.data;
  },
};
