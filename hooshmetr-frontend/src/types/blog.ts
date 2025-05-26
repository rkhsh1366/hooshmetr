import { Category, Tag } from "./tool";
import { User } from "./user";

export interface Comment {
  id: number;
  content: string;
  user?: {
    id: number;
    display_name?: string;
  };
  parent_id?: number;
  created_at: string;
  replies?: Comment[];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  featured_image?: string;
  author_id: number;
  published: boolean;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories: Category[];
  tags: Tag[];
  author?: User;
  related_tools?: number[];
  comments?: BlogComment[];
}

export interface BlogPostListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  author_id?: number;
  sort_by?: "newest" | "popular";
}

export interface BlogPostListResponse {
  results: BlogPost[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BlogComment {
  id: number;
  content: string;
  user?: {
    id: number;
    display_name?: string;
  };
  parent_id?: number;
  created_at: string;
  post_id: number;
  user_id: number;
  updated_at: string;
  replies?: BlogComment[];
}

export interface BlogCommentCreate {
  post_id: number;
  content: string;
  parent_id?: number;
}

export interface BlogCommentUpdate {
  content: string;
}

export interface BlogCommentListParams {
  post_id: number;
  page?: number;
  limit?: number;
}

export interface BlogCommentListResponse {
  results: BlogComment[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}
