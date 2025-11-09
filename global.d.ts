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
