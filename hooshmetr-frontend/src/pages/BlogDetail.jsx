import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BlogDetail = () => {
  const { slug } = useParams(); // گرفتن slug از URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/blog/posts/${slug}/`);
        setPost(response.data);
      } catch (error) {
        console.error("خطا در گرفتن مقاله:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <p className="text-center py-10">در حال بارگذاری...</p>;
  if (!post)
    return <p className="text-center text-red-500">مقاله‌ای یافت نشد.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-right">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg shadow mb-6"
        />
      )}
      <p className="text-gray-600 text-sm mb-2">
        نویسنده: {post.author_username}
      </p>
      <p className="text-gray-400 text-xs mb-6">
        تاریخ: {new Date(post.created_at).toLocaleDateString("fa-IR")}
      </p>
      <p className="text-lg leading-loose text-justify whitespace-pre-line">
        {post.content}
      </p>
    </div>
  );
};

export default BlogDetail;
