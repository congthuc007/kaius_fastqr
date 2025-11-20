const fallbackSiteName = "Kaius FastQR"
const fallbackTagline = "Trình tạo mã QR chuyên nghiệp miễn phí trực tuyến"
const fallbackDescription =
  "Tạo mã QR chuyên nghiệp tức thì với các tùy chọn nâng cao như URL, vCard, WiFi, SMS, Email, Sự kiện và định vị. Công cụ hỗ trợ xác thực vị trí và tải xuống chất lượng cao."

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
    "trình tạo mã QR",
    "tạo mã QR miễn phí",
    "mã QR chuyên nghiệp",
    "mã QR tùy chỉnh",
    "mã QR vCard",
    "mã QR WiFi",
    "mã QR vị trí",
    "mã QR có logo",
    "mã QR sự kiện",
    "mã QR SMS",
    "mã QR email",
    "Kaius FastQR",
    "tạo QR code online",
    "QR code cho doanh nghiệp",
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

