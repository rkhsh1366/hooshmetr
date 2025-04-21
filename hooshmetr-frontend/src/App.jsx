import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Tools from "@/pages/Tools";
import Compare from "@/pages/Compare";
import ToolDetail from "@/pages/ToolDetail";
import Profile from "@/pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

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
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
