"use client"

import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, LinkIcon, Shield, Clock, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { decodeFromBase64 } from "@/utils/base64"

interface MultiLinkEntry {
  url: string
  title?: string
}

interface MultiLinkPayload {
  links: MultiLinkEntry[]
}

function MultiLinkContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  const payload = useMemo<MultiLinkPayload | null>(() => {
    const dataParam = searchParams.get("data")
    if (!dataParam) return null
    try {
        const decoded = JSON.parse(decodeFromBase64(dataParam))
      if (!decoded?.links || !Array.isArray(decoded.links)) return null
      const sanitizedLinks = decoded.links
        .map((item: MultiLinkEntry) => {
          const url = typeof item.url === "string" ? item.url.trim() : ""
          if (!url) return null
          return {
            url,
            title: typeof item.title === "string" && item.title.trim().length > 0 ? item.title.trim() : undefined,
          }
        })
        .filter((entry: MultiLinkEntry | null): entry is MultiLinkEntry => Boolean(entry))

      if (!sanitizedLinks.length) return null

      return {
        links: sanitizedLinks.map(({ url, title }: MultiLinkEntry) => ({ url, title })),
      }
    } catch {
      return null
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8 space-y-2">
          <Badge variant="outline" className="text-sm">
            Multi Link
          </Badge>
          <h1 className="text-3xl font-bold">{t("multilink.title")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("multilink.description")}</p>
        </div>

        {!payload ? (
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>{t("multilink.empty_state")}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {payload.links.map((entry: MultiLinkEntry, idx: number) => (
              <Card key={`${entry.url}-${idx}`} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl">
                      {entry.title || t("multilink.link_default", { index: idx + 1 })}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground break-all">{entry.url}</p>
                  </div>
                  <LinkIcon className="h-5 w-5 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t("multilink.available_anytime")}</span>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={entry.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t("multilink.visit")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Separator />
            <div className="rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium">{t("multilink.safe_title")}</p>
                  <p className="text-sm text-muted-foreground">{t("multilink.safe_desc")}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/">{t("multilink.create_own")}</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function MultiLinkLanding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading links...</p>
            </div>
          </main>
        </div>
      }
    >
      <MultiLinkContent />
    </Suspense>
  )
}
