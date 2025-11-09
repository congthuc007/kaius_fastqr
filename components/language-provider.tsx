"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "vi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
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
    "qr.multiurl": "Multi Link",

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
  "form.facebook_username": "Facebook Username",
  "form.multiurl_urls": "Multiple URLs",
  "form.add_link": "Add Link",
  "form.remove_link": "Remove",
  "form.link_title": "Link Title (optional)",

    // Customization
    "custom.title": "QR Code Styling",
    "custom.foreground": "Foreground Color",
    "custom.background": "Background Color",
    "custom.size": "Size",
    "custom.margin": "Margin",
    "custom.error_level": "Error Correction",
    "custom.dot_style": "Dot Style",
    "custom.corner_style": "Corner Style",
    "custom.color_presets": "Color Presets",
  "custom.logo_section": "Logo Overlay",
  "custom.add_logo": "Add logo in the center",
  "custom.logo_size": "Logo size",
  "custom.logo_padding": "Logo padding",
  "custom.logo_round": "Rounded logo background",
  "custom.logo_bg": "Logo background color",
  "custom.logo_file": "Logo image",
  "custom.remove_logo": "Remove logo",

    // Dot Styles
    "dot.square": "Square",
    "dot.rounded": "Rounded",
    "dot.circle": "Circle",
    "dot.diamond": "Diamond",

    // Corner Styles
    "corner.square": "Square",
    "corner.rounded": "Rounded",
    "corner.circle": "Circle",

    // Error Levels
    "error.low": "Low (7%)",
    "error.medium": "Medium (15%)",
    "error.quartile": "Quartile (25%)",
    "error.high": "High (30%)",

    // Color Presets
    "preset.black_white": "Black & White",
    "preset.blue_white": "Blue & White",
    "preset.white_black": "White & Black",
    "preset.orange_black": "Orange & Black",
    "preset.purple_white": "Purple & White",
    "preset.green_white": "Green & White",

    // Location
    "location.require_verification": "Require Location Verification",
    "location.verification_description": "Users must be at the correct location to access content",
    "location.current_location": "Current Location",
    "location.getting_location": "Getting location...",
    "location.get_location_again": "Get Location Again",
    "location.use_current": "Use Current Location",
    "location.allow_access": "Allow Location Access",

    // Buttons
    "btn.generate_qr": "Generate QR Code",
    "btn.generating": "Generating...",
    "btn.download_qr": "Download QR",
    "btn.create_new": "Create New QR",
    "btn.reset": "Reset",
    "btn.auto_fix": "Auto Fix",

    // Messages
    "msg.fill_required": "Please fill in all required information",
    "msg.allow_location_access": "Please allow location access",
    "msg.qr_generated": "QR code generated successfully",
    "msg.invalid_colors": "Cannot generate QR code with current colors. Please choose different colors.",
    "msg.generation_error": "Cannot generate QR code. Please try again.",

    // Validation Messages
    "validation.contrast_too_low":
      "Contrast too low! QR code may not be scannable. Minimum contrast ratio of 3:1 recommended",
    "validation.contrast_low": "Low contrast. QR code may be difficult to scan in low light conditions.",
    "validation.colors_too_similar": "Colors too similar! QR code will not be scannable.",

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
    "qr_info.location_required": "Location Required",

    // Verify Page
    "verify.title": "Location Verification",
    "verify.access_content": "Access Content",
    "verify.please_verify": "Please verify your location to continue",
    "verify.click_to_access": "Click the button below to access content",
    "verify.qr_info": "QR Code Information",
    "verify.location_verification": "Location Verification",
    "verify.your_location_needs": "Your location needs to be verified",
    "verify.required_location": "Required Location",
    "verify.allowed_range": "Allowed Range",
    "verify.within_meters": "Within {distance} meters",
    "verify.determining_location": "Determining your location...",
    "verify.current_location": "Current Location",
    "verify.accuracy": "Accuracy",
    "verify.distance": "Distance",
    "verify.meters_from_required": "{distance} meters from required location",
    "verify.verification_success": "Location verification successful! You can access the content.",
    "verify.allow_location": "Allow Location Access",
    "verify.try_again": "Try Again",
    "verify.access_content_btn": "Access Content",
    "verify.invalid_qr": "Invalid QR Code",
    "verify.invalid_qr_desc":
      "This QR code does not contain valid information. Please use a QR code generated from the system.",
    "verify.distance_too_far":
      "You are {distance}m away from the required location. Please get closer (within {allowed}m range)",
    "verify.permission_denied": "You need to allow location access",
    "verify.position_unavailable": "Cannot determine current location",
    "verify.timeout": "Location timeout",
    "verify.unknown_error": "Unknown error when getting location",
    "verify.content_copied": "Content copied to clipboard!",
    "verify.wifi_info": "WiFi Information:",
    "verify.coupon_code": "Coupon Code: {code}",
    "verify.discount": "Discount: {discount}",
    "verify.unsupported_qr": "Unsupported QR type",
    "verify.browser_not_supported": "Browser doesn't support geolocation",
    "verify.location_services": "Location Services",
    "verify.enable_location": "Please enable location services in your browser settings",
    "verify.need_assistance": "Need assistance?",
    "verify.having_trouble": "Having trouble?",
    "verify.security_info": "Security Information",
    "verify.encrypted_data": "Encrypted QR Data",
    "verify.encrypted_desc": "All QR information is securely encoded",
    "verify.location_verified_locally": "Your location is verified locally",
    "verify.no_data_storage": "No Data Storage",
    "verify.no_storage_desc": "We don't store your personal information",

    // Multi Link Landing
    "multilink.title": "Choose a destination",
    "multilink.description": "Pick a link below to continue to your desired content.",
    "multilink.empty_state": "We couldn't find any links for this QR code.",
    "multilink.link_default": "Link {index}",
    "multilink.available_anytime": "Available anytime",
    "multilink.visit": "Open link",
    "multilink.safe_title": "Safe & trusted",
    "multilink.safe_desc": "All destinations were shared via Kaius FastQR.",
    "multilink.create_own": "Create your own",
    "verify.qr_details": "QR Details",
    "verify.security_level": "Security Level",
    "verify.security_high": "High",
    "verify.security_standard": "Standard",
    "verify.loading_verification": "Loading verification...",
    "verify.open_content": "Open {type}",
    "verify.multi_links": "Multiple Links",
    "verify.invalid_multi_links": "Invalid multi-link data",

    // Form Placeholders
    "placeholder.url": "https://example.com",
    "placeholder.text": "Enter your text content here...",
    "placeholder.email": "example@email.com",
    "placeholder.email_subject": "Email subject",
    "placeholder.email_body": "Email body",
    "placeholder.phone": "+1 234 567 890",
    "placeholder.name": "John Doe",
    "placeholder.company": "Company Name",
    "placeholder.address": "123 Main St, City, Country",
    "placeholder.website": "https://website.com",
    "placeholder.note": "Additional notes...",
    "placeholder.message": "Message content...",
    "placeholder.event_name": "Event Name",
    "placeholder.event_location": "Event Location",
    "placeholder.event_url": "https://event-link.com",
    "placeholder.event_description": "Event description...",
    "placeholder.wifi_name": "WiFi Network Name",
    "placeholder.wifi_password": "WiFi Password",
    "placeholder.place_name": "Place Name",
    "placeholder.latitude": "10.7769",
    "placeholder.longitude": "106.7009",
  "placeholder.facebook": "https://facebook.com/username",
  "placeholder.facebook_username": "nhập username (ví dụ: kaius.dev)",
  "placeholder.multiurl_url": "https://example.com/page",
  "placeholder.link_title": "e.g., Official website",

    // WiFi Security
    "wifi.wpa": "WPA/WPA2",
    "wifi.wep": "WEP",
    "wifi.no_password": "No Password",

    // Time
    "time.created_at": "Created at",
    "time.now": "now",

    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.help": "Help",

    // Footer (if needed)
    "footer.copyright": "© 2024 Kaius FastQR. All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
  },
  vi: {
    // Header
    "app.title": "Kaius FastQR",
    "app.subtitle": "Tạo QR Code Chuyên Nghiệp",
    "app.description": "Tạo mã QR tùy chỉnh với các tuỳ chọn thiết kế nâng cao và tính năng xác thực vị trí",

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
    "qr.multiurl": "Nhiều Link",

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
  "form.facebook_username": "Facebook Username",
  "form.multiurl_urls": "Danh sách URL",
  "form.add_link": "Thêm link",
  "form.remove_link": "Xóa",
  "form.link_title": "Tiêu đề link (không bắt buộc)",

    // Customization
    "custom.title": "Tùy chỉnh QR Code",
    "custom.foreground": "Màu chấm",
    "custom.background": "Màu nền",
    "custom.size": "Kích thước",
    "custom.margin": "Lề",
    "custom.error_level": "Mức sửa lỗi",
    "custom.dot_style": "Kiểu chấm QR",
    "custom.corner_style": "Kiểu góc định vị",
    "custom.color_presets": "Bộ màu có sẵn",
  "custom.logo_section": "Chèn logo",
  "custom.add_logo": "Chèn logo ở giữa QR",
  "custom.logo_size": "Kích thước logo",
  "custom.logo_padding": "Khoảng đệm logo",
  "custom.logo_round": "Bo tròn nền logo",
  "custom.logo_bg": "Màu nền logo",
  "custom.logo_file": "Ảnh logo",
  "custom.remove_logo": "Xóa logo",

    // Dot Styles
    "dot.square": "Vuông",
    "dot.rounded": "Bo góc",
    "dot.circle": "Tròn",
    "dot.diamond": "Kim cương",

    // Corner Styles
    "corner.square": "Vuông",
    "corner.rounded": "Bo góc",
    "corner.circle": "Tròn",

    // Error Levels
    "error.low": "Thấp (7%)",
    "error.medium": "Trung bình (15%)",
    "error.quartile": "Cao (25%)",
    "error.high": "Rất cao (30%)",

    // Color Presets
    "preset.black_white": "Đen trắng",
    "preset.blue_white": "Xanh trắng",
    "preset.white_black": "Trắng đen",
    "preset.orange_black": "Cam đen",
    "preset.purple_white": "Tím trắng",
    "preset.green_white": "Xanh lá",

    // Location
    "location.require_verification": "Yêu cầu xác thực vị trí",
    "location.verification_description": "Người dùng phải ở đúng vị trí để truy cập nội dung",
    "location.current_location": "Vị trí hiện tại",
    "location.getting_location": "Đang lấy vị trí...",
    "location.get_location_again": "Lấy vị trí lại",
    "location.use_current": "Sử dụng vị trí hiện tại",
    "location.allow_access": "Cho phép truy cập vị trí",

    // Buttons
    "btn.generate_qr": "Tạo QR Code",
    "btn.generating": "Đang tạo...",
    "btn.download_qr": "Tải xuống QR",
    "btn.create_new": "Tạo QR mới",
    "btn.reset": "Đặt lại",
    "btn.auto_fix": "Sửa tự động",

    // Messages
    "msg.fill_required": "Vui lòng điền đầy đủ thông tin bắt buộc",
    "msg.allow_location_access": "Vui lòng cho phép truy cập vị trí",
    "msg.qr_generated": "Tạo QR code thành công",
    "msg.invalid_colors": "Không thể tạo QR code với màu sắc hiện tại. Vui lòng chọn màu khác.",
    "msg.generation_error": "Không thể tạo QR code. Vui lòng thử lại.",

    // Validation Messages
    "validation.contrast_too_low":
      "Độ tương phản quá thấp! QR code có thể không quét được. Khuyến nghị tỷ lệ tương phản tối thiểu 3:1",
    "validation.contrast_low": "Độ tương phản thấp. QR code có thể khó quét trong điều kiện ánh sáng yếu.",
    "validation.colors_too_similar": "Màu sắc quá giống nhau! QR code sẽ không thể quét được.",

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
    "qr_info.location_required": "Yêu cầu vị trí",

    // Verify Page
    "verify.title": "Xác thực vị trí",
    "verify.access_content": "Truy cập nội dung",
    "verify.please_verify": "Vui lòng xác thực vị trí để tiếp tục",
    "verify.click_to_access": "Nhấn nút bên dưới để truy cập nội dung",
    "verify.qr_info": "Thông tin QR Code",
    "verify.location_verification": "Xác thực vị trí",
    "verify.your_location_needs": "Vị trí của bạn cần được xác thực",
    "verify.required_location": "Vị trí yêu cầu",
    "verify.allowed_range": "Phạm vi cho phép",
    "verify.within_meters": "Trong vòng {distance} mét",
    "verify.determining_location": "Đang xác định vị trí của bạn...",
    "verify.current_location": "Vị trí hiện tại",
    "verify.accuracy": "Độ chính xác",
    "verify.distance": "Khoảng cách",
    "verify.meters_from_required": "{distance} mét từ vị trí yêu cầu",
    "verify.verification_success": "Xác thực vị trí thành công! Bạn có thể truy cập nội dung.",
    "verify.allow_location": "Cho phép truy cập vị trí",
    "verify.try_again": "Thử lại",
    "verify.access_content_btn": "Truy cập nội dung",
    "verify.invalid_qr": "QR Code không hợp lệ",
    "verify.invalid_qr_desc": "QR code này không chứa thông tin hợp lệ. Vui lòng sử dụng QR code được tạo từ hệ thống.",
    "verify.distance_too_far":
      "Bạn cách xa vị trí yêu cầu {distance}m. Vui lòng đến gần hơn (trong phạm vi {allowed}m)",
    "verify.permission_denied": "Bạn cần cho phép truy cập vị trí",
    "verify.position_unavailable": "Không thể xác định vị trí hiện tại",
    "verify.timeout": "Hết thời gian chờ định vị",
    "verify.unknown_error": "Lỗi không xác định khi lấy vị trí",
    "verify.content_copied": "Đã copy nội dung vào clipboard!",
    "verify.wifi_info": "Thông tin WiFi:",
    "verify.coupon_code": "Mã giảm giá: {code}",
    "verify.discount": "Giảm: {discount}",
    "verify.unsupported_qr": "Loại QR không được hỗ trợ",
    "verify.browser_not_supported": "Trình duyệt không hỗ trợ định vị",
    "verify.location_services": "Dịch vụ định vị",
    "verify.enable_location": "Vui lòng bật dịch vụ định vị trong cài đặt trình duyệt",
    "verify.need_assistance": "Cần hỗ trợ?",
    "verify.having_trouble": "Gặp khó khăn?",
    "verify.security_info": "Thông tin bảo mật",
    "verify.encrypted_data": "Dữ liệu QR được mã hóa",
    "verify.encrypted_desc": "Tất cả thông tin QR được mã hóa an toàn",
    "verify.location_verified_locally": "Vị trí của bạn được xác thực cục bộ",
    "verify.no_data_storage": "Không lưu trữ dữ liệu",
    "verify.no_storage_desc": "Chúng tôi không lưu trữ thông tin cá nhân của bạn",
    "verify.qr_details": "Chi tiết QR",
    "verify.security_level": "Mức bảo mật",
    "verify.security_high": "Cao",
    "verify.security_standard": "Tiêu chuẩn",
    "verify.loading_verification": "Đang tải xác thực...",
    "verify.open_content": "Mở {type}",
    "verify.multi_links": "Danh sách liên kết",
    "verify.invalid_multi_links": "Dữ liệu nhiều link không hợp lệ",

    // Multi Link Landing
    "multilink.title": "Chon diem den",
    "multilink.description": "Hay chon mot lien ket ben duoi de truy cap noi dung mong muon.",
    "multilink.empty_state": "Khong tim thay lien ket nao cho QR code nay.",
    "multilink.link_default": "Lien ket {index}",
    "multilink.available_anytime": "Truy cap moi luc",
    "multilink.visit": "Mo lien ket",
    "multilink.safe_title": "An toan & tin cay",
    "multilink.safe_desc": "Tat ca lien ket duoc chia se qua Kaius FastQR.",
    "multilink.create_own": "Tu tao lien ket",

    // Form Placeholders
    "placeholder.url": "https://example.com",
    "placeholder.text": "Nhập nội dung văn bản của bạn...",
    "placeholder.email": "example@email.com",
    "placeholder.email_subject": "Tiêu đề email",
    "placeholder.email_body": "Nội dung email",
    "placeholder.phone": "+84 123 456 789",
    "placeholder.name": "Nguyễn Văn A",
    "placeholder.company": "Tên công ty",
    "placeholder.address": "123 Đường ABC, Quận XYZ, TP.HCM",
    "placeholder.website": "https://website.com",
    "placeholder.note": "Ghi chú thêm...",
    "placeholder.message": "Nội dung tin nhắn...",
    "placeholder.event_name": "Tên sự kiện",
    "placeholder.event_location": "Địa điểm sự kiện",
    "placeholder.event_url": "https://link-su-kien.com",
    "placeholder.event_description": "Mô tả sự kiện...",
    "placeholder.wifi_name": "Tên mạng WiFi",
    "placeholder.wifi_password": "Mật khẩu WiFi",
    "placeholder.place_name": "Tên địa điểm",
    "placeholder.latitude": "10.7769",
    "placeholder.longitude": "106.7009",
  "placeholder.facebook": "https://facebook.com/username",
  "placeholder.facebook_username": "username (ví dụ: kaius.dev)",
  "placeholder.multiurl_url": "https://example.com/trang",
  "placeholder.link_title": "ví dụ: Website chính",

    // WiFi Security
    "wifi.wpa": "WPA/WPA2",
    "wifi.wep": "WEP",
    "wifi.no_password": "Không mật khẩu",

    // Time
    "time.created_at": "Tạo lúc",
    "time.now": "bây giờ",

    // Navigation
    "nav.home": "Trang chủ",
    "nav.about": "Giới thiệu",
    "nav.contact": "Liên hệ",
    "nav.help": "Trợ giúp",

    // Footer (if needed)
    "footer.copyright": "© 2024 Kaius FastQR. Tất cả quyền được bảo lưu.",
    "footer.privacy": "Chính sách bảo mật",
    "footer.terms": "Điều khoản dịch vụ",
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof (typeof translations)[typeof language]] || key

    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue))
      })
    }

    return translation
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
