import { BlogPost } from "./blog";
import { Tool } from "./tool";

export interface SearchResult {
  tools: Tool[];
  blog_posts: BlogPost[];
  categories: {
    id: number;
    name: string;
    slug: string;
    tool_count: number;
  }[];
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export interface AutocompleteResult {
  id: number;
  name: string;
  slug: string;
  type: "tool" | "blog" | "category" | "tag";
  image_url?: string;
  description?: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  filter?: "tools" | "blog" | "all";
}

export interface SearchResponse {
  results: SearchResult;
  page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AutocompleteResponse {
  results: AutocompleteResult[];
}
