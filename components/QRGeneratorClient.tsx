"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Camera,
  Upload,
  Copy,
  ExternalLink,
  StopCircle,
  Trash2,
} from "lucide-react"
import QRCodeLib from "qrcode"
import jsQR from "jsqr"
import NextImage from "next/image"
import { getContrastRatio } from "@/utils/color-validation"
import { encodeToBase64 } from "@/utils/base64"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  logoRound?: boolean
}

interface QRColorPreset {
  id: string
  nameKey: string
  foreground: string
  background: string
}

const QR_COLOR_PRESETS: QRColorPreset[] = [
  { id: "black-white", nameKey: "preset.black_white", foreground: "#111827", background: "#FFFFFF" },
  { id: "blue-white", nameKey: "preset.blue_white", foreground: "#1E3A8A", background: "#FFFFFF" },
  { id: "charcoal-ivory", nameKey: "preset.white_black", foreground: "#1F2937", background: "#FFFBEB" },
  { id: "burnt-orange-white", nameKey: "preset.orange_black", foreground: "#9A3412", background: "#FFFFFF" },
  { id: "purple-white", nameKey: "preset.purple_white", foreground: "#4C1D95", background: "#FFFFFF" },
  { id: "green-white", nameKey: "preset.green_white", foreground: "#14532D", background: "#F0FDF4" },
]
const DEFAULT_QR_COLOR_PRESET = QR_COLOR_PRESETS[0]
const SAFE_LOGO_SIZE_DEFAULT = 20
const SAFE_LOGO_SIZE_MIN = 12
const SAFE_LOGO_SIZE_MAX = 24
const SAFE_LOGO_PADDING_PX = 0
const SAFE_LOGO_BORDER_PX = 5

export default function QRGenerator() {
  const { t } = useLanguage()
  const [qrType, setQrType] = useState<QRType>("url")
  const [requireLocation, setRequireLocation] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [locationError, setLocationError] = useState("")
  const [selectedColorPresetId, setSelectedColorPresetId] = useState<string>(DEFAULT_QR_COLOR_PRESET.id)
  const selectedColorPreset =
    QR_COLOR_PRESETS.find((preset) => preset.id === selectedColorPresetId) ?? DEFAULT_QR_COLOR_PRESET

  // QR Customization
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: DEFAULT_QR_COLOR_PRESET.foreground,
    backgroundColor: DEFAULT_QR_COLOR_PRESET.background,
    size: 300,
    margin: 4,
    errorCorrectionLevel: "M",
    dotStyle: "square",
    cornerStyle: "square",
    logoEnabled: false,
    logoSize: SAFE_LOGO_SIZE_DEFAULT,
    logoRound: true,
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
  const activeForegroundColor = selectedColorPreset.foreground
  const activeBackgroundColor = selectedColorPreset.background
  // QR Scanner state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const logoFileInputRef = useRef<HTMLInputElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState("")
  const [scanError, setScanError] = useState("")
  const [scanMessage, setScanMessage] = useState("")
  const [isDecodingImage, setIsDecodingImage] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  // Lấy vị trí hiện tại
  const getCurrentLocation = useCallback(() => {
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
  }, [t])

  // Tự động lấy vị trí khi bật yêu cầu định vị
  useEffect(() => {
    if (requireLocation && !location) {
      getCurrentLocation()
    }
  }, [requireLocation, location, getCurrentLocation])

  const applyColorPreset = (presetId: string) => {
    const preset = QR_COLOR_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    setSelectedColorPresetId(preset.id)
    setCustomization((prev) => ({
      ...prev,
      foregroundColor: preset.foreground,
      backgroundColor: preset.background,
    }))
  }

  const stopCameraScan = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [cameraStream])

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      setScanResult(code.data)
      setScanError("")
      setScanMessage(t("scan.qr_found"))
      stopCameraScan()
    } else {
      animationFrameRef.current = requestAnimationFrame(scanFrame)
    }
  }

  const startCameraScan = async () => {
    setScanError("")
    setScanMessage("")
    setScanResult("")
    stopCameraScan()
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setScanError(t("scan.no_camera_support"))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraStream(stream)
      setIsScanning(true)
      animationFrameRef.current = requestAnimationFrame(scanFrame)
    } catch (err) {
      console.error(err)
      setScanError(t("scan.camera_permission"))
    }
  }

  const decodeCanvasForImage = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setScanError(t("scan.no_qr_found"))
      return
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      setScanResult(code.data)
      setScanMessage(t("scan.qr_found"))
      setScanError("")
    } else {
      setScanError(t("scan.no_qr_found"))
    }
  }

  const handleImageUpload = (file: File | null) => {
    if (!file) return
    setScanError("")
    setScanMessage("")
    setIsDecodingImage(true)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        decodeCanvasForImage(img)
        setIsDecodingImage(false)
      }
      img.onerror = () => {
        setScanError(t("scan.invalid_image"))
        setIsDecodingImage(false)
      }
      img.src = reader.result as string
    }
    reader.onerror = () => {
      setScanError(t("scan.invalid_image"))
      setIsDecodingImage(false)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = ""
    }
  }

  const clearScanResult = () => {
    setScanResult("")
    setScanMessage("")
    setScanError("")
  }

  const copyScanResult = async () => {
    if (!scanResult) return
    try {
      await navigator.clipboard.writeText(scanResult)
      setScanMessage(t("scan.copied"))
    } catch (err) {
      console.error(err)
      setScanError(t("scan.copy_failed"))
    }
  }

  const isLikelyUrl = (value: string) => {
    try {
      const potential = new URL(value)
      return Boolean(potential)
    } catch {
      return false
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const triggerLogoUpload = () => {
    logoFileInputRef.current?.click()
  }

  const handleCameraButtonClick = () => {
    if (isScanning || cameraStream) {
      stopCameraScan()
    } else {
      startCameraScan()
    }
  }

  const handleScannerOpenChange = (open: boolean) => {
    setScannerOpen(open)
  }

  useEffect(() => {
    if (scannerOpen) {
      setScanError("")
      setScanMessage("")
      setScanResult("")
    } else {
      stopCameraScan()
    }
  }, [scannerOpen, stopCameraScan])

  useEffect(() => {
    return () => {
      stopCameraScan()
    }
  }, [stopCameraScan])

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

    if (requireLocation && !location) {
      setError(t("msg.allow_location_access"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let finalContent = generateQRContent()

      // For multi-link QR, redirect to hosted landing page with encoded data
      if (qrType === "multiurl" && finalContent) {
        try {
          const parsed = JSON.parse(finalContent)
          const linksUrl = new URL(`${window.location.origin}/links`)
          linksUrl.searchParams.append("data", encodeToBase64(JSON.stringify(parsed)))
          finalContent = linksUrl.toString()
        } catch {
          setError(t("msg.generation_error"))
          setIsLoading(false)
          return
        }
      }

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
        verificationUrl.searchParams.append("data", encodeToBase64(JSON.stringify(qrData)))
        finalContent = verificationUrl.toString()
      }

      const qrCodeDataUrl = await QRCodeLib.toDataURL(finalContent, {
        width: customization.size,
        margin: customization.margin,
        color: {
          dark: activeForegroundColor,
          light: activeBackgroundColor,
        },
        errorCorrectionLevel: customization.logoEnabled ? "H" : customization.errorCorrectionLevel,
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
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = ""
    }
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
          const sizePct = Math.min(
            SAFE_LOGO_SIZE_MAX,
            Math.max(SAFE_LOGO_SIZE_MIN, customization.logoSize || SAFE_LOGO_SIZE_DEFAULT),
          )
          const logoBoxSize = Math.round((sizePct / 100) * qrImg.width)
          const padding = SAFE_LOGO_PADDING_PX
          const borderWidth = SAFE_LOGO_BORDER_PX
          const totalInset = padding + borderWidth
          const totalBoxSize = logoBoxSize + totalInset * 2
          const x = (qrImg.width - totalBoxSize) / 2
          const y = (qrImg.height - totalBoxSize) / 2

          // Safe guard ring: fixed border only (no background fill), colored by the active QR palette.
          ctx.save()
          const centerX = x + totalBoxSize / 2
          const centerY = y + totalBoxSize / 2
          ctx.strokeStyle = activeForegroundColor
          ctx.lineWidth = borderWidth
          if (customization.logoRound) {
            const radius = totalBoxSize / 2 - borderWidth / 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.closePath()
            ctx.stroke()
          } else {
            const half = borderWidth / 2
            ctx.strokeRect(x + half, y + half, totalBoxSize - borderWidth, totalBoxSize - borderWidth)
          }
          ctx.restore()

          // Crop and scale logo to perfect square so it never leaves empty bars
          const naturalWidth = logoImg.naturalWidth || logoImg.width
          const naturalHeight = logoImg.naturalHeight || logoImg.height
          const squareSourceSize = Math.min(naturalWidth, naturalHeight)
          const sourceX = naturalWidth > naturalHeight ? (naturalWidth - naturalHeight) / 2 : 0
          const sourceY = naturalHeight > naturalWidth ? (naturalHeight - naturalWidth) / 2 : 0
          const drawX = x + totalInset
          const drawY = y + totalInset

          if (customization.logoRound) {
            ctx.save()
            const clipRadius = logoBoxSize / 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, clipRadius, 0, Math.PI * 2)
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
        <div className="mb-8 text-center lg:text-left space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("app.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">{t("app.description")}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form tạo QR */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    {t("form.qr_type")}
                  </CardTitle>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 rounded-full"
                          onClick={() => setScannerOpen(true)}
                          aria-label={t("scan.open_dialog")}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{t("scan.open_dialog")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>{t("app.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chọn loại QR */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">{t("form.qr_type")}</Label>
                  <Tabs value={qrType} onValueChange={(value) => setQrType(value as QRType)} className="w-full">
                    <TabsList className="flex lg:grid h-auto w-full overflow-x-auto lg:overflow-visible lg:grid-cols-11 custom-scrollbar gap-1 p-1 justify-start">
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
                            className="flex flex-col gap-1 p-3 text-xs min-h-[60px] min-w-[72px] lg:min-w-0 flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="leading-tight whitespace-nowrap">{label}</span>
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("custom.color_presets")}</Label>
                    <p className="text-xs text-muted-foreground">{t("custom.safe_palette_notice")}</p>
                    <div className="flex gap-2 flex-wrap">
                      {QR_COLOR_PRESETS.map((preset) => {
                        const isSelected = selectedColorPreset.id === preset.id
                        const contrast = getContrastRatio(preset.foreground, preset.background).toFixed(1)
                        return (
                          <Button
                            key={preset.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => applyColorPreset(preset.id)}
                            className="text-xs"
                          >
                            <div className="flex items-center gap-1 mr-2">
                              <div className="w-3 h-3 rounded border" style={{ backgroundColor: preset.foreground }} />
                              <div className="w-3 h-3 rounded border" style={{ backgroundColor: preset.background }} />
                            </div>
                            {t(preset.nameKey)} ({contrast}:1)
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={triggerLogoUpload}
                            className="h-12 w-full justify-center gap-2 border-2 border-dashed border-primary/50 bg-primary/5 font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                          >
                            <Upload className="h-5 w-5" />
                            {t("custom.choose_logo_file")}
                          </Button>
                          <p className="text-xs text-muted-foreground">{t("custom.logo_upload_hint")}</p>
                          <p className="text-xs text-muted-foreground">
                            {logoFile?.name ? `${t("custom.selected_file")}: ${logoFile.name}` : t("custom.no_file_selected")}
                          </p>
                          {logoPreview && (
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded border overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoPreview} alt="logo" className="h-full w-full object-cover" />
                              </div>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                  handleLogoUpload(null)
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
                            value={[customization.logoSize || SAFE_LOGO_SIZE_DEFAULT]}
                            onValueChange={(v) => setCustomization({ ...customization, logoSize: v[0] })}
                            min={SAFE_LOGO_SIZE_MIN}
                            max={SAFE_LOGO_SIZE_MAX}
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

                        <div className="rounded-md border p-3 bg-muted/30 space-y-2">
                          <p className="text-xs text-muted-foreground">{t("custom.logo_safety_lock")}</p>
                          <p className="text-xs text-muted-foreground">{t("custom.logo_ec_notice")}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{t("custom.logo_border_preview")}</span>
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: activeForegroundColor }} />
                          </div>
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
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  <CardTitle>{t("qr_info.preview")}</CardTitle>
                </div>
                <Dialog open={scannerOpen} onOpenChange={handleScannerOpenChange}>
                  <DialogContent className="w-[92vw] max-w-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Camera className="h-5 w-5 text-primary" />
                        {t("scan.title")}
                      </DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        {t("scan.description")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5">
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted sm:aspect-[4/3]">
                        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
                        {!cameraStream && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/85 px-6 text-center text-xs text-muted-foreground">
                            <Camera className="mb-2 h-6 w-6" />
                            <span>{t("scan.camera_inactive")}</span>
                          </div>
                        )}
                        {isScanning && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/40 text-primary-foreground">
                            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
                            <span className="text-xs">{t("scan.camera_scanning")}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={handleCameraButtonClick}
                          aria-label={isScanning || cameraStream ? t("scan.stop") : t("scan.start")}
                        >
                          {isScanning || cameraStream ? <StopCircle className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={triggerImageUpload}
                          disabled={isDecodingImage}
                          aria-label={t("scan.upload_label")}
                          className="gap-2"
                        >
                          {isDecodingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{t("scan.upload_label")}</span>
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t("scan.result")}</Label>
                        {scanResult ? (
                          <>
                            <div className="rounded-md bg-muted p-3 text-xs break-all">{scanResult}</div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="icon" variant="outline" onClick={copyScanResult} aria-label={t("scan.copy")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              {isLikelyUrl(scanResult) && (
                                <Button size="icon" variant="outline" asChild aria-label={t("scan.open")}>
                                  <a href={scanResult} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" onClick={clearScanResult} aria-label={t("scan.clear")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">{t("scan.no_result")}</p>
                        )}
                        <div className="space-y-1 text-xs">
                          {scanMessage && <p className="text-green-600">{scanMessage}</p>}
                          {scanError && (
                            <Alert variant="destructive">
                              <AlertDescription>{scanError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCodeUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg shadow-inner">
                        <NextImage
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
