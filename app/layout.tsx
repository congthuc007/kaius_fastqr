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
  "@type": "WebApplication",
  name: seoDefaults.siteName,
  description: seoDefaults.description,
  inLanguage: "vi-VN",
  url: seoDefaults.baseUrl,
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
      url: `${seoDefaults.baseUrl}/logo.png`,
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
    "Tùy chỉnh màu sắc và kiểu dáng",
    "Xác thực vị trí",
    "Tải xuống chất lượng cao",
  ],
  screenshot: `${seoDefaults.baseUrl}/screenshot.png`,
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
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

