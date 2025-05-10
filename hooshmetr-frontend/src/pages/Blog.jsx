import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/blog/posts/");
        setPosts(response.data);
      } catch (error) {
        console.error("خطا در دریافت مقالات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center py-10">در حال بارگذاری...</p>;
  if (posts.length === 0)
    return (
      <p className="text-center text-gray-500">هنوز مقاله‌ای منتشر نشده است.</p>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-right">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2">مقالات</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="block p-4 border rounded-lg shadow hover:shadow-md transition bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-sm text-gray-600 mb-1">
              {post.excerpt?.slice(0, 100)}...
            </p>
            <p className="text-xs text-gray-400">
              نویسنده: {post.author_username} •{" "}
              {new Date(post.created_at).toLocaleDateString("fa-IR")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
