"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "vi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Header
    "app.title": "Kaius FastQR",
    "app.subtitle": "Professional QR Code Generator",
    "app.description": "Generate customizable QR codes with advanced styling and location verification",

    // QR Types
    "qr.url": "Website",
    "qr.text": "Text",
    "qr.email": "Email",
    "qr.phone": "Phone",
    "qr.vcard": "Contact",
    "qr.sms": "SMS",
    "qr.event": "Event",
    "qr.wifi": "Wi-Fi",
    "qr.location": "Location",
    "qr.facebook": "Facebook",

    // Form Labels
    "form.qr_type": "QR Code Type",
    "form.url": "Website URL",
    "form.text_content": "Text Content",
    "form.email": "Email Address",
    "form.phone": "Phone Number",
    "form.name": "Full Name",
    "form.organization": "Organization",
    "form.address": "Address",
    "form.website": "Website",
    "form.note": "Note",
    "form.message": "Message",
    "form.event_title": "Event Title",
    "form.event_location": "Location",
    "form.start_date": "Start Date",
    "form.end_date": "End Date",
    "form.description": "Description",
    "form.wifi_name": "WiFi Name (SSID)",
    "form.password": "Password",
    "form.security": "Security",
    "form.hidden_network": "Hidden Network",
    "form.place_name": "Place Name",
    "form.latitude": "Latitude",
    "form.longitude": "Longitude",
    "form.facebook_url": "Facebook Profile/Page URL",

    // Customization
    "custom.title": "QR Code Styling",
    "custom.foreground": "Foreground Color",
    "custom.background": "Background Color",
    "custom.size": "Size",
    "custom.margin": "Margin",
    "custom.error_level": "Error Correction",
    "custom.style": "Style",
    "custom.style_square": "Square",
    "custom.style_dots": "Dots",
    "custom.style_rounded": "Rounded",

    // Location
    "location.require_verification": "Require Location Verification",
    "location.verification_description": "Users must be at the correct location to access content",
    "location.current_location": "Current Location",
    "location.getting_location": "Getting location...",
    "location.get_location_again": "Get Location Again",
    "location.use_current": "Use Current Location",

    // Buttons
    "btn.generate_qr": "Generate QR Code",
    "btn.generating": "Generating...",
    "btn.download_qr": "Download QR",
    "btn.create_new": "Create New QR",
    "btn.reset": "Reset",

    // Messages
    "msg.fill_required": "Please fill in all required information",
    "msg.allow_location_access": "Please allow location access",
    "msg.qr_generated": "QR code generated successfully",

    // Guide
    "guide.title": "How to Use",
    "guide.step1": "1. Choose QR code type",
    "guide.step2": "2. Fill in the information",
    "guide.step3": "3. Customize appearance",
    "guide.step4": "4. Generate and download",

    // QR Info
    "qr_info.title": "QR Information",
    "qr_info.type": "Type",
    "qr_info.created_at": "Created at",
    "qr_info.preview": "QR Code Preview",
    "qr_info.no_qr": "No QR code generated yet",
  },
  vi: {
    // Header
    "app.title": "Kaius FastQR",
    "app.subtitle": "Tạo QR Code Chuyên Nghiệp",
    "app.description": "Tạo QR code tùy chỉnh với kiểu dáng nâng cao và xác thực vị trí",

    // QR Types
    "qr.url": "Website",
    "qr.text": "Văn bản",
    "qr.email": "Email",
    "qr.phone": "Điện thoại",
    "qr.vcard": "Liên hệ",
    "qr.sms": "SMS",
    "qr.event": "Sự kiện",
    "qr.wifi": "Wi-Fi",
    "qr.location": "Vị trí",
    "qr.facebook": "Facebook",

    // Form Labels
    "form.qr_type": "Loại QR Code",
    "form.url": "URL Website",
    "form.text_content": "Nội dung văn bản",
    "form.email": "Địa chỉ Email",
    "form.phone": "Số điện thoại",
    "form.name": "Họ tên",
    "form.organization": "Tổ chức/Công ty",
    "form.address": "Địa chỉ",
    "form.website": "Website",
    "form.note": "Ghi chú",
    "form.message": "Tin nhắn",
    "form.event_title": "Tiêu đề sự kiện",
    "form.event_location": "Địa điểm",
    "form.start_date": "Thời gian bắt đầu",
    "form.end_date": "Thời gian kết thúc",
    "form.description": "Mô tả",
    "form.wifi_name": "Tên WiFi (SSID)",
    "form.password": "Mật khẩu",
    "form.security": "Bảo mật",
    "form.hidden_network": "Mạng ẩn",
    "form.place_name": "Tên địa điểm",
    "form.latitude": "Vĩ độ",
    "form.longitude": "Kinh độ",
    "form.facebook_url": "URL Facebook Profile/Page",

    // Customization
    "custom.title": "Tùy chỉnh QR Code",
    "custom.foreground": "Màu chữ",
    "custom.background": "Màu nền",
    "custom.size": "Kích thước",
    "custom.margin": "Lề",
    "custom.error_level": "Mức sửa lỗi",
    "custom.style": "Kiểu dáng",
    "custom.style_square": "Vuông",
    "custom.style_dots": "Chấm tròn",
    "custom.style_rounded": "Bo góc",

    // Location
    "location.require_verification": "Yêu cầu xác thực vị trí",
    "location.verification_description": "Người dùng phải ở đúng vị trí để truy cập nội dung",
    "location.current_location": "Vị trí hiện tại",
    "location.getting_location": "Đang lấy vị trí...",
    "location.get_location_again": "Lấy vị trí lại",
    "location.use_current": "Sử dụng vị trí hiện tại",

    // Buttons
    "btn.generate_qr": "Tạo QR Code",
    "btn.generating": "Đang tạo...",
    "btn.download_qr": "Tải xuống QR",
    "btn.create_new": "Tạo QR mới",
    "btn.reset": "Đặt lại",

    // Messages
    "msg.fill_required": "Vui lòng điền đầy đủ thông tin bắt buộc",
    "msg.allow_location_access": "Vui lòng cho phép truy cập vị trí",
    "msg.qr_generated": "Tạo QR code thành công",

    // Guide
    "guide.title": "Hướng dẫn sử dụng",
    "guide.step1": "1. Chọn loại QR code",
    "guide.step2": "2. Điền thông tin",
    "guide.step3": "3. Tùy chỉnh giao diện",
    "guide.step4": "4. Tạo và tải xuống",

    // QR Info
    "qr_info.title": "Thông tin QR",
    "qr_info.type": "Loại",
    "qr_info.created_at": "Thời gian tạo",
    "qr_info.preview": "Xem trước QR Code",
    "qr_info.no_qr": "Chưa tạo QR code nào",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "en" || saved === "vi")) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
