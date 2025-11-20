// app/page.tsx

import dynamic from "next/dynamic"
import type { Metadata } from "next"
import { seoDefaults } from "@/lib/site-config"

export const metadata: Metadata = {
  title: seoDefaults.marketingTitle,
  description: seoDefaults.description,
  keywords: seoDefaults.keywords,
  openGraph: {
    title: seoDefaults.marketingTitle,
    description: seoDefaults.description,
    url: seoDefaults.baseUrl,
    siteName: seoDefaults.siteName,
    images: [
      {
        url: seoDefaults.ogImage,
        width: 1200,
        height: 630,
        alt: seoDefaults.siteName,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seoDefaults.siteName,
    description: seoDefaults.description,
    images: [seoDefaults.ogImage],
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
}

const QRGeneratorClient = dynamic(() => import("@/components/QRGeneratorClient"), {
  ssr: false,
})

export default function HomePage() {
  return <QRGeneratorClient />
}

