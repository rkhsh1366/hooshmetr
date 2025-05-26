"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaEye, FaUser, FaTag, FaFolder } from "react-icons/fa";
import { blogService } from "@/services/blogService";
import { BlogPost, BlogComment } from "@/types/blog";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // دریافت مقاله
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogService.getBlogPostBySlug(slug as string);
        setPost(data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // ارسال نظر
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim() || !post) return;

    try {
      setSubmitting(true);
      const newComment = await blogService.addComment(
        post.id,
        comment,
        replyTo || undefined
      );

      // به‌روزرسانی نظرات در UI
      setPost({
        ...post,
        comments: [...(post.comments || []), newComment],
      });

      // پاک کردن فرم
      setComment("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("خطا در ارسال نظر. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR").format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">مقاله یافت نشد</h1>
        <p className="mb-6">مقاله مورد نظر شما یافت نشد یا حذف شده است.</p>
        <Link href="/blog">
          <Button>بازگشت به وبلاگ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* محتوای اصلی */}
        <div className="md:w-3/4">
          {/* هدر مقاله */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {post.featured_image && (
              <div className="relative h-64 md:h-96">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center text-gray-500 text-sm mb-6">
                <div className="flex items-center ml-4 mb-2">
                  <FaUser className="ml-1" />
                  {post.author?.display_name || "نویسنده هوش‌متر"}
                </div>
                <div className="flex items-center ml-4 mb-2">
                  <FaCalendarAlt className="ml-1" />
                  {formatDate(post.published_at || post.created_at)}
                </div>
                <div className="flex items-center mb-2">
                  <FaEye className="ml-1" />
                  {post.view_count} بازدید
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <FaFolder className="ml-1" />
                    {category.name}
                  </Link>
                ))}

                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    <FaTag className="ml-1" />
                    {tag.name}
                  </Link>
                ))}
              </div>

              {post.summary && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-gray-700">
                  {post.summary}
                </div>
              )}

              {/* محتوای مقاله */}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* بخش نظرات */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">
              نظرات ({post.comments?.length || 0})
            </h2>

            {/* فرم ارسال نظر */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  {replyTo && (
                    <div className="bg-gray-50 p-3 rounded-md mb-2 flex justify-between items-center">
                      <span>در حال پاسخ به نظر #{replyTo}</span>
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        لغو پاسخ
                      </button>
                    </div>
                  )}

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="نظر خود را بنویسید..."
                    required
                  ></textarea>
                </div>

                <Button type="submit" isLoading={submitting}>
                  ارسال نظر
                </Button>
              </form>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md mb-8 text-center">
                <p className="mb-3">
                  برای ارسال نظر ابتدا وارد حساب کاربری خود شوید.
                </p>
                <Link href="/login">
                  <Button>ورود / ثبت‌نام</Button>
                </Link>
              </div>
            )}

            {/* لیست نظرات */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments
                  .filter((comment) => !comment.parent_id)
                  .map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      allComments={post.comments || []}
                      onReply={() => setReplyTo(comment.id)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                هنوز نظری برای این مقاله ثبت نشده است. اولین نفری باشید که نظر
                می‌دهید!
              </div>
            )}
          </div>
        </div>

        {/* سایدبار */}
        <div className="md:w-1/4">
          {/* اطلاعات نویسنده */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">
              درباره نویسنده
            </h3>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold ml-3">
                {post.author?.display_name || "نویسنده هوش‌متر"}
              </div>
              <div>
                <div className="font-medium">
                  {post.author?.display_name || "نویسنده هوش‌متر"}
                </div>
              </div>
            </div>
          </div>

          {/* مقالات مرتبط */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">
              مقالات مرتبط
            </h3>
            <div className="space-y-4">
              {/* این بخش می‌تواند با API مقالات مرتبط پر شود */}
              <p className="text-gray-500 text-center">
                در حال حاضر مقاله مرتبطی یافت نشد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت نمایش نظر
interface CommentCardProps {
  comment: BlogComment;
  allComments: BlogComment[];
  onReply: () => void;
}

function CommentCard({ comment, allComments, onReply }: CommentCardProps) {
  // یافتن پاسخ‌های این نظر
  const replies = allComments.filter((c) => c.parent_id === comment.id);

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR").format(date);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold ml-3">
            {comment.user?.display_name || "کاربر هوش‌متر"}
          </div>
          <div>
            <div className="font-medium">
              {comment.user?.display_name || "کاربر هوش‌متر"}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-gray-700">{comment.content}</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onReply}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            پاسخ
          </button>
        </div>

        {/* نمایش پاسخ‌ها */}
        {replies.length > 0 && (
          <div className="mt-4 pr-6 border-r-2 border-gray-200">
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold ml-2">
                      {reply.user?.display_name || "کاربر هوش‌متر"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {reply.user?.display_name || "کاربر هوش‌متر"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
