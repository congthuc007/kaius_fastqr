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

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

type QRType = "url" | "text" | "email" | "phone" | "vcard" | "sms" | "event" | "wifi" | "location" | "facebook"

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
  style: "square" | "dots" | "rounded"
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

  // QR Customization
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    size: 300,
    margin: 2,
    errorCorrectionLevel: "M",
    style: "square",
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
  const [facebookData, setFacebookData] = useState("")

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
            setLocationError("User denied location access")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable")
            break
          case error.TIMEOUT:
            setLocationError("Location timeout")
            break
          default:
            setLocationError("Unknown location error")
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
        return facebookData.trim()

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
        return (locationData.latitude && locationData.longitude) || location !== null
      case "facebook":
        return facebookData.trim() !== ""
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

      setQrCodeUrl(qrCodeDataUrl)
    } catch (err) {
      setError("Cannot generate QR code. Please try again.")
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
        setFacebookData("")
        break
    }
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
                    <TabsList className="grid grid-cols-5 lg:grid-cols-10 h-auto gap-1 p-1">
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
                            placeholder="https://example.com"
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
                            placeholder={t("form.text_content")}
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
                            placeholder="example@email.com"
                            value={emailData.email}
                            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-subject">Subject</Label>
                          <Input
                            id="email-subject"
                            placeholder="Email subject"
                            value={emailData.subject}
                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-body">Body</Label>
                          <Textarea
                            id="email-body"
                            placeholder="Email body"
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
                            placeholder="+1 234 567 890"
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
                              placeholder="John Doe"
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
                              placeholder="+1 234 567 890"
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
                              placeholder="john@example.com"
                              value={vcardData.email}
                              onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcard-org">{t("form.organization")}</Label>
                            <Input
                              id="vcard-org"
                              placeholder="Company Name"
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
                            placeholder="123 Main St, City, Country"
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
                            placeholder="https://website.com"
                            value={vcardData.website}
                            onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vcard-note">{t("form.note")}</Label>
                          <Textarea
                            id="vcard-note"
                            placeholder={t("form.note")}
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
                            placeholder="+1 234 567 890"
                            value={smsData.phone}
                            onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sms-message">{t("form.message")}</Label>
                          <Textarea
                            id="sms-message"
                            placeholder="Message content..."
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
                            placeholder="Event Name"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-location">{t("form.event_location")}</Label>
                          <Input
                            id="event-location"
                            placeholder="Event Location"
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
                            placeholder="https://event-link.com"
                            value={eventData.url}
                            onChange={(e) => setEventData({ ...eventData, url: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-desc">{t("form.description")}</Label>
                          <Textarea
                            id="event-desc"
                            placeholder={t("form.description")}
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
                            placeholder="WiFi Network Name"
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
                            placeholder="WiFi Password"
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
                                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                <SelectItem value="WEP">WEP</SelectItem>
                                <SelectItem value="nopass">No Password</SelectItem>
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
                            placeholder="Place Name"
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
                              placeholder="10.7769"
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
                              placeholder="106.7009"
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
                          <Label htmlFor="facebook">{t("form.facebook_url")} *</Label>
                          <Input
                            id="facebook"
                            type="url"
                            placeholder="https://facebook.com/username"
                            value={facebookData}
                            onChange={(e) => setFacebookData(e.target.value)}
                            className="mt-1"
                          />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="L">Low (7%)</SelectItem>
                          <SelectItem value="M">Medium (15%)</SelectItem>
                          <SelectItem value="Q">Quartile (25%)</SelectItem>
                          <SelectItem value="H">High (30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="style">{t("custom.style")}</Label>
                      <Select
                        value={customization.style}
                        onValueChange={(value: "square" | "dots" | "rounded") =>
                          setCustomization({ ...customization, style: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">{t("custom.style_square")}</SelectItem>
                          <SelectItem value="dots">{t("custom.style_dots")}</SelectItem>
                          <SelectItem value="rounded">{t("custom.style_rounded")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    <span className="font-medium">Location:</span>
                    <span className="text-green-600">Required</span>
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
