import type { MetadataRoute } from "next"
import { seoDefaults } from "@/lib/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoDefaults.baseUrl
  const currentDate = new Date().toISOString()

  // Các loại mã QR chính để tối ưu hóa SEO theo ý định tìm kiếm (Search Intent)
  const qrTypes = [
    { type: "url", priority: 0.9, changeFreq: "weekly" as const },
    { type: "vcard", priority: 0.9, changeFreq: "weekly" as const },
    { type: "wifi", priority: 0.9, changeFreq: "weekly" as const },
    { type: "location", priority: 0.9, changeFreq: "weekly" as const },
    { type: "email", priority: 0.8, changeFreq: "weekly" as const },
    { type: "sms", priority: 0.8, changeFreq: "weekly" as const },
    { type: "event", priority: 0.8, changeFreq: "weekly" as const },
    { type: "facebook", priority: 0.8, changeFreq: "weekly" as const },
    { type: "multiurl", priority: 0.8, changeFreq: "weekly" as const },
  ]

  const typeEntries: MetadataRoute.Sitemap = qrTypes.map((item) => ({
    url: `${baseUrl}/?type=${item.type}`,
    lastModified: currentDate,
    changeFrequency: item.changeFreq,
    priority: item.priority,
  }))

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...typeEntries,
    {
      url: `${baseUrl}/verify`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/links`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]
}
