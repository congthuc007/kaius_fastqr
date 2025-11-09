// app/page.tsx

import dynamic from "next/dynamic"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kaius FastQR - Trình tạo mã QR chuyên nghiệp",
  description:
    "Tạo mã QR chuyên nghiệp ngay lập tức với tuỳ chỉnh nâng cao. Hỗ trợ URL, vCard, WiFi, SMS, Email, Sự kiện và nhiều hơn nữa.",
  keywords: [
    "tạo mã QR",
    "trình tạo mã QR",
    "tạo mã QR miễn phí",
    "mã QR tuỳ chỉnh",
    "mã QR có logo",
    "mã QR vCard",
    "mã QR WiFi",
    "mã QR vị trí",
    "mã QR sự kiện",
    "mã QR SMS",
    "mã QR email",
    "tạo mã QR danh thiếp",
    "FastQR",
    "ứng dụng tạo mã QR miễn phí",
    "tạo mã QR có xác thực vị trí",
    "mã QR cho doanh nghiệp",
    // retain some English terms
    "QR code generator",
    "custom QR code",
    "free QR code",
  ],
  openGraph: {
    title: "Kaius FastQR - Trình tạo mã QR chuyên nghiệp",
    description:
      "Tạo mã QR chuyên nghiệp tức thì với tuỳ chỉnh nâng cao. Hỗ trợ vCard, WiFi, SMS và nhiều hơn nữa.",
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
      "Công cụ tạo mã QR miễn phí với tuỳ chỉnh nâng cao và xác thực vị trí.",
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
