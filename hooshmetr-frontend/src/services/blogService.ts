import api from "./api";
import {
  BlogPost,
  BlogPostListParams,
  BlogPostListResponse,
  BlogComment,
  BlogCommentCreate,
  BlogCommentUpdate,
  BlogCommentListParams,
  BlogCommentListResponse,
  BlogCategory,
  BlogTag,
} from "@/types/blog";

export const blogService = {
  /**
   * Get all blog posts with pagination and filters
   * @param params Filter and pagination parameters
   * @returns Promise with blog post list response
   */
  getBlogPosts: async (
    params?: BlogPostListParams
  ): Promise<BlogPostListResponse> => {
    const response = await api.get("/blog", { params });
    return response.data;
  },

  getCategories: async (): Promise<BlogCategory[]> => {
    const response = await api.get("/blog/categories");
    return response.data;
  },

  getTags: async (): Promise<BlogTag[]> => {
    const response = await api.get("/blog/tags");
    return response.data;
  },

  /**
   * Get blog post by slug
   * @param slug Blog post slug
   * @returns Promise with blog post data
   */
  getBlogPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get(`/blog/${slug}`);
    return response.data;
  },

  /**
   * Get related blog posts
   * @param slug Blog post slug
   * @param limit Number of posts to return
   * @returns Promise with blog post list response
   */
  getRelatedBlogPosts: async (
    slug: string,
    limit: number = 3
  ): Promise<BlogPostListResponse> => {
    const response = await api.get(`/blog/${slug}/related`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get comments for a blog post
   * @param params Post ID and pagination parameters
   * @returns Promise with comment list response
   */
  getBlogComments: async (
    params: BlogCommentListParams
  ): Promise<BlogCommentListResponse> => {
    const response = await api.get(`/blog/${params.post_id}/comments`, {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  /**
   * Create a new comment
   * @param data Comment data
   * @returns Promise with created comment
   */
  createComment: async (data: BlogCommentCreate): Promise<BlogComment> => {
    const response = await api.post("/blog/comments", data);
    return response.data;
  },

  /**
   * Add a comment to a blog post
   * @param postId Blog post ID
   * @param content Comment content
   * @param parentId Parent comment ID (for replies)
   * @returns Promise with created comment
   */
  addComment: async (
    postId: number,
    content: string,
    parentId?: number
  ): Promise<BlogComment> => {
    const response = await api.post(`/blog/${postId}/comments`, {
      content,
      parent_id: parentId,
    });
    return response.data;
  },

  /**
   * Update a comment
   * @param commentId Comment ID
   * @param data Updated comment data
   * @returns Promise with updated comment
   */
  updateComment: async (
    commentId: number,
    data: BlogCommentUpdate
  ): Promise<BlogComment> => {
    const response = await api.put(`/blog/comments/${commentId}`, data);
    return response.data;
  },

  /**
   * Delete a comment
   * @param commentId Comment ID
   * @returns Promise with response
   */
  deleteComment: async (commentId: number) => {
    const response = await api.delete(`/blog/comments/${commentId}`);
    return response.data;
  },

  /**
   * Bookmark a blog post
   * @param postId Blog post ID
   * @returns Promise with bookmark data
   */
  bookmarkBlogPost: async (postId: number) => {
    const response = await api.post("/bookmarks", {
      item_id: postId,
      item_type: "blog",
    });
    return response.data;
  },

  /**
   * Check if a blog post is bookmarked by the current user
   * @param postId Blog post ID
   * @returns Promise with boolean indicating if post is bookmarked
   */
  isBlogPostBookmarked: async (postId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/bookmarks/check`, {
        params: { item_id: postId, item_type: "blog" },
      });
      return response.data.is_bookmarked;
    } catch (error) {
      return false;
    }
  },
};
