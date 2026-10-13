/* =========================================================================
 * ⚙️ CẤU HÌNH TRUNG TÂM (CENTRAL CONFIGURATION)
 * Khi cần thay đổi thông tin dự án, tác giả hoặc GitHub, BẠN CHỈ CẦN ĐỔI BIẾN Ở ĐÂY
 * hoặc cấu hình qua các biến môi trường (.env / Vercel Environment Variables).
 * ========================================================================= */

// 1. Cấu hình GitHub (đổi username hoặc repo tại đây)
export const GITHUB_CONFIG = {
  username: process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim() || "congthuc007",
  repo: process.env.NEXT_PUBLIC_GITHUB_REPO?.trim() || "kaius_fastqr",
} as const

// 2. Cấu hình Tác giả & Thương hiệu
export const AUTHOR_CONFIG = {
  name: process.env.NEXT_PUBLIC_AUTHOR_NAME?.trim() || "Nguyễn Công Thức (Kaius)",
  brand: process.env.NEXT_PUBLIC_AUTHOR_BRAND?.trim() || "Kaius",
  email: process.env.NEXT_PUBLIC_AUTHOR_EMAIL?.trim() || "thuctk04@gmail.com",
} as const

// 3. Cấu hình Website & Nội dung mặc định
export const SITE_METADATA = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Kaius FastQR",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE?.trim() ||
    "Trình Tạo & Quét Mã QR Code Chuyên Nghiệp Miễn Phí",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    "Trình tạo và quét mã QR Code chuyên nghiệp miễn phí trực tuyến. Hỗ trợ tạo mã QR URL, vCard danh bạ, WiFi, GPS vị trí khóa (Geo-lock), SMS, Email, Sự kiện, Facebook, Multi-Link. Tùy chỉnh màu sắc, chèn logo cá nhân, kiểm tra tương phản chuẩn WCAG, tải xuống ảnh chất lượng cao không bao giờ hết hạn.",
  fallbackDomain: "fastqr.kaius.id.vn",
} as const

// 4. Các đường dẫn GitHub tự động tạo từ GITHUB_CONFIG
export const githubLinks = {
  username: GITHUB_CONFIG.username,
  repo: GITHUB_CONFIG.repo,
  profileUrl: `https://github.com/${GITHUB_CONFIG.username}`,
  repoUrl: `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}`,
  issuesUrl: `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/issues`,
  cloneUrl: `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}.git`,
} as const

/* =========================================================================
 * 🛠️ XỬ LÝ SANITIZE DOMAIN & BASE URL
 * ========================================================================= */
const sanitizeDomain = (value: string) =>
  value.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim()

const sanitizeBaseUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
}

const envDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN
const domain =
  envDomain && sanitizeDomain(envDomain).length > 0
    ? sanitizeDomain(envDomain)
    : SITE_METADATA.fallbackDomain

const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
const baseUrl =
  envBaseUrl && sanitizeBaseUrl(envBaseUrl).length > 0
    ? sanitizeBaseUrl(envBaseUrl)
    : `https://${domain}`

const siteName = SITE_METADATA.name
const siteTagline = SITE_METADATA.tagline
const marketingTitle = `${siteName} - ${siteTagline}`

/* =========================================================================
 * 🌐 SEO DEFAULTS EXPORT (Tương thích toàn diện với mã nguồn hiện tại)
 * ========================================================================= */
export const seoDefaults = {
  siteName,
  siteTagline,
  marketingTitle,
  description: SITE_METADATA.description,
  authorName: AUTHOR_CONFIG.name,
  authorBrand: AUTHOR_CONFIG.brand,
  authorEmail: AUTHOR_CONFIG.email,
  githubUsername: GITHUB_CONFIG.username,
  githubRepoName: GITHUB_CONFIG.repo,
  githubUrl: githubLinks.repoUrl,
  githubProfile: githubLinks.profileUrl,
  githubRepo: `${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}`,
  githubCloneUrl: githubLinks.cloneUrl,
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

export const siteConfig = {
  github: githubLinks,
  author: AUTHOR_CONFIG,
  site: SITE_METADATA,
  seo: seoDefaults,
} as const

export const buildCanonicalUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, `${seoDefaults.baseUrl}/`)
    .toString()
    .replace(/\/$/, normalizedPath === "/" ? "/" : "")
}
