import api from "./api";
import {
  ToolReview,
  ToolReviewCreate,
  ToolReviewUpdate,
  ToolReviewListParams,
  ToolReviewListResponse,
  ToolReviewSummary,
  ReviewReactionCreate,
} from "@/types/review";

export const reviewService = {
  /**
   * Get reviews for a tool
   * @param toolId Tool ID
   * @param params Pagination and sort parameters
   * @returns Promise with review list response
   */
  getToolReviews: async (
    toolId: number,
    params?: Omit<ToolReviewListParams, "tool_id">
  ): Promise<ToolReviewListResponse> => {
    const response = await api.get(`/tools/${toolId}/reviews`, { params });
    return response.data;
  },

  /**
   * Get reviews by current user
   * @param page Page number
   * @returns Promise with review list response
   */
  getUserReviews: async (page: number = 1): Promise<ToolReviewListResponse> => {
    const response = await api.get("/reviews/me", { params: { page } });
    return response.data;
  },

  /**
   * Create a new review
   * @param data Review data (includes tool_id)
   * @returns Promise with created review
   */
  createReview: async (data: ToolReviewCreate): Promise<ToolReview> => {
    const response = await api.post("/reviews", data);
    return response.data;
  },

  /**
   * Update a review
   * @param reviewId Review ID
   * @param data Updated review data
   * @returns Promise with updated review
   */
  updateReview: async (
    reviewId: number,
    data: ToolReviewUpdate
  ): Promise<ToolReview> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  /**
   * Delete a review
   * @param reviewId Review ID
   * @returns Promise with response
   */
  deleteReview: async (reviewId: number) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Get review summary for a tool
   * @param toolId Tool ID
   * @returns Promise with review summary
   */
  getReviewSummary: async (toolId: number): Promise<ToolReviewSummary> => {
    const response = await api.get(`/tools/${toolId}/review-summary`);
    return response.data;
  },

  /**
   * Add reaction to a review
   * @param reviewId Review ID
   * @param reactionType Reaction type ("like" | "dislike")
   * @returns Promise with response
   */
  addReaction: async (
    reviewId: number,
    reactionType: "like" | "dislike"
  ): Promise<void> => {
    await api.post(`/reviews/${reviewId}/reactions`, { type: reactionType });
  },

  /**
   * Update reaction for a review
   * @param reviewId Review ID
   * @param reactionType Reaction type ("like" | "dislike")
   * @returns Promise with response
   */
  updateReaction: async (
    reviewId: number,
    reactionType: "like" | "dislike"
  ): Promise<void> => {
    await api.put(`/reviews/${reviewId}/reactions`, { type: reactionType });
  },

  /**
   * Delete reaction from a review
   * @param reviewId Review ID
   * @returns Promise with response
   */
  deleteReaction: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}/reactions`);
  },
};
