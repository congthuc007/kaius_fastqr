import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: {
    default: "Kaius FastQR - Professional QR Code Generator | Free Online Tool",
    template: "%s | Kaius FastQR",
  },
  description:
    "Generate professional QR codes instantly with advanced customization options. Support for URL, vCard, WiFi, SMS, Email, Events and more. Free online QR code generator with location verification.",
  keywords: [
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
    "Kaius FastQR",
    "online QR generator",
    "mobile QR scanner",
  ],
  authors: [{ name: "Kaius", url: "https://kaius.dev" }],
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
    locale: "en_US",
    alternateLocale: ["vi_VN"],
    url: "https://kaius-fastqr.vercel.app",
    siteName: "Kaius FastQR",
    title: "Kaius FastQR - Professional QR Code Generator",
    description:
      "Generate professional QR codes instantly with advanced customization options. Support for URL, vCard, WiFi, SMS, Email, Events and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kaius FastQR - Professional QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kaius_dev",
    creator: "@kaius_dev",
    title: "Kaius FastQR - Professional QR Code Generator",
    description:
      "Generate professional QR codes instantly with advanced customization options. Free online tool with location verification.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://kaius-fastqr.vercel.app",
    languages: {
      "en-US": "https://kaius-fastqr.vercel.app/en",
      "vi-VN": "https://kaius-fastqr.vercel.app/vi",
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
  metadataBase: new URL("https://kaius-fastqr.vercel.app"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.png", color: "#2563eb" },
      { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaius FastQR",
  },
  applicationName: "Kaius FastQR",
  generator: "Next.js",
  abstract: "Professional QR code generator with advanced customization and location verification features.",
  archives: ["https://kaius-fastqr.vercel.app/archive"],
  assets: ["https://kaius-fastqr.vercel.app/assets"],
  bookmarks: ["https://kaius-fastqr.vercel.app/bookmarks"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO tags */}
        {/* Favicon meta tags */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Kaius FastQR",
              description: "Professional QR code generator with advanced customization options",
              url: "https://kaius-fastqr.vercel.app",
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
                  url: "https://kaius-fastqr.vercel.app/logo.png",
                },
              },
              featureList: [
                "URL QR Code Generation",
                "vCard QR Code",
                "WiFi QR Code",
                "SMS QR Code",
                "Email QR Code",
                "Event QR Code",
                "Location QR Code",
                "Custom Colors and Styling",
                "Location Verification",
                "Mobile Responsive",
              ],
              screenshot: "https://kaius-fastqr.vercel.app/screenshot.png",
            }),
          }}
        />

        {/* Additional meta tags for better SEO */}
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
