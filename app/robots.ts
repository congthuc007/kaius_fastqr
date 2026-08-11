import type { MetadataRoute } from "next"
import { seoDefaults } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = seoDefaults.baseUrl

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
