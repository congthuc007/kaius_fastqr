// Utility functions for color validation
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

export function validateQRColors(
  foreground: string,
  background: string,
): {
  isValid: boolean
  warning: string | null
  severity: "error" | "warning" | null
} {
  const contrastRatio = getContrastRatio(foreground, background)

  // QR codes need high contrast to be readable
  if (contrastRatio < 3) {
    return {
      isValid: false,
      warning: "Độ tương phản quá thấp! QR code có thể không quét được. Khuyến nghị tỷ lệ tương phản tối thiểu 3:1",
      severity: "error",
    }
  }

  if (contrastRatio < 4.5) {
    return {
      isValid: true,
      warning: "Độ tương phản thấp. QR code có thể khó quét trong điều kiện ánh sáng yếu.",
      severity: "warning",
    }
  }

  // Check if colors are too similar
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (fg && bg) {
    const colorDistance = Math.sqrt(Math.pow(fg.r - bg.r, 2) + Math.pow(fg.g - bg.g, 2) + Math.pow(fg.b - bg.b, 2))

    if (colorDistance < 100) {
      return {
        isValid: false,
        warning: "Màu sắc quá giống nhau! QR code sẽ không thể quét được.",
        severity: "error",
      }
    }
  }

  return {
    isValid: true,
    warning: null,
    severity: null,
  }
}

export function suggestBetterColors(
  foreground: string,
  background: string,
): {
  foreground: string
  background: string
} {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (!fg || !bg) return { foreground, background }

  // If background is light, suggest dark foreground
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b)

  if (bgLuminance > 0.5) {
    return {
      foreground: "#000000",
      background: background,
    }
  } else {
    return {
      foreground: foreground,
      background: "#FFFFFF",
    }
  }
}
