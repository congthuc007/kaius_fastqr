/* =========================================================================
 * ⚙️ CẤU HÌNH TẬP TRUNG DUY NHẤT (SINGLE CONFIG FILE)
 * Toàn bộ thông tin GitHub, tác giả, tên trang và domain đều được định nghĩa ở đây.
 * Khi cần thay đổi bất kỳ thông tin nào, bạn CHỈ CẦN SỬA TRỰC TIẾP TẠI FILE NÀY!
 * ========================================================================= */

// 1. Cấu hình GitHub (Khi đổi tài khoản hoặc repo chỉ cần đổi 2 dòng này)
export const GITHUB_CONFIG = {
  username: "congthuc007",
  repo: "kaius_fastqr",
} as const

// 2. Cấu hình Tác giả & Thương hiệu
export const AUTHOR_CONFIG = {
  name: "Nguyễn Công Thức (Kaius)",
  brand: "Kaius",
  email: "thuctk04@gmail.com",
} as const

// 3. Cấu hình Website & Domain
export const SITE_METADATA = {
  name: "Kaius FastQR",
  tagline: "Trình Tạo & Quét Mã QR Code Chuyên Nghiệp Miễn Phí",
  description:
    "Trình tạo và quét mã QR Code chuyên nghiệp miễn phí trực tuyến. Hỗ trợ tạo mã QR URL, vCard danh bạ, WiFi, GPS vị trí khóa (Geo-lock), SMS, Email, Sự kiện, Facebook, Multi-Link. Tùy chỉnh màu sắc, chèn logo cá nhân, kiểm tra tương phản chuẩn WCAG, tải xuống ảnh chất lượng cao không bao giờ hết hạn.",
  domain: "fastqr.kaius.id.vn",
  baseUrl: "https://fastqr.kaius.id.vn",
} as const

// 4. Các đường dẫn GitHub (tự động sinh từ GITHUB_CONFIG)
export const githubLinks = {
  username: GITHUB_CONFIG.username,
  repo: GITHUB_CONFIG.repo,
  profileUrl: `https://github.com/${GITHUB_CONFIG.username}`,
  repoUrl: `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}`,
  issuesUrl: `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/issues`,
  cloneUrl: `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}.git`,
} as const

const marketingTitle = `${SITE_METADATA.name} - ${SITE_METADATA.tagline}`

/* =========================================================================
 * 🌐 SEO DEFAULTS EXPORT (Tương thích toàn diện với layout & page)
 * ========================================================================= */
export const seoDefaults = {
  siteName: SITE_METADATA.name,
  siteTagline: SITE_METADATA.tagline,
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
  domain: SITE_METADATA.domain,
  baseUrl: SITE_METADATA.baseUrl,
  canonical: SITE_METADATA.baseUrl,
  ogImage: "/og-image.png",
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
