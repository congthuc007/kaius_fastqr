"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import {
  MapPin,
  CheckCircle,
  XCircle,
  ExternalLink,
  LinkIcon,
  MessageSquare,
  Phone,
  Wifi,
  User,
  Calendar,
  Navigation,
  CreditCard,
  Tag,
  ImageIcon,
  FileText,
  Mail,
  MessageCircle,
  Facebook,
  Clock,
  Shield,
  Loader2,
  AlertTriangle,
  Target,
  Smartphone,
} from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

interface QRData {
  type: string
  content: string
  requireLocation: boolean
  location?: LocationData
  timestamp?: string
}

// Tính khoảng cách giữa 2 điểm (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Bán kính Trái Đất tính bằng mét
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Khoảng cách tính bằng mét
}

function VerifyLocationContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [qrData, setQrData] = useState<QRData | null>(null)

  // Khoảng cách cho phép (mét)
  const ALLOWED_DISTANCE = 100

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
    payment: CreditCard,
    coupon: Tag,
    image: ImageIcon,
    file: FileText,
  }

  // Lấy dữ liệu QR từ URL
  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const decoded = JSON.parse(atob(dataParam))
        setQrData(decoded)

        // Nếu không yêu cầu định vị, tự động chuyển hướng
        if (!decoded.requireLocation) {
          setIsVerified(true)
        }
      } catch (err) {
        setError(t("verify.invalid_qr_desc"))
      }
    }
  }, [searchParams, t])

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Browser doesn't support geolocation")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        setCurrentLocation(location)

        if (qrData?.requireLocation && qrData.location) {
          // Tính khoảng cách
          const dist = calculateDistance(
            qrData.location.latitude,
            qrData.location.longitude,
            location.latitude,
            location.longitude,
          )
          setDistance(dist)

          // Kiểm tra xem có trong phạm vi cho phép không
          if (dist <= ALLOWED_DISTANCE) {
            setIsVerified(true)
          } else {
            setError(
              t("verify.distance_too_far", {
                distance: Math.round(dist).toString(),
                allowed: ALLOWED_DISTANCE.toString(),
              }),
            )
          }
        } else {
          setIsVerified(true)
        }
        setIsLoading(false)
      },
      (error) => {
        let errorMessage = ""
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("verify.permission_denied")
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("verify.position_unavailable")
            break
          case error.TIMEOUT:
            errorMessage = t("verify.timeout")
            break
          default:
            errorMessage = t("verify.unknown_error")
            break
        }
        setError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  }

  const handleAccess = () => {
    if (isVerified && qrData) {
      // Xử lý theo loại QR
      switch (qrData.type) {
        case "url":
          window.open(qrData.content, "_blank")
          break
        case "text":
          navigator.clipboard.writeText(qrData.content)
          alert(t("verify.content_copied"))
          break
        case "vcard":
          // Tạo file vCard để download
          const blob = new Blob([qrData.content], { type: "text/vcard" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "contact.vcf"
          a.click()
          break
        case "event":
          // Tạo file iCal để download
          const eventBlob = new Blob([qrData.content], { type: "text/calendar" })
          const eventUrl = URL.createObjectURL(eventBlob)
          const eventLink = document.createElement("a")
          eventLink.href = eventUrl
          eventLink.download = "event.ics"
          eventLink.click()
          break
        case "wifi":
          alert(t("verify.wifi_info") + "\n" + qrData.content)
          break
        case "location":
          window.open(qrData.content, "_blank")
          break
        case "payment":
          window.open(qrData.content, "_blank")
          break
        case "sms":
          window.location.href = qrData.content
          break
        case "coupon":
          const couponInfo = JSON.parse(qrData.content)
          alert(
            t("verify.coupon_code", { code: couponInfo.code }) +
              "\n" +
              t("verify.discount", { discount: couponInfo.discount }) +
              "\n" +
              couponInfo.description,
          )
          break
        case "image":
          const imageInfo = JSON.parse(qrData.content)
          window.open(imageInfo.url, "_blank")
          break
        case "file":
          const fileInfo = JSON.parse(qrData.content)
          const fileLink = document.createElement("a")
          fileLink.href = fileInfo.url
          fileLink.download = fileInfo.filename
          fileLink.click()
          break
        default:
          alert(t("verify.unsupported_qr"))
      }
    }
  }

  // Tự động lấy vị trí nếu cần
  useEffect(() => {
    if (qrData?.requireLocation && !currentLocation) {
      getCurrentLocation()
    } else if (qrData && !qrData.requireLocation) {
      setIsVerified(true)
    }
  }, [qrData])

  if (!qrData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-red-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-600 text-2xl">{t("verify.invalid_qr")}</CardTitle>
                <CardDescription className="text-lg">{t("verify.invalid_qr_desc")}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" onClick={() => (window.location.href = "/")} className="mt-4">
                  <Navigation className="h-4 w-4 mr-2" />
                  {t("nav.home")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const Icon = qrTypeIcons[qrData.type as keyof typeof qrTypeIcons] || MessageSquare

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {qrData.requireLocation ? t("verify.title") : t("verify.access_content")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {qrData.requireLocation ? t("verify.please_verify") : t("verify.click_to_access")}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              {isVerified ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 text-sm border border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("verify.verification_success")}
                </Badge>
              ) : qrData.requireLocation ? (
                <Badge variant="secondary" className="px-4 py-2 text-sm border border-border">
                  <Shield className="h-4 w-4 mr-2" />
                  {t("verify.location_verification")}
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 text-sm border border-blue-200 dark:border-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("verify.access_content")}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* QR Information Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg">{t(`qr.${qrData.type}`) || t("verify.qr_info")}</div>
                      <div className="text-sm text-muted-foreground font-normal">{t("verify.qr_info")}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Content Preview */}
                  {qrData.type === "text" && (
                    <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                      <p className="text-sm font-mono break-all text-foreground">{qrData.content}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t("qr_info.created_at")}:</span>
                      <span className="text-muted-foreground">
                        {qrData.timestamp ? new Date(qrData.timestamp).toLocaleString() : t("time.now")}
                      </span>
                    </div>

                    {qrData.requireLocation && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{t("verify.location_verification")}:</span>
                        <Badge variant="secondary" className="text-xs">
                          {t("qr_info.location_required")}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Verification Card */}
              {qrData.requireLocation && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-lg">{t("verify.location_verification")}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {t("verify.your_location_needs")}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Location Requirements */}
                    {qrData.location && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-900 dark:text-blue-200">
                              {t("verify.required_location")}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                            {qrData.location.latitude.toFixed(6)}, {qrData.location.longitude.toFixed(6)}
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Navigation className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-900 dark:text-green-200">
                              {t("verify.allowed_range")}
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {t("verify.within_meters", { distance: ALLOWED_DISTANCE.toString() })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex items-center justify-center p-8 bg-muted/30 dark:bg-muted/20 rounded-lg border-2 border-dashed border-border">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
                          <p className="text-sm font-medium text-foreground">{t("verify.determining_location")}</p>
                          <p className="text-xs text-muted-foreground">Please allow location access when prompted</p>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span>{error}</span>
                          {!isLoading && (
                            <Button size="sm" variant="outline" onClick={getCurrentLocation}>
                              {t("verify.try_again")}
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Current Location Display */}
                    {currentLocation && !isLoading && (
                      <div className="space-y-4">
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {t("verify.current_location")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                            </p>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{t("verify.accuracy")}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">±{Math.round(currentLocation.accuracy)}m</p>
                          </div>

                          {distance !== null && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{t("verify.distance")}</span>
                              </div>
                              <p
                                className={`text-xs font-medium ${
                                  distance <= ALLOWED_DISTANCE ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {Math.round(distance)}m
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Success State */}
                    {isVerified && (
                      <Alert className="border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          {t("verify.verification_success")}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Location Permission Button */}
                    {qrData.requireLocation && !currentLocation && !isLoading && (
                      <Button
                        onClick={getCurrentLocation}
                        size="lg"
                        className="w-full h-14 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                      >
                        <MapPin className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{t("verify.allow_location")}</div>
                          <div className="text-xs opacity-90">Required for verification</div>
                        </div>
                      </Button>
                    )}

                    {/* Retry Button */}
                    {qrData.requireLocation && currentLocation && !isVerified && !isLoading && (
                      <Button
                        onClick={getCurrentLocation}
                        variant="outline"
                        size="lg"
                        className="w-full h-14 bg-background hover:bg-muted dark:bg-background dark:hover:bg-muted border-border"
                      >
                        <MapPin className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{t("verify.try_again")}</div>
                          <div className="text-xs text-muted-foreground">Check location again</div>
                        </div>
                      </Button>
                    )}

                    {/* Access Content Button */}
                    {isVerified && (
                      <Button
                        onClick={handleAccess}
                        size="lg"
                        className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white"
                      >
                        <ExternalLink className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{t("verify.access_content_btn")}</div>
                          <div className="text-xs opacity-90">Open {t(`qr.${qrData.type}`)}</div>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Encrypted QR Data</p>
                      <p className="text-muted-foreground text-xs">All QR information is securely encoded</p>
                    </div>
                  </div>

                  {qrData.requireLocation && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location Verification</p>
                        <p className="text-muted-foreground text-xs">Your location is verified locally</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">No Data Storage</p>
                      <p className="text-muted-foreground text-xs">We don't store your personal information</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    {t("nav.help")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">Having trouble?</p>
                    <p className="text-muted-foreground text-xs">
                      Make sure location services are enabled in your browser settings.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-1">Need assistance?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-background hover:bg-muted dark:bg-background dark:hover:bg-muted border-border"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t("nav.contact")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                    QR Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="secondary" className="text-xs">
                      {t(`qr.${qrData.type}`)}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security:</span>
                    <Badge variant={qrData.requireLocation ? "default" : "secondary"} className="text-xs">
                      {qrData.requireLocation ? "High" : "Standard"}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-xs">
                      {qrData.timestamp ? new Date(qrData.timestamp).toLocaleDateString() : "Today"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VerifyLocation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-muted-foreground">Loading verification...</p>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <VerifyLocationContent />
    </Suspense>
  )
}
