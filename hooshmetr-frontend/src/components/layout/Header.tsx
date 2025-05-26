"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isToolsSubmenuOpen, setIsToolsSubmenuOpen] = useState(false);

  // بستن منو در صورت تغییر مسیر
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsToolsSubmenuOpen(false);
  }, [pathname]);

  // تغییر استایل هدر در هنگام اسکرول
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // بستن منو در صورت کلیک خارج از منو
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById("user-menu");
      const toolsSubmenu = document.getElementById("tools-submenu");

      if (
        isUserMenuOpen &&
        userMenu &&
        !userMenu.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }

      if (
        isToolsSubmenuOpen &&
        toolsSubmenu &&
        !toolsSubmenu.contains(event.target as Node)
      ) {
        setIsToolsSubmenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isToolsSubmenuOpen]);

  // ارسال فرم جستجو
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  };

  // آیتم‌های منوی اصلی
  const menuItems = [
    { title: "صفحه اصلی", href: "/" },
    {
      title: "ابزارها",
      href: "/tools",
      hasSubmenu: true,
      submenu: [
        { title: "همه ابزارها", href: "/tools" },
        { title: "چت‌بات‌ها", href: "/tools?category=chatbots" },
        { title: "تولید تصویر", href: "/tools?category=image-generation" },
        { title: "تولید متن", href: "/tools?category=text-generation" },
        { title: "کدنویسی", href: "/tools?category=coding" },
        { title: "تولید صدا", href: "/tools?category=audio-generation" },
        { title: "ویرایش ویدیو", href: "/tools?category=video-editing" },
      ],
    },
    { title: "مقایسه", href: "/compare" },
    { title: "وبلاگ", href: "/blog" },
    { title: "درباره ما", href: "/about" },
    { title: "تماس با ما", href: "/contact" },
  ];

  // آیتم‌های منوی کاربر
  const userMenuItems = [
    { title: "پروفایل", href: "/profile", icon: <FaUser className="ml-2" /> },
    {
      title: "مقایسه‌های من",
      href: "/profile/comparisons",
      icon: <FaUser className="ml-2" />,
    },
    {
      title: "نشان‌شده‌ها",
      href: "/profile/bookmarks",
      icon: <FaUser className="ml-2" />,
    },
    {
      title: "نظرات من",
      href: "/profile/reviews",
      icon: <FaUser className="ml-2" />,
    },
    {
      title: "خروج",
      onClick: () => logout(),
      icon: <FaSignOutAlt className="ml-2" />,
      isDanger: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* لوگو */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="هوش‌متر"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900 mr-2">
                هوش‌متر
              </span>
            </Link>
          </div>

          {/* منوی دسکتاپ */}
          <nav className="hidden md:flex items-center space-x-4 space-x-reverse">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.hasSubmenu ? (
                  <>
                    <button
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        pathname === item.href ||
                        pathname?.startsWith(`${item.href}/`)
                          ? "text-blue-600"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                      onClick={() => setIsToolsSubmenuOpen(!isToolsSubmenuOpen)}
                      id="tools-submenu-button"
                    >
                      {item.title}
                      <FaChevronDown className="mr-1 h-3 w-3" />
                    </button>

                    {isToolsSubmenuOpen && (
                      <div
                        id="tools-submenu"
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                      >
                        {item.submenu?.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm ${
                              pathname === subItem.href
                                ? "bg-gray-100 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`)
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* جستجو و احراز هویت */}
          <div className="flex items-center">
            {/* فرم جستجو */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex mr-4 relative"
            >
              <input
                type="text"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 text-gray-900 rounded-full py-2 pl-10 pr-4 w-48 focus:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaSearch />
              </button>
            </form>

            {/* دکمه‌های ورود/ثبت‌نام یا منوی کاربر */}
            <div className="relative">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="user-menu-button"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {user?.display_name?.[0] ||
                        user?.first_name?.[0] ||
                        user?.phone_number?.[0] ||
                        "ک"}
                    </div>
                  </button>

                  {/* منوی کاربر */}
                  {isUserMenuOpen && (
                    <div
                      id="user-menu"
                      className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.display_name ||
                            user?.first_name ||
                            "کاربر هوش‌متر"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.phone_number}
                        </p>
                      </div>

                      <div className="py-1">
                        {userMenuItems.map((item, index) =>
                          item.onClick ? (
                            <button
                              key={index}
                              onClick={item.onClick}
                              className={`flex items-center w-full text-right px-4 py-2 text-sm ${
                                item.isDanger
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                              }`}
                            >
                              {item.icon}
                              {item.title}
                            </button>
                          ) : (
                            <Link
                              key={index}
                              href={item.href!}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            >
                              {item.icon}
                              {item.title}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      ورود
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">ثبت‌نام</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* دکمه منوی موبایل */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden ml-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            {/* فرم جستجوی موبایل */}
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 text-gray-900 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaSearch />
              </button>
            </form>

            {/* آیتم‌های منو */}
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.hasSubmenu ? (
                    <>
                      <button
                        className={`flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-md ${
                          pathname === item.href ||
                          pathname?.startsWith(`${item.href}/`)
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                        onClick={() =>
                          setIsToolsSubmenuOpen(!isToolsSubmenuOpen)
                        }
                      >
                        {item.title}
                        <FaChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isToolsSubmenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isToolsSubmenuOpen && (
                        <div className="mt-1 pr-4 border-r-2 border-gray-200">
                          {item.submenu?.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              className={`block px-3 py-2 text-sm rounded-md ${
                                pathname === subItem.href
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-base font-medium rounded-md ${
                        pathname === item.href ||
                        pathname?.startsWith(`${item.href}/`)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* بخش احراز هویت موبایل */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div>
                  <div className="flex items-center px-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                      {user?.display_name?.[0] ||
                        user?.first_name?.[0] ||
                        user?.phone_number?.[0] ||
                        "ک"}
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900">
                        {user?.display_name ||
                          user?.first_name ||
                          "کاربر هوش‌متر"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    {userMenuItems.map((item, index) =>
                      item.onClick ? (
                        <button
                          key={index}
                          onClick={item.onClick}
                          className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md ${
                            item.isDanger
                              ? "text-red-600 hover:bg-red-50"
                              : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                          }`}
                        >
                          {item.icon}
                          {item.title}
                        </button>
                      ) : (
                        <Link
                          key={index}
                          href={item.href!}
                          className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          {item.icon}
                          {item.title}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login">
                    <Button variant="outline" fullWidth>
                      ورود
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button fullWidth>ثبت‌نام</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
