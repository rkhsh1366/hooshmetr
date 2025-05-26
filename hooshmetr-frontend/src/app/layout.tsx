import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

// فونت وزیرمتن
const vazirmatn = localFont({
  src: [
    {
      path: "../fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

// فونت اینتر برای متون انگلیسی
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | هوش‌متر",
    default: "هوش‌متر | مرجع مقایسه ابزارهای هوش مصنوعی",
  },
  description:
    "مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران فارسی‌زبان",
  keywords: [
    "هوش مصنوعی",
    "مقایسه ابزار",
    "هوش‌متر",
    "AI",
    "ابزارهای هوشمند",
    "ChatGPT",
    "DALL-E",
  ],
  authors: [{ name: "هوش‌متر" }],
  creator: "هوش‌متر",
  publisher: "هوش‌متر",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://hooshmetr.com"),
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
    },
  },
  openGraph: {
    title: "هوش‌متر | مرجع مقایسه ابزارهای هوش مصنوعی",
    description:
      "مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران فارسی‌زبان",
    url: "https://hooshmetr.com",
    siteName: "هوش‌متر",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "هوش‌متر | مرجع مقایسه ابزارهای هوش مصنوعی",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "هوش‌متر | مرجع مقایسه ابزارهای هوش مصنوعی",
    description:
      "مرجع جامع معرفی و مقایسه ابزارهای هوش مصنوعی برای کاربران فارسی‌زبان",
    images: ["/twitter-image.jpg"],
    creator: "@hooshmetr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0072f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${inter.variable}`}
    >
      <body className="flex flex-col min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
