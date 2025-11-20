declare module "*.css" {
  const content: { readonly [className: string]: string } | string
  export default content
}

// Minimal typings for 'qrcode' used in the project
declare module "qrcode" {
  export interface QRCodeColor {
    dark?: string
    light?: string
  }

  export interface QRCodeToDataURLOptions {
    width?: number
    margin?: number
    color?: QRCodeColor
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  }

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>

  const _default: { toDataURL: typeof toDataURL }
  export default _default
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_NAME?: string
    NEXT_PUBLIC_SITE_TAGLINE?: string
    NEXT_PUBLIC_SITE_DESCRIPTION?: string
    NEXT_PUBLIC_SITE_DOMAIN?: string
    NEXT_PUBLIC_SITE_URL?: string
  }
}
