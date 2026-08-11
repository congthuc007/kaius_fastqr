const fallbackSiteName = "Kaius FastQR"
const fallbackTagline = "Trình Tạo & Quét Mã QR Code Chuyên Nghiệp Miễn Phí"
const fallbackDescription =
  "Trình tạo và quét mã QR Code chuyên nghiệp miễn phí trực tuyến. Hỗ trợ tạo mã QR URL, vCard danh bạ, WiFi, GPS vị trí khóa (Geo-lock), SMS, Email, Sự kiện, Facebook, Multi-Link. Tùy chỉnh màu sắc, chèn logo cá nhân, kiểm tra tương phản chuẩn WCAG, tải xuống ảnh chất lượng cao không bao giờ hết hạn."

const sanitizeDomain = (value: string) =>
  value.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim()

const sanitizeBaseUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
}

const envDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN
const domain = envDomain && sanitizeDomain(envDomain).length > 0 ? sanitizeDomain(envDomain) : "fastqr.kaius.id.vn"

const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
const baseUrl =
  envBaseUrl && sanitizeBaseUrl(envBaseUrl).length > 0
    ? sanitizeBaseUrl(envBaseUrl)
    : `https://${domain}`

const siteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || fallbackSiteName
const siteTagline = process.env.NEXT_PUBLIC_SITE_TAGLINE?.trim() || fallbackTagline
const marketingTitle = `${siteName} - ${siteTagline}`

export const seoDefaults = {
  siteName,
  siteTagline,
  marketingTitle,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() || fallbackDescription,
  keywords: [
    "tạo mã QR",
    "tạo mã QR code online",
    "tạo mã QR miễn phí",
    "trình tạo mã QR chuyên nghiệp",
    "tạo mã QR có logo",
    "tạo mã QR wifi",
    "mã QR vCard danh bạ",
    "mã QR vị trí địa lý",
    "mã QR khoá vị trí",
    "geo locked QR code",
    "mã QR sự kiện lịch",
    "mã QR SMS nhắn tin",
    "mã QR email soạn sẵn",
    "mã QR Facebook",
    "mã QR multi link",
    "quét mã QR online camera",
    "quét mã QR từ hình ảnh",
    "tạo QR code không hết hạn",
    "tùy chỉnh màu mã QR",
    "kiểm tra tương phản QR",
    "Kaius FastQR",
    "free QR code generator",
    "custom QR code maker",
    "QR code generator with logo",
    "wifi QR code generator",
    "vcard QR code generator",
    "location locked QR code",
    "online QR scanner",
  ],
  baseUrl,
  domain,
  canonical: `${baseUrl}`,
  ogImage: "/og-image.png",
}

export const buildCanonicalUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, `${seoDefaults.baseUrl}/`).toString().replace(/\/$/, normalizedPath === "/" ? "/" : "")
}
