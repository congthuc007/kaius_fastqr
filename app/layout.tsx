import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { seoDefaults, buildCanonicalUrl } from "@/lib/site-config"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${seoDefaults.baseUrl}/#website`,
      url: seoDefaults.baseUrl,
      name: seoDefaults.siteName,
      description: seoDefaults.description,
      inLanguage: "vi-VN",
      publisher: {
        "@id": `${seoDefaults.baseUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${seoDefaults.baseUrl}/?s={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${seoDefaults.baseUrl}/#organization`,
      name: "Kaius",
      url: seoDefaults.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${seoDefaults.baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: ["https://github.com/congthuc007"],
    },
    {
      "@type": "WebApplication",
      "@id": `${seoDefaults.baseUrl}/#webapplication`,
      name: seoDefaults.siteName,
      alternateName: "Kaius FastQR - Professional QR Generator & Scanner",
      description: seoDefaults.description,
      inLanguage: "vi-VN",
      url: seoDefaults.baseUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      permissions: "location",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      author: {
        "@type": "Person",
        name: "Kaius",
        url: "https://github.com/congthuc007",
      },
      publisher: {
        "@id": `${seoDefaults.baseUrl}/#organization`,
      },
      featureList: [
        "Tạo mã QR URL / Website",
        "Tạo mã QR vCard Danh Bạ",
        "Tạo mã QR Kết Nối WiFi",
        "Tạo mã QR SMS & Email",
        "Tạo mã QR Sự Kiện Lịch",
        "Tạo mã QR Vị Trí Bản Đồ",
        "Xác Thực Vị Trí Địa Lý (Geo-locking)",
        "Tùy Chỉnh Màu Sắc & Chèn Logo",
        "Kiểm Tra Tương Phản Mã QR Chuẩn WCAG",
        "Quét Mã QR Qua Camera & Tệp Ảnh",
      ],
      screenshot: `${seoDefaults.baseUrl}/og-image.png`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "320",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${seoDefaults.baseUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Kaius FastQR là gì?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kaius FastQR là trình tạo và quét mã QR trực tuyến miễn phí, hỗ trợ tạo mã QR URL, vCard, WiFi, GPS vị trí, SMS, Email, Sự kiện, tùy chỉnh màu sắc, logo và khóa vị trí địa lý (Geo-lock).",
          },
        },
        {
          "@type": "Question",
          name: "Tạo mã QR tại Kaius FastQR có mất phí hay giới hạn lượt dùng không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kaius FastQR hoàn toàn miễn phí 100%, không cần đăng ký tài khoản và không giới hạn số lượt tạo hay quét mã.",
          },
        },
        {
          "@type": "Question",
          name: "Tính năng Mã QR Khóa Vị Trí (Geo-Locked QR) hoạt động như thế nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Khi cài đặt vị trí cho mã QR, người quét phải bật GPS và di chuyển tới đúng bán kính 100m tính từ vị trí cài đặt mới xem được nội dung mã QR.",
          },
        },
        {
          "@type": "Question",
          name: "Mã QR được tạo ra có hết hạn không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tất cả mã QR được tạo bởi Kaius FastQR có giá trị vĩnh viễn và không bao giờ hết hạn.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${seoDefaults.baseUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: seoDefaults.baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Xác thực Vị trí",
          item: `${seoDefaults.baseUrl}/verify`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Multi-Link",
          item: `${seoDefaults.baseUrl}/links`,
        },
      ],
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(seoDefaults.baseUrl),
  title: {
    default: seoDefaults.marketingTitle,
    template: `%s | ${seoDefaults.siteName}`,
  },
  description: seoDefaults.description,
  keywords: seoDefaults.keywords,
  authors: [{ name: "Kaius", url: "https://github.com/congthuc007" }],
  creator: "Kaius",
  publisher: "Kaius",
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
  openGraph: {
    type: "website",
    locale: "vi_VN",
    alternateLocale: ["en_US"],
    url: seoDefaults.baseUrl,
    siteName: seoDefaults.siteName,
    title: seoDefaults.marketingTitle,
    description: seoDefaults.description,
    images: [
      {
        url: seoDefaults.ogImage,
        width: 1200,
        height: 630,
        alt: seoDefaults.marketingTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kaius_dev",
    creator: "@kaius_dev",
    title: seoDefaults.marketingTitle,
    description: seoDefaults.description,
    images: [seoDefaults.ogImage],
  },
  other: {
    "bingbot": "index, follow",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  alternates: {
    canonical: seoDefaults.canonical,
    languages: {
      "vi-VN": buildCanonicalUrl("/vi"),
      "en-US": buildCanonicalUrl("/en"),
    },
  },
  category: "Technology",
  classification: "Business Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#2563eb" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: seoDefaults.siteName,
  },
  applicationName: seoDefaults.siteName,
  generator: "Next.js",
  abstract: "Professional QR code generator with advanced customization and location verification features.",
  archives: [`${seoDefaults.baseUrl}/archive`],
  assets: [`${seoDefaults.baseUrl}/assets`],
  bookmarks: [`${seoDefaults.baseUrl}/bookmarks`],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="manifest" href="/manifest.json" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <meta name="site_name" content={seoDefaults.siteName} />
        <meta property="og:site_name" content={seoDefaults.siteName} />
        <meta name="application-name" content={seoDefaults.siteName} />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={seoDefaults.siteName} />

        <link rel="preload" href="/logo.png" as="image" type="image/png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

