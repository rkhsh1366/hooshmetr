export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  tool_count?: number;
  icon?: string;
}

export enum SortOption {
  NEWEST = "newest",
  NAME = "name",
  RATING = "rating",
  REVIEWS = "reviews",
  VIEWS = "views",
  COMPARISONS = "comparisons",
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  website?: string;
  image_url?: string;
  pricing_info?: string;
  is_free: boolean;
  is_open_source: boolean;
  supports_farsi: boolean;
  is_sanctioned: boolean;
  api_available: boolean;
  average_rating: number;
  review_count: number;
  comparison_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories: Category[];
  tags: Tag[];
  technologies: Technology[];
  features?: ToolFeature[];
  website_url?: string;
  highlight_features?: string;
  review_summary?: {
    summary: string;
    pros_summary: string;
    cons_summary: string;
  };
}

export interface ToolFeature {
  id: number;
  name: string;
  description?: string;
  value?: string;
  is_available: boolean;
}

export interface ToolListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  technology?: string;
  sort_by?: "name" | "rating" | "reviews" | "views" | "newest" | "comparisons";
  sort_order?: "asc" | "desc";
  is_free?: boolean;
  supports_farsi?: boolean;
  is_sanctioned?: boolean;
  api_available?: boolean;
}

export interface ToolListResponse {
  results: Tool[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CategoryListResponse {
  results: Category[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TagListResponse {
  results: Tag[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TechnologyListResponse {
  results: Technology[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Bookmark {
  id: number;
  user_id: number;
  item_id: number;
  item_type: "tool" | "blog";
  created_at: string;
  item: any; // Tool or Blog
}

export interface BookmarkListResponse {
  results: Bookmark[];
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
