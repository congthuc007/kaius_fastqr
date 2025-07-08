"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    vcard: User,
    event: Calendar,
    wifi: Wifi,
    location: Navigation,
    payment: CreditCard,
    sms: Phone,
    coupon: Tag,
    image: ImageIcon,
    file: FileText,
  }

  const qrTypeLabels = {
    url: "Website",
    text: "Văn bản",
    vcard: "Liên hệ",
    event: "Sự kiện",
    wifi: "Wi-Fi",
    location: "Vị trí",
    payment: "Thanh toán",
    sms: "SMS/Gọi",
    coupon: "Coupon",
    image: "Hình ảnh",
    file: "File",
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
        setError("Dữ liệu QR không hợp lệ")
      }
    }
  }, [searchParams])

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị")
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
              `Bạn cách xa vị trí yêu cầu ${Math.round(dist)}m. Vui lòng đến gần hơn (trong phạm vi ${ALLOWED_DISTANCE}m)`,
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
            errorMessage = "Bạn cần cho phép truy cập vị trí"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Không thể xác định vị trí hiện tại"
            break
          case error.TIMEOUT:
            errorMessage = "Hết thời gian chờ định vị"
            break
          default:
            errorMessage = "Lỗi không xác định khi lấy vị trí"
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
          alert("Đã copy văn bản vào clipboard!")
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
          alert("Thông tin WiFi:\n" + qrData.content)
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
          alert(`Mã giảm giá: ${couponInfo.code}\nGiảm: ${couponInfo.discount}\nMô tả: ${couponInfo.description}`)
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
          alert("Loại QR không được hỗ trợ")
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              QR Code Không Hợp Lệ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              QR code này không chứa thông tin hợp lệ. Vui lòng sử dụng QR code được tạo từ hệ thống.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = qrTypeIcons[qrData.type as keyof typeof qrTypeIcons] || MessageSquare

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Icon className="h-8 w-8 text-blue-600" />
            {qrData.requireLocation ? "Xác Thực Vị Trí" : "Truy Cập Nội Dung"}
          </h1>
          <p className="text-gray-600">
            {qrData.requireLocation ? "Vui lòng xác thực vị trí để tiếp tục" : "Nhấn nút bên dưới để truy cập nội dung"}
          </p>
        </div>

        {/* Thông tin QR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {qrTypeLabels[qrData.type as keyof typeof qrTypeLabels] || "Nội dung"}
            </CardTitle>
            <CardDescription>Thông tin từ QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {qrData.type === "text" && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{qrData.content}</p>
              </div>
            )}
            {qrData.timestamp && (
              <div className="text-sm">
                <p className="font-medium text-gray-700">Thời gian tạo:</p>
                <p className="text-gray-600">{new Date(qrData.timestamp).toLocaleString("vi-VN")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Xác thực vị trí (nếu cần) */}
        {qrData.requireLocation && (
          <Card>
            <CardHeader>
              <CardTitle>Xác Thực Vị Trí</CardTitle>
              <CardDescription>Vị trí của bạn cần được xác thực</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrData.location && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Vị trí yêu cầu:</p>
                    <p className="text-gray-600">
                      {qrData.location.latitude.toFixed(6)}, {qrData.location.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Phạm vi cho phép:</p>
                    <p className="text-gray-600">Trong vòng {ALLOWED_DISTANCE} mét</p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span>Đang xác định vị trí của bạn...</span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {currentLocation && !isLoading && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Vị trí hiện tại:</p>
                      <p className="text-gray-600">
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Độ chính xác:</p>
                      <p className="text-gray-600">±{Math.round(currentLocation.accuracy)}m</p>
                    </div>
                  </div>

                  {distance !== null && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Khoảng cách:</p>
                      <p className={`${distance <= ALLOWED_DISTANCE ? "text-green-600" : "text-red-600"}`}>
                        {Math.round(distance)} mét từ vị trí yêu cầu
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isVerified && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Xác thực vị trí thành công! Bạn có thể truy cập nội dung.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nút truy cập */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              {qrData.requireLocation && !currentLocation && !isLoading && (
                <Button onClick={getCurrentLocation} size="lg" className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Cho Phép Truy Cập Vị Trí
                </Button>
              )}

              {qrData.requireLocation && currentLocation && !isVerified && !isLoading && (
                <Button onClick={getCurrentLocation} variant="outline" size="lg" className="w-full bg-transparent">
                  <MapPin className="h-4 w-4 mr-2" />
                  Thử Lại
                </Button>
              )}

              {isVerified && (
                <Button onClick={handleAccess} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Truy Cập Nội Dung
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyLocation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <VerifyLocationContent />
    </Suspense>
  )
}
