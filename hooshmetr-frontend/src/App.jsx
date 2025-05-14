import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Tools from "@/pages/Tools";
import Compare from "@/pages/Compare";
import ToolDetail from "@/pages/ToolDetail";
import Profile from "@/pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

/**
 * تعریف مسیرهای سایت با استفاده از react-router و layout
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="tools" element={<Tools />} />
        <Route path="compare" element={<Compare />} />
        <Route path="tools/:id" element={<ToolDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
}

export default App;
