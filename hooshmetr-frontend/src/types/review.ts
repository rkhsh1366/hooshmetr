import { Tool } from "./tool";
import { User } from "./user";

export interface ToolReview {
  id: number;
  tool_id: number;
  tool?: {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
  };
  user?: {
    id: number;
    display_name?: string;
  };
  rating: number;
  content?: string;
  pros?: string;
  cons?: string;
  created_at: string;
  updated_at?: string;
  positive_reactions_count: number;
  negative_reactions_count: number;
  user_reaction?: "like" | "dislike" | null;
}

export interface ToolReviewCreate {
  tool_id: number;
  rating: number;
  content?: string;
  pros?: string;
  cons?: string;
}

export interface ToolReviewUpdate {
  rating?: number;
  content?: string;
  pros?: string;
  cons?: string;
}

export interface ToolReviewListParams {
  page?: number;
  limit?: number;
  tool_id?: number;
  user_id?: number;
  sort_by?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful";
}

export interface ToolReviewListResponse {
  results: ToolReview[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ToolReviewSummary {
  id: number;
  tool_id: number;
  content: string;
  pros: string[];
  cons: string[];
  created_at: string;
  updated_at: string;
}

export interface ReviewReaction {
  id: number;
  user_id: number;
  review_id: number;
  reaction_type: "helpful" | "not_helpful";
  created_at: string;
  updated_at: string;
}

export interface ReviewReactionCreate {
  review_id: number;
  reaction_type: "helpful" | "not_helpful";
}
