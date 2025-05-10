import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 text-sm py-8 border-t border-gray-700 mt-10">
      <div className="container mx-auto px-6 text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-4">
          <Link to="/" className="hover:text-white">
            خانه
          </Link>
          <Link to="/tools" className="hover:text-white">
            ابزارها
          </Link>
          <Link to="/compare" className="hover:text-white">
            مقایسه
          </Link>
          <Link to="/blog" className="hover:text-white">
            بلاگ
          </Link>
          <Link to="/about" className="hover:text-white">
            درباره ما
          </Link>
        </div>

        <div className="flex justify-center gap-6 text-lg mb-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <i className="fab fa-github"></i>
          </a>
        </div>

        <p>© {new Date().getFullYear()} Hooshmetr - همه حقوق محفوظ است.</p>
      </div>
    </footer>
  );
}
