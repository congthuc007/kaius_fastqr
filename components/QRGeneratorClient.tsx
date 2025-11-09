"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import {
  MapPin,
  Download,
  QrCode,
  LinkIcon,
  MessageSquare,
  Phone,
  Wifi,
  User,
  Calendar,
  Navigation,
  Mail,
  MessageCircle,
  Facebook,
  Palette,
  Settings,
  Loader2,
} from "lucide-react"
import QRCodeLib from "qrcode"
import Image from "next/image"
import { validateQRColors, suggestBetterColors } from "@/utils/color-validation"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

type QRType = "url" | "text" | "email" | "phone" | "vcard" | "sms" | "event" | "wifi" | "location" | "facebook" | "multiurl"

interface QRData {
  type: QRType
  content: string
  requireLocation: boolean
  location?: LocationData
  timestamp?: string
  metadata?: any
}

interface QRCustomization {
  foregroundColor: string
  backgroundColor: string
  size: number
  margin: number
  errorCorrectionLevel: "L" | "M" | "Q" | "H"
  dotStyle: "square" | "rounded" | "circle" | "diamond"
  cornerStyle: "square" | "rounded" | "circle"
  // Logo customization
  logoEnabled?: boolean
  logoSize?: number // percentage of QR size
  logoPadding?: number // padding around logo box in px
  logoRound?: boolean
  logoBgColor?: string
}

export default function QRGenerator() {
  const { t } = useLanguage()
  const [qrType, setQrType] = useState<QRType>("url")
  const [requireLocation, setRequireLocation] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [locationError, setLocationError] = useState("")
  const [colorValidation, setColorValidation] = useState<{
    isValid: boolean
    warning: string | null
    severity: "error" | "warning" | null
  }>({ isValid: true, warning: null, severity: null })

  // QR Customization
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    size: 300,
    margin: 2,
    errorCorrectionLevel: "M",
    dotStyle: "square",
    cornerStyle: "square",
    logoEnabled: false,
    logoSize: 20,
    logoPadding: 8,
    logoRound: true,
    logoBgColor: "#FFFFFF",
  })

  // Form data cho các loại QR khác nhau
  const [urlData, setUrlData] = useState("")
  const [textData, setTextData] = useState("")
  const [emailData, setEmailData] = useState({ email: "", subject: "", body: "" })
  const [phoneData, setPhoneData] = useState("")
  const [vcardData, setVcardData] = useState({
    name: "",
    phone: "",
    email: "",
    organization: "",
    address: "",
    website: "",
    note: "",
  })
  const [smsData, setSmsData] = useState({ phone: "", message: "" })
  const [eventData, setEventData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    url: "",
  })
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", security: "WPA", hidden: false })
  const [locationData, setLocationData] = useState({ latitude: "", longitude: "", label: "" })
  const [facebookUsername, setFacebookUsername] = useState("")
  // Multi-link entries with optional title
  const [multiUrls, setMultiUrls] = useState<{ url: string; title: string }[]>([{ url: "", title: "" }])
  // Logo file state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Lấy vị trí hiện tại
  const getCurrentLocation = () => {
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError("Browser doesn't support geolocation")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t("verify.permission_denied"))
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError(t("verify.position_unavailable"))
            break
          case error.TIMEOUT:
            setLocationError(t("verify.timeout"))
            break
          default:
            setLocationError(t("verify.unknown_error"))
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  // Tự động lấy vị trí khi bật yêu cầu định vị
  useEffect(() => {
    if (requireLocation && !location) {
      getCurrentLocation()
    }
  }, [requireLocation])

  useEffect(() => {
    const validation = validateQRColors(customization.foregroundColor, customization.backgroundColor, t)
    setColorValidation(validation)
  }, [customization.foregroundColor, customization.backgroundColor, t])

  // Tạo nội dung QR dựa trên loại
  const generateQRContent = (): string => {
    switch (qrType) {
      case "url":
        return urlData.trim()

      case "text":
        return textData.trim()

      case "email":
        const emailParams = new URLSearchParams()
        if (emailData.subject) emailParams.append("subject", emailData.subject)
        if (emailData.body) emailParams.append("body", emailData.body)
        const emailQuery = emailParams.toString()
        return `mailto:${emailData.email}${emailQuery ? "?" + emailQuery : ""}`

      case "phone":
        return `tel:${phoneData.trim()}`

      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardData.name}
TEL:${vcardData.phone}
EMAIL:${vcardData.email}
ORG:${vcardData.organization}
ADR:;;${vcardData.address};;;;
URL:${vcardData.website}
NOTE:${vcardData.note}
END:VCARD`

      case "sms":
        return `sms:${smsData.phone}?body=${encodeURIComponent(smsData.message)}`

      case "event":
        const startDate = eventData.startDate
          ? new Date(eventData.startDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
          : ""
        const endDate = eventData.endDate
          ? new Date(eventData.endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
          : ""
        return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventData.title}
LOCATION:${eventData.location}
DTSTART:${startDate}
DTEND:${endDate}
DESCRIPTION:${eventData.description}
URL:${eventData.url}
END:VEVENT
END:VCALENDAR`

      case "wifi":
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? "true" : "false"};;`

      case "location":
        const lat = locationData.latitude || location?.latitude || 0
        const lng = locationData.longitude || location?.longitude || 0
        return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(locationData.label || "Location")})`

      case "facebook":
        {
          let username = facebookUsername.trim()
          // normalize username: remove leading @ and spaces
          if (username.startsWith("@")) username = username.slice(1)
          // basic sanitation: keep common allowed chars (letters, numbers, dot, underscore)
          username = username.replace(/[^a-zA-Z0-9._]/g, "")
          return username ? `https://facebook.com/${username}` : ""
        }

      case "multiurl": {
        const cleaned = multiUrls
          .map((entry) => ({ url: entry.url.trim(), title: entry.title.trim() }))
          .filter((e) => e.url !== "")
        if (!cleaned.length) return ""
        return JSON.stringify({ links: cleaned })
      }

      default:
        return ""
    }
  }

  // Kiểm tra dữ liệu hợp lệ
  const validateData = (): boolean => {
    switch (qrType) {
      case "url":
        return urlData.trim() !== ""
      case "text":
        return textData.trim() !== ""
      case "email":
        return emailData.email.trim() !== ""
      case "phone":
        return phoneData.trim() !== ""
      case "vcard":
        return vcardData.name.trim() !== ""
      case "sms":
        return smsData.phone.trim() !== ""
      case "event":
        return eventData.title.trim() !== ""
      case "wifi":
        return wifiData.ssid.trim() !== ""
      case "location":
        return ((!!locationData.latitude && !!locationData.longitude) || location !== null)
      case "facebook":
        return facebookUsername.trim() !== ""
      case "multiurl":
        return multiUrls.some((e) => e.url.trim() !== "")
      default:
        return false
    }
  }

  // Tạo QR code
  const generateQRCode = async () => {
    if (!validateData()) {
      setError(t("msg.fill_required"))
      return
    }

    if (!colorValidation.isValid) {
      setError(t("msg.invalid_colors"))
      return
    }

    if (requireLocation && !location) {
      setError(t("msg.allow_location_access"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let finalContent = generateQRContent()

      // Nếu yêu cầu định vị, tạo URL đến trang verification
      if (requireLocation && location) {
        const qrData: QRData = {
          type: qrType,
          content: finalContent,
          requireLocation: true,
          location,
          timestamp: new Date().toISOString(),
          metadata: {
            originalType: qrType,
          },
        }

        const verificationUrl = new URL(`${window.location.origin}/verify`)
        verificationUrl.searchParams.append("data", btoa(JSON.stringify(qrData)))
        finalContent = verificationUrl.toString()
      }

      const qrCodeDataUrl = await QRCodeLib.toDataURL(finalContent, {
        width: customization.size,
        margin: customization.margin,
        color: {
          dark: customization.foregroundColor,
          light: customization.backgroundColor,
        },
        errorCorrectionLevel: customization.errorCorrectionLevel,
      })
      // Compose logo overlay if enabled
      let finalDataUrl = qrCodeDataUrl
      if (customization.logoEnabled && logoFile) {
        try {
          finalDataUrl = await composeLogo(qrCodeDataUrl)
        } catch (e) {
          // ignore composition errors
        }
      }
      setQrCodeUrl(finalDataUrl)
    } catch (err) {
      setError(t("msg.generation_error"))
    } finally {
      setIsLoading(false)
    }
  }

  // Tải xuống QR code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.download = `kaius-fastqr-${qrType}-${Date.now()}.png`
    link.href = qrCodeUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset form
  const resetForm = () => {
    setQrCodeUrl("")
    setError("")
    setLogoFile(null)
    setLogoPreview(null)
    // Reset form data based on type
    switch (qrType) {
      case "url":
        setUrlData("")
        break
      case "text":
        setTextData("")
        break
      case "email":
        setEmailData({ email: "", subject: "", body: "" })
        break
      case "phone":
        setPhoneData("")
        break
      case "vcard":
        setVcardData({ name: "", phone: "", email: "", organization: "", address: "", website: "", note: "" })
        break
      case "sms":
        setSmsData({ phone: "", message: "" })
        break
      case "event":
        setEventData({ title: "", location: "", startDate: "", endDate: "", description: "", url: "" })
        break
      case "wifi":
        setWifiData({ ssid: "", password: "", security: "WPA", hidden: false })
        break
      case "location":
        setLocationData({ latitude: "", longitude: "", label: "" })
        break
      case "facebook":
        setFacebookUsername("")
        break
      case "multiurl":
        setMultiUrls([{ url: "", title: "" }])
        break
    }
  }

  // Compose logo overlay using canvas
  const composeLogo = async (qrDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const qrImg = document.createElement("img")
      qrImg.crossOrigin = "anonymous"
      qrImg.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = qrImg.width
        canvas.height = qrImg.height
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("No 2D context"))
        ctx.drawImage(qrImg, 0, 0)

        if (!logoPreview) return resolve(qrDataUrl)

        const logoImg = document.createElement("img")
        logoImg.crossOrigin = "anonymous"
        logoImg.onload = () => {
          const sizePct = customization.logoSize || 20
          const logoBoxSize = Math.round((sizePct / 100) * qrImg.width)
          const padding = customization.logoPadding || 0
          const totalBoxSize = logoBoxSize + padding * 2
          const x = (qrImg.width - totalBoxSize) / 2
          const y = (qrImg.height - totalBoxSize) / 2

          // Draw background container so circular logos remain true circles
          ctx.save()
          ctx.fillStyle = customization.logoBgColor || "#FFFFFF"
          if (customization.logoRound) {
            const centerX = x + totalBoxSize / 2
            const centerY = y + totalBoxSize / 2
            const radius = totalBoxSize / 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.closePath()
            ctx.fill()
          } else {
            ctx.fillRect(x, y, totalBoxSize, totalBoxSize)
          }
          ctx.restore()

          // Crop and scale logo to perfect square so it never leaves empty bars
          const naturalWidth = logoImg.naturalWidth || logoImg.width
          const naturalHeight = logoImg.naturalHeight || logoImg.height
          const squareSourceSize = Math.min(naturalWidth, naturalHeight)
          const sourceX = naturalWidth > naturalHeight ? (naturalWidth - naturalHeight) / 2 : 0
          const sourceY = naturalHeight > naturalWidth ? (naturalHeight - naturalWidth) / 2 : 0
          const drawX = x + padding
          const drawY = y + padding

          if (customization.logoRound) {
            ctx.save()
            const clipRadius = logoBoxSize / 2
            const clipCenterX = x + totalBoxSize / 2
            const clipCenterY = y + totalBoxSize / 2
            ctx.beginPath()
            ctx.arc(clipCenterX, clipCenterY, clipRadius, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
            ctx.drawImage(
              logoImg,
              sourceX,
              sourceY,
              squareSourceSize,
              squareSourceSize,
              drawX,
              drawY,
              logoBoxSize,
              logoBoxSize,
            )
            ctx.restore()
          } else {
            ctx.drawImage(
              logoImg,
              sourceX,
              sourceY,
              squareSourceSize,
              squareSourceSize,
              drawX,
              drawY,
              logoBoxSize,
              logoBoxSize,
            )
          }

          resolve(canvas.toDataURL("image/png"))
        }
        logoImg.onerror = reject
        logoImg.src = logoPreview
      }
      qrImg.onerror = reject
      qrImg.src = qrDataUrl
    })
  }

  const qrTypeIcons = {
    url: LinkIcon,
    text: MessageSquare,
    email: Mail,
    phone: Phone,
    vcard: User,
    sms: MessageCircle,
    event: Calendar,
    wifi: Wifi,
    location: Navigation,
    facebook: Facebook,
    multiurl: LinkIcon,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("app.description")}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form tạo QR */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  {t("form.qr_type")}
                </CardTitle>
                <CardDescription>{t("app.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chọn loại QR */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">{t("form.qr_type")}</Label>
                  <Tabs value={qrType} onValueChange={(value) => setQrType(value as QRType)} className="w-full">
                    <TabsList className="grid grid-cols-5 lg:grid-cols-11 h-auto gap-1 p-1">
                      {Object.entries({
                        url: t("qr.url"),
                        text: t("qr.text"),
                        email: t("qr.email"),
                        phone: t("qr.phone"),
                        vcard: t("qr.vcard"),
                        sms: t("qr.sms"),
                        event: t("qr.event"),
                        wifi: t("qr.wifi"),
                        location: t("qr.location"),
                        facebook: t("qr.facebook"),
                        multiurl: t("qr.multiurl"),
                      }).map(([type, label]) => {
                        const Icon = qrTypeIcons[type as QRType]
                        return (
                          <TabsTrigger
                            key={type}
                            value={type}
                            className="flex flex-col gap-1 p-3 text-xs min-h-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="leading-tight">{label}</span>
                          </TabsTrigger>
                        )
                      })}
                    </TabsList>

                    {/* Form cho từng loại QR */}
                    <div className="mt-6 space-y-4">
                      <TabsContent value="url" className="space-y-4">
                        <div>
                          <Label htmlFor="url">{t("form.url")} *</Label>
                          <Input
                            id="url"
                            type="url"
                            placeholder={t("placeholder.url")}
                            value={urlData}
                            onChange={(e) => setUrlData(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="text" className="space-y-4">
                        <div>
                          <Label htmlFor="text">{t("form.text_content")} *</Label>
                          <Textarea
                            id="text"
                            placeholder={t("placeholder.text")}
                            value={textData}
                            onChange={(e) => setTextData(e.target.value)}
                            rows={4}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="email" className="space-y-4">
                        <div>
                          <Label htmlFor="email">{t("form.email")} *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t("placeholder.email")}
                            value={emailData.email}
                            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-subject">{t("form.email")} Subject</Label>
                          <Input
                            id="email-subject"
                            placeholder={t("placeholder.email_subject")}
                            value={emailData.subject}
                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-body">{t("form.email")} Body</Label>
                          <Textarea
                            id="email-body"
                            placeholder={t("placeholder.email_body")}
                            value={emailData.body}
                            onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="phone" className="space-y-4">
                        <div>
                          <Label htmlFor="phone">{t("form.phone")} *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder={t("placeholder.phone")}
                            value={phoneData}
                            onChange={(e) => setPhoneData(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="vcard" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vcard-name">{t("form.name")} *</Label>
                            <Input
                              id="vcard-name"
                              placeholder={t("placeholder.name")}
                              value={vcardData.name}
                              onChange={(e) => setVcardData({ ...vcardData, name: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcard-phone">{t("form.phone")}</Label>
                            <Input
                              id="vcard-phone"
                              type="tel"
                              placeholder={t("placeholder.phone")}
                              value={vcardData.phone}
                              onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcard-email">{t("form.email")}</Label>
                            <Input
                              id="vcard-email"
                              type="email"
                              placeholder={t("placeholder.email")}
                              value={vcardData.email}
                              onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcard-org">{t("form.organization")}</Label>
                            <Input
                              id="vcard-org"
                              placeholder={t("placeholder.company")}
                              value={vcardData.organization}
                              onChange={(e) => setVcardData({ ...vcardData, organization: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="vcard-address">{t("form.address")}</Label>
                          <Input
                            id="vcard-address"
                            placeholder={t("placeholder.address")}
                            value={vcardData.address}
                            onChange={(e) => setVcardData({ ...vcardData, address: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vcard-website">{t("form.website")}</Label>
                          <Input
                            id="vcard-website"
                            type="url"
                            placeholder={t("placeholder.website")}
                            value={vcardData.website}
                            onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vcard-note">{t("form.note")}</Label>
                          <Textarea
                            id="vcard-note"
                            placeholder={t("placeholder.note")}
                            value={vcardData.note}
                            onChange={(e) => setVcardData({ ...vcardData, note: e.target.value })}
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="sms" className="space-y-4">
                        <div>
                          <Label htmlFor="sms-phone">{t("form.phone")} *</Label>
                          <Input
                            id="sms-phone"
                            type="tel"
                            placeholder={t("placeholder.phone")}
                            value={smsData.phone}
                            onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sms-message">{t("form.message")}</Label>
                          <Textarea
                            id="sms-message"
                            placeholder={t("placeholder.message")}
                            value={smsData.message}
                            onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="event" className="space-y-4">
                        <div>
                          <Label htmlFor="event-title">{t("form.event_title")} *</Label>
                          <Input
                            id="event-title"
                            placeholder={t("placeholder.event_name")}
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-location">{t("form.event_location")}</Label>
                          <Input
                            id="event-location"
                            placeholder={t("placeholder.event_location")}
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-date">{t("form.start_date")}</Label>
                            <Input
                              id="start-date"
                              type="datetime-local"
                              value={eventData.startDate}
                              onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date">{t("form.end_date")}</Label>
                            <Input
                              id="end-date"
                              type="datetime-local"
                              value={eventData.endDate}
                              onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="event-url">Event URL</Label>
                          <Input
                            id="event-url"
                            type="url"
                            placeholder={t("placeholder.event_url")}
                            value={eventData.url}
                            onChange={(e) => setEventData({ ...eventData, url: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-desc">{t("form.description")}</Label>
                          <Textarea
                            id="event-desc"
                            placeholder={t("placeholder.event_description")}
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="wifi" className="space-y-4">
                        <div>
                          <Label htmlFor="ssid">{t("form.wifi_name")} *</Label>
                          <Input
                            id="ssid"
                            placeholder={t("placeholder.wifi_name")}
                            value={wifiData.ssid}
                            onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="wifi-password">{t("form.password")}</Label>
                          <Input
                            id="wifi-password"
                            type="password"
                            placeholder={t("placeholder.wifi_password")}
                            value={wifiData.password}
                            onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="security">{t("form.security")}</Label>
                            <Select
                              value={wifiData.security}
                              onValueChange={(value) => setWifiData({ ...wifiData, security: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WPA">{t("wifi.wpa")}</SelectItem>
                                <SelectItem value="WEP">{t("wifi.wep")}</SelectItem>
                                <SelectItem value="nopass">{t("wifi.no_password")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id="hidden"
                              checked={wifiData.hidden}
                              onCheckedChange={(checked) => setWifiData({ ...wifiData, hidden: checked })}
                            />
                            <Label htmlFor="hidden">{t("form.hidden_network")}</Label>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="location" className="space-y-4">
                        <div>
                          <Label htmlFor="location-label">{t("form.place_name")} *</Label>
                          <Input
                            id="location-label"
                            placeholder={t("placeholder.place_name")}
                            value={locationData.label}
                            onChange={(e) => setLocationData({ ...locationData, label: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="latitude">{t("form.latitude")}</Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              placeholder={t("placeholder.latitude")}
                              value={locationData.latitude}
                              onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitude">{t("form.longitude")}</Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              placeholder={t("placeholder.longitude")}
                              value={locationData.longitude}
                              onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (location) {
                              setLocationData({
                                ...locationData,
                                latitude: location.latitude.toString(),
                                longitude: location.longitude.toString(),
                              })
                            } else {
                              getCurrentLocation()
                            }
                          }}
                          className="w-full"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          {t("location.use_current")}
                        </Button>
                      </TabsContent>

                      <TabsContent value="facebook" className="space-y-4">
                        <div>
                          <Label htmlFor="facebook-username">{t("form.facebook_username")} *</Label>
                          <Input
                            id="facebook-username"
                            type="text"
                            placeholder={t("placeholder.facebook_username")}
                            value={facebookUsername}
                            onChange={(e) => setFacebookUsername(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="multiurl" className="space-y-4">
                        <div className="space-y-3">
                          <Label>{t("form.multiurl_urls")} *</Label>
                          {multiUrls.map((entry, idx) => (
                            <div key={idx} className="flex flex-col gap-2 border p-3 rounded-md bg-muted/30">
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  placeholder={t("placeholder.multiurl_url")}
                                  value={entry.url}
                                  onChange={(e) => {
                                    const copy = [...multiUrls]
                                    copy[idx] = { ...copy[idx], url: e.target.value }
                                    setMultiUrls(copy)
                                  }}
                                  className="flex-1"
                                />
                                {multiUrls.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setMultiUrls((prev) => prev.filter((_, i) => i !== idx))}
                                  >
                                    {t("form.remove_link")}
                                  </Button>
                                )}
                              </div>
                              <Input
                                type="text"
                                placeholder={t("placeholder.link_title")}
                                value={entry.title}
                                onChange={(e) => {
                                  const copy = [...multiUrls]
                                  copy[idx] = { ...copy[idx], title: e.target.value }
                                  setMultiUrls(copy)
                                }}
                                className="flex-1"
                              />
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setMultiUrls((prev) => [...prev, { url: "", title: "" }])}
                            >
                              {t("form.add_link")}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setMultiUrls([{ url: "", title: "" }])}
                            >
                              {t("btn.reset")}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">{t("placeholder.multiurl_url")}</p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* QR Customization */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <Label className="text-base font-medium">{t("custom.title")}</Label>
                  </div>

                  {/* Color Validation Alert */}
                  {colorValidation.warning && (
                    <Alert variant={colorValidation.severity === "error" ? "destructive" : "default"}>
                      <AlertDescription className="flex items-center justify-between">
                        <span>{colorValidation.warning}</span>
                        {colorValidation.severity === "error" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const suggested = suggestBetterColors(
                                customization.foregroundColor,
                                customization.backgroundColor,
                              )
                              setCustomization({
                                ...customization,
                                foregroundColor: suggested.foreground,
                                backgroundColor: suggested.background,
                              })
                            }}
                          >
                            {t("btn.auto_fix")}
                          </Button>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Colors */}
                    <div>
                      <Label htmlFor="foreground-color">{t("custom.foreground")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="foreground-color"
                          type="color"
                          value={customization.foregroundColor}
                          onChange={(e) => setCustomization({ ...customization, foregroundColor: e.target.value })}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={customization.foregroundColor}
                          onChange={(e) => setCustomization({ ...customization, foregroundColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="background-color">{t("custom.background")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="background-color"
                          type="color"
                          value={customization.backgroundColor}
                          onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={customization.backgroundColor}
                          onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Size and Margin */}
                    <div>
                      <Label htmlFor="size">
                        {t("custom.size")}: {customization.size}px
                      </Label>
                      <Slider
                        id="size"
                        min={200}
                        max={800}
                        step={50}
                        value={[customization.size]}
                        onValueChange={(value) => setCustomization({ ...customization, size: value[0] })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="margin">
                        {t("custom.margin")}: {customization.margin}
                      </Label>
                      <Slider
                        id="margin"
                        min={0}
                        max={10}
                        step={1}
                        value={[customization.margin]}
                        onValueChange={(value) => setCustomization({ ...customization, margin: value[0] })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="error-level">{t("custom.error_level")}</Label>
                      <Select
                        value={customization.errorCorrectionLevel}
                        onValueChange={(value: "L" | "M" | "Q" | "H") =>
                          setCustomization({ ...customization, errorCorrectionLevel: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">{t("error.low")}</SelectItem>
                          <SelectItem value="M">{t("error.medium")}</SelectItem>
                          <SelectItem value="Q">{t("error.quartile")}</SelectItem>
                          <SelectItem value="H">{t("error.high")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <Label className="text-sm font-medium">{t("custom.color_presets")}</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[
                        { name: t("preset.black_white"), fg: "#000000", bg: "#FFFFFF" },
                        { name: t("preset.blue_white"), fg: "#1d4ed8", bg: "#FFFFFF" },
                        { name: t("preset.white_black"), fg: "#FFFFFF", bg: "#000000" },
                        { name: t("preset.orange_black"), fg: "#f97316", bg: "#000000" },
                        { name: t("preset.purple_white"), fg: "#7c3aed", bg: "#FFFFFF" },
                        { name: t("preset.green_white"), fg: "#16a34a", bg: "#FFFFFF" },
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCustomization({
                              ...customization,
                              foregroundColor: preset.fg,
                              backgroundColor: preset.bg,
                            })
                          }
                          className="text-xs"
                        >
                          <div
                            className="w-3 h-3 rounded mr-1 border"
                            style={{ backgroundColor: preset.fg, borderColor: preset.bg }}
                          />
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Overlay */}
                  <div className="mt-4 border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{t("custom.logo_section")}</Label>
                      <Switch
                        checked={!!customization.logoEnabled}
                        onCheckedChange={(v) => setCustomization({ ...customization, logoEnabled: v })}
                      />
                    </div>
                    {customization.logoEnabled && (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                          <Label>{t("custom.logo_file")}</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setLogoFile(file)
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
                                reader.readAsDataURL(file)
                              } else {
                                setLogoPreview(null)
                              }
                            }}
                          />
                          {logoPreview && (
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded border overflow-hidden">
                                <img src={logoPreview} alt="logo" className="h-full w-full object-cover" />
                              </div>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                  setLogoFile(null)
                                  setLogoPreview(null)
                                }}
                              >
                                {t("custom.remove_logo")}
                              </Button>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>
                            {t("custom.logo_size")}: {customization.logoSize}%
                          </Label>
                          <Slider
                            value={[customization.logoSize || 20]}
                            onValueChange={(v) => setCustomization({ ...customization, logoSize: v[0] })}
                            min={10}
                            max={35}
                            step={1}
                          />
                        </div>

                        <div>
                          <Label>
                            {t("custom.logo_padding")}: {customization.logoPadding}px
                          </Label>
                          <Slider
                            value={[customization.logoPadding || 8]}
                            onValueChange={(v) => setCustomization({ ...customization, logoPadding: v[0] })}
                            min={0}
                            max={24}
                            step={1}
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Switch
                            checked={!!customization.logoRound}
                            onCheckedChange={(v) => setCustomization({ ...customization, logoRound: v })}
                          />
                          <Label>{t("custom.logo_round")}</Label>
                        </div>

                        <div>
                          <Label>{t("custom.logo_bg")}</Label>
                          <Input
                            type="color"
                            value={customization.logoBgColor}
                            onChange={(e) => setCustomization({ ...customization, logoBgColor: e.target.value })}
                            className="h-10 w-24 p-1"
                          />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {t("custom.add_logo")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tùy chọn định vị */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{t("location.require_verification")}</Label>
                      <p className="text-sm text-muted-foreground">{t("location.verification_description")}</p>
                    </div>
                    <Switch checked={requireLocation} onCheckedChange={setRequireLocation} />
                  </div>

                  {requireLocation && (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-base font-medium">
                        <MapPin className="h-4 w-4" />
                        {t("location.current_location")}
                      </Label>
                      {location ? (
                        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium">{t("form.latitude")}:</p>
                              <p className="text-muted-foreground">{location.latitude.toFixed(6)}</p>
                            </div>
                            <div>
                              <p className="font-medium">{t("form.longitude")}:</p>
                              <p className="text-muted-foreground">{location.longitude.toFixed(6)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            className="w-full bg-transparent"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            {t("location.get_location_again")}
                          </Button>
                          {locationError && (
                            <Alert variant="destructive">
                              <AlertDescription>{locationError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button onClick={generateQRCode} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("btn.generating")}
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        {t("btn.generate_qr")}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    <Settings className="h-4 w-4 mr-2" />
                    {t("btn.reset")}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* QR Preview & Info */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  {t("qr_info.preview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCodeUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg shadow-inner">
                        <Image
                          src={qrCodeUrl || "/placeholder.svg"}
                          alt="Generated QR Code"
                          width={customization.size}
                          height={customization.size}
                        />
                      </div>
                    </div>
                    <Button onClick={downloadQRCode} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t("btn.download_qr")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <QrCode className="h-12 w-12 mb-4 opacity-50" />
                    <p>{t("qr_info.no_qr")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("qr_info.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {React.createElement(qrTypeIcons[qrType], { className: "h-4 w-4" })}
                  <span className="font-medium">{t("qr_info.type")}:</span>
                  <span>{t(`qr.${qrType}`)}</span>
                </div>
                {requireLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{t("qr_info.location_required")}:</span>
                    <span className="text-green-600">{t("qr_info.location_required")}</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{t("qr_info.created_at")}:</span>
                  <span className="ml-1">{new Date().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Guide */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("guide.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{t("guide.step1")}</p>
                <p>{t("guide.step2")}</p>
                <p>{t("guide.step3")}</p>
                <p>{t("guide.step4")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
