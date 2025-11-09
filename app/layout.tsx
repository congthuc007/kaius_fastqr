import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: {
    default: "Kaius FastQR - Trình tạo mã QR chuyên nghiệp | Miễn phí trực tuyến",
    template: "%s | Kaius FastQR",
  },
  description:
    "Tạo mã QR chuyên nghiệp tức thì với các tuỳ chọn tuỳ chỉnh nâng cao: URL, vCard, WiFi, SMS, Email, Sự kiện, Vị trí và hơn thế nữa. Công cụ tạo mã QR miễn phí hỗ trợ xác thực vị trí.",
  keywords: [
    // Vietnamese primary keywords first for better local SEO
    "tạo mã QR",
    "trình tạo mã QR",
    "tạo mã QR miễn phí",
    "mã QR chuyên nghiệp",
    "mã QR tuỳ chỉnh",
    "mã QR vCard",
    "mã QR WiFi",
    "mã QR vị trí",
    "mã QR có logo",
    "mã QR sự kiện",
    "mã QR SMS",
    "mã QR email",
    "Kaius FastQR",
    "tạo QR code online",
    "qr code cho doanh nghiệp",
    // English (retain for bilingual reach)
    "QR code generator",
    "free QR code",
    "professional QR generator",
    "custom QR code",
    "vCard QR code",
    "WiFi QR code",
    "location QR code",
    "QR code with logo",
    "business QR code",
    "event QR code",
    "SMS QR code",
    "email QR code",
    "online QR generator",
    "mobile QR scanner",
  ],
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
    url: "https://fastqr.kaius.id.vn",
    siteName: "Kaius FastQR",
    title: "Kaius FastQR - Trình tạo mã QR chuyên nghiệp",
    description:
      "Tạo mã QR chuyên nghiệp tức thì với tuỳ chỉnh nâng cao: URL, vCard, WiFi, SMS, Email, Sự kiện, Vị trí và hơn thế nữa.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kaius FastQR - Trình tạo mã QR chuyên nghiệp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kaius_dev",
    creator: "@kaius_dev",
    title: "Kaius FastQR - Mã QR chuyên nghiệp",
    description:
      "Tạo mã QR miễn phí với tuỳ chỉnh nâng cao và xác thực vị trí. Hỗ trợ URL, vCard, WiFi, SMS, Email, Sự kiện.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://fastqr.kaius.id.vn",
    languages: {
      "vi-VN": "https://fastqr.kaius.id.vn/vi",
      "en-US": "https://fastqr.kaius.id.vn/en",
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
  metadataBase: new URL("https://fastqr.kaius.id.vn"),
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
    title: "Kaius FastQR",
  },
  applicationName: "Kaius FastQR",
  generator: "Next.js",
  abstract: "Professional QR code generator with advanced customization and location verification features.",
  archives: ["https://fastqr.kaius.id.vn/archive"],
  assets: ["https://fastqr.kaius.id.vn/assets"],
  bookmarks: ["https://fastqr.kaius.id.vn/bookmarks"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Additional SEO tags */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Kaius FastQR",
              description: "Trình tạo mã QR chuyên nghiệp với các tuỳ chọn tuỳ chỉnh nâng cao",
              inLanguage: "vi-VN",
              url: "https://fastqr.kaius.id.vn",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              permissions: "location",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Kaius",
              },
              publisher: {
                "@type": "Organization",
                name: "Kaius",
                logo: {
                  "@type": "ImageObject",
                  url: "https://fastqr.kaius.id.vn/logo.png",
                },
              },
              featureList: [
                "Tạo mã QR URL",
                "Mã QR vCard (danh thiếp)",
                "Mã QR WiFi",
                "Mã QR SMS",
                "Mã QR Email",
                "Mã QR Sự kiện",
                "Mã QR Vị trí",
                "Tuỳ chỉnh màu sắc và kiểu dáng",
                "Xác thực vị trí",
                "Tối ưu di động",
              ],
              screenshot: "https://fastqr.kaius.id.vn/screenshot.png",
            }),
          }}
        />

        {/* Additional meta tags for better SEO */}
        <meta property="og:site_name" content="Kaius FastQR" />
        <meta name="application-name" content="Kaius FastQR" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kaius FastQR" />

        {/* Preload critical resources */}
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
