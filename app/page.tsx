// app/page.tsx

import dynamic from "next/dynamic"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kaius FastQR - Professional QR Code Generator",
  description:
    "Generate professional QR codes instantly with advanced customization. Supports URL, vCard, WiFi, SMS, Email, Events and more.",
  keywords: [
    "QR code generator",
    "Kaius FastQR",
    "custom QR code",
    "QR code free",
    "vCard QR",
    "WiFi QR",
    "SMS QR",
    "email QR",
    "location QR",
    "tạo mã QR miễn phí",
    "trình tạo mã QR chuyên nghiệp",
    "tạo mã QR online",
    "mã QR tùy chỉnh",
    "mã QR có logo",
    "tạo mã QR vCard",
    "tạo mã QR WiFi",
    "mã QR vị trí",
    "mã QR sự kiện",
    "mã QR tin nhắn SMS",
    "mã QR email",
    "tạo mã QR danh thiếp",
    "FastQR",
    "ứng dụng tạo mã QR miễn phí",
    "máy tạo QR code trực tuyến",
    "tạo mã QR có xác minh vị trí",
    "mã QR cho doanh nghiệp"
  ],
  openGraph: {
    title: "Kaius FastQR - Professional QR Code Generator",
    description:
      "Generate professional QR codes instantly with advanced customization. Supports vCard, WiFi, SMS, and more.",
    url: "https://fastqr.kaius.id.vn",
    siteName: "Kaius FastQR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kaius FastQR",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaius FastQR",
    description:
      "Free online QR code generator with advanced customization and location verification.",
    images: ["/og-image.png"],
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
