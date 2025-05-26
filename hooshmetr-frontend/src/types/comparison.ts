import { Tool } from "./tool";
import { User } from "./user";

export interface Comparison {
  id: number;
  user_id?: number;
  title: string;
  shared: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
  tools: Tool[];
  user?: User;
}

export interface ComparisonCreate {
  title: string;
  tool_ids: number[];
  shared?: boolean;
}

export interface ComparisonUpdate {
  title?: string;
  tool_ids?: number[];
  shared?: boolean;
}

export interface ComparisonListParams {
  page?: number;
  limit?: number;
  user_id?: number;
}

export interface ComparisonListResponse {
  results: Comparison[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
